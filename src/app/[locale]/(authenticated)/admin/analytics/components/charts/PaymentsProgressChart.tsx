'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PaymentProgressData {
    period: string;
    date: string;
    efectivoOrders: number;
    efectivoRevenue: number;
    transferenciaOrders: number;
    transferenciaRevenue: number;
    tarjetaOrders: number;
    tarjetaRevenue: number;
    totalOrders: number;
    totalRevenue: number;
}

interface PaymentsProgressChartProps {
    data: PaymentProgressData[];
    compareData?: PaymentProgressData[];
    isComparing?: boolean;
    periodType: 'daily' | 'weekly' | 'monthly';
    filter: 'all' | 'Efectivo' | 'Transferencia' | 'Mercado Pago';
    dateFilter?: { from: Date; to: Date };
    compareFilter?: { from: Date; to: Date };
}

const PAYMENT_KEYS = {
    'Efectivo': { orders: 'efectivoOrders', revenue: 'efectivoRevenue', color: '#10b981', icon: '💵' },
    'Transferencia': { orders: 'transferenciaOrders', revenue: 'transferenciaRevenue', color: '#3b82f6', icon: '🏦' },
    'Mercado Pago': { orders: 'tarjetaOrders', revenue: 'tarjetaRevenue', color: '#00b1ea', icon: '💙' },
};

export function PaymentsProgressChart({
    data,
    compareData,
    isComparing = false,
    periodType,
    filter,
    dateFilter,
    compareFilter
}: PaymentsProgressChartProps) {

    const formatDisplayDate = (item: any, periodType: string) => {
        const period = item.period || item.date || '';
        if (!period) return '';

        if (periodType === 'monthly') {
            if (period.includes('-')) {
                const [year, month] = period.split('-');
                if (month) {
                    const date = new Date(Number(year), Number(month) - 1, 1);
                    if (!isNaN(date.getTime())) return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
                }
            }
            return period.split(' ')[0] || period;
        } else if (periodType === 'weekly') {
            if (period.includes('-W')) {
                const [year, week] = period.split('-W');
                return `Semana ${week}, ${year}`;
            }
            return period;
        } else {
            if (period.includes('-')) {
                const parts = period.split('-');
                if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
            } else if (period.includes('/')) {
                const parts = period.split('/');
                if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
            }
            return period;
        }
    };

    // Preparar datos para el gráfico principal
    const chartData = useMemo(() => {
        return data.map(item => ({
            ...item,
            displayDate: formatDisplayDate(item, periodType)
        }));
    }, [data, periodType]);

    // Preparar datos para el gráfico de comparación
    const compareChartData = useMemo(() => {
        if (!isComparing || !compareData) {
            return [];
        }

        return compareData.map(item => ({
            ...item,
            displayDate: formatDisplayDate(item, periodType),
            // Renombrar para evitar conflictos
            compareEfectivoOrders: item.efectivoOrders,
            compareEfectivoRevenue: item.efectivoRevenue,
            compareTransferenciaOrders: item.transferenciaOrders,
            compareTransferenciaRevenue: item.transferenciaRevenue,
            compareTarjetaOrders: item.tarjetaOrders,
            compareTarjetaRevenue: item.tarjetaRevenue,
        }));
    }, [compareData, isComparing, periodType]);

    const visibleKeys = useMemo(() => {
        if (filter === 'all') {
            return Object.keys(PAYMENT_KEYS);
        }
        return [filter];
    }, [filter]);

    const formatCurrency = (value: number) => {
        return `$${value.toLocaleString()}`;
    };

    const formatDateRange = (from: Date, to: Date) => {
        return `${from.toLocaleDateString('es-ES')} - ${to.toLocaleDateString('es-ES')}`;
    };

    const getPeriodLabel = () => {
        switch (periodType) {
            case 'daily': return 'Día';
            case 'weekly': return 'Semana';
            case 'monthly': return 'Mes';
            default: return 'Período';
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Gráfico de Líneas - Evolución de Pagos por Método */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-lg">Evolución de Pagos por {getPeriodLabel()}</span>
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
                        {!isComparing && dateFilter && (
                            <Badge variant="outline" className="text-blue-600 w-fit">
                                {formatDateRange(dateFilter.from, dateFilter.to)}
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Número de órdenes por método de pago a lo largo del tiempo {isComparing ? 'con comparación' : ''}
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
                                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="displayDate"
                                        tick={{ fontSize: 10 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip
                                        formatter={(value: number, name: string) => [
                                            `${value} pedidos`,
                                            name === 'efectivoOrders' ? '💵 Efectivo' :
                                                name === 'transferenciaOrders' ? '🏦 Transferencia Bancaria' :
                                                    name === 'tarjetaOrders' ? '💳 Mercado Pago' : name
                                        ]}
                                        labelFormatter={(label, payload) => {
                                            const point = payload?.[0]?.payload;
                                            if (point && point.date && periodType === 'daily') {
                                                const parts = point.date.split('/');
                                                if (parts.length === 3) {
                                                    const date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                                                    if (!isNaN(date.getTime())) {
                                                        return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
                                                    }
                                                }
                                            }
                                            return `${getPeriodLabel()}: ${label}`;
                                        }}
                                    />
                                    <Legend />
                                    {visibleKeys.map(key => {
                                        const config = PAYMENT_KEYS[key as keyof typeof PAYMENT_KEYS];
                                        return (
                                            <Line
                                                key={key}
                                                type="monotone"
                                                dataKey={config.orders}
                                                stroke={config.color}
                                                strokeWidth={2}
                                                name={`${config.icon} ${key}`}
                                                dot={{ r: 3 }}
                                            />
                                        );
                                    })}
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
                                    <LineChart data={compareChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="displayDate"
                                            tick={{ fontSize: 10 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip
                                            formatter={(value: number, name: string) => [
                                                `${value} pedidos`,
                                                name === 'compareEfectivoOrders' ? '💵 Efectivo' :
                                                    name === 'compareTransferenciaOrders' ? '🏦 Transferencia Bancaria' :
                                                        name === 'compareTarjetaOrders' ? '💳 Mercado Pago' : name
                                            ]}
                                            labelFormatter={(label, payload) => {
                                                const point = payload?.[0]?.payload;
                                                const periodStr = point?.period || point?.date;
                                                if (periodStr && periodType === 'daily') {
                                                    let dateObj: Date | null = null;
                                                    if (periodStr.includes('-')) {
                                                        const parts = periodStr.split('-');
                                                        if (parts.length === 3) {
                                                            dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                                                        }
                                                    } else if (periodStr.includes('/')) {
                                                        const parts = periodStr.split('/');
                                                        if (parts.length === 3) {
                                                            dateObj = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                                                        }
                                                    }
                                                    if (dateObj && !isNaN(dateObj.getTime())) {
                                                        return dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
                                                    }
                                                }
                                                return `${getPeriodLabel()}: ${label}`;
                                            }}
                                        />
                                        <Legend />
                                        {visibleKeys.map(key => {
                                            const config = PAYMENT_KEYS[key as keyof typeof PAYMENT_KEYS];
                                            return (
                                                <Line
                                                    key={key}
                                                    type="monotone"
                                                    dataKey={config.orders}
                                                    stroke={config.color}
                                                    strokeWidth={2}
                                                    name={`${config.icon} ${key}`}
                                                    dot={{ r: 3 }}
                                                />
                                            );
                                        })}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Gráfico de Barras - Ingresos por Método de Pago */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-lg">Ingresos por Método de Pago</span>
                        {isComparing && (
                            <div className="flex flex-col sm:flex-row gap-2 text-xs">
                                <Badge variant="outline" className="text-purple-600 w-fit">Principal</Badge>
                                <Badge variant="outline" className="text-orange-600 w-fit">Comparación</Badge>
                            </div>
                        )}
                        {!isComparing && dateFilter && (
                            <Badge variant="outline" className="text-purple-600 w-fit">
                                {formatDateRange(dateFilter.from, dateFilter.to)}
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Evolución de ingresos por método de pago por {getPeriodLabel()} {isComparing ? 'con comparación' : ''}
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
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="displayDate"
                                        tick={{ fontSize: 10 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        formatter={(value: number, name: string) => [
                                            formatCurrency(value),
                                            name === 'efectivoRevenue' ? '💵 Efectivo' :
                                                name === 'transferenciaRevenue' ? '🏦 Transferencia Bancaria' :
                                                    name === 'tarjetaRevenue' ? '💳 Mercado Pago' : name
                                        ]}
                                        labelFormatter={(label, payload) => {
                                            const point = payload?.[0]?.payload;
                                            const periodStr = point?.period || point?.date;
                                            if (periodStr && periodType === 'daily') {
                                                let dateObj: Date | null = null;
                                                if (periodStr.includes('-')) {
                                                    const parts = periodStr.split('-');
                                                    if (parts.length === 3) {
                                                        dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                                                    }
                                                } else if (periodStr.includes('/')) {
                                                    const parts = periodStr.split('/');
                                                    if (parts.length === 3) {
                                                        dateObj = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                                                    }
                                                }
                                                if (dateObj && !isNaN(dateObj.getTime())) {
                                                    return dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
                                                }
                                            }
                                            return `${getPeriodLabel()}: ${label}`;
                                        }}
                                    />
                                    <Legend />
                                    {visibleKeys.map(key => {
                                        const config = PAYMENT_KEYS[key as keyof typeof PAYMENT_KEYS];
                                        return (
                                            <Bar
                                                key={key}
                                                dataKey={config.revenue}
                                                stackId="a"
                                                fill={config.color}
                                                name={`${config.icon} ${key}`}
                                            />
                                        );
                                    })}
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
                                    <BarChart data={compareChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="displayDate"
                                            tick={{ fontSize: 10 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10 }}
                                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            formatter={(value: number, name: string) => [
                                                formatCurrency(value),
                                                name === 'compareEfectivoRevenue' ? '💵 Efectivo' :
                                                    name === 'compareTransferenciaRevenue' ? '🏦 Transferencia Bancaria' :
                                                        name === 'compareTarjetaRevenue' ? '💳 Mercado Pago' : name
                                            ]}
                                            labelFormatter={(label, payload) => {
                                                const point = payload?.[0]?.payload;
                                                const periodStr = point?.period || point?.date;
                                                if (periodStr && periodType === 'daily') {
                                                    let dateObj: Date | null = null;
                                                    if (periodStr.includes('-')) {
                                                        const parts = periodStr.split('-');
                                                        if (parts.length === 3) {
                                                            dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                                                        }
                                                    } else if (periodStr.includes('/')) {
                                                        const parts = periodStr.split('/');
                                                        if (parts.length === 3) {
                                                            dateObj = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                                                        }
                                                    }
                                                    if (dateObj && !isNaN(dateObj.getTime())) {
                                                        return dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
                                                    }
                                                }
                                                return `${getPeriodLabel()}: ${label}`;
                                            }}
                                        />
                                        <Legend />
                                        {visibleKeys.map(key => {
                                            const config = PAYMENT_KEYS[key as keyof typeof PAYMENT_KEYS];
                                            return (
                                                <Bar
                                                    key={key}
                                                    dataKey={config.revenue}
                                                    stackId="a"
                                                    fill={config.color}
                                                    name={`${config.icon} ${key}`}
                                                />
                                            );
                                        })}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 