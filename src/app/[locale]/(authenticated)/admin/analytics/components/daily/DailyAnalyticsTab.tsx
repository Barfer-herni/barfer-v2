import { getOrdersByDayAction, getRevenueByDayAction } from '../../actions';
import { DailyAnalyticsClient } from './DailyAnalyticsClient';

interface DailyAnalyticsTabProps {
    dateFilter: {
        from: Date;
        to: Date;
    };
    compareFilter?: {
        from: Date;
        to: Date;
    };
}

export async function DailyAnalyticsTab({ dateFilter, compareFilter }: DailyAnalyticsTabProps) {
    try {
        // Datos del período principal
        const [allOrdersResponse, confirmedOrdersResponse] = await Promise.all([
            getOrdersByDayAction(dateFilter.from.toISOString(), dateFilter.to.toISOString()),
            getRevenueByDayAction(dateFilter.from.toISOString(), dateFilter.to.toISOString())
        ]);

        // Datos del período de comparación (si está habilitado)
        let compareAllOrdersData, compareConfirmedOrdersData;
        if (compareFilter) {
            const [compareAllResp, compareConfirmedResp] = await Promise.all([
                getOrdersByDayAction(compareFilter.from.toISOString(), compareFilter.to.toISOString()),
                getRevenueByDayAction(compareFilter.from.toISOString(), compareFilter.to.toISOString())
            ]);
            compareAllOrdersData = compareAllResp.success ? compareAllResp.data : [];
            compareConfirmedOrdersData = compareConfirmedResp.success ? compareConfirmedResp.data : [];
        }

        return (
            <DailyAnalyticsClient
                allOrdersData={allOrdersResponse.success ? allOrdersResponse.data : []}
                confirmedOrdersData={confirmedOrdersResponse.success ? confirmedOrdersResponse.data : []}
                compareAllOrdersData={compareAllOrdersData}
                compareConfirmedOrdersData={compareConfirmedOrdersData}
                isComparing={!!compareFilter}
                dateFilter={dateFilter}
                compareFilter={compareFilter}
            />
        );
    } catch (error) {
        console.error('Error loading daily analytics:', error);
        return (
            <div className="p-4 border rounded-lg">
                <p className="text-sm text-red-600">Error al cargar datos diarios</p>
            </div>
        );
    }
}
