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
 * Obtiene ordenes filtradas y ordenadas desde el backend.
 * La paginacion se hace client-side ya que el backend retorna todas las ordenes.
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
        if (search) params.set('search', search);
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        if (orderType) params.set('orderType', orderType);
        if (sorting.length > 0) {
            params.set('sorting', JSON.stringify(sorting));
        }

        const allOrders: Order[] = await apiClient.get(`/orders/all?${params.toString()}`);

        const total = allOrders.length;
        const pageCount = Math.ceil(total / pageSize);
        const start = pageIndex * pageSize;
        const orders = allOrders.slice(start, start + pageSize);

        return { orders, pageCount, total };
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw new Error('Could not fetch orders.');
    }
}
