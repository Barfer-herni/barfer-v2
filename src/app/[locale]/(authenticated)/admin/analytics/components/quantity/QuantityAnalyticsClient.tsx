'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuantityTable } from './QuantityTable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ProductQuantity {
    month: string;
    // Productos Perro
    pollo: number;
    vaca: number;
    cerdo: number;
    cordero: number;
    bigDogPollo: number;
    bigDogVaca: number;
    totalPerro: number;
    // Productos Gato
    gatoPollo: number;
    gatoVaca: number;
    gatoCordero: number;
    totalGato: number;
    // Otros
    huesosCarnosos: number;
    // Total del mes
    totalMes: number;
}

interface QuantityStatsByType {
    minorista: ProductQuantity[];
    sameDay: ProductQuantity[];
    mayorista: ProductQuantity[];
}

interface QuantityAnalyticsClientProps {
    dateFilter: {
        from: Date;
        to: Date;
    };
    compareFilter?: {
        from: Date;
        to: Date;
    };
    quantityStats?: QuantityStatsByType;
    compareQuantityStats?: QuantityStatsByType;
    selectedYear?: number;
}

export function QuantityAnalyticsClient({
    dateFilter,
    compareFilter,
    quantityStats,
    compareQuantityStats,
    selectedYear
}: QuantityAnalyticsClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const currentYear = new Date().getFullYear();
    const displayYear = selectedYear || currentYear;

    // Generar lista de años disponibles (desde 2020 hasta el año actual)
    const availableYears = Array.from({ length: currentYear - 2019 }, (_, i) => currentYear - i);

    const handleYearChange = (year: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (year && year !== currentYear.toString()) {
            params.set('quantityYear', year);
        } else {
            params.delete('quantityYear');
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const formatDateRange = (from: Date, to: Date) => {
        if (!from || !to) {
            return 'Período no válido';
        }
        return `${format(from, 'dd/MM/yyyy', { locale: es })} - ${format(to, 'dd/MM/yyyy', { locale: es })}`;
    };

    // Función para consolidar datos por mes sumando entradas duplicadas (por ejemplo, múltiples puntoEnvio)
    const consolidateByMonth = (data: ProductQuantity[]): ProductQuantity[] => {
        const monthMap = new Map<string, ProductQuantity>();

        data.forEach(item => {
            const existing = monthMap.get(item.month);
            if (existing) {
                // Sumar todos los valores si ya existe una entrada para este mes
                existing.pollo += item.pollo;
                existing.vaca += item.vaca;
                existing.cerdo += item.cerdo;
                existing.cordero += item.cordero;
                existing.bigDogPollo += item.bigDogPollo;
                existing.bigDogVaca += item.bigDogVaca;
                existing.totalPerro += item.totalPerro;
                existing.gatoPollo += item.gatoPollo;
                existing.gatoVaca += item.gatoVaca;
                existing.gatoCordero += item.gatoCordero;
                existing.totalGato += item.totalGato;
                existing.huesosCarnosos += item.huesosCarnosos;
                existing.totalMes += item.totalMes;
            } else {
                // Primera entrada para este mes
                monthMap.set(item.month, { ...item });
            }
        });

        return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    };

    // Función para calcular los totales generales sumando todos los tipos de pedidos
    const getTotalData = (stats?: QuantityStatsByType): ProductQuantity[] => {
        if (!stats) return [];

        const minorista = stats.minorista || [];
        const sameDay = stats.sameDay || [];
        const mayorista = stats.mayorista || [];

        // Obtener todos los meses únicos
        const allMonths = new Set([
            ...minorista.map(m => m.month),
            ...sameDay.map(m => m.month),
            ...mayorista.map(m => m.month)
        ]);

        return Array.from(allMonths).sort().map(month => {
            const minoristaMonth = minorista.find(m => m.month === month);
            // Para sameDay, necesitamos sumar TODAS las entradas del mismo mes (puede haber múltiples puntoEnvio)
            const sameDayMonths = sameDay.filter(m => m.month === month);
            const mayoristaMonth = mayorista.find(m => m.month === month);

            // Sumar todos los valores de sameDay para este mes
            const sameDayTotal = sameDayMonths.reduce((acc, curr) => ({
                pollo: acc.pollo + curr.pollo,
                vaca: acc.vaca + curr.vaca,
                cerdo: acc.cerdo + curr.cerdo,
                cordero: acc.cordero + curr.cordero,
                bigDogPollo: acc.bigDogPollo + curr.bigDogPollo,
                bigDogVaca: acc.bigDogVaca + curr.bigDogVaca,
                totalPerro: acc.totalPerro + curr.totalPerro,
                gatoPollo: acc.gatoPollo + curr.gatoPollo,
                gatoVaca: acc.gatoVaca + curr.gatoVaca,
                gatoCordero: acc.gatoCordero + curr.gatoCordero,
                totalGato: acc.totalGato + curr.totalGato,
                huesosCarnosos: acc.huesosCarnosos + curr.huesosCarnosos,
                totalMes: acc.totalMes + curr.totalMes,
            }), {
                pollo: 0, vaca: 0, cerdo: 0, cordero: 0,
                bigDogPollo: 0, bigDogVaca: 0, totalPerro: 0,
                gatoPollo: 0, gatoVaca: 0, gatoCordero: 0, totalGato: 0,
                huesosCarnosos: 0, totalMes: 0
            });

            return {
                month,
                // Productos Perro - sumar todos los tipos
                pollo: (minoristaMonth?.pollo || 0) + sameDayTotal.pollo + (mayoristaMonth?.pollo || 0),
                vaca: (minoristaMonth?.vaca || 0) + sameDayTotal.vaca + (mayoristaMonth?.vaca || 0),
                cerdo: (minoristaMonth?.cerdo || 0) + sameDayTotal.cerdo + (mayoristaMonth?.cerdo || 0),
                cordero: (minoristaMonth?.cordero || 0) + sameDayTotal.cordero + (mayoristaMonth?.cordero || 0),
                bigDogPollo: (minoristaMonth?.bigDogPollo || 0) + sameDayTotal.bigDogPollo + (mayoristaMonth?.bigDogPollo || 0),
                bigDogVaca: (minoristaMonth?.bigDogVaca || 0) + sameDayTotal.bigDogVaca + (mayoristaMonth?.bigDogVaca || 0),
                totalPerro: (minoristaMonth?.totalPerro || 0) + sameDayTotal.totalPerro + (mayoristaMonth?.totalPerro || 0),
                // Productos Gato - sumar todos los tipos
                gatoPollo: (minoristaMonth?.gatoPollo || 0) + sameDayTotal.gatoPollo + (mayoristaMonth?.gatoPollo || 0),
                gatoVaca: (minoristaMonth?.gatoVaca || 0) + sameDayTotal.gatoVaca + (mayoristaMonth?.gatoVaca || 0),
                gatoCordero: (minoristaMonth?.gatoCordero || 0) + sameDayTotal.gatoCordero + (mayoristaMonth?.gatoCordero || 0),
                totalGato: (minoristaMonth?.totalGato || 0) + sameDayTotal.totalGato + (mayoristaMonth?.totalGato || 0),
                // Otros - sumar todos los tipos
                huesosCarnosos: (minoristaMonth?.huesosCarnosos || 0) + sameDayTotal.huesosCarnosos + (mayoristaMonth?.huesosCarnosos || 0),
                // Total del mes - sumar todos los tipos
                totalMes: (minoristaMonth?.totalMes || 0) + sameDayTotal.totalMes + (mayoristaMonth?.totalMes || 0)
            };
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl font-semibold">Cantidad Total KG</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Año:</span>
                    <Select
                        value={displayYear.toString()}
                        onValueChange={handleYearChange}
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Tabla de Minoristas */}
            <QuantityTable
                data={quantityStats?.minorista || []}
                title="Minoristas"
                description="Cantidad total en KG por mes para pedidos minoristas"
            />

            {/* Tabla de Envíos en el Día */}
            <QuantityTable
                data={consolidateByMonth(quantityStats?.sameDay || [])}
                title="Envíos en el Día"
                description="Cantidad total en KG por mes para envíos en el día"
            />

            {/* Tabla de Mayoristas */}
            <QuantityTable
                data={quantityStats?.mayorista || []}
                title="Mayoristas"
                description="Cantidad total en KG por mes para pedidos mayoristas"
            />

            {/* Tabla de Totales Generales */}
            <QuantityTable
                data={getTotalData(quantityStats)}
                title="Totales Generales"
                description="Cantidad total en KG por mes sumando todos los tipos de pedidos (Minoristas + Envíos en el Día + Mayoristas)"
            />

            {/* Datos de comparación */}
            {compareFilter && compareQuantityStats && (
                <>
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">
                            Comparación con año anterior ({displayYear - 1})
                        </h3>
                    </div>

                    {/* Tabla de comparación - Minoristas */}
                    <QuantityTable
                        data={compareQuantityStats.minorista || []}
                        title="Minoristas (Comparación)"
                        description="Cantidad total en KG por mes para pedidos minoristas - Período de comparación"
                    />

                    {/* Tabla de comparación - Envíos en el Día */}
                    <QuantityTable
                        data={consolidateByMonth(compareQuantityStats.sameDay || [])}
                        title="Envíos en el Día (Comparación)"
                        description="Cantidad total en KG por mes para envíos en el día - Período de comparación"
                    />

                    {/* Tabla de comparación - Mayoristas */}
                    <QuantityTable
                        data={compareQuantityStats.mayorista || []}
                        title="Mayoristas (Comparación)"
                        description="Cantidad total en KG por mes para pedidos mayoristas - Período de comparación"
                    />

                    {/* Tabla de comparación - Totales Generales */}
                    <QuantityTable
                        data={getTotalData(compareQuantityStats)}
                        title="Totales Generales (Comparación)"
                        description="Cantidad total en KG por mes sumando todos los tipos de pedidos - Período de comparación"
                    />
                </>
            )}
        </div>
    );
} 