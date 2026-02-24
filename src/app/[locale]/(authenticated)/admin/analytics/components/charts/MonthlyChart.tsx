'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MonthlyData {
    month: string;
    orders: number;
    uniqueCustomers: number;
    revenue: number;
}

interface MonthlyChartProps {
    allOrdersData: MonthlyData[];
    compareAllOrdersData?: MonthlyData[];
    isComparing?: boolean;
    dateFilter?: { from: Date; to: Date };
    compareFilter?: { from: Date; to: Date };
}

export function MonthlyChart({
    allOrdersData,
    compareAllOrdersData,
    isComparing = false,
    dateFilter,
    compareFilter
}: MonthlyChartProps) {

    // Preparar datos para el gráfico principal
    const mainChartData = useMemo(() => {
        return allOrdersData.map(month => ({
            month: month.month,
            fullDate: month.month,
            orders: month.orders,
            revenue: month.revenue,
            uniqueCustomers: month.uniqueCustomers,
            averageOrderValue: month.orders > 0 ? month.revenue / month.orders : 0
        })).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
    }, [allOrdersData]);

    // Preparar datos para el gráfico de comparación
    const compareChartData = useMemo(() => {
        if (!isComparing || !compareAllOrdersData) {
            return [];
        }

        return compareAllOrdersData.map(month => ({
            month: month.month,
            fullDate: month.month,
            compareOrders: month.orders,
            compareRevenue: month.revenue,
            compareUniqueCustomers: month.uniqueCustomers,
            compareAverageOrderValue: month.orders > 0 ? month.revenue / month.orders : 0
        })).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
    }, [compareAllOrdersData, isComparing]);

    const formatCurrency = (value: number) => {
        return `$${value.toLocaleString()}`;
    };

    const formatDateRange = (from: Date, to: Date) => {
        return `${from.toLocaleDateString('es-ES')} - ${to.toLocaleDateString('es-ES')}`;
    };

    const formatMonthName = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short'
        });
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Gráfico de Barras - Pedidos Mensuales */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-lg">Pedidos por Mes</span>
                        {isComparing && (
                            <div className="flex flex-col sm:flex-row gap-2 text-xs">
                                <Badge variant="outline" className="text-blue-600 w-fit">
                                    Principal: {dateFilter && formatDateRange(dateFilter.from, dateFilter.to)}
                                </Badge>
                                <Badge variant="outline" className="text-orange-600 w-fit">
                                    Comparación: {compareFilter && formatDateRange(compareFilter.from, compareFilter.to)}
                                </Badge>
                            </div>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Distribución mensual de pedidos {isComparing ? 'con comparación' : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className={`grid grid-cols-1 gap-6 ${isComparing ? 'xl:grid-cols-2' : ''}`}>
                        {/* Gráfico Principal */}
                        <div>
                            {isComparing && (
                                <h4 className="text-sm font-medium mb-3">
                                    Período Principal {dateFilter && `(${formatDateRange(dateFilter.from, dateFilter.to)})`}
                                </h4>
                            )}
                            <ResponsiveContainer width="100%" height={isComparing ? 320 : 400}>
                                <BarChart data={mainChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={formatMonthName}
                                    />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip
                                        formatter={(value: number, name: string) => [
                                            value.toLocaleString(),
                                            name === 'orders' ? 'Pedidos' :
                                                name === 'uniqueCustomers' ? 'Clientes Únicos' : name
                                        ]}
                                        labelFormatter={(label) => `Mes: ${formatMonthName(label)}`}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="orders"
                                        name="Pedidos"
                                        fill="#3b82f6"
                                        radius={[2, 2, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="uniqueCustomers"
                                        name="Clientes Únicos"
                                        fill="#14b8a6"
                                        radius={[2, 2, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Gráfico de Comparación */}
                        {isComparing && compareChartData.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-3">
                                    Período de Comparación {compareFilter && `(${formatDateRange(compareFilter.from, compareFilter.to)})`}
                                </h4>
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={compareChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 10 }}
                                            tickFormatter={formatMonthName}
                                        />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip
                                            formatter={(value: number, name: string) => [
                                                value.toLocaleString(),
                                                name === 'compareOrders' ? 'Pedidos' :
                                                    name === 'compareUniqueCustomers' ? 'Clientes Únicos' : name
                                            ]}
                                            labelFormatter={(label) => `Mes: ${formatMonthName(label)}`}
                                        />
                                        <Legend />
                                        <Bar
                                            dataKey="compareOrders"
                                            name="Pedidos"
                                            fill="#ea580c"
                                            radius={[2, 2, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="compareUniqueCustomers"
                                            name="Clientes Únicos"
                                            fill="#dc2626"
                                            radius={[2, 2, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Gráfico de Líneas - Ingresos Mensuales */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-lg">Ingresos por Mes</span>
                        {isComparing && (
                            <div className="flex flex-col sm:flex-row gap-2 text-xs">
                                <Badge variant="outline" className="text-purple-600 w-fit">Principal</Badge>
                                <Badge variant="outline" className="text-orange-600 w-fit">Comparación</Badge>
                            </div>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Evolución mensual de los ingresos {isComparing ? 'con comparación' : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className={`grid grid-cols-1 gap-6 ${isComparing ? 'xl:grid-cols-2' : ''}`}>
                        {/* Gráfico Principal */}
                        <div>
                            {isComparing && (
                                <h4 className="text-sm font-medium mb-3">
                                    Período Principal {dateFilter && `(${formatDateRange(dateFilter.from, dateFilter.to)})`}
                                </h4>
                            )}
                            <ResponsiveContainer width="100%" height={isComparing ? 320 : 400}>
                                <LineChart data={mainChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={formatMonthName}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        formatter={(value: number, name: string) => [
                                            formatCurrency(value),
                                            name === 'revenue' ? 'Ingresos' :
                                                name === 'averageOrderValue' ? 'Valor Promedio por Pedido' : name
                                        ]}
                                        labelFormatter={(label) => `Mes: ${formatMonthName(label)}`}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#7c3aed"
                                        strokeWidth={3}
                                        name="Ingresos"
                                        dot={{ r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="averageOrderValue"
                                        stroke="#059669"
                                        strokeWidth={2}
                                        name="Valor Promedio por Pedido"
                                        dot={{ r: 3 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Gráfico de Comparación */}
                        {isComparing && compareChartData.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-3">
                                    Período de Comparación {compareFilter && `(${formatDateRange(compareFilter.from, compareFilter.to)})`}
                                </h4>
                                <ResponsiveContainer width="100%" height={320}>
                                    <LineChart data={compareChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 10 }}
                                            tickFormatter={formatMonthName}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10 }}
                                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            formatter={(value: number, name: string) => [
                                                formatCurrency(value),
                                                name === 'compareRevenue' ? 'Ingresos' :
                                                    name === 'compareAverageOrderValue' ? 'Valor Promedio por Pedido' : name
                                            ]}
                                            labelFormatter={(label) => `Mes: ${formatMonthName(label)}`}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="compareRevenue"
                                            stroke="#f59e0b"
                                            strokeWidth={3}
                                            name="Ingresos"
                                            dot={{ r: 4 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="compareAverageOrderValue"
                                            stroke="#ef4444"
                                            strokeWidth={2}
                                            name="Valor Promedio por Pedido"
                                            dot={{ r: 3 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 