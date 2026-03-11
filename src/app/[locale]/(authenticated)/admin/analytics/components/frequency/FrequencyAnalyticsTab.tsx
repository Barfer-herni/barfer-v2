import { getCustomerInsightsAction, getPurchaseFrequencyAction } from '../../actions';
import { FrequencyAnalyticsClient } from './FrequencyAnalyticsClient';

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
        const [customerInsightsResp, purchaseFrequencyResp] = await Promise.all([
            getCustomerInsightsAction(dateFilter.from.toISOString(), dateFilter.to.toISOString()),
            getPurchaseFrequencyAction(dateFilter.from.toISOString(), dateFilter.to.toISOString())
        ]);
        // Datos del período de comparación (si está habilitado)
        const defaultInsights: CustomerInsights = {
            averageOrderValue: 0,
            averageOrdersPerCustomer: 0,
            totalCustomers: 0,
            totalOrders: 0,
            totalRevenue: 0,
            averageSpentPerCustomer: 0,
            repeatCustomerRate: 0,
            customersWithMultipleOrders: 0
        };

        const defaultFrequency = { avgFrequencyDays: 0 };

        let compareCustomerInsights;
        let comparePurchaseFrequency;
        if (compareFilter) {
            const [compInsightsResp, compFrequencyResp] = await Promise.all([
                getCustomerInsightsAction(compareFilter.from.toISOString(), compareFilter.to.toISOString()),
                getPurchaseFrequencyAction(compareFilter.from.toISOString(), compareFilter.to.toISOString())
            ]);
            compareCustomerInsights = compInsightsResp.success && compInsightsResp.data ? compInsightsResp.data : defaultInsights;
            comparePurchaseFrequency = compFrequencyResp.success && compFrequencyResp.data ? compFrequencyResp.data : defaultFrequency;
        }

        return (
            <FrequencyAnalyticsClient
                customerInsights={customerInsightsResp.success && customerInsightsResp.data ? customerInsightsResp.data : defaultInsights}
                purchaseFrequency={purchaseFrequencyResp.success && purchaseFrequencyResp.data ? purchaseFrequencyResp.data : defaultFrequency}
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
