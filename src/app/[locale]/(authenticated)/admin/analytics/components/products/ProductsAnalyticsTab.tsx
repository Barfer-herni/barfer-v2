import { getProductSalesAction, getProductTimelineAction } from '../../actions';
import { ProductsAnalyticsClient } from './ProductsAnalyticsClient';

interface ProductsAnalyticsTabProps {
    dateFilter: {
        from: Date;
        to: Date;
    };
    compareFilter?: {
        from: Date;
        to: Date;
    };
}

export async function ProductsAnalyticsTab({ dateFilter, compareFilter }: ProductsAnalyticsTabProps) {
    try {
        const allProductsResp = await getProductSalesAction('all', 20, dateFilter.from.toISOString(), dateFilter.to.toISOString());
        const allProducts = allProductsResp.success ? (allProductsResp.data as any[]) : [];

        const productIds = Array.from(new Set(allProducts.map((p: any) => (p.productId || p.id) as string)));

        const timelineResp = await getProductTimelineAction(dateFilter.from.toISOString(), dateFilter.to.toISOString(), productIds);
        const timelineData = timelineResp.success ? (timelineResp.data as any[]) : [];

        let compareAllProducts, compareTimelineData;
        if (compareFilter) {
            const compareProductsResp = await getProductSalesAction('all', 20, compareFilter.from.toISOString(), compareFilter.to.toISOString());
            compareAllProducts = compareProductsResp.success ? (compareProductsResp.data as any[]) : [];
            const compareProductIds = Array.from(new Set(compareAllProducts.map((p: any) => (p.productId || p.id) as string)));
            const compareTimelineResp = await getProductTimelineAction(compareFilter.from.toISOString(), compareFilter.to.toISOString(), compareProductIds);
            compareTimelineData = compareTimelineResp.success ? (compareTimelineResp.data as any[]) : [];
        }

        return (
            <ProductsAnalyticsClient
                allProducts={allProducts}
                pendingProducts={[]}
                confirmedProducts={[]}
                compareAllProducts={compareAllProducts}
                comparePendingProducts={[]}
                compareConfirmedProducts={[]}
                timelineData={timelineData}
                compareTimelineData={compareTimelineData}
                isComparing={!!compareFilter}
                dateFilter={dateFilter}
                compareFilter={compareFilter}
            />
        );
    } catch (error) {
        console.error('Error loading products analytics:', error);
        return (
            <div className="p-4 border rounded-lg">
                <p className="text-sm text-red-600">Error al cargar datos de productos</p>
            </div>
        );
    }
}
