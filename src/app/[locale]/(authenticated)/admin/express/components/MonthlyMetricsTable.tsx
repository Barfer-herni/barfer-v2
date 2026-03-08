import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Order } from '@/lib/services';
import { getQuantityStatsByMonthAction } from '../../analytics/actions';

interface MonthlyMetricsTableProps {
    orders: Order[];
    puntoEnvioName?: string;
}

export function MonthlyMetricsTable({ orders, puntoEnvioName }: MonthlyMetricsTableProps) {
    const [backendStats, setBackendStats] = useState<any>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    // Fetch accurate stats from backend
    useEffect(() => {
        const fetchStats = async () => {
            setIsLoadingStats(true);
            try {
                // We fetch without specific dates to get the full history or we could pass the range if needed
                // But usually this table shows the history related to the orders passed or general.
                // Since orders are already filtered by the parent, we'll try to match the range if possible
                // or just fetch all for this puntoEnvio.
                const result = await getQuantityStatsByMonthAction(undefined, undefined, puntoEnvioName);
                if (result.success) {
                    setBackendStats(result.data);
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
    // But take Kilos from backendStats if available
    const monthlyData = useMemo(() => {
        const dataByMonth: Record<string, {
            monthKey: string; // YYYY-MM
            totalOrders: number;
            totalKilos: number;
            totalRevenue: number;
            totalShipping: number;
        }> = {};

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

            const data = dataByMonth[monthKey];
            data.totalOrders += 1;
            data.totalRevenue += (order.total || 0);
            data.totalShipping += (order.shippingPrice || 0);

            // We still keep the local kilos calculation as fallback, 
            // but the Table will prioritize backend stats if present.
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                    const productName = (item.name || '').toUpperCase().trim();
                    const qty = item.quantity || item.options?.[0]?.quantity || 1;
                    let weight = 0;

                    const weightMatch = productName.match(/(\d+)\s*KG/i);
                    if (weightMatch) {
                        weight = parseFloat(weightMatch[1]);
                    } else if (productName.includes('BOX')) {
                        weight = 10;
                    } else if (item.options && item.options.length > 0) {
                        const optName = item.options[0].name || '';
                        const optMatch = optName.match(/(\d+)\s*KG/i);
                        if (optMatch) weight = parseFloat(optMatch[1]);
                    }

                    if (weight > 0) {
                        data.totalKilos += (weight * qty);
                    }
                });
            }
        });

        // Convert to array and sort
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
    }, [orders, puntoEnvioName, backendStats]);

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
