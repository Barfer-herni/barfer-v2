'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, DollarSign, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DailyChart } from '../charts/DailyChart';

interface DailyData {
    date: string;
    orders: number;
    revenue: number;
}

interface DailyAnalyticsClientProps {
    allOrdersData: DailyData[];   // Todos los pedidos (pending + confirmed)
    confirmedOrdersData: DailyData[]; // Solo pedidos confirmados
    compareAllOrdersData?: DailyData[];   // Datos de comparación - todos los pedidos
    compareConfirmedOrdersData?: DailyData[]; // Datos de comparación - confirmados
    isComparing?: boolean; // Si está en modo comparación
    dateFilter?: { from: Date; to: Date }; // Fechas del período principal
    compareFilter?: { from: Date; to: Date }; // Fechas del período de comparación
}

export function DailyAnalyticsClient({
    allOrdersData,
    confirmedOrdersData,
    compareAllOrdersData,
    compareConfirmedOrdersData,
    isComparing = false,
    dateFilter,
    compareFilter
}: DailyAnalyticsClientProps) {
    // Los datos ya vienen filtrados del servidor, solo necesitamos ordenarlos
    const { sortedAllOrders, sortedConfirmedOrders, sortedCompareAllOrders, sortedCompareConfirmedOrders } = useMemo(() => {
        return {
            sortedAllOrders: [...allOrdersData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            sortedConfirmedOrders: [...confirmedOrdersData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            sortedCompareAllOrders: compareAllOrdersData ? [...compareAllOrdersData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [],
            sortedCompareConfirmedOrders: compareConfirmedOrdersData ? [...compareConfirmedOrdersData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : []
        };
    }, [allOrdersData, confirmedOrdersData, compareAllOrdersData, compareConfirmedOrdersData]);

    // Calcular totales para comparación
    const totals = useMemo(() => {
        const currentAllTotal = sortedAllOrders.reduce((acc, day) => ({
            orders: acc.orders + day.orders,
            revenue: acc.revenue + day.revenue
        }), { orders: 0, revenue: 0 });

        const currentConfirmedTotal = sortedConfirmedOrders.reduce((acc, day) => ({
            orders: acc.orders + day.orders,
            revenue: acc.revenue + day.revenue
        }), { orders: 0, revenue: 0 });

        const compareAllTotal = sortedCompareAllOrders.reduce((acc, day) => ({
            orders: acc.orders + day.orders,
            revenue: acc.revenue + day.revenue
        }), { orders: 0, revenue: 0 });

        const compareConfirmedTotal = sortedCompareConfirmedOrders.reduce((acc, day) => ({
            orders: acc.orders + day.orders,
            revenue: acc.revenue + day.revenue
        }), { orders: 0, revenue: 0 });

        return {
            current: { all: currentAllTotal, confirmed: currentConfirmedTotal },
            compare: { all: compareAllTotal, confirmed: compareConfirmedTotal }
        };
    }, [sortedAllOrders, sortedConfirmedOrders, sortedCompareAllOrders, sortedCompareConfirmedOrders]);

    // Función para calcular porcentaje de cambio (de fecha antigua a reciente)
    const calculateChange = (primaryValue: number, compareValue: number, primaryDate: Date, compareDate: Date) => {
        // Determinar cuál es el período anterior y cuál el actual basándose en fechas
        const isPrimaryNewer = primaryDate > compareDate;
        const oldValue = isPrimaryNewer ? compareValue : primaryValue;
        const newValue = isPrimaryNewer ? primaryValue : compareValue;

        if (oldValue === 0) return newValue > 0 ? 100 : 0;
        return ((newValue - oldValue) / oldValue) * 100;
    };

    const formatChange = (change: number) => {
        const isPositive = change >= 0;
        return (
            <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{change.toFixed(1)}%
            </span>
        );
    };

    const formatDateRange = (from: Date, to: Date) => {
        if (!from || !to) {
            return 'Período no válido';
        }
        return `${from.toLocaleDateString('es-ES')} - ${to.toLocaleDateString('es-ES')}`;
    };

    // Determinar cuál período es más reciente para las etiquetas
    const isPrimaryNewer = dateFilter && compareFilter ? dateFilter.from > compareFilter.from : true;
    const newerLabel = isPrimaryNewer ? 'Principal' : 'Comparación';
    const olderLabel = isPrimaryNewer ? 'Comparación' : 'Principal';

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Resumen de comparación */}
            {isComparing && (
                <div className="grid gap-4 xl:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Resumen - Todos los Pedidos</CardTitle>
                            {dateFilter && (
                                <p className="text-xs text-muted-foreground">
                                    Principal: {formatDateRange(dateFilter.from, dateFilter.to)}
                                    {compareFilter && (
                                        <><br />Comparación: {formatDateRange(compareFilter.from, compareFilter.to)}</>
                                    )}
                                </p>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{olderLabel} (anterior):</span>
                                    <div className="text-right">
                                        <div className="font-medium">
                                            {isPrimaryNewer ? totals.compare.all.orders : totals.current.all.orders} pedidos
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            ${(isPrimaryNewer ? totals.compare.all.revenue : totals.current.all.revenue).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{newerLabel} (más reciente):</span>
                                    <div className="text-right">
                                        <div className="font-medium">
                                            {isPrimaryNewer ? totals.current.all.orders : totals.compare.all.orders} pedidos
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            ${(isPrimaryNewer ? totals.current.all.revenue : totals.compare.all.revenue).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Cambio en pedidos:</span>
                                        {formatChange(calculateChange(
                                            totals.current.all.orders,
                                            totals.compare.all.orders,
                                            dateFilter?.from || new Date(),
                                            compareFilter?.from || new Date()
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Cambio en ingresos:</span>
                                        {formatChange(calculateChange(
                                            totals.current.all.revenue,
                                            totals.compare.all.revenue,
                                            dateFilter?.from || new Date(),
                                            compareFilter?.from || new Date()
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Resumen - Pedidos Confirmados</CardTitle>
                            {dateFilter && (
                                <p className="text-xs text-muted-foreground">
                                    Principal: {formatDateRange(dateFilter.from, dateFilter.to)}
                                    {compareFilter && (
                                        <><br />Comparación: {formatDateRange(compareFilter.from, compareFilter.to)}</>
                                    )}
                                </p>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{olderLabel} (anterior):</span>
                                    <div className="text-right">
                                        <div className="font-medium">
                                            {isPrimaryNewer ? totals.compare.confirmed.orders : totals.current.confirmed.orders} confirmados
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            ${(isPrimaryNewer ? totals.compare.confirmed.revenue : totals.current.confirmed.revenue).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{newerLabel} (más reciente):</span>
                                    <div className="text-right">
                                        <div className="font-medium">
                                            {isPrimaryNewer ? totals.current.confirmed.orders : totals.compare.confirmed.orders} confirmados
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            ${(isPrimaryNewer ? totals.current.confirmed.revenue : totals.compare.confirmed.revenue).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Cambio en pedidos:</span>
                                        {formatChange(calculateChange(
                                            totals.current.confirmed.orders,
                                            totals.compare.confirmed.orders,
                                            dateFilter?.from || new Date(),
                                            compareFilter?.from || new Date()
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Cambio en ingresos:</span>
                                        {formatChange(calculateChange(
                                            totals.current.confirmed.revenue,
                                            totals.compare.confirmed.revenue,
                                            dateFilter?.from || new Date(),
                                            compareFilter?.from || new Date()
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid gap-4 xl:grid-cols-2">
                {/* Tabla 1: Todos los pedidos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Todos los Pedidos {isComparing ? `(${newerLabel})` : ''}
                        </CardTitle>
                        <CardDescription>
                            {dateFilter && `${formatDateRange(dateFilter.from, dateFilter.to)} • `}
                            Incluye pedidos pendientes + confirmados • Total histórico: ~18,691 pedidos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {sortedAllOrders.length > 0 ? (
                                sortedAllOrders.map((day, index) => (
                                    <div key={`${day.date}-${index}`} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded gap-2">
                                        <span className="text-sm font-medium">{day.date}</span>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="secondary">
                                                {day.orders} pedidos
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                ${day.revenue.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                                    <p>No hay datos para la fecha seleccionada</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla 2: Solo pedidos confirmados (revenue real) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Ingresos Reales {isComparing ? `(${newerLabel})` : ''}
                        </CardTitle>
                        <CardDescription>
                            {dateFilter && `${formatDateRange(dateFilter.from, dateFilter.to)} • `}
                            Solo pedidos confirmados • Total histórico: ~5,755 pedidos confirmados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {sortedConfirmedOrders.length > 0 ? (
                                sortedConfirmedOrders.map((day, index) => (
                                    <div key={`${day.date}-${index}`} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded gap-2">
                                        <span className="text-sm font-medium">{day.date}</span>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="default">
                                                {day.orders} confirmados
                                            </Badge>
                                            <span className="text-sm font-semibold text-green-600">
                                                ${day.revenue.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                                    <p>No hay ventas confirmadas para la fecha seleccionada</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Datos de comparación */}
            {isComparing && (sortedCompareAllOrders.length > 0 || sortedCompareConfirmedOrders.length > 0) && (
                <div className="grid gap-4 xl:grid-cols-2">
                    {/* Tabla 3: Todos los pedidos - Período de comparación */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Todos los Pedidos ({olderLabel})
                            </CardTitle>
                            <CardDescription>
                                {compareFilter && `${formatDateRange(compareFilter.from, compareFilter.to)} • `}
                                Incluye pedidos pendientes + confirmados del período de comparación
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {sortedCompareAllOrders.map((day, index) => (
                                    <div key={`${day.date}-${index}`} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded gap-2">
                                        <span className="text-sm font-medium">{day.date}</span>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline">
                                                {day.orders} pedidos
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                ${day.revenue.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabla 4: Solo pedidos confirmados - Período de comparación */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Ingresos Reales ({olderLabel})
                            </CardTitle>
                            <CardDescription>
                                {compareFilter && `${formatDateRange(compareFilter.from, compareFilter.to)} • `}
                                Solo pedidos confirmados del período de comparación
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {sortedCompareConfirmedOrders.map((day, index) => (
                                    <div key={`${day.date}-${index}`} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded gap-2">
                                        <span className="text-sm font-medium">{day.date}</span>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline">
                                                {day.orders} confirmados
                                            </Badge>
                                            <span className="text-sm font-semibold text-blue-600">
                                                ${day.revenue.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Gráficos */}
            <DailyChart
                allOrdersData={allOrdersData}
                confirmedOrdersData={confirmedOrdersData}
                compareAllOrdersData={compareAllOrdersData}
                compareConfirmedOrdersData={compareConfirmedOrdersData}
                isComparing={isComparing}
                dateFilter={dateFilter}
                compareFilter={compareFilter}
            />
        </div>
    );
} 