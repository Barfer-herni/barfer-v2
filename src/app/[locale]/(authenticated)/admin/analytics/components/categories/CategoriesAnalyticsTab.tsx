import { getCategorySalesAction, getProductsByTimePeriodAction } from '../../actions';
import { CategoriesAnalyticsClient } from './CategoriesAnalyticsClient';

interface CategoriesAnalyticsTabProps {
    dateFilter: {
        from: Date;
        to: Date;
    };
    compareFilter?: {
        from: Date;
        to: Date;
    };
}

export async function CategoriesAnalyticsTab({ dateFilter, compareFilter }: CategoriesAnalyticsTabProps) {
    try {
        const [allCategoriesResp, progressResp] = await Promise.all([
            getCategorySalesAction('all', 10, dateFilter.from.toISOString(), dateFilter.to.toISOString()),
            getProductsByTimePeriodAction(dateFilter.from.toISOString(), dateFilter.to.toISOString())
        ]);

        // Datos del período de comparación (si está habilitado)
        let compareAllCategories, compareProgressData;
        if (compareFilter) {
            const [compareAllResp, compareProgressResp] = await Promise.all([
                getCategorySalesAction('all', 10, compareFilter.from.toISOString(), compareFilter.to.toISOString()),
                getProductsByTimePeriodAction(compareFilter.from.toISOString(), compareFilter.to.toISOString())
            ]);
            compareAllCategories = compareAllResp.success ? compareAllResp.data : [];
            compareProgressData = compareProgressResp.success ? compareProgressResp.data : [];
        }

        return (
            <CategoriesAnalyticsClient
                allCategories={allCategoriesResp.success ? allCategoriesResp.data : []}
                pendingCategories={[]}
                confirmedCategories={[]}
                compareAllCategories={compareAllCategories}
                comparePendingCategories={[]}
                compareConfirmedCategories={[]}
                progressData={progressResp.success ? progressResp.data : []}
                compareProgressData={compareProgressData}
                isComparing={!!compareFilter}
                dateFilter={dateFilter}
                compareFilter={compareFilter}
            />
        );
    } catch (error) {
        console.error('Error loading categories analytics:', error);
        return (
            <div className="p-4 border rounded-lg">
                <p className="text-sm text-red-600">Error al cargar datos de categorías</p>
            </div>
        );
    }
}
