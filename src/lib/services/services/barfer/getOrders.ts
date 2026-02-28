import 'server-only';
import { apiClient } from '@/lib/api';
import type { Order } from '../../types/barfer';

interface GetOrdersParams {
    pageIndex?: number;
    pageSize?: number;
    search?: string;
    sorting?: { id: string; desc: boolean }[];
    from?: string;
    to?: string;
    orderType?: string;
}

/**
 * Obtiene ordenes de forma paginada, filtrada y ordenada desde el backend.
 */
export async function getOrders({
    pageIndex = 0,
    pageSize = 50,
    search = '',
    sorting = [{ id: 'createdAt', desc: true }],
    from,
    to,
    orderType,
}: GetOrdersParams): Promise<{ orders: Order[]; pageCount: number; total: number }> {
    try {
        const params = new URLSearchParams();
        params.set('pageIndex', String(pageIndex));
        params.set('pageSize', String(pageSize));
        if (search) params.set('search', search);
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        if (orderType) params.set('orderType', orderType);
        if (sorting.length > 0) {
            params.set('sorting', JSON.stringify(sorting));
        }

        const result = await apiClient.get(`/orders/all?${params.toString()}`);

        return {
            orders: result.orders || result.data || [],
            pageCount: result.pageCount || 0,
            total: result.total || 0,
        };
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw new Error('Could not fetch orders.');
    }
}
