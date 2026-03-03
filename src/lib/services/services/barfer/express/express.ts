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



export async function getProductsForStock() {
    try {
        const result = await apiClient.get(`/stock/products-for-stock`);
        return {
            success: true,
            products: result.products || result || [],
        };
    } catch (error) {
        return {
            success: false,
            products: [],
            message: 'Error al obtener los productos',
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

/**
 * Obtener la cantidad de pedidos para un punto de envío y fecha
 */
export async function getPedidosDelDia(puntoEnvio: string, date: string): Promise<{
    success: boolean;
    count: number;
    error?: string;
}> {
    try {
        const params = new URLSearchParams();
        params.set('puntoEnvio', puntoEnvio);
        params.set('date', date);

        const count = await apiClient.get(`/orders/count-by-day?${params.toString()}`);
        return {
            success: true,
            count: typeof count === 'number' ? count : (count.count || 0),
        };
    } catch (error) {
        return {
            success: false,
            count: 0,
            error: 'GET_PEDIDOS_DEL_DIA_ERROR',
        };
    }
}

/**
 * Inicializar stock para una fecha específica
 */
export async function initializeStockForDate(puntoEnvio: string, date: string): Promise<{
    success: boolean;
    initialized: boolean;
    count: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.post('/stock/initialize', { puntoEnvio, date });
        return {
            success: true,
            initialized: result.initialized ?? false,
            count: result.count ?? 0,
            message: result.message,
        };
    } catch (error) {
        return {
            success: false,
            initialized: false,
            count: 0,
            error: 'INITIALIZE_STOCK_ERROR',
        };
    }
}

/**
 * Obtener zonas de entrega que tienen punto de envío
 */
export async function getDeliveryAreasWithPuntoEnvio(): Promise<{
    success: boolean;
    deliveryAreas: any[];
    error?: string;
}> {
    try {
        const result = await apiClient.get('/delivery-areas/with-punto-envio');
        return {
            success: true,
            deliveryAreas: result || [],
        };
    } catch (error) {
        return {
            success: false,
            deliveryAreas: [],
            error: 'GET_DELIVERY_AREAS_ERROR',
        };
    }
}

/**
 * Recalcular la cadena de stock hacia adelante
 */
export async function recalculateStockChain(puntoEnvio: string, startDate: string): Promise<{
    success: boolean;
    modifiedDays: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.post('/stock/recalculate', { puntoEnvio, startDate });
        return {
            success: true,
            modifiedDays: result.modifiedDays ?? 0,
            message: result.message,
        };
    } catch (error) {
        return {
            success: false,
            modifiedDays: 0,
            error: 'RECALCULATE_STOCK_ERROR',
        };
    }
}




