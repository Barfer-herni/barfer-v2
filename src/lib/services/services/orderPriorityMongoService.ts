import { apiClient } from '@/lib/api';
import type { OrderPriority, CreateOrderPriorityData, UpdateOrderPriorityData } from '../types/barfer';

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
