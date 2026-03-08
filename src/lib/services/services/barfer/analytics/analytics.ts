import 'server-only';
import { apiClient } from '@/lib/api';

/**
 * Get the average value of orders
 */
export async function getAverageOrderValue() {
    try {
        return await apiClient.get('/analytics/average-order-value');
    } catch (error) {
        console.error('Error fetching average order value:', error);
        return { averageOrderValue: 0, totalOrders: 0, totalRevenue: 0 };
    }
}

/**
 * Get sales by category
 */
export async function getCategorySales(statusFilter = 'all', limit = 10, startDate?: string, endDate?: string) {
    try {
        const params = new URLSearchParams();
        if (statusFilter) params.append('statusFilter', statusFilter);
        if (limit) params.append('limit', limit.toString());
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const query = params.toString() ? `?${params.toString()}` : '';
        return await apiClient.get(`/analytics/category-sales${query}`);
    } catch (error) {
        console.error('Error fetching category sales:', error);
        return [];
    }
}

/**
 * Get client categories statistics
 */
export async function getClientCategoriesStats(startDate?: string, endDate?: string) {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const query = params.toString() ? `?${params.toString()}` : '';

        return await apiClient.get(`/analytics/client-categories-stats${query}`);
    } catch (error) {
        console.error('Error fetching client categories stats:', error);
        return { behaviorCategories: [], spendingCategories: [] };
    }
}

/**
 * Get client categorization
 */
export async function getClientCategorization() {
    try {
        return await apiClient.get('/analytics/client-categorization');
    } catch (error) {
        console.error('Error fetching client categorization:', error);
        return { behaviorCategories: [], spendingCategories: [] };
    }
}

/**
 * Get general client statistics
 */
export async function getClientGeneralStats(startDate?: string, endDate?: string) {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const query = params.toString() ? `?${params.toString()}` : '';

        return await apiClient.get(`/analytics/client-general-stats${query}`);
    } catch (error) {
        console.error('Error fetching client general stats:', error);
        return { totalClients: 0, averageOrderValue: 0, repeatCustomerRate: 0, averageOrdersPerCustomer: 0 };
    }
}

/**
 * Get clients grouped by category
 */
export async function getClientsByCategory() {
    try {
        return await apiClient.get('/analytics/clients-by-category');
    } catch (error) {
        console.error('Error fetching clients by category:', error);
        return { success: false, data: [] };
    }
}

/**
 * Get paginated clients
 */
export async function getClientsPaginated(page = 1, limit = 20) {
    try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        return await apiClient.get(`/analytics/clients-paginated?${params.toString()}`);
    } catch (error) {
        console.error('Error fetching paginated clients:', error);
        return { clients: [], total: 0, page, limit };
    }
}

/**
 * Get customer order frequency
 */
export async function getCustomerFrequency() {
    try {
        return await apiClient.get('/analytics/customer-frequency');
    } catch (error) {
        console.error('Error fetching customer frequency:', error);
        return [];
    }
}

/**
 * Get customer insights
 */
export async function getCustomerInsights(startDate?: string, endDate?: string) {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const query = params.toString() ? `?${params.toString()}` : '';

        return await apiClient.get(`/analytics/customer-insights${query}`);
    } catch (error) {
        console.error('Error fetching customer insights:', error);
        return { success: false, insights: [] };
    }
}

/**
 * Get delivery type statistics by month
 */
export async function getDeliveryTypeStatsByMonth() {
    try {
        return await apiClient.get('/analytics/delivery-type-stats-by-month');
    } catch (error) {
        console.error('Error fetching delivery type stats:', error);
        return [];
    }
}

/**
 * Get orders count and revenue by day
 */
export async function getOrdersByDay(startDate?: string, endDate?: string) {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const query = params.toString() ? `?${params.toString()}` : '';
        return await apiClient.get(`/analytics/orders-by-day${query}`);
    } catch (error) {
        console.error('Error fetching orders by day:', error);
        return [];
    }
}

/**
 * Get orders count and revenue by month
 */
export async function getOrdersByMonth() {
    try {
        return await apiClient.get('/analytics/orders-by-month');
    } catch (error) {
        console.error('Error fetching orders by month:', error);
        return [];
    }
}

/**
 * Get statistics by payment method
 */
export async function getPaymentMethodStats(startDate?: string, endDate?: string) {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const query = params.toString() ? `?${params.toString()}` : '';

        return await apiClient.get(`/analytics/payment-method-stats${query}`);
    } catch (error) {
        console.error('Error fetching payment method stats:', error);
        return [];
    }
}

/**
 * Get payments breakdown by time period
 */
export async function getPaymentsByTimePeriod(startDate: string, endDate: string, periodType = 'daily') {
    try {
        const params = new URLSearchParams();
        params.append('startDate', startDate);
        params.append('endDate', endDate);
        params.append('periodType', periodType);

        return await apiClient.get(`/analytics/payments-by-time-period?${params.toString()}`);
    } catch (error) {
        console.error('Error fetching payments by time period:', error);
        return [];
    }
}

/**
 * Get sales statistics by product
 */
export async function getProductSales(statusFilter = 'all', limit = 50, startDate?: string, endDate?: string) {
    try {
        const params = new URLSearchParams();
        if (statusFilter) params.append('statusFilter', statusFilter);
        if (limit) params.append('limit', limit.toString());
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const query = params.toString() ? `?${params.toString()}` : '';
        return await apiClient.get(`/analytics/product-sales${query}`);
    } catch (error) {
        console.error('Error fetching product sales:', error);
        return [];
    }
}

/**
 * Get products grouped by time period
 */
export async function getProductsByTimePeriod(startDate: string, endDate: string) {
    try {
        const params = new URLSearchParams();
        params.append('startDate', startDate);
        params.append('endDate', endDate);

        return await apiClient.get(`/analytics/products-by-time-period?${params.toString()}`);
    } catch (error) {
        console.error('Error fetching products by time period:', error);
        return [];
    }
}

/**
 * Get product sales timeline
 */
export async function getProductTimeline(startDate: string, endDate: string, productIds?: string[]) {
    try {
        const params = new URLSearchParams();
        params.append('startDate', startDate);
        params.append('endDate', endDate);
        if (productIds && productIds.length > 0) {
            productIds.forEach(id => params.append('productIds', id));
        }

        return await apiClient.get(`/analytics/product-timeline?${params.toString()}`);
    } catch (error) {
        console.error('Error fetching product timeline:', error);
        return [];
    }
}

/**
 * Get purchase frequency statistics
 */
export async function getPurchaseFrequency(startDate?: string, endDate?: string) {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const query = params.toString() ? `?${params.toString()}` : '';

        return await apiClient.get(`/analytics/purchase-frequency${query}`);
    } catch (error) {
        console.error('Error fetching purchase frequency:', error);
        return [];
    }
}

/**
 * Get quantity statistics aggregated by month
 */
export async function getQuantityStatsByMonth(startDate?: string, endDate?: string, puntoEnvio?: string) {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (puntoEnvio) params.append('puntoEnvio', puntoEnvio);
        const query = params.toString() ? `?${params.toString()}` : '';

        return await apiClient.get(`/analytics/quantity-stats-by-month${query}`);
    } catch (error) {
        console.error('Error fetching quantity stats:', error);
        return [];
    }
}

/**
 * Get revenue trends by day
 */
export async function getRevenueByDay(startDate?: string, endDate?: string) {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const query = params.toString() ? `?${params.toString()}` : '';
        return await apiClient.get(`/analytics/revenue-by-day${query}`);
    } catch (error) {
        console.error('Error fetching revenue by day:', error);
        return [];
    }
}
