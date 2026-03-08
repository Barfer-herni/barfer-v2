import { getOrdersByMonthAction, getDeliveryTypeStatsByMonthAction } from '../../actions';
import { MonthlyAnalyticsClient } from './MonthlyAnalyticsClient';

interface MonthlyAnalyticsTabProps {
    dateFilter: {
        from: Date;
        to: Date;
    };
    compareFilter?: {
        from: Date;
        to: Date;
    };
}

export async function MonthlyAnalyticsTab({ dateFilter, compareFilter }: MonthlyAnalyticsTabProps) {
    try {
        const [allOrdersResponse, deliveryStatsResponse] = await Promise.all([
            getOrdersByMonthAction(),
            getDeliveryTypeStatsByMonthAction()
        ]);

        let compareAllOrdersData;
        let compareDeliveryStats;
        if (compareFilter) {
            // Nota: El backend actualmente no filtra getOrdersByMonth por rango en el viejo back tampoco parece usarlo
            // pero si fuera necesario se pasaría. Por ahora mantenemos paridad.
            const [compareAllResp, compareDeliveryResp] = await Promise.all([
                getOrdersByMonthAction(),
                getDeliveryTypeStatsByMonthAction()
            ]);
            compareAllOrdersData = compareAllResp.success ? compareAllResp.data : [];
            compareDeliveryStats = compareDeliveryResp.success ? compareDeliveryResp.data : [];
        }

        return (
            <MonthlyAnalyticsClient
                allOrdersData={allOrdersResponse.success ? allOrdersResponse.data : []}
                compareAllOrdersData={compareAllOrdersData}
                deliveryStats={deliveryStatsResponse.success ? deliveryStatsResponse.data : []}
                compareDeliveryStats={compareDeliveryStats}
                isComparing={!!compareFilter}
                dateFilter={dateFilter}
                compareFilter={compareFilter}
            />
        );
    } catch (error) {
        console.error('Error loading monthly analytics:', error);
        return (
            <div className="p-4 border rounded-lg">
                <p className="text-sm text-red-600">Error al cargar datos mensuales</p>
            </div>
        );
    }
}
