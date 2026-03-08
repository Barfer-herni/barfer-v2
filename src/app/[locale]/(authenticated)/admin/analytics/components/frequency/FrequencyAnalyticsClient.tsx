'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, DollarSign, Users, RefreshCw, TrendingUp, Target } from 'lucide-react';

interface CustomerInsights {
    averageOrderValue: number;
    averageOrdersPerCustomer: number;
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    averageSpentPerCustomer: number;
    repeatCustomerRate: number;
    customersWithMultipleOrders?: number;
}

interface PurchaseFrequency {
    avgFrequencyDays: number;
}

interface FrequencyAnalyticsClientProps {
    customerInsights: CustomerInsights;
    purchaseFrequency: PurchaseFrequency;
    compareCustomerInsights?: CustomerInsights;
    comparePurchaseFrequency?: PurchaseFrequency;
    isComparing?: boolean;
    dateFilter?: { from: Date; to: Date };
    compareFilter?: { from: Date; to: Date };
}

export function FrequencyAnalyticsClient({
    customerInsights,
    purchaseFrequency,
    compareCustomerInsights,
    comparePurchaseFrequency,
    isComparing = false,
    dateFilter,
    compareFilter
}: FrequencyAnalyticsClientProps) {

    const formatDateRange = (from: Date, to: Date) => {
        const fromDate = new Date(from);
        return `${fromDate.toLocaleDateString('es-ES')} - ${to.toLocaleDateString('es-ES')}`;
    };

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

    // Determinar cuál período es más reciente para las etiquetas
    const isPrimaryNewer = dateFilter && compareFilter ? dateFilter.from > compareFilter.from : true;
    const newerLabel = isPrimaryNewer ? 'Principal' : 'Comparación';
    const olderLabel = isPrimaryNewer ? 'Comparación' : 'Principal';

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Métricas principales */}
            <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            Gasto Promedio por Compra {isComparing ? `(${newerLabel})` : ''}
                        </CardTitle>
                        <CardDescription>
                            {dateFilter && `${formatDateRange(dateFilter.from, dateFilter.to)} • `}
                            Monto promedio de cada compra realizada
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-2 break-words overflow-hidden">
                            ${(customerInsights?.averageOrderValue || 0).toLocaleString()}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Basado en {(customerInsights?.totalOrders || 0).toLocaleString()} órdenes totales
                        </p>
                        <div className="mt-3 p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-xs text-green-700">
                                <strong>Valor promedio:</strong> Calculado como Revenue Total ÷ Total de Órdenes
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-purple-600" />
                            Frecuencia Promedio de Compra {isComparing ? `(${newerLabel})` : ''}
                        </CardTitle>
                        <CardDescription>
                            {dateFilter && `${formatDateRange(dateFilter.from, dateFilter.to)} • `}
                            Número promedio de órdenes por cliente
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 mb-2 break-words overflow-hidden">
                            {customerInsights?.averageOrdersPerCustomer || 0} órdenes
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Por cliente activo
                        </p>
                        <div className="mt-3 p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-xs text-purple-700">
                                <strong>Frecuencia promedio:</strong> Total de Órdenes ÷ Clientes Únicos
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-orange-600" />
                            Frecuencia de Compra (Días) {isComparing ? `(${newerLabel})` : ''}
                        </CardTitle>
                        <CardDescription>
                            {dateFilter && `${formatDateRange(dateFilter.from, dateFilter.to)} • `}
                            Promedio de días entre pedidos de un cliente
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 mb-2 break-words overflow-hidden">
                            {purchaseFrequency?.avgFrequencyDays || 0} días
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Entre compras recurrentes
                        </p>
                        <div className="mt-3 p-2 sm:p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <p className="text-xs text-orange-700">
                                <strong>Frecuencia en días:</strong> Promedio de tiempo entre las compras de los clientes que repiten
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Resumen de comparación */}
            {isComparing && compareCustomerInsights && (
                <div className="grid gap-4 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Resumen - Valor Promedio Orden</CardTitle>
                            {dateFilter && (
                                <div className="text-xs text-muted-foreground">
                                    Principal: {formatDateRange(dateFilter.from, dateFilter.to)}
                                    {compareFilter && (
                                        <><br />Comparación: {formatDateRange(compareFilter.from, compareFilter.to)}</>
                                    )}
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{olderLabel} (anterior):</span>
                                    <span className="font-medium">${(isPrimaryNewer ? (compareCustomerInsights?.averageOrderValue || 0) : (customerInsights?.averageOrderValue || 0)).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{newerLabel} (más reciente):</span>
                                    <span className="font-medium">${(isPrimaryNewer ? (customerInsights?.averageOrderValue || 0) : (compareCustomerInsights?.averageOrderValue || 0)).toLocaleString()}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Cambio:</span>
                                    {formatChange(calculateChange(
                                        customerInsights?.averageOrderValue || 0,
                                        compareCustomerInsights?.averageOrderValue || 0,
                                        dateFilter?.from || new Date(),
                                        compareFilter?.from || new Date()
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Resumen - Órdenes por Cliente</CardTitle>
                            {dateFilter && (
                                <div className="text-xs text-muted-foreground">
                                    Principal: {formatDateRange(dateFilter.from, dateFilter.to)}
                                    {compareFilter && (
                                        <><br />Comparación: {formatDateRange(compareFilter.from, compareFilter.to)}</>
                                    )}
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{olderLabel} (anterior):</span>
                                    <span className="font-medium">{(isPrimaryNewer ? (compareCustomerInsights?.averageOrdersPerCustomer || 0) : (customerInsights?.averageOrdersPerCustomer || 0))} órdenes</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{newerLabel} (más reciente):</span>
                                    <span className="font-medium">{(isPrimaryNewer ? (customerInsights?.averageOrdersPerCustomer || 0) : (compareCustomerInsights?.averageOrdersPerCustomer || 0))} órdenes</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Cambio:</span>
                                    {formatChange(calculateChange(
                                        customerInsights?.averageOrdersPerCustomer || 0,
                                        compareCustomerInsights?.averageOrdersPerCustomer || 0,
                                        dateFilter?.from || new Date(),
                                        compareFilter?.from || new Date()
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Resumen - Tasa de Repetición</CardTitle>
                            {dateFilter && (
                                <div className="text-xs text-muted-foreground">
                                    Principal: {formatDateRange(dateFilter.from, dateFilter.to)}
                                    {compareFilter && (
                                        <><br />Comparación: {formatDateRange(compareFilter.from, compareFilter.to)}</>
                                    )}
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{olderLabel} (anterior):</span>
                                    <span className="font-medium">{(isPrimaryNewer ? (compareCustomerInsights?.repeatCustomerRate || 0) : (customerInsights?.repeatCustomerRate || 0))}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{newerLabel} (más reciente):</span>
                                    <span className="font-medium">{(isPrimaryNewer ? (customerInsights?.repeatCustomerRate || 0) : (compareCustomerInsights?.repeatCustomerRate || 0))}%</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Cambio:</span>
                                    {formatChange(calculateChange(
                                        customerInsights?.repeatCustomerRate || 0,
                                        compareCustomerInsights?.repeatCustomerRate || 0,
                                        dateFilter?.from || new Date(),
                                        compareFilter?.from || new Date()
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Métricas principales del período de comparación */}
            {isComparing && compareCustomerInsights && (
                <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                                Gasto Promedio por Compra ({olderLabel})
                            </CardTitle>
                            <CardDescription>
                                {compareFilter && `${formatDateRange(compareFilter.from, compareFilter.to)} • `}
                                Compra promedio del período de comparación
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-2 break-words overflow-hidden">
                                ${(compareCustomerInsights?.averageOrderValue || 0).toLocaleString()}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Basado en {(compareCustomerInsights?.totalOrders || 0).toLocaleString()} órdenes totales
                            </p>
                            <div className="mt-3 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs text-blue-700">
                                    <strong>Período de comparación</strong>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <RefreshCw className="h-5 w-5 text-blue-600" />
                                Frecuencia Promedio de Compra ({olderLabel})
                            </CardTitle>
                            <CardDescription>
                                {compareFilter && `${formatDateRange(compareFilter.from, compareFilter.to)} • `}
                                Órdenes promedio por cliente del período de comparación
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-2 break-words overflow-hidden">
                                {compareCustomerInsights?.averageOrdersPerCustomer || 0} órdenes
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Por cliente activo
                            </p>
                            <div className="mt-3 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs text-blue-700">
                                    <strong>Período de comparación</strong>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Métricas de contexto adicionales */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Métricas de Comportamiento de Clientes {isComparing ? `(${newerLabel})` : ''}
                    </CardTitle>
                    <CardDescription>
                        Análisis detallado del comportamiento de compra y gastos
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                        <div className="p-3 sm:p-4 border rounded-lg text-center">
                            <Users className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-blue-500" />
                            <div className="text-sm sm:text-lg font-bold text-blue-600 mb-1 break-words overflow-hidden">
                                {(customerInsights?.totalCustomers || 0).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Clientes únicos
                            </p>
                        </div>

                        <div className="p-3 sm:p-4 border rounded-lg text-center">
                            <Target className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-green-500" />
                            <div className="text-sm sm:text-lg font-bold text-green-600 mb-1 break-words overflow-hidden">
                                ${(customerInsights?.averageSpentPerCustomer || 0).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Gasto promedio por cliente
                            </p>
                            <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                                (Revenue total ÷ clientes únicos)
                            </p>
                        </div>

                        <div className="p-3 sm:p-4 border rounded-lg text-center">
                            <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-purple-500" />
                            <div className="text-sm sm:text-lg font-bold text-purple-600 mb-1 break-words overflow-hidden">
                                {customerInsights?.repeatCustomerRate || 0}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Tasa de repetición
                            </p>
                            <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                                (Clientes con +1 orden ÷ total clientes)
                            </p>
                        </div>

                        <div className="p-3 sm:p-4 border rounded-lg text-center">
                            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-orange-500" />
                            <div className="text-sm sm:text-lg font-bold text-orange-600 mb-1 break-words overflow-hidden">
                                ${Math.round((customerInsights?.totalRevenue || 0) / 1000000)}M
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Revenue total
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Métricas de contexto del período de comparación */}
            {isComparing && compareCustomerInsights && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Métricas de Comportamiento de Clientes ({olderLabel})
                        </CardTitle>
                        <CardDescription>
                            {compareFilter && `${formatDateRange(compareFilter.from, compareFilter.to)} • `}
                            Análisis del período de comparación
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                            <div className="p-3 sm:p-4 border rounded-lg text-center">
                                <Users className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-blue-500" />
                                <div className="text-sm sm:text-lg font-bold text-blue-600 mb-1 break-words overflow-hidden">
                                    {(compareCustomerInsights?.totalCustomers || 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Clientes únicos
                                </p>
                            </div>

                            <div className="p-3 sm:p-4 border rounded-lg text-center">
                                <Target className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-blue-500" />
                                <div className="text-sm sm:text-lg font-bold text-blue-600 mb-1 break-words overflow-hidden">
                                    ${(compareCustomerInsights?.averageSpentPerCustomer || 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Gasto promedio por cliente
                                </p>
                                <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                                    (Revenue total ÷ clientes únicos)
                                </p>
                            </div>

                            <div className="p-3 sm:p-4 border rounded-lg text-center">
                                <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-blue-500" />
                                <div className="text-sm sm:text-lg font-bold text-blue-600 mb-1 break-words overflow-hidden">
                                    {compareCustomerInsights?.repeatCustomerRate || 0}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Tasa de repetición
                                </p>
                                <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                                    (Clientes con +1 orden ÷ total clientes)
                                </p>
                            </div>

                            <div className="p-3 sm:p-4 border rounded-lg text-center">
                                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-blue-500" />
                                <div className="text-sm sm:text-lg font-bold text-blue-600 mb-1 break-words overflow-hidden">
                                    ${Math.round((compareCustomerInsights?.totalRevenue || 0) / 1000000)}M
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Revenue total
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}