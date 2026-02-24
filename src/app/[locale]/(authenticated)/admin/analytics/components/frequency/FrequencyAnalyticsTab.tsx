import { getCustomerInsights } from '@/lib/services/services/barfer/analytics/getCustomerInsights';
import { getPurchaseFrequency } from '@/lib/services/services/barfer/analytics/getPurchaseFrequency';
import { FrequencyAnalyticsClient } from './FrequencyAnalyticsClient';

interface FrequencyAnalyticsTabProps {
    dateFilter: {
        from: Date;
        to: Date;
    };
    compareFilter?: {
        from: Date;
        to: Date;
    };
}

export async function FrequencyAnalyticsTab({ dateFilter, compareFilter }: FrequencyAnalyticsTabProps) {
    try {
        const [customerInsights, purchaseFrequency] = await Promise.all([
            getCustomerInsights(dateFilter.from, dateFilter.to),
            getPurchaseFrequency(dateFilter.from, dateFilter.to)
        ]);

        // Datos del período de comparación (si está habilitado)
        let compareCustomerInsights;
        let comparePurchaseFrequency;
        if (compareFilter) {
            const [compInsights, compFrequency] = await Promise.all([
                getCustomerInsights(compareFilter.from, compareFilter.to),
                getPurchaseFrequency(compareFilter.from, compareFilter.to)
            ]);
            compareCustomerInsights = compInsights;
            comparePurchaseFrequency = compFrequency;
        }

        return (
            <FrequencyAnalyticsClient
                customerInsights={customerInsights}
                purchaseFrequency={purchaseFrequency}
                compareCustomerInsights={compareCustomerInsights}
                comparePurchaseFrequency={comparePurchaseFrequency}
                isComparing={!!compareFilter}
                dateFilter={dateFilter}
                compareFilter={compareFilter}
            />
        );
    } catch (error) {
        console.error('Error loading frequency analytics:', error);
        return (
            <div className="p-4 border rounded-lg">
                <p className="text-sm text-red-600">Error al cargar datos de métricas</p>
            </div>
        );
    }
} 