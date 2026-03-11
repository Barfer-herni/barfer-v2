'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Dictionary } from '@/config/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Package, ShoppingCart, BarChart3, Edit2, Save, X, ChevronUp, ChevronDown, GripVertical, Trash2, CalendarDays, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { AddStockModal } from './AddStockModal';
import { CreatePuntoEnvioModal } from './CreatePuntoEnvioModal';
import { UpdatePuntoEnvioModal } from './UpdatePuntoEnvioModal';
import { DeletePuntoEnvioDialog } from './DeletePuntoEnvioDialog';
import { DuplicateOrderModal } from './DuplicateOrderModal';
import { EstadoEnvioFilter } from './EstadoEnvioFilter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    getExpressOrdersAction,
    getStockByPuntoEnvioAction,
    getProductsForStockAction,
    updateStockAction,
    createStockAction,
    duplicateExpressOrderAction,
    getOrderPriorityAction,
    saveOrderPriorityAction,
    initializeStockForDateAction,
    recalculateStockChainAction,
} from '../actions';
import type { Order, Stock, PuntoEnvio } from '@/lib/services';
type ProductForStock = any;
import { OrdersDataTable } from '../../table/components/OrdersDataTable';
import { DateRangeFilter } from '../../table/components/DateRangeFilter';
import { createExpressColumns } from './expressColumns';
import { ResumenGeneralTables } from './ResumenGeneralTables';
import { MonthlyMetricsTable } from './MonthlyMetricsTable';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { getQuantityStatsByMonthAction } from '../../analytics/actions';
import { QuantityTable } from '../../analytics/components/quantity/QuantityTable';


interface ExpressPageClientProps {
    dictionary: Dictionary;
    initialPuntosEnvio: PuntoEnvio[];
    userPuntosEnvio?: string[]; // Array de nombres de puntos asignados al usuario (no-admin)
    canEdit: boolean;
    canDelete: boolean;
    isAdmin?: boolean;
}

export function ExpressPageClient({ dictionary, initialPuntosEnvio, userPuntosEnvio = [], canEdit, canDelete, isAdmin = true }: ExpressPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Obtener valores iniciales de la URL
    const initialPuntoIdFromUrl = searchParams.get('puntoId');
    const initialTabFromUrl = searchParams.get('tab') || 'orders';

    const [showAddStockModal, setShowAddStockModal] = useState(false);
    const [showCreatePuntoEnvioModal, setShowCreatePuntoEnvioModal] = useState(false);
    const [showUpdatePuntoEnvioModal, setShowUpdatePuntoEnvioModal] = useState(false);
    const [showDeletePuntoEnvioModal, setShowDeletePuntoEnvioModal] = useState(false);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [orderToDuplicate, setOrderToDuplicate] = useState<string | null>(null);

    // Inicializar estado con valor de URL si existe
    const [selectedPuntoEnvio, setSelectedPuntoEnvio] = useState<string>(initialPuntoIdFromUrl || '');
    const [activeTab, setActiveTab] = useState<string>(initialTabFromUrl);

    const [puntosEnvio, setPuntosEnvio] = useState<PuntoEnvio[]>(initialPuntosEnvio);
    const [quantityStats, setQuantityStats] = useState<any>(null);

    // Función auxiliar para actualizar URL
    const updateUrlParams = useCallback((param: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(param, value);
        } else {
            params.delete(param);
        }
        router.replace(`${pathname}?${params.toString()}`);
    }, [searchParams, pathname, router]);

    // Volver a «hoy» en el rango de fechas (preserva punto, tab, etc.)
    const setDateRangeToToday = useCallback(() => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const params = new URLSearchParams(searchParams.toString());
        params.set('from', today);
        params.set('to', today);
        params.set('page', '1');
        router.replace(`${pathname}?${params.toString()}`);
    }, [searchParams, pathname, router]);

    // Manejar cambio de punto de envío
    const handlePuntoEnvioChange = (value: string) => {
        setSelectedPuntoEnvio(value);
        updateUrlParams('puntoId', value);
    };

    // Manejar cambio de tab
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        updateUrlParams('tab', value);
    };


    useEffect(() => {
        // Si hay un puntoId en la URL pero no está seleccionado en el estado (casos borde), sincronizar
        if (initialPuntoIdFromUrl && selectedPuntoEnvio !== initialPuntoIdFromUrl) {
            setSelectedPuntoEnvio(initialPuntoIdFromUrl);
        }
    }, [initialPuntoIdFromUrl]);

    // Datos de las tablas
    const [orders, setOrders] = useState<Order[]>([]);
    const [stock, setStock] = useState<Stock[]>([]);
    const [productsForStock, setProductsForStock] = useState<ProductForStock[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    // Estado para el orden de prioridad desde la base de datos
    const [orderPriorityFromDB, setOrderPriorityFromDB] = useState<string[]>([]);
    // Estado para forzar re-render cuando se actualiza el orden de prioridad
    const [orderPriorityVersion, setOrderPriorityVersion] = useState(0);
    // Estado local para los valores editados (sin necesidad de modo edición)
    const [localStockValues, setLocalStockValues] = useState<Record<string, { stockInicial: number; llevamos: number }>>({});
    // Ref para mantener los valores actuales del estado (para acceder sin setState)
    const localStockValuesRef = useRef<Record<string, { stockInicial: number; llevamos: number }>>({});
    // Refs para los timeouts de debounce - usar stockId como clave (no stockId-field)
    const saveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
    // Refs para flags que previenen creación duplicada
    const savingFlags = useRef<Record<string, boolean>>({});

    // Configurar sensores para drag and drop con mejor compatibilidad cross-platform
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Reducido de 8 a 5px para mejor respuesta en Windows
                tolerance: 5, // Añadir tolerancia para movimientos imprecisos
                delay: 0, // Sin delay para respuesta inmediata
            },
        }),
        useSensor(KeyboardSensor)
    );

    // Obtener parámetros de paginación y filtros de la URL para procesamiento local
    const pageFromUrl = Number(searchParams.get('page')) || 1;
    const pageSizeFromUrl = Number(searchParams.get('pageSize')) || 50; // Default a 50 como estaba antes
    const searchFromUrl = searchParams.get('search') || '';
    const fromFromUrl = searchParams.get('from');
    const toFromUrl = searchParams.get('to');
    const estadosEnvioFromUrl = searchParams.get('estadosEnvio');
    const sortFromUrl = searchParams.get('sort');

    // Función para cargar el orden de prioridad desde la base de datos
    const loadOrderPriorityFromDB = useCallback(async (fecha: string, puntoEnvio: string) => {
        try {
            const result = await getOrderPriorityAction(fecha, puntoEnvio);
            if (result.success && result.orderPriority && Array.isArray(result.orderPriority.orderIds)) {
                setOrderPriorityFromDB(result.orderPriority.orderIds);
            } else {
                setOrderPriorityFromDB([]);
            }
        } catch (error) {
            console.error('Error loading order priority from DB:', error);
            setOrderPriorityFromDB([]);
        }
    }, []);

    // Función para aplicar el orden guardado a los pedidos
    const applySavedOrder = useCallback((orders: Order[]): Order[] => {
        if (!orderPriorityFromDB || !Array.isArray(orderPriorityFromDB) || orderPriorityFromDB.length === 0) return orders;

        // Normalizar todos los IDs a strings
        const normalizedSavedOrderIds = orderPriorityFromDB.map(id => String(id));

        // Crear un mapa de pedidos por ID (normalizado a string)
        const orderMap = new Map(orders.map(order => [String(order._id), order]));

        // Crear un set de IDs que tenemos (normalizado a string)
        const availableIds = new Set(orders.map(order => String(order._id)));

        // Ordenar según el orden guardado (solo los que existen)
        const ordered: Order[] = [];
        const addedIds = new Set<string>();

        // Primero agregar los pedidos en el orden guardado
        for (const id of normalizedSavedOrderIds) {
            const normalizedId = String(id);
            if (availableIds.has(normalizedId) && !addedIds.has(normalizedId)) {
                const order = orderMap.get(normalizedId);
                if (order) {
                    ordered.push(order);
                    addedIds.add(normalizedId);
                }
            }
        }

        // Agregar los pedidos que no estaban en el orden guardado (nuevos pedidos)
        for (const order of orders) {
            const id = String(order._id);
            if (!addedIds.has(id)) {
                ordered.push(order);
            }
        }

        return ordered;
    }, [orderPriorityFromDB]);

    // Procesar órdenes: Filtrar -> Ordenar -> Paginar
    // 1. Filtrar y Ordenar
    const filteredAndSortedOrders = useMemo(() => {
        let result = [...orders];

        // A. Filtrar por Búsqueda
        if (searchFromUrl) {
            const searchLower = searchFromUrl.toLowerCase();
            // Normalizar búsqueda de teléfono: remover espacios, guiones y paréntesis
            const searchNormalized = searchFromUrl.replace(/[\s\-()]/g, '');

            result = result.filter(order => {
                // Construir nombre completo para búsqueda
                const fullName = `${order.user?.name || ''} ${order.user?.lastName || ''}`.toLowerCase().trim();

                // Normalizar teléfono para búsqueda
                const phoneNormalized = (order.address?.phone || '').replace(/[\s\-()]/g, '');

                return (
                    // Búsqueda por nombre completo (nombre + apellido)
                    fullName.includes(searchLower) ||
                    // Búsqueda por nombre individual
                    (order.user?.name || '').toLowerCase().includes(searchLower) ||
                    // Búsqueda por apellido individual
                    (order.user?.lastName || '').toLowerCase().includes(searchLower) ||
                    // Búsqueda por email
                    (order.user?.email || '').toLowerCase().includes(searchLower) ||
                    // Búsqueda por teléfono (normalizado sin espacios ni guiones)
                    phoneNormalized.includes(searchNormalized) ||
                    // Búsqueda por teléfono (formato original)
                    (order.address?.phone || '').toLowerCase().includes(searchLower) ||
                    // Búsqueda por total
                    (order.total?.toString() || '').includes(searchLower) ||
                    // Búsqueda por ID
                    (typeof order._id === 'string' && order._id.includes(searchLower)) ||
                    // Búsqueda por items
                    (order.items || []).some((item: any) =>
                        (item.name || '').toLowerCase().includes(searchLower) ||
                        (item.fullName || '').toLowerCase().includes(searchLower)
                    ) ||
                    // Búsqueda por dirección
                    (order.address?.address || '').toLowerCase().includes(searchLower) ||
                    (order.address?.city || '').toLowerCase().includes(searchLower)
                );
            });
        }

        // B. Filtrar por Rango de Fechas
        if (fromFromUrl || toFromUrl) {
            result = result.filter(order => {
                let orderDateStr: string;

                if (order.deliveryDay) {
                    // deliveryDay viene como Date de MongoDB, extraer fecha UTC
                    const deliveryDate = new Date(order.deliveryDay);
                    orderDateStr = deliveryDate.toISOString().substring(0, 10);
                } else {
                    // Convertir UTC a hora Argentina (UTC-3)
                    const orderDate = new Date(order.createdAt);
                    const argDate = new Date(orderDate.getTime() - (3 * 60 * 60 * 1000));
                    orderDateStr = argDate.toISOString().substring(0, 10);
                }

                const passesFrom = !fromFromUrl || orderDateStr >= fromFromUrl;
                const passesTo = !toFromUrl || orderDateStr <= toFromUrl;
                return passesFrom && passesTo;
            });

        }

        // C. Filtrar por Estado de Envío
        if (estadosEnvioFromUrl && estadosEnvioFromUrl !== 'all') {
            const selectedEstados = estadosEnvioFromUrl.split(',');
            result = result.filter(order => {
                const estadoEnvio = order.estadoEnvio || 'pendiente';
                return selectedEstados.includes(estadoEnvio);
            });
        }

        // D. Ordenar
        // SIEMPRE aplicar el orden guardado en BD si hay punto seleccionado
        // El orden manual tiene prioridad sobre el ordenamiento de columnas
        if (selectedPuntoEnvio && selectedPuntoEnvio !== 'all') {
            result = applySavedOrder(result);
            // Si no hay orden guardado, usar orden por defecto
            if (orderPriorityFromDB.length === 0) {
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            }
        } else if (sortFromUrl) {
            // Solo aplicar ordenamiento de columnas si no hay punto específico
            const [sortId, sortDesc] = sortFromUrl.split('.');
            const isDesc = sortDesc === 'desc';

            result.sort((a: any, b: any) => {
                // Obtener valor para ordenar
                let valA = a[sortId];
                let valB = b[sortId];

                // Manejar casos especiales (objetos anidados)
                if (sortId === 'user.name') {
                    valA = `${a.user?.name || ''} ${a.user?.lastName || ''}`.trim();
                    valB = `${b.user?.name || ''} ${b.user?.lastName || ''}`.trim();
                } else if (sortId === 'total' || sortId === 'shippingPrice') {
                    valA = Number(valA || 0);
                    valB = Number(valB || 0);
                }

                // Comparación nula segura
                if (valA === valB) return 0;
                if (valA === null || valA === undefined) return 1;
                if (valB === null || valB === undefined) return -1;

                if (valA < valB) return isDesc ? 1 : -1;
                if (valA > valB) return isDesc ? -1 : 1;
                return 0;
            });
        } else {
            // Default sort: createdAt desc
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }


        return result;
    }, [orders, searchFromUrl, fromFromUrl, toFromUrl, estadosEnvioFromUrl, sortFromUrl, selectedPuntoEnvio, applySavedOrder, orderPriorityFromDB, orderPriorityVersion]);

    // 2. Paginar
    const paginatedOrders = useMemo(() => {
        const startIndex = (pageFromUrl - 1) * pageSizeFromUrl;
        return filteredAndSortedOrders.slice(startIndex, startIndex + pageSizeFromUrl);
    }, [filteredAndSortedOrders, pageFromUrl, pageSizeFromUrl]);

    // Función para manejar el fin del drag and drop
    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        if (!selectedPuntoEnvio || selectedPuntoEnvio === 'all') {
            return;
        }

        // REQUERIR que haya una fecha seleccionada
        if (!fromFromUrl) {
            toast({
                title: 'Fecha requerida',
                description: 'Debes seleccionar una fecha para ordenar los pedidos',
                variant: 'destructive',
            });
            return;
        }

        // Normalizar IDs a strings
        const activeId = String(active.id);
        const overId = String(over.id);

        // Usar la fecha seleccionada (ya validada arriba)
        const dateKey = fromFromUrl;

        // Obtener la lista actual de IDs desde filteredAndSortedOrders
        // Esta lista ya tiene todos los filtros aplicados (búsqueda, fechas, tipo de orden, punto de envío)
        const currentOrderIds = filteredAndSortedOrders.map(order => String(order._id));

        // Verificar que los IDs arrastrados existan en la lista actual
        const oldIndex = currentOrderIds.indexOf(activeId);
        const newIndex = currentOrderIds.indexOf(overId);

        if (oldIndex === -1 || newIndex === -1) {
            console.warn('No se pudieron encontrar los índices para el drag and drop', {
                activeId,
                overId,
                oldIndex,
                newIndex,
                totalItems: currentOrderIds.length
            });
            return;
        }

        // Usar arrayMove de @dnd-kit para reordenar
        const newOrderIds = arrayMove(currentOrderIds, oldIndex, newIndex);

        // Optimistic update: actualizar el estado local inmediatamente
        setOrderPriorityFromDB(newOrderIds);
        setOrderPriorityVersion(prev => prev + 1);

        // Guardar en la base de datos en segundo plano
        try {
            const result = await saveOrderPriorityAction(dateKey, selectedPuntoEnvio, newOrderIds);

            if (!result.success) {
                // Revertir en caso de error
                toast({
                    title: 'Error',
                    description: 'No se pudo guardar el orden',
                    variant: 'destructive',
                });
                // Recargar el orden desde BD
                await loadOrderPriorityFromDB(dateKey, selectedPuntoEnvio);
            }
        } catch (error) {
            console.error('Error saving order priority:', error);
            toast({
                title: 'Error',
                description: 'No se pudo guardar el orden',
                variant: 'destructive',
            });
            // Recargar el orden desde BD
            await loadOrderPriorityFromDB(dateKey, selectedPuntoEnvio);
        }
    }, [fromFromUrl, selectedPuntoEnvio, filteredAndSortedOrders, loadOrderPriorityFromDB, toast]);

    // Función para actualizar una orden específica en el estado local
    const handleOrderUpdate = useCallback((updatedOrder: Order) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                String(order._id) === String(updatedOrder._id) ? updatedOrder : order
            )
        );
    }, []);

    // Función para mover un pedido arriba o abajo en el orden (mantener para compatibilidad con flechas)
    const moveOrder = useCallback(async (orderId: string, direction: 'up' | 'down') => {
        if (!selectedPuntoEnvio || selectedPuntoEnvio === 'all') {
            return;
        }

        // REQUERIR que haya una fecha seleccionada
        if (!fromFromUrl) {
            toast({
                title: 'Fecha requerida',
                description: 'Debes seleccionar una fecha para ordenar los pedidos',
                variant: 'destructive',
            });
            return;
        }

        // Normalizar el orderId a string
        const normalizedOrderId = String(orderId);

        // Usar la fecha seleccionada (ya validada arriba)
        const dateKey = fromFromUrl;

        // Obtener la lista actual de IDs desde filteredAndSortedOrders
        const currentOrderIds = filteredAndSortedOrders.map(order => String(order._id));

        // Encontrar el índice del pedido
        const currentIndex = currentOrderIds.indexOf(normalizedOrderId);

        if (currentIndex === -1) {
            console.warn('No se encontró el pedido en la lista actual:', normalizedOrderId);
            return;
        }

        // Calcular el nuevo índice
        let newIndex: number;
        if (direction === 'up') {
            if (currentIndex === 0) return; // Ya está arriba
            newIndex = currentIndex - 1;
        } else {
            if (currentIndex === currentOrderIds.length - 1) return; // Ya está abajo
            newIndex = currentIndex + 1;
        }

        // Intercambiar posiciones
        [currentOrderIds[currentIndex], currentOrderIds[newIndex]] =
            [currentOrderIds[newIndex], currentOrderIds[currentIndex]];

        // Optimistic update: actualizar el estado local inmediatamente
        setOrderPriorityFromDB(currentOrderIds);
        setOrderPriorityVersion(prev => prev + 1);

        // Guardar en la base de datos en segundo plano
        try {
            const result = await saveOrderPriorityAction(dateKey, selectedPuntoEnvio, currentOrderIds);

            if (!result.success) {
                // Revertir en caso de error
                toast({
                    title: 'Error',
                    description: 'No se pudo guardar el orden',
                    variant: 'destructive',
                });
                // Recargar el orden desde BD
                await loadOrderPriorityFromDB(dateKey, selectedPuntoEnvio);
            }
        } catch (error) {
            console.error('Error saving order priority:', error);
            toast({
                title: 'Error',
                description: 'No se pudo guardar el orden',
                variant: 'destructive',
            });
            // Recargar el orden desde BD
            await loadOrderPriorityFromDB(dateKey, selectedPuntoEnvio);
        }
    }, [fromFromUrl, selectedPuntoEnvio, filteredAndSortedOrders, loadOrderPriorityFromDB, toast]);

    // Cargar productos para stock al montar el componente
    useEffect(() => {
        const loadProductsForStock = async () => {
            try {
                const result = await getProductsForStockAction();
                if (result.success && result.products) {
                    setProductsForStock(result.products);
                }
            } catch (error) {
                console.error('Error loading products for stock:', error);
            }
        };
        loadProductsForStock();
    }, []);

    const handlePuntosEnvioRefresh = async (): Promise<PuntoEnvio[]> => {
        router.refresh();
        const { getAllPuntosEnvioAction } = await import('../actions');
        const result = await getAllPuntosEnvioAction();
        if (result.success && result.puntosEnvio) {
            let refreshed = result.puntosEnvio;
            // Si no es admin, filtrar solo los puntos asignados al usuario
            if (!isAdmin && userPuntosEnvio.length > 0) {
                const normalizedUserPuntos = userPuntosEnvio.map(p => (p || '').trim().toUpperCase());
                refreshed = result.puntosEnvio.filter(p => {
                    if (!p.nombre) return false;
                    return normalizedUserPuntos.includes(p.nombre.trim().toUpperCase());
                });
                // Fallback: si no coincide nada, crear objetos sintéticos
                if (refreshed.length === 0) {
                    refreshed = userPuntosEnvio.map(nombre => ({
                        _id: nombre,
                        nombre,
                        cutoffTime: undefined,
                        createdAt: '',
                        updatedAt: '',
                    }));
                }
            }
            setPuntosEnvio(refreshed);
            return refreshed;
        }
        return [];
    };

    // NO establecer fecha por defecto - permitir ver todas las órdenes sin filtro de fecha
    // const hasInitializedDate = useRef(false);
    // useEffect(() => {
    //     if (!hasInitializedDate.current && !fromFromUrl && !toFromUrl) {
    //         hasInitializedDate.current = true;
    //         const today = format(new Date(), 'yyyy-MM-dd');
    //         const params = new URLSearchParams(searchParams.toString());
    //         params.set('from', today);
    //         params.set('to', today);
    //         router.replace(`${pathname}?${params.toString()}`);
    //     }
    // }, [fromFromUrl, toFromUrl, searchParams, pathname, router]);

    // Si no es admin y hay puntos de envío, seleccionar automáticamente si no hay selección (URL o estado)
    useEffect(() => {
        if (!isAdmin && puntosEnvio.length > 0 && !selectedPuntoEnvio) {
            const firstPunto = puntosEnvio[0].nombre || '';
            handlePuntoEnvioChange(firstPunto);
        }
    }, [isAdmin, puntosEnvio, selectedPuntoEnvio]);

    // Cargar datos cuando se selecciona un punto de envío (con o sin fecha)
    useEffect(() => {
        if (selectedPuntoEnvio) {
            loadTablasData(selectedPuntoEnvio);
        } else {
            setOrders([]);
            setStock([]);
        }
    }, [selectedPuntoEnvio, fromFromUrl, toFromUrl]);

    // Cargar orden de prioridad cuando cambia la fecha o el punto de envío
    useEffect(() => {
        if (selectedPuntoEnvio && selectedPuntoEnvio !== 'all' && fromFromUrl) {
            loadOrderPriorityFromDB(fromFromUrl, selectedPuntoEnvio);
        } else {
            // Limpiar el orden si no hay punto o fecha específica
            setOrderPriorityFromDB([]);
        }
    }, [selectedPuntoEnvio, fromFromUrl, loadOrderPriorityFromDB]);

    const loadTablasData = async (puntoEnvio: string, options: { skipLocalUpdate?: boolean; silent?: boolean } = {}) => {
        const { skipLocalUpdate = false, silent = false } = options;
        if (!silent) setIsLoading(true);
        try {
            // Si es 'all', traemos todas las órdenes sin filtro de punto
            const ordersPromise = getExpressOrdersAction(
                puntoEnvio === 'all' ? undefined : puntoEnvio,
                fromFromUrl || undefined,
                toFromUrl || undefined
            );

            // Si hay fecha y punto seleccionado, intentar inicializar stock del día (rollover)
            if (puntoEnvio !== 'all' && fromFromUrl && !silent) {
                // No esperamos result para no bloquear UI, pero necesitamos recargar si hubo cambios
                // Mejor hacer: await init, luego getStock.
                // Optimización: getStock primero, si vacío -> init -> getStock.
                // En este caso, lo hacemos simple: intentar init antes de getStock
                await initializeStockForDateAction(puntoEnvio, fromFromUrl);
            }

            // Si es 'all', no traemos stock ni detalle específico por ahora (o podríamos adaptarlo luego)
            const stockPromise = puntoEnvio === 'all' ? Promise.resolve({ success: true, stock: [] }) : getStockByPuntoEnvioAction(puntoEnvio);

            // Cargar estadísticas de cantidad por kilo (mismo que Analytics)
            const currentYear = new Date().getFullYear();
            const yearStart = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0)).toISOString();
            const yearEnd = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999)).toISOString();
            const quantityStatsPromise = getQuantityStatsByMonthAction(yearStart, yearEnd, puntoEnvio === 'all' ? undefined : puntoEnvio);

            const [ordersResult, stockResult, quantityStatsResult] = await Promise.all([
                ordersPromise,
                stockPromise,
                quantityStatsPromise,
            ]);

            if (ordersResult.success) {
                setOrders(ordersResult.orders || []);
            }
            if (stockResult.success && stockResult.stock) {
                setStock(stockResult.stock);
                // Inicializar valores locales con los datos del servidor
                if (!skipLocalUpdate) {
                    const initialValues: Record<string, { stockInicial: number; llevamos: number }> = {};
                    stockResult.stock.forEach(s => {
                        const key = String(s._id);
                        initialValues[key] = {
                            stockInicial: s.stockInicial,
                            llevamos: s.llevamos,
                        };
                    });
                    setLocalStockValues(initialValues);
                    localStockValuesRef.current = initialValues;
                }
            }
            if (quantityStatsResult.success && quantityStatsResult.data) {
                setQuantityStats(quantityStatsResult.data);
            }
        } catch (error) {
            console.error('Error loading tablas data:', error);
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    // Función para manejar duplicación de pedidos
    const handleDuplicate = useCallback(async (row: any) => {
        // Si el usuario tiene acceso a más de un punto de envío, mostrar modal
        if (puntosEnvio.length > 1) {
            setOrderToDuplicate(row.id);
            setShowDuplicateModal(true);
        } else if (puntosEnvio.length === 1 || selectedPuntoEnvio) {
            // Si solo tiene un punto de envío, duplicar directamente ahí
            const targetPuntoEnvio = puntosEnvio[0]?.nombre || selectedPuntoEnvio;

            if (!targetPuntoEnvio) {
                toast({
                    title: 'Error',
                    description: 'No hay punto de envío seleccionado',
                    variant: 'destructive',
                });
                return;
            }

            try {
                const result = await duplicateExpressOrderAction(row.id, targetPuntoEnvio);

                if (!result.success) {
                    throw new Error('Error al duplicar');
                }

                // Recargar datos del punto de envío actual
                if (selectedPuntoEnvio) {
                    await loadTablasData(selectedPuntoEnvio, { silent: true });
                }

                toast({
                    title: 'Éxito',
                    description: result.message || 'Pedido duplicado correctamente',
                });
            } catch (error) {
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'Error al duplicar la orden',
                    variant: 'destructive',
                });
            }
        } else {
            toast({
                title: 'Error',
                description: 'No hay puntos de envío disponibles',
                variant: 'destructive',
            });
        }
    }, [puntosEnvio, selectedPuntoEnvio, toast]);

    // Función para confirmar la duplicación con el punto de envío seleccionado
    const handleConfirmDuplicate = useCallback(async (targetPuntoEnvio: string) => {
        if (!orderToDuplicate) {
            return;
        }
        try {
            const result = await duplicateExpressOrderAction(orderToDuplicate, targetPuntoEnvio);

            if (!result.success) {
                const errorMsg = 'Error al duplicar';
                throw new Error(errorMsg);
            }

            // Recargar datos del punto de envío actual
            if (selectedPuntoEnvio) {
                await loadTablasData(selectedPuntoEnvio, { silent: true });
            }

            toast({
                title: 'Éxito',
                description: result.message || 'Pedido duplicado correctamente',
            });
        } catch (error) {
            console.error('❌ Error al duplicar:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error al duplicar la orden';
            console.error('❌ Mensaje de error completo:', errorMessage);
            toast({
                title: 'Error al duplicar',
                description: errorMessage,
                variant: 'destructive',
            });
            // También mostrar alert para asegurar que el usuario vea el error
            alert(`Error al duplicar: ${errorMessage}`);
        } finally {
            setOrderToDuplicate(null);
        }
    }, [orderToDuplicate, selectedPuntoEnvio, toast]);

    // Normalizar nombre de producto para comparación (remover prefijos como "BOX PERRO", "BOX GATO", "BIG DOG")
    const normalizeProductName = useCallback((productName: string): string => {
        let normalized = (productName || '').toUpperCase().trim();
        // Remover prefijos comunes
        normalized = normalized.replace(/^BOX\s+PERRO\s+/i, '');
        normalized = normalized.replace(/^BOX\s+GATO\s+/i, '');
        normalized = normalized.replace(/^BIG\s+DOG\s+/i, '');
        // Remover peso si está en el nombre
        normalized = normalized.replace(/\s+\d+KG.*$/i, '');
        return normalized.trim();
    }, []);

    // Normalizar peso para comparación (eliminar espacios y convertir a mayúsculas)
    const normalizeWeight = useCallback((weight: string | null | undefined): string => {
        if (!weight) return '';
        return (weight || '').toUpperCase().trim().replace(/\s+/g, '');
    }, []);

    // Comparar si dos productos son el mismo (producto y peso)
    // NOTA: Los productos nuevos se guardan como "SECCION PRODUCTO" (ej: "PERRO POLLO")
    // Los productos viejos pueden estar como solo "POLLO"
    // Los productos de referencia vienen con section separada (ej: section="PERRO", product="POLLO")
    const isSameProduct = useCallback((stockItem: Stock, product: ProductForStock): boolean => {
        const stockProductUpper = (stockItem.producto || '').toUpperCase().trim();
        const productProductUpper = (product.product || '').toUpperCase().trim();
        const productSectionUpper = (product.section || '').toUpperCase().trim();
        const stockWeightNormalized = normalizeWeight(stockItem.peso);
        const productWeightNormalized = normalizeWeight(product.weight);

        // Comparar pesos primero (más específico)
        const weightMatches = stockWeightNormalized === productWeightNormalized;
        if (!weightMatches) return false;

        // CON SECCIÓN: Si el stock tiene el campo section, usarlo para comparar
        if (stockItem.section) {
            const stockSectionUpper = (stockItem.section || '').toUpperCase().trim();
            if (stockSectionUpper !== productSectionUpper) return false;

            // En este caso, el stockItem.producto puede ser el nombre base o el nombre con sección prepended
            if (stockProductUpper === productProductUpper) return true;
            if (stockProductUpper === `${stockSectionUpper} ${productProductUpper}`.trim()) return true;

            return false;
        }

        // BACKWARD COMPATIBILITY: Sin campo section en el registro de stock
        // Construir el nombre completo del producto de referencia (SECCION PRODUCTO)
        const fullProductName = `${productSectionUpper} ${productProductUpper}`.trim();

        // 1. Formato nuevo (en string): coincidencia exacta con sección incluida
        if (stockProductUpper === fullProductName) {
            return true;
        }

        // 2. Formato viejo: solo nombre de producto, sin sección prepended
        // IMPORTANTE: Solo aceptar si el stock NO tiene ninguna sección conocida en el nombre
        if (stockProductUpper === productProductUpper) {
            const hasSectionInName = stockProductUpper.includes('PERRO') ||
                stockProductUpper.includes('GATO') ||
                stockProductUpper.includes('BIG DOG') ||
                stockProductUpper.includes('OTROS');
            return !hasSectionInName;
        }

        return false;
    }, [normalizeWeight]);

    // Filtrar stock por fecha seleccionada desde URL
    const getStockForDate = useCallback((): Stock[] => {
        const fromDate = searchParams.get('from');
        const toDate = searchParams.get('to');

        if (!fromDate) return stock; // Si no hay filtro, devolver todo

        return stock.filter(s => {
            // Comparar directamente el string de fecha (primeros 10 caracteres)
            // para evitar problemas de zona horaria
            const stockDateStr = String(s.fecha).substring(0, 10);

            // Si from y to son iguales, filtrar por ese día específico
            if (fromDate === toDate) {
                return stockDateStr === fromDate;
            }

            // Si hay rango, filtrar por rango
            return stockDateStr >= fromDate && stockDateStr <= (toDate || fromDate);
        });
    }, [stock, searchParams]);

    // Calcular automáticamente los pedidos del día para un producto específico
    const calculatePedidosDelDia = useCallback((product?: ProductForStock): number => {
        if (!selectedPuntoEnvio || !product) return 0;

        const fromDate = searchParams.get('from');
        if (!fromDate) return 0;

        const ordersOfDay = orders.filter(order => {
            if (!order.puntoEnvio || order.puntoEnvio !== selectedPuntoEnvio) return false;

            let orderDateStr: string;

            if (order.deliveryDay) {
                // deliveryDay viene como Date de MongoDB, extraer fecha UTC
                const deliveryDate = new Date(order.deliveryDay);
                orderDateStr = deliveryDate.toISOString().substring(0, 10);
            } else {
                const orderDate = new Date(order.createdAt);
                const argDate = new Date(orderDate.getTime() - (3 * 60 * 60 * 1000));
                orderDateStr = argDate.toISOString().substring(0, 10);
            }

            if (orderDateStr !== fromDate) return false;
            if (!order.items || order.items.length === 0) return false;

            return true;
        });

        // Sumar cantidades de los items que coinciden
        let totalQuantity = 0;
        const sectionUpper = (product.section || '').toUpperCase();
        const productName = (product.product || '').toUpperCase().trim();
        const productWeight = product.weight ? (product.weight || '').toUpperCase().trim().replace(/\s+/g, '') : null;

        ordersOfDay.forEach(order => {
            order.items.forEach((item: any) => {
                const itemProductBase = (item.name || '').toUpperCase().trim();
                const isBigDogItem = itemProductBase.includes('BIG DOG');
                const isBigDogStock = productName.includes('BIG DOG');

                // --- VALIDACIÓN DE SECCIÓN ---
                // Evitar mezclar PERRO con GATO y BIG DOG con PERRO REGULAR
                if (!sectionUpper.includes('OTROS')) {
                    if (sectionUpper.includes('GATO')) {
                        if (!itemProductBase.includes('GATO')) return;
                    } else if (sectionUpper.includes('PERRO')) {
                        if (itemProductBase.includes('GATO')) return;

                        // Regla: Si el ítem es BIG DOG, el stock debe ser BIG DOG.
                        // Si el ítem NO es BIG DOG, el stock NO debe ser BIG DOG.
                        if (isBigDogStock && !isBigDogItem) return;
                        if (!isBigDogStock && isBigDogItem) return;
                    }
                }

                let isMatch = false;

                // CASO ESPECIAL: BIG DOG
                if (isBigDogItem && isBigDogStock) {
                    const flavors = ['POLLO', 'VACA', 'CORDERO', 'CERDO', 'CONEJO', 'PAVO', 'MIX'];
                    const stockFullIdent = `${productName} ${productWeight || ''}`.toUpperCase();

                    // Prioridad: Matchear sabor desde las opciones
                    if (item.options && item.options.length > 0) {
                        // Buscamos si alguna opción es un sabor conocido
                        const flavorOption = item.options.find((opt: any) =>
                            flavors.some(f => (opt.name || '').toUpperCase().includes(f))
                        );

                        if (flavorOption) {
                            const optValue = flavorOption.name.toUpperCase().trim();
                            // Si hay una opción de sabor, DEBE coincidir con el stock
                            isMatch = stockFullIdent.includes(optValue);
                        }
                    }

                    // Fallback: Si no hay match por opciones de sabor, intentar por el nombre del ítem
                    if (!isMatch) {
                        const itemFullIdent = itemProductBase.toUpperCase();
                        const itemFlavor = flavors.find(f => itemFullIdent.includes(f));
                        const stockFlavor = flavors.find(f => stockFullIdent.includes(f));

                        const cleanItem = itemProductBase.replace(/\s*\(?\d+KG\)?/gi, '').trim();
                        const cleanStock = productName.replace(/\s*\(?\d+KG\)?/gi, '').trim();

                        if (cleanItem === cleanStock || (cleanItem.includes(cleanStock) && cleanStock.length > 5)) {
                            if (stockFlavor) {
                                // Si el stock tiene un sabor específico, el ítem debe tenerlo en su nombre
                                isMatch = itemFullIdent.includes(stockFlavor);
                            } else {
                                // Si el stock no tiene sabor especificado en el nombre/peso,
                                // solo matcheamos si el ítem tampoco tiene sabor en el nombre
                                isMatch = !itemFlavor;
                            }
                        }
                    }
                } else {
                    // CASO REGULAR: BOX PERRO, BOX GATO, etc.
                    const itemOptions = (item.options || []).map((opt: any) => (opt.name || '').toUpperCase().trim());
                    const itemMainOption = itemOptions[0] || '';

                    // Detectar pesos en el ítem (en nombre u opciones)
                    const itemFullIdent = `${itemProductBase} ${itemOptions.join(' ')}`.toUpperCase();
                    const weightRegex = /(\d+\s*KG)/gi;
                    const itemWeightsMatch = itemFullIdent.match(weightRegex);
                    const stockWeightsMatch = `${productName} ${productWeight || ''}`.toUpperCase().match(weightRegex);

                    const normalizedItemWeight = itemWeightsMatch ? itemWeightsMatch[0].replace(/\s+/g, '') : null;
                    const normalizedStockWeight = stockWeightsMatch ? stockWeightsMatch[0].replace(/\s+/g, '') : (productWeight ? productWeight.replace(/\s+/g, '') : null);

                    // Construir el nombre del item incluyendo la opción pero SIN el peso
                    const itemProduct = `${itemProductBase} ${itemMainOption}`.trim();
                    const cleanItemProduct = itemProduct.replace(/\s*\(?\d+\s*KG\)?/gi, '').trim();
                    const cleanProductName = productName.replace(/\s*\(?\d+\s*KG\)?/gi, '').trim();

                    // Extraer el sabor/tipo del producto del item (POLLO, VACA, CERDO, CORDERO, etc.)
                    let extractedFlavor = '';
                    let extracted = itemProductBase;
                    extracted = extracted.replace(/^BOX\s+PERRO\s+/i, '');
                    extracted = extracted.replace(/^BOX\s+GATO\s+/i, '');
                    extracted = extracted.replace(/\s*\(?\d+\s*KG\)?/gi, '');
                    extractedFlavor = extracted.trim();

                    // 1. Comparación básica de nombre
                    // Para productos como "BOX PERRO POLLO", el extractedFlavor sería "POLLO"
                    // y debería coincidir con el stock que tiene product: "POLLO"
                    const nameMatch = cleanItemProduct === cleanProductName ||
                        cleanItemProduct.includes(cleanProductName) ||
                        cleanProductName.includes(cleanItemProduct) ||
                        itemProductBase.includes(cleanProductName) ||
                        extractedFlavor === cleanProductName ||
                        cleanProductName === extractedFlavor;

                    if (nameMatch) {
                        // Si el nombre coincide, verificar el peso
                        // IMPORTANTE: Si alguno tiene peso especificado, AMBOS deben coincidir
                        if (normalizedStockWeight || normalizedItemWeight) {
                            if (normalizedStockWeight === normalizedItemWeight) {
                                isMatch = true;
                            } else {
                                // Mismatch de peso - NO es un match
                                isMatch = false;
                            }
                        } else {
                            // Ninguno tiene peso especificado, es un match genérico
                            isMatch = true;
                        }
                    }

                    // Fallback: Si no hay match, intentar comparación directa con el sabor extraído
                    if (!isMatch && extractedFlavor) {
                        const flavorMatch = extractedFlavor === cleanProductName;

                        if (flavorMatch) {
                            // Verificar peso
                            if (normalizedStockWeight || normalizedItemWeight) {
                                isMatch = normalizedStockWeight === normalizedItemWeight;
                            } else {
                                isMatch = true;
                            }
                        }
                    }
                }

                if (isMatch) {
                    const qty = item.quantity || item.options?.[0]?.quantity || 1;
                    totalQuantity += qty;
                }
            });
        });

        return totalQuantity;
    }, [selectedPuntoEnvio, orders, searchParams]);

    // Función para guardar automáticamente con debounce
    const saveStockValue = useCallback((stockId: string, field: 'stockInicial' | 'llevamos', value: number, product?: ProductForStock) => {
        // Limpiar timeout anterior si existe (usar solo stockId como clave)
        if (saveTimeouts.current[stockId]) {
            clearTimeout(saveTimeouts.current[stockId]);
        }

        // Actualizar estado local inmediatamente (sin recargar)
        setLocalStockValues(prev => {
            const updated = {
                ...prev,
                [stockId]: {
                    ...prev[stockId],
                    [field]: value,
                }
            };

            // Actualizar ref para acceso directo
            localStockValuesRef.current = updated;

            // Actualizar también el estado de stock local para reflejar cambios inmediatamente
            setStock(prevStock => {
                const stockItem = prevStock.find(s => String(s._id) === stockId);
                if (stockItem) {
                    const currentValues = updated[stockId] || { stockInicial: stockItem.stockInicial, llevamos: stockItem.llevamos };
                    return prevStock.map(s =>
                        String(s._id) === stockId
                            ? { ...s, [field]: value, stockFinal: currentValues.stockInicial + currentValues.llevamos - (s.pedidosDelDia || 0) }
                            : s
                    );
                }
                return prevStock;
            });

            return updated;
        });

        // Guardar en servidor después de 1 segundo de inactividad
        saveTimeouts.current[stockId] = setTimeout(async () => {
            try {
                // Verificar si ya se está guardando este registro (evitar duplicados)
                if (savingFlags.current[stockId]) {
                    return;
                }

                // Obtener valores actualizados del estado local usando ref (no setState)
                const currentValues = localStockValuesRef.current[stockId] || {};
                const currentStockInicial = currentValues.stockInicial ?? 0;
                const currentLlevamos = currentValues.llevamos ?? 0;

                // Marcar como guardando
                savingFlags.current[stockId] = true;

                // Recalcular pedidos del día actualizado para guardar
                let currentPedidosDelDia = 0;

                // Buscar producto si no está presente
                let targetProduct = product;
                if (!targetProduct && !stockId.startsWith('new-')) {
                    // Intentar encontrar el producto en productsForStock basado en el stock actual
                    const currentStock = stock.find(s => String(s._id) === stockId);
                    if (currentStock) {
                        targetProduct = productsForStock.find(p => isSameProduct(currentStock, p));
                    }
                }

                if (targetProduct) {
                    currentPedidosDelDia = calculatePedidosDelDia(targetProduct);
                } else {
                    // Si no se encuentra el producto, intentar usar el valor guardado
                    const currentStock = stock.find(s => String(s._id) === stockId);
                    currentPedidosDelDia = currentStock?.pedidosDelDia || 0;
                }

                // Fórmula: stockInicial + llevamos - pedidosDelDia = stockFinal
                const stockFinal = currentStockInicial + currentLlevamos - currentPedidosDelDia;

                // Guardar en servidor
                try {
                    if (stockId.startsWith('new-')) {
                        // Crear nuevo registro solo si no existe
                        if (!selectedPuntoEnvio || !targetProduct) return;

                        const fromDate = searchParams.get('from');
                        if (!fromDate) return; // Necesitamos una fecha para crear stock

                        const pedidosDelDiaCalculado = calculatePedidosDelDia(targetProduct);
                        // Guardar el producto con la sección para distinguir PERRO de GATO
                        const productoConSeccion = `${targetProduct.section} ${targetProduct.product}`.trim();
                        const stockData: any = {
                            puntoEnvio: selectedPuntoEnvio,
                            producto: productoConSeccion,
                            peso: targetProduct.weight || undefined,
                            stockInicial: currentStockInicial,
                            llevamos: currentLlevamos,
                            stockFinal,
                            pedidosDelDia: pedidosDelDiaCalculado,
                            section: targetProduct.section,
                            fecha: fromDate, // Enviar formato YYYY-MM-DD desde URL
                        };

                        const result = await createStockAction(stockData);
                        if (result.success && result.stock) {
                            // Actualizar estado local con el nuevo ID
                            const newId = String(result.stock._id);
                            setLocalStockValues(prevLocal => {
                                const { [stockId]: _, ...rest } = prevLocal;
                                const updated = { ...rest, [newId]: { stockInicial: result.stock!.stockInicial, llevamos: result.stock!.llevamos } };
                                localStockValuesRef.current = updated;
                                return updated;
                            });
                            setStock(prev => [...prev, result.stock!]);
                        }
                    } else {
                        // Actualizar registro existente
                        const updateData: any = {
                            stockInicial: currentStockInicial,
                            llevamos: currentLlevamos,
                            stockFinal,
                        };

                        // Si tenemos el producto, actualizar también pedidosDelDia
                        if (targetProduct) {
                            updateData.pedidosDelDia = calculatePedidosDelDia(targetProduct);

                            // IMPORTANTE: Actualizar el nombre del producto para incluir la sección
                            // Esto corrige registros viejos que solo tienen "POLLO" sin "PERRO" o "GATO"
                            const currentStock = stock.find(s => String(s._id) === stockId);
                            if (currentStock) {
                                const currentProductUpper = (currentStock.producto || '').toUpperCase();
                                const hasSection = currentProductUpper.includes('PERRO') ||
                                    currentProductUpper.includes('GATO') ||
                                    currentProductUpper.includes('BIG DOG');

                                // Si el registro viejo no tiene sección, agregársela
                                if (!hasSection) {
                                    const productoConSeccion = `${targetProduct.section} ${targetProduct.product}`.trim();
                                    updateData.producto = productoConSeccion;
                                }
                            }
                        }

                        const result = await updateStockAction(stockId, updateData);
                        if (result.success && result.stock) {
                            // Actualizar estado local sin recargar
                            setStock(prev => prev.map(s =>
                                String(s._id) === stockId ? result.stock! : s
                            ));
                            // Actualizar también localStockValues con los valores del servidor
                            setLocalStockValues(prev => ({
                                ...prev,
                                [stockId]: {
                                    stockInicial: result.stock!.stockInicial,
                                    llevamos: result.stock!.llevamos,
                                }
                            }));
                            localStockValuesRef.current = {
                                ...localStockValuesRef.current,
                                [stockId]: {
                                    stockInicial: result.stock!.stockInicial,
                                    llevamos: result.stock!.llevamos,
                                }
                            };
                        }
                    }
                } catch (error) {
                    console.error('Error saving stock:', error);
                    // Revertir cambios locales en caso de error
                    if (selectedPuntoEnvio) {
                        loadTablasData(selectedPuntoEnvio, { skipLocalUpdate: true });
                    }
                } finally {
                    // Remover flag de guardando
                    delete savingFlags.current[stockId];
                }
            } catch (error) {
                console.error('Error in save timeout:', error);
                delete savingFlags.current[stockId];
            }
            delete saveTimeouts.current[stockId];
        }, 1000);
    }, [selectedPuntoEnvio, stock, getStockForDate, calculatePedidosDelDia, isSameProduct, productsForStock, searchParams]);

    // Función para determinar el orden de los productos
    const getProductOrder = (product: string, section: string): number => {
        const productUpper = product.toUpperCase();
        const sectionUpper = section.toUpperCase();

        // PERRO POLLO (pero no BIG DOG POLLO)
        if (sectionUpper === 'PERRO' && productUpper.includes('POLLO') && !productUpper.includes('BIG DOG')) {
            return 1;
        }
        // PERRO VACA (pero no BIG DOG VACA)
        if (sectionUpper === 'PERRO' && productUpper.includes('VACA') && !productUpper.includes('BIG DOG')) {
            return 2;
        }
        // PERRO CERDO
        if (sectionUpper === 'PERRO' && productUpper.includes('CERDO')) {
            return 3;
        }
        // PERRO CORDERO
        if (sectionUpper === 'PERRO' && productUpper.includes('CORDERO')) {
            return 4;
        }
        // BIG DOG POLLO
        if (productUpper.includes('BIG DOG POLLO')) {
            return 5;
        }
        // BIG DOG VACA
        if (productUpper.includes('BIG DOG VACA')) {
            return 6;
        }
        // GATO POLLO
        if (sectionUpper === 'GATO' && productUpper.includes('POLLO')) {
            return 7;
        }
        // GATO VACA
        if (sectionUpper === 'GATO' && productUpper.includes('VACA')) {
            return 8;
        }
        // GATO CORDERO
        if (sectionUpper === 'GATO' && productUpper.includes('CORDERO')) {
            return 9;
        }
        // HUESOS CARNOSOS
        if (productUpper.includes('HUESOS CARNOSOS') || productUpper.includes('HUESO CARNOSO')) {
            return 10;
        }
        // BOX DE COMPLEMENTOS
        if (productUpper.includes('BOX DE COMPLEMENTOS') || productUpper.includes('BOX COMPLEMENTOS')) {
            return 11;
        }

        // Productos no especificados van al final
        return 999;
    };

    // Función para determinar el color de fondo de la fila según el producto
    const getProductRowColor = (product: string, section: string): string => {
        const productUpper = product.toUpperCase();
        const sectionUpper = section.toUpperCase();

        // PERRO POLLO (5KG, 10KG, BIG DOG POLLO) y GATO POLLO: amarillo
        if (productUpper.includes('POLLO') && (sectionUpper === 'PERRO' || sectionUpper === 'GATO')) {
            return 'bg-yellow-100 hover:bg-yellow-200';
        }

        // VACA: rojo más oscuro (antes era claro)
        if (productUpper.includes('VACA')) {
            return 'bg-red-300 hover:bg-red-400';
        }

        // CERDO: rosa claro (antes era más oscuro)
        if (productUpper.includes('CERDO')) {
            return 'bg-pink-100 hover:bg-pink-200';
        }

        // CORDERO: violeta
        if (productUpper.includes('CORDERO')) {
            return 'bg-violet-100 hover:bg-violet-200';
        }

        // HUESOS CARNOSOS: marrón fuerte
        if (productUpper.includes('HUESOS CARNOSOS') || productUpper.includes('HUESO CARNOSO')) {
            return 'bg-amber-700 text-white hover:bg-amber-800';
        }

        // BOX DE COMPLEMENTOS: color piel medio marrón
        if (productUpper.includes('BOX DE COMPLEMENTOS') || productUpper.includes('BOX COMPLEMENTOS')) {
            return 'bg-stone-200 hover:bg-stone-300';
        }

        // Color por defecto
        return 'hover:bg-gray-50';
    };

    return (
        <div className="h-full w-full">
            <div className="mb-5 p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {dictionary.app.admin.navigation.gestionEnvioExpressStock || 'Gestión de Envío Express y Stock'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Gestiona los puntos de envío express, su stock y órdenes asociadas.
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5">
                {/* Filtros: Punto de Envío */}
                <div className="mb-6 space-y-4">
                    {/* Selector de punto de envío */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">
                                📍 Seleccionar Punto de Envío
                            </label>
                            <Select
                                value={selectedPuntoEnvio}
                                onValueChange={handlePuntoEnvioChange}
                                disabled={!isAdmin && initialPuntosEnvio.length <= 1}
                            >
                                <SelectTrigger className="w-full max-w-md">
                                    <SelectValue placeholder={puntosEnvio.length === 0 ? "No hay puntos de envío disponibles" : "Selecciona un punto de envío..."} />
                                </SelectTrigger>
                                <SelectContent>
                                    {isAdmin && (
                                        <SelectItem value="all" className="font-bold border-b mb-1">
                                            Todos los puntos (Resumen General)
                                        </SelectItem>
                                    )}
                                    {puntosEnvio.length === 0 ? (
                                        <SelectItem value="__empty" disabled>
                                            No hay puntos de envío
                                        </SelectItem>
                                    ) : (
                                        puntosEnvio.map((punto) => (
                                            <SelectItem key={String(punto._id)} value={punto.nombre || ''}>
                                                {punto.nombre}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        {(isAdmin || canDelete) && (
                            <div className="flex gap-2 mt-6">
                                {isAdmin && (
                                    <>
                                        <Button onClick={() => setShowCreatePuntoEnvioModal(true)} variant="outline">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Nuevo Punto
                                        </Button>
                                        <Button
                                            onClick={() => setShowUpdatePuntoEnvioModal(true)}
                                            variant="outline"
                                            disabled={!selectedPuntoEnvio || selectedPuntoEnvio === 'all'}
                                        >
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            Editar
                                        </Button>
                                    </>
                                )}
                                {canDelete && (
                                    <Button
                                        onClick={() => setShowDeletePuntoEnvioModal(true)}
                                        variant="outline"
                                        disabled={!selectedPuntoEnvio || selectedPuntoEnvio === 'all'}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mostrar Resumen General si está seleccionado "all" */}
                {selectedPuntoEnvio === 'all' && (
                    <ResumenGeneralTables
                        orders={filteredAndSortedOrders}
                        puntosEnvio={puntosEnvio}
                        productsForStock={productsForStock}
                    />
                )}

                {/* Mostrar Tabs normales si hay un punto específico seleccionado */}
                {selectedPuntoEnvio && selectedPuntoEnvio !== 'all' && (
                    <div className="space-y-4">
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <TabsList className={isAdmin ? "grid w-full grid-cols-4" : "grid w-full grid-cols-3"}>
                                <TabsTrigger value="orders" className="flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4" />
                                    Órdenes ({filteredAndSortedOrders.length})
                                </TabsTrigger>
                                <TabsTrigger value="stock" className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Stock ({stock.length})
                                </TabsTrigger>
                                <TabsTrigger value="metrics" className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    Métricas
                                </TabsTrigger>
                                {isAdmin && (
                                    <TabsTrigger value="detalle" className="flex items-center gap-2">
                                        <Edit2 className="h-4 w-4" />
                                        Detalle
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            {/* Filtro de rango de fechas (compartido por Órdenes y Stock). Sticky para no perderse al hacer scroll */}
                            <div className="sticky top-0 z-10 mt-4 flex flex-col sm:flex-row gap-4 py-3 bg-background border-b border-border/50">
                                <DateRangeFilter />
                                {activeTab === 'orders' && <EstadoEnvioFilter />}
                            </div>

                            <TabsContent value="metrics" className="mt-6">
                                <MonthlyMetricsTable orders={orders} puntoEnvioName={selectedPuntoEnvio} />
                            </TabsContent>

                            <TabsContent value="orders" className="mt-6">
                                {!selectedPuntoEnvio || selectedPuntoEnvio === 'all' ? (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Órdenes Express</CardTitle>
                                            <CardDescription>
                                                Selecciona un punto de envío para ver las órdenes
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-center py-8 text-muted-foreground">
                                                <p className="text-lg mb-2">📍 Selecciona un punto de envío específico para comenzar</p>
                                                <p className="text-sm">Los datos se cargarán automáticamente</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : isLoading ? (
                                    <Card>
                                        <CardContent className="py-8">
                                            <div className="text-center text-muted-foreground">
                                                <p>Cargando órdenes...</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : orders.length === 0 ? (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Órdenes Express</CardTitle>
                                            <CardDescription>
                                                Órdenes express asociadas a este punto de envío
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-center py-8 text-muted-foreground space-y-4">
                                                <p>No hay órdenes express para este punto de envío en la fecha seleccionada.</p>
                                                <p className="text-sm">
                                                    Usá el selector de fechas de arriba para cambiar el rango, o volvé a hoy:
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    onClick={setDateRangeToToday}
                                                    className="gap-2"
                                                >
                                                    <CalendarDays className="h-4 w-4" />
                                                    Ver hoy
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (() => {
                                    // SIEMPRE habilitar drag cuando hay un punto de envío específico seleccionado Y una fecha seleccionada
                                    const isDragEnabled = Boolean(selectedPuntoEnvio && selectedPuntoEnvio !== 'all' && fromFromUrl);

                                    // Crear array de IDs para SortableContext usando la lista COMPLETA filtrada
                                    // Esto permite que el drag and drop funcione correctamente con paginación
                                    const itemIds = filteredAndSortedOrders.map((order) => String(order._id));

                                    const tableComponent = (
                                        <>
                                            <OrdersDataTable
                                                isExpressContext={true}
                                                fontSize="text-sm"
                                                columns={createExpressColumns(
                                                    undefined, // No recargar datos al actualizar
                                                    moveOrder,
                                                    isDragEnabled, // Pasar flag para ocultar columna de flechas si drag está habilitado
                                                    handleOrderUpdate // Pasar callback para actualizar orden
                                                )}
                                                data={paginatedOrders}
                                                pageCount={Math.ceil(filteredAndSortedOrders.length / pageSizeFromUrl)}
                                                total={filteredAndSortedOrders.length}
                                                pagination={{
                                                    pageIndex: pageFromUrl - 1,
                                                    pageSize: pageSizeFromUrl,
                                                }}
                                                sorting={sortFromUrl ? [{
                                                    id: sortFromUrl.split('.')[0],
                                                    desc: sortFromUrl.split('.')[1] === 'desc'
                                                }] : [{ id: 'createdAt', desc: true }]}
                                                canEdit={canEdit}
                                                canDelete={canDelete}
                                                onOrderUpdated={async () => {
                                                    // Recargar solo si es necesario (edición completa, no campos inline)
                                                    if (selectedPuntoEnvio) {
                                                        await loadTablasData(selectedPuntoEnvio, { silent: true });
                                                    }
                                                }}
                                                onDuplicate={handleDuplicate}
                                                isDragEnabled={isDragEnabled}
                                                hideOrderTypeFilter={true}
                                                hideDateRangeFilter={true}
                                            />
                                        </>
                                    );

                                    // SIEMPRE envolver con DndContext cuando hay punto de envío
                                    return (
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                            modifiers={[restrictToVerticalAxis]}
                                        >
                                            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                                                {tableComponent}
                                            </SortableContext>
                                        </DndContext>
                                    );
                                })()}
                            </TabsContent>

                            <TabsContent value="stock" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle>Stock</CardTitle>
                                                    <CardDescription>
                                                        Gestión de stock día a día para este punto de envío
                                                    </CardDescription>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={async () => {
                                                            if (!selectedPuntoEnvio || !fromFromUrl) return;
                                                            setIsLoading(true);
                                                            try {
                                                                const result = await recalculateStockChainAction(selectedPuntoEnvio, fromFromUrl);
                                                                if (result.success) {
                                                                    toast({
                                                                        title: 'Stock recalculado',
                                                                        description: 'La cadena de stock ha sido sincronizada.',
                                                                    });
                                                                    await loadTablasData(selectedPuntoEnvio);
                                                                } else {
                                                                    toast({
                                                                        title: 'Error',
                                                                        description: 'No se pudo recalcular el stock.',
                                                                        variant: 'destructive',
                                                                    });
                                                                }
                                                            } catch (error) {
                                                                toast({
                                                                    title: 'Error',
                                                                    description: 'Ocurrió un error inesperado al recalcular.',
                                                                    variant: 'destructive',
                                                                });
                                                            } finally {
                                                                setIsLoading(false);
                                                            }
                                                        }}
                                                        disabled={!selectedPuntoEnvio || !fromFromUrl || isLoading}
                                                    >
                                                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                                        Recalcular Cadena
                                                    </Button>
                                                    <Button onClick={() => setShowAddStockModal(true)} disabled={!selectedPuntoEnvio}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Agregar producto
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <p>Cargando stock...</p>
                                            </div>
                                        ) : !selectedPuntoEnvio ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <p>Selecciona un punto de envío para ver el stock</p>
                                            </div>
                                        ) : productsForStock.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <p>Cargando productos...</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b bg-gray-50">
                                                            <th className="text-left p-2 font-semibold">Sección</th>
                                                            <th className="text-left p-2 font-semibold">Producto</th>
                                                            <th className="text-left p-2 font-semibold">Peso/Sabor</th>
                                                            <th className="text-right p-2 font-semibold">Stock Inicial</th>
                                                            <th className="text-right p-2 font-semibold">Llevamos</th>
                                                            <th className="text-center p-2 font-semibold">Pedidos del Día</th>
                                                            <th className="text-center p-2 font-semibold">Stock Final</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {[...productsForStock].sort((a, b) => {
                                                            const orderA = getProductOrder(a.product, a.section);
                                                            const orderB = getProductOrder(b.product, b.section);

                                                            // Si tienen el mismo orden, ordenar por peso
                                                            if (orderA === orderB) {
                                                                const weightA = (a.weight || '').toUpperCase();
                                                                const weightB = (b.weight || '').toUpperCase();
                                                                return weightA.localeCompare(weightB);
                                                            }

                                                            return orderA - orderB;
                                                        }).map((product) => {
                                                            // Buscar registros de stock para este producto en la fecha seleccionada
                                                            const stockForDate = getStockForDate();
                                                            // Usar la función de comparación normalizada
                                                            const stockRecords = stockForDate.filter(s => isSameProduct(s, product));

                                                            // Si hay múltiples registros, tomar solo el más reciente (por fecha de creación)
                                                            const uniqueStockRecord = stockRecords.length > 0
                                                                ? stockRecords.sort((a, b) => {
                                                                    const dateA = new Date(a.createdAt || a.fecha || 0).getTime();
                                                                    const dateB = new Date(b.createdAt || b.fecha || 0).getTime();
                                                                    return dateB - dateA;
                                                                })[0]
                                                                : null;

                                                            // Obtener el color de la fila para este producto
                                                            const rowColorClass = getProductRowColor(product.product, product.section);

                                                            // Calcular pedidos del día en vivo
                                                            const pedidosDelDia = calculatePedidosDelDia(product);

                                                            // Si no hay registros, mostrar una fila vacía con campos siempre editables
                                                            if (!uniqueStockRecord) {
                                                                const emptyId = `new-${product.section}-${product.product}-${product.weight || 'no-weight'}`;
                                                                const localValues = localStockValues[emptyId] || { stockInicial: 0, llevamos: 0 };
                                                                const stockInicial = localValues.stockInicial ?? 0;
                                                                const llevamos = localValues.llevamos ?? 0;
                                                                const stockFinalCalculado = stockInicial + llevamos - pedidosDelDia;

                                                                return (
                                                                    <tr key={`${product.section}-${product.product}-${product.weight || 'no-weight'}`} className={`border-b ${rowColorClass}`}>
                                                                        <td className="p-2 font-bold text-gray-700">{product.section}</td>
                                                                        <td className="p-2 font-bold">{product.product}</td>
                                                                        <td className="p-2 font-bold text-gray-600">{product.weight || '-'}</td>
                                                                        <td className="p-2 text-right">
                                                                            <div className="flex justify-end">
                                                                                <Input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    value={stockInicial}
                                                                                    onChange={(e) => {
                                                                                        const inputValue = e.target.value;
                                                                                        if (inputValue === '') return;
                                                                                        const newValue = Number(inputValue);
                                                                                        if (!isNaN(newValue) && newValue >= 0) {
                                                                                            saveStockValue(emptyId, 'stockInicial', newValue, product);
                                                                                        }
                                                                                    }}
                                                                                    onBlur={(e) => {
                                                                                        const inputValue = e.target.value;
                                                                                        if (inputValue === '' || isNaN(Number(inputValue))) {
                                                                                            saveStockValue(emptyId, 'stockInicial', 0, product);
                                                                                        }
                                                                                    }}
                                                                                    onKeyDown={(e) => {
                                                                                        if (stockInicial === 0 && /[0-9]/.test(e.key) &&
                                                                                            e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' &&
                                                                                            e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Enter') {
                                                                                            e.preventDefault();
                                                                                            saveStockValue(emptyId, 'stockInicial', Number(e.key), product);
                                                                                        }
                                                                                    }}
                                                                                    className="w-20 text-right h-8 font-bold"
                                                                                />
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-2 text-right">
                                                                            <div className="flex justify-end">
                                                                                <Input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    value={llevamos}
                                                                                    onChange={(e) => {
                                                                                        const inputValue = e.target.value;
                                                                                        if (inputValue === '') return;
                                                                                        const newValue = Number(inputValue);
                                                                                        if (!isNaN(newValue) && newValue >= 0) {
                                                                                            saveStockValue(emptyId, 'llevamos', newValue, product);
                                                                                        }
                                                                                    }}
                                                                                    onBlur={(e) => {
                                                                                        const inputValue = e.target.value;
                                                                                        if (inputValue === '' || isNaN(Number(inputValue))) {
                                                                                            saveStockValue(emptyId, 'llevamos', 0, product);
                                                                                        }
                                                                                    }}
                                                                                    onKeyDown={(e) => {
                                                                                        if (llevamos === 0 && /[0-9]/.test(e.key) &&
                                                                                            e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' &&
                                                                                            e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Enter') {
                                                                                            e.preventDefault();
                                                                                            saveStockValue(emptyId, 'llevamos', Number(e.key), product);
                                                                                        }
                                                                                    }}
                                                                                    className="w-20 text-right h-8 font-bold"
                                                                                />
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-2 text-center">
                                                                            <span className="font-semibold text-gray-700">{pedidosDelDia}</span>
                                                                        </td>
                                                                        <td className="p-2 text-center font-bold">
                                                                            {stockFinalCalculado}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            }

                                                            // Si hay registro, usar sus valores
                                                            const stockId = String(uniqueStockRecord._id);
                                                            const localValues = localStockValues[stockId] || {
                                                                stockInicial: uniqueStockRecord.stockInicial,
                                                                llevamos: uniqueStockRecord.llevamos
                                                            };
                                                            const stockInicial = localValues.stockInicial ?? uniqueStockRecord.stockInicial ?? 0;
                                                            const llevamos = localValues.llevamos ?? uniqueStockRecord.llevamos ?? 0;
                                                            const displayStockFinal = stockInicial + llevamos - pedidosDelDia;

                                                            return (
                                                                <tr key={`${product.section}-${product.product}-${product.weight || 'no-weight'}-${stockId}`} className={`border-b ${rowColorClass}`}>
                                                                    <td className="p-2 font-bold text-gray-700">{product.section}</td>
                                                                    <td className="p-2 font-bold">{product.product}</td>
                                                                    <td className="p-2 font-bold text-gray-600">{product.weight || '-'}</td>
                                                                    <td className="p-2 text-right">
                                                                        <div className="flex justify-end">
                                                                            <Input
                                                                                type="number"
                                                                                min="0"
                                                                                value={stockInicial}
                                                                                onChange={(e) => {
                                                                                    const inputValue = e.target.value;
                                                                                    const newValue = inputValue === '' ? 0 : (parseInt(inputValue, 10) || 0);
                                                                                    if (!isNaN(newValue) && newValue >= 0) {
                                                                                        saveStockValue(stockId, 'stockInicial', newValue, product);
                                                                                    }
                                                                                }}
                                                                                onBlur={(e) => {
                                                                                    const inputValue = e.target.value;
                                                                                    const finalValue = inputValue === '' || isNaN(Number(inputValue)) ? 0 : parseInt(inputValue, 10);
                                                                                    if (!isNaN(finalValue) && finalValue >= 0) {
                                                                                        saveStockValue(stockId, 'stockInicial', finalValue, product);
                                                                                    }
                                                                                }}
                                                                                onKeyDown={(e) => {
                                                                                    if (stockInicial === 0 && /[0-9]/.test(e.key) &&
                                                                                        e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' &&
                                                                                        e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Enter') {
                                                                                        e.preventDefault();
                                                                                        saveStockValue(stockId, 'stockInicial', Number(e.key), product);
                                                                                    }
                                                                                }}
                                                                                className="w-20 text-right h-8 font-bold"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-2 text-right">
                                                                        <div className="flex justify-end">
                                                                            <Input
                                                                                type="number"
                                                                                min="0"
                                                                                value={llevamos}
                                                                                onChange={(e) => {
                                                                                    const inputValue = e.target.value;
                                                                                    const newValue = inputValue === '' ? 0 : (parseInt(inputValue, 10) || 0);
                                                                                    if (!isNaN(newValue) && newValue >= 0) {
                                                                                        saveStockValue(stockId, 'llevamos', newValue, product);
                                                                                    }
                                                                                }}
                                                                                onBlur={(e) => {
                                                                                    const inputValue = e.target.value;
                                                                                    const finalValue = inputValue === '' || isNaN(Number(inputValue)) ? 0 : parseInt(inputValue, 10);
                                                                                    if (!isNaN(finalValue) && finalValue >= 0) {
                                                                                        saveStockValue(stockId, 'llevamos', finalValue, product);
                                                                                    }
                                                                                }}
                                                                                onKeyDown={(e) => {
                                                                                    if (llevamos === 0 && /[0-9]/.test(e.key) &&
                                                                                        e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' &&
                                                                                        e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Enter') {
                                                                                        e.preventDefault();
                                                                                        saveStockValue(stockId, 'llevamos', Number(e.key), product);
                                                                                    }
                                                                                }}
                                                                                className="w-20 text-right h-8 font-bold"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-2 text-center">
                                                                        <span className="font-semibold text-gray-700">{pedidosDelDia}</span>
                                                                    </td>
                                                                    <td className="p-2 text-center font-bold">
                                                                        {displayStockFinal}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {
                                isAdmin && (
                                    <TabsContent value="detalle" className="mt-6">
                                        {(() => {
                                            // Calcular totales
                                            const totalEnvios = orders.length;
                                            const totalIngresos = orders.reduce((sum, order) => sum + (order.total || 0), 0);
                                            const totalCostoEnvio = orders.reduce((sum, order) => sum + (order.shippingPrice || 0), 0);
                                            const porcentajeCosto = totalIngresos > 0 ? ((totalCostoEnvio / totalIngresos) * 100).toFixed(1) : '0';
                                            const costoEnvioPromedio = totalEnvios > 0 ? totalCostoEnvio / totalEnvios : 0;

                                            return (
                                                <>
                                                    <div className="grid gap-4 md:grid-cols-4 mb-6">
                                                        <Card>
                                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                                <CardTitle className="text-sm font-medium">
                                                                    Cantidad de Envíos
                                                                </CardTitle>
                                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="text-2xl font-bold">{totalEnvios}</div>
                                                            </CardContent>
                                                        </Card>
                                                        <Card>
                                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                                <CardTitle className="text-sm font-medium">
                                                                    Costo de Envío Total
                                                                </CardTitle>
                                                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="text-2xl font-bold">
                                                                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(totalCostoEnvio)}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Equivale al {porcentajeCosto}% de los ingresos
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                        <Card>
                                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                                <CardTitle className="text-sm font-medium">
                                                                    Costo de Envío Promedio
                                                                </CardTitle>
                                                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="text-2xl font-bold">
                                                                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(costoEnvioPromedio)}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Por pedido
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                        <Card>
                                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                                <CardTitle className="text-sm font-medium">
                                                                    Ingresos Totales
                                                                </CardTitle>
                                                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="text-2xl font-bold">
                                                                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(totalIngresos)}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>

                                                    <QuantityTable
                                                        data={quantityStats?.sameDay || []}
                                                        title="Desglose por Producto (KG)"
                                                        description={`Cantidades mensuales en KG para envíos express en el año ${new Date().getFullYear()}`}
                                                    />
                                                </>
                                            );
                                        })()}
                                    </TabsContent>
                                )
                            }
                        </Tabs>
                    </div>
                )
                }
            </div >

            {selectedPuntoEnvio && selectedPuntoEnvio !== 'all' && (
                <AddStockModal
                    open={showAddStockModal}
                    onOpenChange={setShowAddStockModal}
                    puntoEnvio={selectedPuntoEnvio}
                    defaultDate={searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date()}
                    onStockCreated={() => {
                        if (selectedPuntoEnvio) {
                            loadTablasData(selectedPuntoEnvio);
                        }
                    }}
                />
            )}

            <CreatePuntoEnvioModal
                open={showCreatePuntoEnvioModal}
                onOpenChange={setShowCreatePuntoEnvioModal}
                onPuntoEnvioCreated={() => {
                    handlePuntosEnvioRefresh();
                }}
            />

            <UpdatePuntoEnvioModal
                open={showUpdatePuntoEnvioModal}
                onOpenChange={setShowUpdatePuntoEnvioModal}
                puntoEnvio={puntosEnvio.find(p => p.nombre === selectedPuntoEnvio) || null}
                onPuntoEnvioUpdated={() => {
                    handlePuntosEnvioRefresh();
                }}
            />

            <DeletePuntoEnvioDialog
                open={showDeletePuntoEnvioModal}
                onOpenChange={setShowDeletePuntoEnvioModal}
                puntoEnvio={puntosEnvio.find(p => p.nombre === selectedPuntoEnvio) || null}
                onDeleted={async (deletedNombre) => {
                    const list = await handlePuntosEnvioRefresh();
                    if (selectedPuntoEnvio === deletedNombre) {
                        const next = list.length > 0
                            ? (isAdmin ? 'all' : list[0]?.nombre ?? '')
                            : '';
                        setSelectedPuntoEnvio(next);
                        updateUrlParams('puntoId', next);
                    }
                }}
            />

            <DuplicateOrderModal
                open={showDuplicateModal}
                onOpenChange={setShowDuplicateModal}
                puntosEnvio={puntosEnvio}
                currentPuntoEnvio={selectedPuntoEnvio}
                onConfirm={handleConfirmDuplicate}
            />
        </div >
    );
}

