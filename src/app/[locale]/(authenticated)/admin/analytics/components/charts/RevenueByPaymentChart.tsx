'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

interface RevenueByPaymentChartProps {
    data: PaymentProgressData[];
    compareData?: PaymentProgressData[];
    isComparing?: boolean;
    periodType: 'daily' | 'weekly' | 'monthly';
    dateFilter?: { from: Date; to: Date };
    compareFilter?: { from: Date; to: Date };
}

const PAYMENT_KEYS = {
    'Efectivo': { revenue: 'efectivoRevenue', color: '#10b981', icon: '💵' },
    'Transferencia': { revenue: 'transferenciaRevenue', color: '#3b82f6', icon: '🏦' },
    'Mercado Pago': { revenue: 'tarjetaRevenue', color: '#00b1ea', icon: '💙' },
};

export function RevenueByPaymentChart({
    data,
    compareData,
    isComparing = false,
    periodType,
    dateFilter,
    compareFilter
}: RevenueByPaymentChartProps) {

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

    const chartData = useMemo(() => {
        return data.map(item => ({
            ...item,
            displayDate: formatDisplayDate(item, periodType)
        }));
    }, [data, periodType]);

    const compareChartData = useMemo(() => {
        if (!isComparing || !compareData) return [];
        return compareData.map(item => ({
            ...item,
            displayDate: formatDisplayDate(item, periodType),
            compareEfectivoRevenue: item.efectivoRevenue,
            compareTransferenciaRevenue: item.transferenciaRevenue,
            compareTarjetaRevenue: item.tarjetaRevenue,
        }));
    }, [compareData, isComparing, periodType]);

    const formatCurrency = (value: number) => {
        return `$${value.toLocaleString()}`;
    };

    const formatDateRange = (from: Date, to: Date) => {
        return `${from.toLocaleDateString('es-ES')} - ${to.toLocaleDateString('es-ES')}`;
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-lg">Ingresos por Método de Pago</span>
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
                    Evolución de ingresos mensuales desglosados por método de pago.
                    Barras agrupadas para una mejor comparación visual.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className={`grid grid-cols-1 gap-6 ${isComparing ? 'xl:grid-cols-2' : ''}`}>
                    <div>
                        {isComparing && (
                            <h4 className="text-sm font-medium mb-3">
                                Período Principal {dateFilter && `(${formatDateRange(dateFilter.from, dateFilter.to)})`}
                            </h4>
                        )}
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="displayDate"
                                    tick={{ fontSize: 10 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis tick={{ fontSize: 10 }} tickFormatter={formatCurrency} />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        formatCurrency(value),
                                        name === 'efectivoRevenue' ? '💵 Efectivo' :
                                            name === 'transferenciaRevenue' ? '🏦 Transferencia' :
                                                name === 'tarjetaRevenue' ? '💙 Mercado Pago' : name
                                    ]}
                                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                                />
                                <Legend />
                                <Bar dataKey="efectivoRevenue" name="💵 Efectivo" fill={PAYMENT_KEYS['Efectivo'].color} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="transferenciaRevenue" name="🏦 Transferencia" fill={PAYMENT_KEYS['Transferencia'].color} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="tarjetaRevenue" name="💙 Mercado Pago" fill={PAYMENT_KEYS['Mercado Pago'].color} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {isComparing && compareChartData.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-3">
                                Período de Comparación {compareFilter && `(${formatDateRange(compareFilter.from, compareFilter.to)})`}
                            </h4>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={compareChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="displayDate"
                                        tick={{ fontSize: 10 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis tick={{ fontSize: 10 }} tickFormatter={formatCurrency} />
                                    <Tooltip
                                        formatter={(value: number, name: string) => [
                                            formatCurrency(value),
                                            name === 'compareEfectivoRevenue' ? '💵 Efectivo' :
                                                name === 'compareTransferenciaRevenue' ? '🏦 Transferencia' :
                                                    name === 'compareTarjetaRevenue' ? '💙 Mercado Pago' : name
                                        ]}
                                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="compareEfectivoRevenue" name="💵 Efectivo" fill={PAYMENT_KEYS['Efectivo'].color} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="compareTransferenciaRevenue" name="🏦 Transferencia" fill={PAYMENT_KEYS['Transferencia'].color} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="compareTarjetaRevenue" name="💙 Mercado Pago" fill={PAYMENT_KEYS['Mercado Pago'].color} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
