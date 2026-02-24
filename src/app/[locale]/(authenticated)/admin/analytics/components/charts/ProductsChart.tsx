'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductSale {
    productId: string;
    productName: string;
    optionName: string;
    quantity: number;
    revenue: number;
    orders: number;
    avgPrice: number;
    statuses: string[];
    statusFilter: string;
}

interface ProductsChartProps {
    currentProducts: ProductSale[];
    compareProducts?: ProductSale[];
    isComparing?: boolean;
    statusFilter: 'all' | 'pending' | 'confirmed';
    dateFilter?: { from: Date; to: Date };
    compareFilter?: { from: Date; to: Date };
}

export function ProductsChart({
    currentProducts,
    compareProducts = [],
    isComparing = false,
    statusFilter,
    dateFilter,
    compareFilter
}: ProductsChartProps) {

    // Debug: log de datos recibidos (comentado para producción)
    // console.log('ProductsChart - currentProducts:', currentProducts?.length || 0);
    // console.log('ProductsChart - compareProducts:', compareProducts?.length || 0);
    // console.log('ProductsChart - statusFilter:', statusFilter);

    // Preparar datos para el gráfico principal (top 15)
    const chartData = useMemo(() => {
        if (!currentProducts || currentProducts.length === 0) {
            return [];
        }

        const data = currentProducts.slice(0, 15).map((product, index) => ({
            product: product.productName.length > 20
                ? product.productName.substring(0, 20) + '...'
                : product.productName,
            fullName: product.productName,
            option: product.optionName,
            quantity: product.quantity,
            revenue: product.revenue,
            orders: product.orders,
            avgPrice: product.avgPrice,
            index: index + 1
        }));

        return data;
    }, [currentProducts]);

    // Preparar datos para comparación (top 10)
    const comparisonData = useMemo(() => {
        if (!isComparing || !compareProducts.length || !currentProducts.length) {
            console.log('ProductsChart - No comparison data needed');
            return [];
        }

        const topProducts = currentProducts.slice(0, 10);

        const data = topProducts.map(current => {
            const compare = compareProducts.find(p =>
                p.productName === current.productName && p.optionName === current.optionName
            );
            return {
                product: current.productName.length > 15
                    ? current.productName.substring(0, 15) + '...'
                    : current.productName,
                fullName: current.productName,
                option: current.optionName,
                current: current.quantity,
                currentRevenue: current.revenue,
                compare: compare?.quantity || 0,
                compareRevenue: compare?.revenue || 0
            };
        });

        console.log('ProductsChart - comparisonData generated:', data.length);
        return data;
    }, [currentProducts, compareProducts, isComparing]);

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

    // Early return si no hay datos
    if (!currentProducts || currentProducts.length === 0) {
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Productos Más Vendidos</CardTitle>
                        <CardDescription>No hay datos disponibles</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No hay datos de productos para mostrar</p>
                            <p className="text-xs">Filtro actual: {getStatusLabel(statusFilter)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Gráfico de Barras - Productos más vendidos */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-lg">Productos Más Vendidos</span>
                        <Badge variant="secondary" className="w-fit">
                            {getStatusLabel(statusFilter)} - Top 15
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Productos ordenados por cantidad vendida
                        {dateFilter && ` (${formatDateRange(dateFilter.from, dateFilter.to)})`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={500}>
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                                barCategoryGap="15%"
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="product"
                                    tick={{ fontSize: 8 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={140}
                                    interval={0}
                                />
                                <YAxis
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    formatter={(value: number) => [
                                        `${value.toLocaleString()} unidades`,
                                        'Cantidad Vendida'
                                    ]}
                                    labelFormatter={(label, payload) => {
                                        const data = payload?.[0]?.payload;
                                        return data ? `${data.fullName} - ${data.option} | ${data.orders} pedidos | Precio promedio: ${formatCurrency(data.avgPrice)}` : label;
                                    }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar
                                    dataKey="quantity"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={50}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No hay datos de productos para mostrar</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Gráfico de Comparación de Productos */}
            {isComparing && comparisonData.length > 0 && (
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className="text-lg">Comparación de Productos</span>
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
                            Comparación de unidades vendidas - Top 10 productos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={450}>
                            <BarChart
                                data={comparisonData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                                barCategoryGap="15%"
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="product"
                                    tick={{ fontSize: 8 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={120}
                                    interval={0}
                                />
                                <YAxis
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    formatter={(value: number, name: string) => [
                                        `${value.toLocaleString()} unidades`,
                                        name === 'current' ? 'Principal' : 'Comparación'
                                    ]}
                                    labelFormatter={(label, payload) => {
                                        const data = payload?.[0]?.payload;
                                        return data ? `${data.fullName} - ${data.option}` : label;
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
                                    maxBarSize={40}
                                />
                                <Bar
                                    dataKey="compare"
                                    name="Comparación"
                                    fill="#ea580c"
                                    radius={[2, 2, 0, 0]}
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 