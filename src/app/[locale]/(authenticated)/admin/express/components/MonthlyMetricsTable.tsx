import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Order } from '@/lib/services';
import { getQuantityStatsByMonthAction } from '../../analytics/actions';
import { getExpressOrdersMetricsAction } from '../actions';

interface MonthlyMetricsTableProps {
    orders: Order[];
    puntoEnvioName?: string;
}

export function MonthlyMetricsTable({ orders, puntoEnvioName }: MonthlyMetricsTableProps) {
    const [backendStats, setBackendStats] = useState<any>(null);
    const [extraMetrics, setExtraMetrics] = useState<any[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    // Fetch accurate stats from backend
    useEffect(() => {
        const fetchStats = async () => {
            setIsLoadingStats(true);
            try {
                // Fetch kilos (existing action)
                const quantityPromise = getQuantityStatsByMonthAction(undefined, undefined, puntoEnvioName);

                // Fetch other metrics (new action)
                const metricsPromise = getExpressOrdersMetricsAction(puntoEnvioName === 'all' ? undefined : puntoEnvioName);

                const [quantityResult, metricsResult] = await Promise.all([quantityPromise, metricsPromise]);

                if (quantityResult.success) {
                    setBackendStats(quantityResult.data);
                }

                if (metricsResult.success && metricsResult.data?.monthly) {
                    setExtraMetrics(metricsResult.data.monthly);
                }
            } catch (error) {
                console.error('Error fetching backend monthly stats:', error);
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchStats();
    }, [puntoEnvioName]);

    // Process orders to group by month for orders/revenue/shipping
    // But take Kilos and accurate metrics from extraMetrics if available
    const monthlyData = useMemo(() => {
        const dataByMonth: Record<string, {
            monthKey: string; // YYYY-MM
            totalOrders: number;
            totalKilos: number;
            totalRevenue: number;
            totalShipping: number;
        }> = {};

        // FIRST: Populate with metrics from the specialized backend API
        if (extraMetrics && extraMetrics.length > 0) {
            extraMetrics.forEach(m => {
                dataByMonth[m.month] = {
                    monthKey: m.month,
                    totalOrders: m.totalOrders || 0,
                    totalKilos: 0, // Will be filled from backendStats below
                    totalRevenue: m.totalRevenue || 0,
                    totalShipping: m.totalShipping || 0,
                };
            });
        }

        // SECOND: Fallback/Merge with orders passed as props 
        // (This might be redundant if extraMetrics covers everything, but good for real-time updates)
        orders.forEach(order => {
            if (puntoEnvioName && order.puntoEnvio !== puntoEnvioName && puntoEnvioName !== 'all') {
                return;
            }

            let orderDate: Date;
            if (order.deliveryDay) {
                orderDate = new Date(order.deliveryDay);
            } else {
                const createdAt = new Date(order.createdAt);
                orderDate = new Date(createdAt.getTime() - (3 * 60 * 60 * 1000));
            }

            const monthKey = orderDate.toISOString().substring(0, 7); // YYYY-MM

            if (!dataByMonth[monthKey]) {
                dataByMonth[monthKey] = {
                    monthKey,
                    totalOrders: 0,
                    totalKilos: 0,
                    totalRevenue: 0,
                    totalShipping: 0,
                };
            }

            // Only add if we don't already have specialized metrics for this month
            // or if we want to combine them (usually we trust the backend metrics more for historical data)
            if (!extraMetrics || extraMetrics.length === 0) {
                const data = dataByMonth[monthKey];
                data.totalOrders += 1;
                data.totalRevenue += (order.total || 0);
                data.totalShipping += (order.shippingPrice || 0);
            }
        });

        // THIRD: Add kilos from backendStats and finalize
        const result = Object.values(dataByMonth).map(item => {
            // Overwrite kilos with backend data if available
            if (backendStats?.sameDay) {
                const backendMonth = backendStats.sameDay.find((m: any) => m.month === item.monthKey);
                if (backendMonth) {
                    return {
                        ...item,
                        totalKilos: backendMonth.totalMes // Use the accurate weight from backend
                    };
                }
            }
            return item;
        }).sort((a, b) => b.monthKey.localeCompare(a.monthKey));

        return result;
    }, [orders, puntoEnvioName, backendStats, extraMetrics]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
    const formatNumber = (val: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(val);

    const formatMonthKey = (key: string) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(date);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Historial Mensual</span>
                    {isLoadingStats && <span className="text-xs font-normal text-muted-foreground animate-pulse">Sincronizando kilos...</span>}
                </CardTitle>
                <CardDescription>
                    {puntoEnvioName ? `Métricas detalladas para ${puntoEnvioName}` : 'Métricas generales por mes'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="text-left p-3 font-medium text-muted-foreground">Mes</th>
                                <th className="text-center p-3 font-medium text-muted-foreground">Pedidos Totales</th>
                                <th className="text-center p-3 font-medium text-muted-foreground">Kilos Vendidos</th>
                                <th className="text-center p-3 font-medium text-muted-foreground">Ingresos Totales</th>
                                <th className="text-center p-3 font-medium text-muted-foreground">Costo Envío Promedio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlyData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                        No hay datos disponibles para el periodo seleccionado
                                    </td>
                                </tr>
                            ) : (
                                monthlyData.map((row) => (
                                    <tr key={row.monthKey} className="border-b hover:bg-muted/50 transition-colors">
                                        <td className="p-3 font-medium capitalize">{formatMonthKey(row.monthKey)}</td>
                                        <td className="p-3 text-center">{row.totalOrders}</td>
                                        <td className="p-3 text-center font-bold text-blue-600">
                                            {formatNumber(row.totalKilos)} kg
                                            {backendStats && <span className="ml-1 text-[10px] text-green-600" title="Verificado desde el backend">✓</span>}
                                        </td>
                                        <td className="p-3 text-center font-medium text-green-600">{formatCurrency(row.totalRevenue)}</td>
                                        <td className="p-3 text-center text-orange-600">
                                            {formatCurrency(row.totalOrders > 0 ? row.totalShipping / row.totalOrders : 0)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
