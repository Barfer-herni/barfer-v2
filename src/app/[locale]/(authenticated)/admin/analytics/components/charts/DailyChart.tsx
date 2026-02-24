'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DailyData {
    date: string;
    orders: number;
    revenue: number;
}

interface DailyChartProps {
    allOrdersData: DailyData[];
    confirmedOrdersData: DailyData[];
    compareAllOrdersData?: DailyData[];
    compareConfirmedOrdersData?: DailyData[];
    isComparing?: boolean;
    dateFilter?: { from: Date; to: Date };
    compareFilter?: { from: Date; to: Date };
}

export function DailyChart({
    allOrdersData,
    confirmedOrdersData,
    compareAllOrdersData,
    compareConfirmedOrdersData,
    isComparing = false,
    dateFilter,
    compareFilter
}: DailyChartProps) {

    // Preparar datos para el gráfico principal
    const mainChartData = useMemo(() => {
        return allOrdersData.map(dayAll => {
            const dayConfirmed = confirmedOrdersData.find(d => d.date === dayAll.date);
            return {
                date: new Date(dayAll.date).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit'
                }),
                fullDate: dayAll.date,
                allOrders: dayAll.orders,
                allRevenue: dayAll.revenue,
                confirmedOrders: dayConfirmed?.orders || 0,
                confirmedRevenue: dayConfirmed?.revenue || 0
            };
        }).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
    }, [allOrdersData, confirmedOrdersData]);

    // Preparar datos para el gráfico de comparación
    const compareChartData = useMemo(() => {
        if (!isComparing || !compareAllOrdersData || !compareConfirmedOrdersData) {
            return [];
        }

        return compareAllOrdersData.map(dayAll => {
            const dayConfirmed = compareConfirmedOrdersData.find(d => d.date === dayAll.date);
            return {
                date: new Date(dayAll.date).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit'
                }),
                fullDate: dayAll.date,
                compareAllOrders: dayAll.orders,
                compareAllRevenue: dayAll.revenue,
                compareConfirmedOrders: dayConfirmed?.orders || 0,
                compareConfirmedRevenue: dayConfirmed?.revenue || 0
            };
        }).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
    }, [compareAllOrdersData, compareConfirmedOrdersData, isComparing]);

    const formatCurrency = (value: number) => {
        return `$${value.toLocaleString()}`;
    };

    const formatDateRange = (from: Date, to: Date) => {
        return `${from.toLocaleDateString('es-ES')} - ${to.toLocaleDateString('es-ES')}`;
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Gráfico de Pedidos */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-lg">Pedidos por Día</span>
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
                        Evolución diaria del número de pedidos {isComparing ? 'con comparación' : ''}
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
                                <LineChart data={mainChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 10 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip
                                        formatter={(value: number, name: string) => [value, name]}
                                        labelFormatter={(label, payload) => {
                                            const point = payload?.[0]?.payload;
                                            if (point && point.fullDate) {
                                                const date = new Date(`${point.fullDate}T00:00:00`);
                                                const dateString = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                                                const dayString = date.toLocaleDateString('es-ES', { weekday: 'long' });
                                                return `${dateString} - ${dayString}`;
                                            }
                                            return label;
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="allOrders"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        name="Todos los pedidos"
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
                                    <LineChart data={compareChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 10 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip
                                            formatter={(value: number, name: string) => [value, name]}
                                            labelFormatter={(label, payload) => {
                                                const point = payload?.[0]?.payload;
                                                if (point && point.fullDate) {
                                                    const date = new Date(`${point.fullDate}T00:00:00`);
                                                    const dateString = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                                                    const dayString = date.toLocaleDateString('es-ES', { weekday: 'long' });
                                                    return `${dateString} - ${dayString}`;
                                                }
                                                return label;
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="compareAllOrders"
                                            stroke="#ea580c"
                                            strokeWidth={2}
                                            name="Todos los pedidos"
                                            dot={{ r: 3 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Gráfico de Ingresos */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-lg">Ingresos por Día</span>
                        {isComparing && (
                            <div className="flex flex-col sm:flex-row gap-2 text-xs">
                                <Badge variant="outline" className="text-blue-600 w-fit">
                                    Principal
                                </Badge>
                                <Badge variant="outline" className="text-orange-600 w-fit">
                                    Comparación
                                </Badge>
                            </div>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Evolución diaria de los ingresos {isComparing ? 'con comparación' : ''}
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
                                <LineChart data={mainChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 10 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        formatter={(value: number, name: string) => [formatCurrency(value), name]}
                                        labelFormatter={(label, payload) => {
                                            const point = payload?.[0]?.payload;
                                            if (point && point.fullDate) {
                                                const date = new Date(`${point.fullDate}T00:00:00`);
                                                const dateString = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                                                const dayString = date.toLocaleDateString('es-ES', { weekday: 'long' });
                                                return `${dateString} - ${dayString}`;
                                            }
                                            return label;
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="allRevenue"
                                        stroke="#7c3aed"
                                        strokeWidth={2}
                                        name="Ingresos totales"
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
                                    <LineChart data={compareChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 10 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10 }}
                                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            formatter={(value: number, name: string) => [formatCurrency(value), name]}
                                            labelFormatter={(label, payload) => {
                                                const point = payload?.[0]?.payload;
                                                if (point && point.fullDate) {
                                                    const date = new Date(`${point.fullDate}T00:00:00`);
                                                    const dateString = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
                                                    const dayString = date.toLocaleDateString('es-ES', { weekday: 'long' });
                                                    return `${dateString} - ${dayString}`;
                                                }
                                                return label;
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="compareAllRevenue"
                                            stroke="#f59e0b"
                                            strokeWidth={2}
                                            name="Ingresos totales"
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