import { DailyAnalyticsTab } from './components/daily/DailyAnalyticsTab';
import { MonthlyAnalyticsTab } from './components/monthly/MonthlyAnalyticsTab';
import { ProductsAnalyticsTab } from './components/products/ProductsAnalyticsTab';
import { CategoriesAnalyticsTab } from './components/categories/CategoriesAnalyticsTab';
import { PaymentsAnalyticsTab } from './components/payments/PaymentsAnalyticsTab';
import { FrequencyAnalyticsTab } from './components/frequency/FrequencyAnalyticsTab';
import { QuantityAnalyticsTab } from './components/quantity/QuantityAnalyticsTab';
import { AnalyticsTabsWrapper } from './components/AnalyticsTabsWrapper';
import { AnalyticsDateFilter } from './components/AnalyticsDateFilter';
import { subDays, startOfDay, endOfDay } from 'date-fns';

interface AnalyticsPageProps {
    searchParams: Promise<{
        tab?: string;
        from?: string;
        to?: string;
        preset?: string;
        compare?: string;
        compareFrom?: string;
        compareTo?: string;
        quantityYear?: string; // Año para la sección de cantidad total KG
    }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
    // Await searchParams ya que es una promesa en Next.js 15
    const params = await searchParams;
    const activeTab = params.tab || 'daily';

    // Convertir searchParams a fechas o usar un rango más amplio por defecto
    const dateFilter = params.from && params.to ? {
        from: new Date(params.from + 'T00:00:00.000Z'), // Forzar UTC
        to: new Date(params.to + 'T23:59:59.999Z')     // Forzar UTC
    } : {
        // Por defecto: últimos 10 años (prácticamente "todo el historial") para coincidir con Express
        from: (() => {
            const now = new Date();
            const tenYearsAgo = subDays(now, 3650);
            return new Date(Date.UTC(
                tenYearsAgo.getUTCFullYear(),
                tenYearsAgo.getUTCMonth(),
                tenYearsAgo.getUTCDate(),
                0, 0, 0, 0
            ));
        })(),
        to: (() => {
            const now = new Date();
            return new Date(Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                23, 59, 59, 999
            ));
        })()
    };

    // Período de comparación (opcional)
    const compareFilter = params.compare === 'true' && params.compareFrom && params.compareTo ? {
        from: new Date(params.compareFrom + 'T00:00:00.000Z'),
        to: new Date(params.compareTo + 'T23:59:59.999Z')
    } : undefined;

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h1 className="text-2xl md:text-3xl font-bold">Estadísticas</h1>
                <div className="text-sm text-muted-foreground">
                    Análisis detallado del negocio
                </div>
            </div>

            {/* Filtro de fechas global */}
            <AnalyticsDateFilter />

            <AnalyticsTabsWrapper activeTab={activeTab}>
                {activeTab === 'daily' && <DailyAnalyticsTab dateFilter={dateFilter} compareFilter={compareFilter} />}
                {activeTab === 'monthly' && <MonthlyAnalyticsTab dateFilter={dateFilter} compareFilter={compareFilter} />}
                {activeTab === 'products' && <ProductsAnalyticsTab dateFilter={dateFilter} compareFilter={compareFilter} />}
                {activeTab === 'categories' && <CategoriesAnalyticsTab dateFilter={dateFilter} compareFilter={compareFilter} />}
                {activeTab === 'payments' && <PaymentsAnalyticsTab dateFilter={dateFilter} compareFilter={compareFilter} />}
                {activeTab === 'frequency' && <FrequencyAnalyticsTab dateFilter={dateFilter} compareFilter={compareFilter} />}
                {activeTab === 'quantity' && <QuantityAnalyticsTab dateFilter={dateFilter} compareFilter={compareFilter} selectedYear={params.quantityYear ? parseInt(params.quantityYear) : undefined} />}
            </AnalyticsTabsWrapper>
        </div>
    );
}
 