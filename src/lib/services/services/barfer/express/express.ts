import 'server-only';
import { apiClient } from '@/lib/api';
import type { Stock, CreateStockData, UpdateStockData, OrderPriority, CreateOrderPriorityData, UpdateOrderPriorityData, Order } from '../../../types/barfer';


export async function getExpressOrders(puntoEnvio?: string, from?: string, to?: string) {
    try {
        const params = new URLSearchParams();
        if (puntoEnvio) params.append('puntoEnvio', puntoEnvio);
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        const query = params.toString() ? `?${params.toString()}` : '';
        const result = await apiClient.get(`/orders/express${query}`);
        return {
            success: true,
            orders: result || [],
        };
    } catch (error) {
        return {
            success: false,
            orders: [],
            message: 'Error al obtener el stock',
        };
    }
}


/**
 * Crear un nuevo registro de stock
 */
export async function createStockMongo(
    data: CreateStockData
): Promise<{ success: boolean; stock?: Stock; message?: string }> {
    try {
        const result = await apiClient.post('/stock', data);
        return {
            success: true,
            stock: result.stock || result,
            message: 'Stock creado exitosamente',
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al crear el stock',
        };
    }
}

/**
 * Obtener todos los registros de stock de un punto de envio
 */
export async function getStockByPuntoEnvioMongo(
    puntoEnvio: string
): Promise<{ success: boolean; stock?: Stock[]; message?: string }> {
    try {
        const result = await apiClient.get(`/stock/punto-envio/${encodeURIComponent(puntoEnvio)}`);
        return {
            success: true,
            stock: result.stock || result || [],
        };
    } catch (error) {
        return {
            success: false,
            stock: [],
            message: 'Error al obtener el stock',
        };
    }
}

/**
 * Obtener un registro de stock por ID
 */
export async function getStockByIdMongo(
    id: string
): Promise<{ success: boolean; stock?: Stock; message?: string }> {
    try {
        const result = await apiClient.get(`/stock/${id}`);
        return {
            success: true,
            stock: result.stock || result,
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener el stock',
        };
    }
}

/**
 * Actualizar un registro de stock
 */
export async function updateStockMongo(
    id: string,
    data: UpdateStockData
): Promise<{ success: boolean; stock?: Stock; message?: string }> {
    try {
        const result = await apiClient.patch(`/stock/${id}`, data);
        return {
            success: true,
            stock: result.stock || result,
            message: 'Stock actualizado exitosamente',
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al actualizar el stock',
        };
    }
}

/**
 * Eliminar un registro de stock
 */
export async function deleteStockMongo(
    id: string
): Promise<{ success: boolean; message?: string }> {
    try {
        await apiClient.delete(`/stock/${id}`);
        return {
            success: true,
            message: 'Stock eliminado exitosamente',
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al eliminar el stock',
        };
    }
}


export async function duplicateExpressOrder(orderId: string, targetPuntoEnvio: string) {
    try {
        const result = await apiClient.post(`/orders/express/${orderId}/duplicate`, { targetPuntoEnvio });
        return {
            success: true,
            order: result.order || result,
            message: 'Pedido duplicado exitosamente',
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al duplicar el pedido',
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
        const result = await apiClient.post('/orders/priority', data);
        return {
            success: true,
            orderPriority: result.data || result.orderPriority || result,
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

        const result = await apiClient.get(`/orders/priority?${params.toString()}`);
        return {
            success: true,
            orderPriority: result.data || result.orderPriority || result || undefined,
        };
    } catch (error) {
        return {
            success: false,
            error: 'GET_ORDER_PRIORITY_ERROR',
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

        const result = await apiClient.patch(`/orders/priority?${params.toString()}`, data);
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
/**
 * Actualizar el estado de envío de un pedido
 */
export async function updateEstadoEnvio(
    orderId: string,
    estadoEnvio: 'pendiente' | 'pidiendo' | 'en-viaje' | 'listo'
): Promise<{
    success: boolean;
    order?: Order;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.patch(`/orders/${orderId}/estado-envio`, { estadoEnvio });
        return {
            success: true,
            order: result.order || result,
            message: 'Estado de envío actualizado exitosamente',
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al actualizar el estado de envío',
            error: 'UPDATE_ESTADO_ENVIO_ERROR',
        };
    }
}
