import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Order, PuntoEnvio } from '@/lib/services';
type ProductForStock = any;
import { ResumenGeneralChart } from './ResumenGeneralChart';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { calculateItemWeight } from '@/lib/services/utils/weightUtils';
import { getQuantityStatsByMonthAction } from '../../analytics/actions';
import { getExpressOrdersMetricsAction } from '../actions';


interface ResumenGeneralTablesProps {
    orders: Order[];
    puntosEnvio: PuntoEnvio[];
    productsForStock: ProductForStock[];
}

export function ResumenGeneralTables({ orders, puntosEnvio, productsForStock }: ResumenGeneralTablesProps) {
    const searchParams = useSearchParams();
    const fromFromUrl = searchParams.get('from');
    // Si hay un from en la URL, usar ese mes como default
    const defaultMonth = fromFromUrl ? fromFromUrl.substring(0, 7) : 'all';
    const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);
    const [backendStats, setBackendStats] = useState<any>(null);
    const [extraMetrics, setExtraMetrics] = useState<any>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    // Fetch accurate stats from backend
    useEffect(() => {
        const fetchStats = async () => {
            setIsLoadingStats(true);
            try {
                // Fetch kilos (existing action)
                const quantityPromise = getQuantityStatsByMonthAction(undefined, undefined, 'all');

                // Fetch other metrics (new action)
                const metricsPromise = getExpressOrdersMetricsAction(undefined);

                const [quantityResult, metricsResult] = await Promise.all([quantityPromise, metricsPromise]);

                if (quantityResult.success) {
                    setBackendStats(quantityResult.data);
                }

                if (metricsResult.success && metricsResult.data) {
                    setExtraMetrics(metricsResult.data);
                }
            } catch (error) {
                console.error('Error fetching backend summary stats:', error);
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchStats();
    }, []);

    // Sincronizar selectedMonth con el filtro de la URL
    useEffect(() => {
        if (fromFromUrl) {
            const urlMonth = fromFromUrl.substring(0, 7);
            setSelectedMonth(urlMonth);
        } else {
            setSelectedMonth('all');
        }
    }, [fromFromUrl]);

    // Derived state: Available months from orders and extraMetrics
    const availableMonths = useMemo(() => {
        const months = new Set<string>();

        // Add months from orders
        orders.forEach(order => {
            let orderDate: Date;
            if (order.deliveryDay) orderDate = new Date(order.deliveryDay);
            else orderDate = new Date(new Date(order.createdAt).getTime() - (3 * 60 * 60 * 1000));
            months.add(orderDate.toISOString().substring(0, 7));
        });

        // Add months from extraMetrics
        if (extraMetrics?.monthly) {
            extraMetrics.monthly.forEach((m: any) => months.add(m.month));
        }

        // Add months from backendStats (kilos)
        if (backendStats?.sameDay) {
            backendStats.sameDay.forEach((s: any) => months.add(s.month));
        }

        return Array.from(months).sort().reverse();
    }, [orders, extraMetrics, backendStats]);

    // Filter orders based on selection
    const filteredOrders = useMemo(() => {
        if (selectedMonth === 'all') return orders;
        const filtered = orders.filter(order => {
            let orderDate: Date;
            if (order.deliveryDay) {
                orderDate = new Date(order.deliveryDay);
            } else {
                const createdAt = new Date(order.createdAt);
                orderDate = new Date(createdAt.getTime() - (3 * 60 * 60 * 1000));
            }
            return orderDate.toISOString().substring(0, 7) === selectedMonth;
        });
        return filtered;
    }, [orders, selectedMonth]);

    // Data processing for Summary Tables (Aggregated by Punto Envio)
    const summaryData = useMemo(() => {
        const dataByPunto: Record<string, {
            name: string;
            totalOrders: number;
            totalKilos: number;
            totalRevenue: number;
            totalShippingCost: number;
            flavors: Record<string, number>;
        }> = {};

        // Initialize
        puntosEnvio.forEach(punto => {
            if (punto.nombre) {
                dataByPunto[punto.nombre] = {
                    name: punto.nombre,
                    totalOrders: 0,
                    totalKilos: 0,
                    totalRevenue: 0,
                    totalShippingCost: 0,
                    flavors: {
                        'POLLO': 0, 'VACA': 0, 'CERDO': 0, 'CORDERO': 0,
                        'BIG DOG POLLO': 0, 'BIG DOG VACA': 0,
                        'GATO POLLO': 0, 'GATO VACA': 0, 'GATO CORDERO': 0,
                        'HUESOS CARNOSOS': 0
                    }
                };
            }
        });
        // Agregar grupo especial para órdenes sin punto de venta
        const SIN_PUNTO = 'Sin punto de venta';
        dataByPunto[SIN_PUNTO] = {
            name: SIN_PUNTO,
            totalOrders: 0,
            totalKilos: 0,
            totalRevenue: 0,
            totalShippingCost: 0,
            flavors: {
                'POLLO': 0, 'VACA': 0, 'CERDO': 0, 'CORDERO': 0,
                'BIG DOG POLLO': 0, 'BIG DOG VACA': 0,
                'GATO POLLO': 0, 'GATO VACA': 0, 'GATO CORDERO': 0,
                'HUESOS CARNOSOS': 0
            }
        };

        // FIRST: Populate with metrics from the specialized backend API (More accurate for historical data)
        if (extraMetrics?.monthly) {
            extraMetrics.monthly.forEach((m: any) => {
                // Filter by month if one is selected
                if (selectedMonth !== 'all' && m.month !== selectedMonth) return;

                let puntoNombre = m.puntoEnvio;
                if (!puntoNombre || !dataByPunto[puntoNombre]) {
                    puntoNombre = SIN_PUNTO;
                }
                const puntoData = dataByPunto[puntoNombre];
                puntoData.totalOrders += (m.totalOrders || 0);
                puntoData.totalRevenue += (m.totalRevenue || 0);
                puntoData.totalShippingCost += (m.totalShipping || 0);
            });
        }

        // SECOND: Process flavors from filteredOrders (since we don't have flavor breakdown in expressMetrics yet)
        // If we don't have extraMetrics, we also fallback to orders for the main metrics
        filteredOrders.forEach(order => {
            let puntoNombre = order.puntoEnvio || order.deliveryArea?.puntoEnvio;
            if (!puntoNombre || !dataByPunto[puntoNombre]) {
                puntoNombre = SIN_PUNTO;
            }
            const puntoData = dataByPunto[puntoNombre];

            // Only add main metrics if we didn't get them from the backend specialized API
            if (!extraMetrics?.monthly || extraMetrics.monthly.length === 0) {
                puntoData.totalOrders += 1;
                puntoData.totalRevenue += (order.total || 0);
                puntoData.totalShippingCost += (order.shippingPrice || 0);
            }

            // Always process flavors from local orders (fallback if not in backend aggregation)
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                    const productName = (item.name || '').toUpperCase().trim();
                    const qty = item.quantity || item.options?.[0]?.quantity || 1;
                    let weight = calculateItemWeight(productName, item.options?.[0]?.name || '');

                    const fullName = `${productName} ${item.options?.[0]?.name || ''}`.toUpperCase();

                    if (weight > 0) {
                        const totalItemWeight = weight * qty;

                        // Se suma siempre localmente como base/fallback
                        puntoData.totalKilos += totalItemWeight;

                        if (productName.includes('BIG DOG')) {
                            if (fullName.includes('POLLO')) puntoData.flavors['BIG DOG POLLO'] += totalItemWeight;
                            else if (fullName.includes('VACA')) puntoData.flavors['BIG DOG VACA'] += totalItemWeight;
                        } else if (productName.includes('GATO')) {
                            if (fullName.includes('POLLO')) puntoData.flavors['GATO POLLO'] += totalItemWeight;
                            else if (fullName.includes('VACA')) puntoData.flavors['GATO VACA'] += totalItemWeight;
                            else if (fullName.includes('CORDERO')) puntoData.flavors['GATO CORDERO'] += totalItemWeight;
                        } else if ((productName.includes('HUESOS CARNOSOS') || productName.includes('HUESO CARNOSO')) &&
                            !productName.includes('RECREATIVO') && !productName.includes('CALDO')) {
                            puntoData.flavors['HUESOS CARNOSOS'] += totalItemWeight;
                        } else {
                            if (fullName.includes('POLLO')) puntoData.flavors['POLLO'] += totalItemWeight;
                            else if (fullName.includes('VACA')) puntoData.flavors['VACA'] += totalItemWeight;
                            else if (fullName.includes('CERDO')) puntoData.flavors['CERDO'] += totalItemWeight;
                            else if (fullName.includes('CORDERO')) puntoData.flavors['CORDERO'] += totalItemWeight;
                        }
                    }
                });
            }
        });

        // REEMPLAZAR KILOS CON DATOS DEL BACKEND PARA MAYOR PRECISIÓN (SOLO SI EXISTEN)
        // Helper: match backend puntoEnvio to frontend puntoData.name
        // Backend uses empty string '' for orders without a punto, frontend uses 'Sin punto de venta'
        const matchesPuntoEnvio = (backendPunto: string | undefined, frontendName: string) => {
            const normalizedBackend = (backendPunto || '').trim().toUpperCase();
            const normalizedFrontend = frontendName.trim().toUpperCase();

            if (frontendName === SIN_PUNTO) {
                return !backendPunto || backendPunto === '';
            }
            return normalizedBackend === normalizedFrontend;
        };

        if (backendStats?.sameDay && backendStats.sameDay.length > 0) {
            Object.values(dataByPunto).forEach(puntoData => {
                const applyStats = (statsEntries: any[]) => {
                    if (statsEntries.length === 0) return;
                    
                    // Solo sobreescribimos si el backend devolvió kilos para este punto específico
                    const totalKilosBackend = statsEntries.reduce((sum: number, s: any) => sum + (s.totalMes || 0), 0);
                    if (totalKilosBackend > 0) {
                        puntoData.totalKilos = totalKilosBackend;
                        puntoData.flavors['POLLO'] = statsEntries.reduce((sum: number, s: any) => sum + (s.pollo || 0), 0);
                        puntoData.flavors['VACA'] = statsEntries.reduce((sum: number, s: any) => sum + (s.vaca || 0), 0);
                        puntoData.flavors['CERDO'] = statsEntries.reduce((sum: number, s: any) => sum + (s.cerdo || 0), 0);
                        puntoData.flavors['CORDERO'] = statsEntries.reduce((sum: number, s: any) => sum + (s.cordero || 0), 0);
                        puntoData.flavors['BIG DOG POLLO'] = statsEntries.reduce((sum: number, s: any) => sum + (s.bigDogPollo || 0), 0);
                        puntoData.flavors['BIG DOG VACA'] = statsEntries.reduce((sum: number, s: any) => sum + (s.bigDogVaca || 0), 0);
                        puntoData.flavors['GATO POLLO'] = statsEntries.reduce((sum: number, s: any) => sum + (s.gatoPollo || 0), 0);
                        puntoData.flavors['GATO VACA'] = statsEntries.reduce((sum: number, s: any) => sum + (s.gatoVaca || 0), 0);
                        puntoData.flavors['GATO CORDERO'] = statsEntries.reduce((sum: number, s: any) => sum + (s.gatoCordero || 0), 0);
                        puntoData.flavors['HUESOS CARNOSOS'] = statsEntries.reduce((sum: number, s: any) => sum + (s.huesosCarnosos || 0), 0);
                    }
                };

                if (selectedMonth !== 'all') {
                    const matching = backendStats.sameDay.filter((s: any) =>
                        s.month === selectedMonth && matchesPuntoEnvio(s.puntoEnvio, puntoData.name)
                    );
                    applyStats(matching);
                } else {
                    const matching = backendStats.sameDay.filter((s: any) =>
                        matchesPuntoEnvio(s.puntoEnvio, puntoData.name)
                    );
                    applyStats(matching);
                }
            });
        }

        return Object.values(dataByPunto);
    }, [filteredOrders, puntosEnvio, backendStats, selectedMonth]);

    // Prepare Data for Chart
    const chartData = useMemo(() => {
        const dataByMonth: Record<string, any> = {};

        // FIRST: Use extraMetrics if available (Full history)
        if (extraMetrics?.monthly) {
            extraMetrics.monthly.forEach((m: any) => {
                const monthKey = m.month;
                if (!dataByMonth[monthKey]) {
                    const [y, mm] = monthKey.split('-');
                    const dateObj = new Date(parseInt(y), parseInt(mm) - 1);
                    const monthName = format(dateObj, 'MMMM yyyy', { locale: es });
                    dataByMonth[monthKey] = {
                        month: monthKey,
                        monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                        totalOrders: 0,
                        totalKilos: 0,
                        totalRevenue: 0,
                        totalShippingSum: 0,
                    };
                    // Initialize puntoEnvio specific fields
                    puntosEnvio.forEach(p => {
                        if (p.nombre) {
                            dataByMonth[monthKey][`${p.nombre}_orders`] = 0;
                            dataByMonth[monthKey][`${p.nombre}_kilos`] = 0;
                            dataByMonth[monthKey][`${p.nombre}_revenue`] = 0;
                            dataByMonth[monthKey][`${p.nombre}_shipping`] = 0;
                            dataByMonth[monthKey][`${p.nombre}_shippingCount`] = 0;
                        }
                    });
                }

                const data = dataByMonth[monthKey];
                data.totalOrders += (m.totalOrders || 0);
                data.totalRevenue += (m.totalRevenue || 0);
                data.totalShippingSum += (m.totalShipping || 0);

                const pName = m.puntoEnvio;
                if (pName && data[`${pName}_orders`] !== undefined) {
                    data[`${pName}_orders`] += (m.totalOrders || 0);
                    data[`${pName}_revenue`] += (m.totalRevenue || 0);
                    data[`${pName}_shipping`] += (m.totalShipping || 0);
                    data[`${pName}_shippingCount`] += (m.totalOrders || 0);
                }
            });
        }

        // SECOND: Fallback to orders prop only if extraMetrics is missing
        if (!extraMetrics?.monthly || extraMetrics.monthly.length === 0) {
            orders.forEach(order => {
                let orderDate: Date;
                if (order.deliveryDay) {
                    orderDate = new Date(order.deliveryDay);
                } else {
                    const createdAt = new Date(order.createdAt);
                    orderDate = new Date(createdAt.getTime() - (3 * 60 * 60 * 1000));
                }
                const monthKey = orderDate.toISOString().substring(0, 7); // YYYY-MM

                if (!dataByMonth[monthKey]) {
                    const dateObj = new Date(parseInt(monthKey.split('-')[0]), parseInt(monthKey.split('-')[1]) - 1);
                    const monthName = format(dateObj, 'MMMM yyyy', { locale: es });
                    dataByMonth[monthKey] = {
                        month: monthKey,
                        monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                        totalOrders: 0,
                        totalKilos: 0,
                        totalRevenue: 0,
                        totalShippingSum: 0,
                    };
                    puntosEnvio.forEach(p => {
                        if (p.nombre) {
                            dataByMonth[monthKey][`${p.nombre}_orders`] = 0;
                            dataByMonth[monthKey][`${p.nombre}_kilos`] = 0;
                            dataByMonth[monthKey][`${p.nombre}_revenue`] = 0;
                            dataByMonth[monthKey][`${p.nombre}_shipping`] = 0;
                            dataByMonth[monthKey][`${p.nombre}_shippingCount`] = 0;
                        }
                    });
                }

                const data = dataByMonth[monthKey];
                data.totalOrders += 1;
                data.totalRevenue += (order.total || 0);
                data.totalShippingSum += (order.shippingPrice || 0);

                const pName = order.puntoEnvio || order.deliveryArea?.puntoEnvio;
                if (pName && data[`${pName}_orders`] !== undefined) {
                    data[`${pName}_orders`] += 1;
                    data[`${pName}_revenue`] += (order.total || 0);
                    data[`${pName}_shipping`] += (order.shippingPrice || 0);
                    data[`${pName}_shippingCount`] += 1;
                }
            });
        }

        // STILL ALWAYS sum kilos locally if not provided by backendStats
        if (!backendStats?.sameDay) {
            orders.forEach(order => {
                let orderDate: Date;
                if (order.deliveryDay) orderDate = new Date(order.deliveryDay);
                else orderDate = new Date(new Date(order.createdAt).getTime() - (3 * 60 * 60 * 1000));
                const monthKey = orderDate.toISOString().substring(0, 7);
                const data = dataByMonth[monthKey];
                if (!data) return;

                if (order.items && Array.isArray(order.items)) {
                    let orderKilos = 0;
                    order.items.forEach((item: any) => {
                        const productName = (item.name || '').toUpperCase().trim();
                        const qty = item.quantity || item.options?.[0]?.quantity || 1;
                        const weight = calculateItemWeight(productName, item.options?.[0]?.name || '');
                        if (weight > 0) orderKilos += (weight * qty);
                    });
                    data.totalKilos += orderKilos;
                    const pName = order.puntoEnvio || order.deliveryArea?.puntoEnvio;
                    if (pName && data[`${pName}_kilos`] !== undefined) {
                        data[`${pName}_kilos`] += orderKilos;
                    }
                }
            });
        }

        // REEMPLAZAR KILOS DEL CHART CON DATOS DEL BACKEND (SIEMPRE MÁS FIABLE)
        if (backendStats?.sameDay) {
            Object.values(dataByMonth).forEach(monthData => {
                const statsForThisMonth = backendStats.sameDay.filter((s: any) => s.month === monthData.month);
                if (statsForThisMonth.length > 0) {
                    monthData.totalKilos = statsForThisMonth.reduce((sum: number, s: any) => sum + s.totalMes, 0);
                    puntosEnvio.forEach(p => {
                        if (p.nombre) {
                            const pStats = statsForThisMonth.find((s: any) => s.puntoEnvio === p.nombre);
                            if (pStats) {
                                monthData[`${p.nombre}_kilos`] = pStats.totalMes;
                            }
                        }
                    });
                }
            });
        }

        return Object.values(dataByMonth).sort((a: any, b: any) => a.month.localeCompare(b.month)).map((item: any) => {
            const processed = { ...item };
            processed.avgShipping = item.totalOrders > 0 ? Math.round(item.totalShippingSum / item.totalOrders) : 0;
            puntosEnvio.forEach(p => {
                if (p.nombre) {
                    const count = item[`${p.nombre}_shippingCount`];
                    const sum = item[`${p.nombre}_shipping`];
                    processed[`${p.nombre}_shipping`] = count > 0 ? Math.round(sum / count) : 0;
                }
            });
            return processed;
        });
    }, [orders, puntosEnvio, backendStats, extraMetrics]);

    // Calculate totals for footer
    const totals = useMemo(() => {
        return summaryData.reduce((acc, curr) => {
            acc.totalOrders += curr.totalOrders;
            acc.totalKilos += curr.totalKilos;
            acc.totalRevenue += curr.totalRevenue;
            acc.totalShippingCost += curr.totalShippingCost;

            Object.keys(curr.flavors).forEach(flavor => {
                acc.flavors[flavor] = (acc.flavors[flavor] || 0) + curr.flavors[flavor];
            });

            return acc;
        }, {
            totalOrders: 0,
            totalKilos: 0,
            totalRevenue: 0,
            totalShippingCost: 0,
            flavors: {} as Record<string, number>
        });
    }, [summaryData]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
    const formatNumber = (val: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(val);

    return (
        <div className="space-y-8">


            {/* Filter Controls for Tables */}
            <div className="flex items-center gap-2 bg-white p-3 rounded-lg border shadow-sm w-fit">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Filtrar Tablas:</span>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[180px] h-8">
                        <SelectValue placeholder="Seleccionar mes" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todo el periodo</SelectItem>
                        {availableMonths.map(month => {
                            const [y, m] = month.split('-');
                            const date = new Date(parseInt(y), parseInt(m) - 1);
                            const label = format(date, 'MMMM yyyy', { locale: es });
                            return <SelectItem key={month} value={month}>{label.charAt(0).toUpperCase() + label.slice(1)}</SelectItem>;
                        })}
                    </SelectContent>
                </Select>
            </div>

            {/* Table 1: Summary Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle>Resumen General por Puntos de Venta</CardTitle>
                    <CardDescription>
                        {selectedMonth === 'all'
                            ? 'Métricas totales acumuladas del periodo seleccionado'
                            : `Métricas para ${format(new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]) - 1), 'MMMM yyyy', { locale: es })}`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="text-left p-3 font-medium text-muted-foreground w-[200px]">Punto de Venta</th>
                                    <th className="text-center p-3 font-medium text-muted-foreground">Pedidos Totales</th>
                                    <th className="text-center p-3 font-medium text-muted-foreground">Kilos Vendidos</th>
                                    <th className="text-center p-3 font-medium text-muted-foreground">Ingresos Totales</th>
                                    <th className="text-center p-3 font-medium text-muted-foreground">Costos de Envío</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summaryData.map((row) => (
                                    <tr key={row.name} className="border-b hover:bg-muted/50">
                                        <td className="p-3 font-medium">{row.name}</td>
                                        <td className="p-3 text-center">{row.totalOrders}</td>
                                        <td className="p-3 text-center font-bold text-blue-600">{formatNumber(row.totalKilos)} kg</td>
                                        <td className="p-3 text-center font-medium text-green-600">{formatCurrency(row.totalRevenue)}</td>
                                        <td className="p-3 text-center text-orange-600">{formatCurrency(row.totalShippingCost)}</td>
                                    </tr>
                                ))}
                                <tr className="bg-muted/30 font-bold border-t-2">
                                    <td className="p-3">TOTALES</td>
                                    <td className="p-3 text-center">{totals.totalOrders}</td>
                                    <td className="p-3 text-center text-blue-700">{formatNumber(totals.totalKilos)} kg</td>
                                    <td className="p-3 text-center text-green-700">{formatCurrency(totals.totalRevenue)}</td>
                                    <td className="p-3 text-center text-orange-700">{formatCurrency(totals.totalShippingCost)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Table 2: Flavor Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Detalle de Kilos por Sabor</CardTitle>
                    <CardDescription>Desglose de kilos vendidos por variedad y punto de venta</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2 font-medium w-[180px] bg-gray-50">Punto de Venta</th>
                                    {/* Perro */}
                                    <th className="text-center p-2 font-medium bg-blue-50">Pollo</th>
                                    <th className="text-center p-2 font-medium bg-blue-50">Vaca</th>
                                    <th className="text-center p-2 font-medium bg-blue-50">Cerdo</th>
                                    <th className="text-center p-2 font-medium bg-blue-50">Cordero</th>
                                    <th className="text-center p-2 font-medium bg-blue-50">Big Dog Pollo</th>
                                    <th className="text-center p-2 font-medium bg-blue-50">Big Dog Vaca</th>
                                    {/* Gato */}
                                    <th className="text-center p-2 font-medium bg-orange-50">Gato Pollo</th>
                                    <th className="text-center p-2 font-medium bg-orange-50">Gato Vaca</th>
                                    <th className="text-center p-2 font-medium bg-orange-50">Gato Cordero</th>
                                    {/* Otros */}
                                    <th className="text-center p-2 font-medium bg-gray-50">Huesos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summaryData.map((row, idx) => (
                                    <tr key={row.name} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                        <td className="p-2 font-medium bg-gray-50/80">{row.name}</td>

                                        <td className="text-center p-2 bg-blue-50/30">{formatNumber(row.flavors['POLLO'])}</td>
                                        <td className="text-center p-2 bg-blue-50/30">{formatNumber(row.flavors['VACA'])}</td>
                                        <td className="text-center p-2 bg-blue-50/30">{formatNumber(row.flavors['CERDO'])}</td>
                                        <td className="text-center p-2 bg-blue-50/30">{formatNumber(row.flavors['CORDERO'])}</td>
                                        <td className="text-center p-2 bg-blue-50/30">{formatNumber(row.flavors['BIG DOG POLLO'])}</td>
                                        <td className="text-center p-2 bg-blue-50/30">{formatNumber(row.flavors['BIG DOG VACA'])}</td>

                                        <td className="text-center p-2 bg-orange-50/30">{formatNumber(row.flavors['GATO POLLO'])}</td>
                                        <td className="text-center p-2 bg-orange-50/30">{formatNumber(row.flavors['GATO VACA'])}</td>
                                        <td className="text-center p-2 bg-orange-50/30">{formatNumber(row.flavors['GATO CORDERO'])}</td>

                                        <td className="text-center p-2 bg-gray-50/30">{formatNumber(row.flavors['HUESOS CARNOSOS'])}</td>
                                    </tr>
                                ))}
                                <tr className="font-bold border-t-2">
                                    <td className="p-2 bg-gray-100">TOTALES</td>
                                    <td className="text-center p-2 bg-blue-100">{formatNumber(totals.flavors['POLLO'] || 0)}</td>
                                    <td className="text-center p-2 bg-blue-100">{formatNumber(totals.flavors['VACA'] || 0)}</td>
                                    <td className="text-center p-2 bg-blue-100">{formatNumber(totals.flavors['CERDO'] || 0)}</td>
                                    <td className="text-center p-2 bg-blue-100">{formatNumber(totals.flavors['CORDERO'] || 0)}</td>
                                    <td className="text-center p-2 bg-blue-100">{formatNumber(totals.flavors['BIG DOG POLLO'] || 0)}</td>
                                    <td className="text-center p-2 bg-blue-100">{formatNumber(totals.flavors['BIG DOG VACA'] || 0)}</td>

                                    <td className="text-center p-2 bg-orange-100">{formatNumber(totals.flavors['GATO POLLO'] || 0)}</td>
                                    <td className="text-center p-2 bg-orange-100">{formatNumber(totals.flavors['GATO VACA'] || 0)}</td>
                                    <td className="text-center p-2 bg-orange-100">{formatNumber(totals.flavors['GATO CORDERO'] || 0)}</td>

                                    <td className="text-center p-2 bg-gray-100">{formatNumber(totals.flavors['HUESOS CARNOSOS'] || 0)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Chart Section */}
            <ResumenGeneralChart data={chartData} puntosEnvio={puntosEnvio} />
        </div>
    );
}
