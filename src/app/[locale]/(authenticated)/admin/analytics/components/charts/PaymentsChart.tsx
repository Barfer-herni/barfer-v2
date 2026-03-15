'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PaymentMethodStat {
    paymentMethod: string;
    totalOrders: number;
    totalRevenue: number;
    confirmedOrders: number;
    confirmedRevenue: number;
    pendingOrders: number;
    pendingRevenue: number;
    averageOrderValue: number;
    statusFilter: string;
}

interface PaymentsChartProps {
    currentPayments: PaymentMethodStat[];
    comparePayments?: PaymentMethodStat[];
    isComparing?: boolean;
    statusFilter: 'all' | 'pending' | 'confirmed';
    dateFilter?: { from: Date; to: Date };
    compareFilter?: { from: Date; to: Date };
}

export function PaymentsChart({
    currentPayments,
    comparePayments = [],
    isComparing = false,
    statusFilter,
    dateFilter,
    compareFilter
}: PaymentsChartProps) {

    // Preparar datos para comparación
    const comparisonData = useMemo(() => {
        if (!isComparing || !comparePayments.length) return [];

        return currentPayments.map(current => {
            const compare = comparePayments.find(p => p.paymentMethod === current.paymentMethod);
            const currentValue = statusFilter === 'confirmed' ? current.confirmedOrders :
                statusFilter === 'pending' ? current.pendingOrders :
                    current.totalOrders;
            const compareValue = compare ? (
                statusFilter === 'confirmed' ? compare.confirmedOrders :
                    statusFilter === 'pending' ? compare.pendingOrders :
                        compare.totalOrders
            ) : 0;

            return {
                method: current.paymentMethod.charAt(0).toUpperCase() + current.paymentMethod.slice(1),
                current: currentValue,
                currentRevenue: statusFilter === 'confirmed' ? current.confirmedRevenue :
                    statusFilter === 'pending' ? current.pendingRevenue :
                        current.totalRevenue,
                compare: compareValue,
                compareRevenue: compare ? (
                    statusFilter === 'confirmed' ? compare.confirmedRevenue :
                        statusFilter === 'pending' ? compare.pendingRevenue :
                            compare.totalRevenue
                ) : 0
            };
        });
    }, [currentPayments, comparePayments, isComparing, statusFilter]);

    const formatCurrency = (value: number) => {
        return `$${value.toLocaleString()}`;
    };

    const formatDateRange = (from: Date, to: Date) => {
        return `${from.toLocaleDateString('es-ES')} - ${to.toLocaleDateString('es-ES')}`;
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'all': return 'Todos';
            case 'pending': return 'Pendientes';
            case 'confirmed': return 'Confirmados';
            default: return 'Todos';
        }
    };

    const getPaymentIcon = (method: string) => {
        switch (method.toLowerCase()) {
            case 'efectivo': return '💵';
            case 'transferencia': return '🏦';
            case 'tarjeta': return '💳';
            case 'qr': return '📱';
            case 'otro': return '💰';
            default: return '💳';
        }
    };

    // Componente render
    return (
        <div className="space-y-4 md:space-y-6">
            {/* Gráfico de Comparación de Métodos de Pago */}
            {isComparing && comparisonData.length > 0 && (
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className="text-lg">Comparación de Métodos de Pago</span>
                            <div className="flex flex-col sm:flex-row gap-2 text-xs">
                                <Badge variant="outline" className="text-blue-600 w-fit">
                                    Principal: {dateFilter && formatDateRange(dateFilter.from, dateFilter.to)}
                                </Badge>
                                <Badge variant="outline" className="text-orange-600 w-fit">
                                    Comparación: {compareFilter && formatDateRange(compareFilter.from, compareFilter.to)}
                                </Badge>
                            </div>
                        </CardTitle>
                        <CardDescription>
                            Comparación de pedidos por método de pago
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                data={comparisonData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                                barCategoryGap="20%"
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="method"
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    formatter={(value: number, name: string, props: any) => [
                                        `${value.toLocaleString()} pedidos`,
                                        name === 'current' ? 'Principal' : 'Comparación'
                                    ]}
                                    labelFormatter={(label, payload) => {
                                        const data = payload?.[0]?.payload;
                                        return data ? `${getPaymentIcon(data.method)} ${data.method}` : label;
                                    }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="current"
                                    name="Principal"
                                    fill="#3b82f6"
                                    radius={[2, 2, 0, 0]}
                                    maxBarSize={60}
                                />
                                <Bar
                                    dataKey="compare"
                                    name="Comparación"
                                    fill="#ea580c"
                                    radius={[2, 2, 0, 0]}
                                    maxBarSize={60}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}