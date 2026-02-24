import { getOrdersByDay, getRevenueByDay } from '@/lib/services/services/barfer';
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
        const [allOrdersData, confirmedOrdersData] = await Promise.all([
            getOrdersByDay(dateFilter.from, dateFilter.to),
            getRevenueByDay(dateFilter.from, dateFilter.to)
        ]);

        // Datos del período de comparación (si está habilitado)
        let compareAllOrdersData, compareConfirmedOrdersData;
        if (compareFilter) {
            [compareAllOrdersData, compareConfirmedOrdersData] = await Promise.all([
                getOrdersByDay(compareFilter.from, compareFilter.to),
                getRevenueByDay(compareFilter.from, compareFilter.to)
            ]);
        }

        return (
            <DailyAnalyticsClient
                allOrdersData={allOrdersData}
                confirmedOrdersData={confirmedOrdersData}
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