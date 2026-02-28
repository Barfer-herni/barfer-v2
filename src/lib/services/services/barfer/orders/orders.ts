import 'server-only';
import { apiClient } from '@/lib/api';
import type { Order } from '../../../types/barfer';

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

        const allOrders: Order[] = await apiClient.get(`/orders/all?${params.toString()}`);

        // Sorting client-side
        if (sorting.length > 0) {
            const { id, desc } = sorting[0];
            allOrders.sort((a: any, b: any) => {
                const aVal = a[id] ?? '';
                const bVal = b[id] ?? '';
                if (aVal < bVal) return desc ? 1 : -1;
                if (aVal > bVal) return desc ? -1 : 1;
                return 0;
            });
        }

        const total = allOrders.length;
        const pageCount = Math.ceil(total / pageSize);
        const start = pageIndex * pageSize;
        const orders = allOrders.slice(start, start + pageSize);

        return { orders, pageCount, total };
    } catch (error) {
        throw new Error('Could not fetch orders.');
    }
}

/**
 * Crea una nueva orden
 */
export async function createOrder(data: any): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
        const result = await apiClient.post('/orders', data);

        if (result.success === false) {
            return { success: false, error: result.error || result.message || 'Failed to create order' };
        }

        return {
            success: true,
            order: result.order || result,
        };
    } catch (error) {
        if (error instanceof Error && error.message.includes('Validation error')) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Internal server error' };
    }
}

/**
 * Elimina una orden por ID
 */
export async function deleteOrder(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await apiClient.delete(`/orders/${id}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Internal server error' };
    }
}

import type { OrderPriority, CreateOrderPriorityData, UpdateOrderPriorityData } from '../../../types/barfer';

/**
 * Obtener el ordenamiento guardado para una fecha y punto de envío específicos
 */
export async function getOrderPriority(fecha: string, puntoEnvio: string): Promise<{
    success: boolean;
    orderPriority?: OrderPriority;
    error?: string;
}> {
    try {
        const params = new URLSearchParams();
        params.set('fecha', fecha);
        params.set('puntoEnvio', puntoEnvio);

        const result = await apiClient.get(`/order-priority?${params.toString()}`);
        return {
            success: true,
            orderPriority: result.orderPriority || result || undefined,
        };
    } catch (error) {
        return {
            success: false,
            error: 'GET_ORDER_PRIORITY_ERROR',
        };
    }
}

/**
 * Guardar o actualizar el ordenamiento de pedidos
 * Usa upsert para crear o actualizar el documento
 */
export async function saveOrderPriority(data: CreateOrderPriorityData): Promise<{
    success: boolean;
    orderPriority?: OrderPriority;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.post('/order-priority', data);
        return {
            success: true,
            orderPriority: result.orderPriority || result,
            message: 'Orden de prioridad guardado exitosamente',
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al guardar el orden de prioridad',
            error: 'SAVE_ORDER_PRIORITY_ERROR',
        };
    }
}

/**
 * Actualizar solo el array de orderIds
 */
export async function updateOrderPriority(
    fecha: string,
    puntoEnvio: string,
    data: UpdateOrderPriorityData
): Promise<{
    success: boolean;
    orderPriority?: OrderPriority;
    message?: string;
    error?: string;
}> {
    try {
        const params = new URLSearchParams();
        params.set('fecha', fecha);
        params.set('puntoEnvio', puntoEnvio);

        const result = await apiClient.patch(`/order-priority?${params.toString()}`, data);
        return {
            success: true,
            orderPriority: result.orderPriority || result,
            message: 'Orden de prioridad actualizado exitosamente',
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al actualizar el orden de prioridad',
            error: 'UPDATE_ORDER_PRIORITY_ERROR',
        };
    }
}
