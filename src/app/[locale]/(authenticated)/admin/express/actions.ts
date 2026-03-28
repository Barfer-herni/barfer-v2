'use server';

import { revalidatePath } from 'next/cache';
import {
    createStockMongo,
    getStockByPuntoEnvioMongo,
    createPuntoEnvioMongo,
    getAllPuntosEnvioMongo,
    deletePuntoEnvioMongo,
    updateStockMongo,
    getExpressOrders,
    getExpressOrdersMetrics,
    duplicateExpressOrder,
    saveOrderPriority,
    getProductsForStock
} from '@/lib/services';
import { getCurrentUserWithPermissions } from '@/lib/auth/server-permissions';

export async function getDeliveryAreasWithPuntoEnvioAction() {
    try {
        const { getDeliveryAreasWithPuntoEnvio } = await import('@/lib/services');
        return await getDeliveryAreasWithPuntoEnvio();
    } catch (error) {
        console.error('Error getting delivery areas:', error);
        return {
            success: false,
            deliveryAreas: [],
        };
    }
}

export async function getExpressOrdersAction(
    puntoEnvio?: string,
    from?: string,
    to?: string,
    page?: number,
    limit?: number
) {
    return await getExpressOrders(puntoEnvio, from, to, page, limit);
}

export async function getExpressOrdersMetricsAction(
    puntoEnvio?: string,
    from?: string,
    to?: string
) {
    return await getExpressOrdersMetrics(puntoEnvio, from, to);
}

export async function createStockAction(data: {
    puntoEnvio: string;
    section?: string;
    producto: string;
    peso?: string;
    stockInicial: number;
    llevamos: number;
    ajuste?: number;
    pedidosDelDia: number;
    stockFinal?: number;
    fecha?: string;
}) {
    try {
        const result = await createStockMongo(data);

        if (result.success) {
            revalidatePath('/admin/express');
        }

        return result;
    } catch (error) {
        console.error('Error creating stock:', error);
        return {
            success: false,
            message: 'Error al crear el stock',
        };
    }
}

export async function getStockByPuntoEnvioAction(puntoEnvio: string) {
    try {
        return await getStockByPuntoEnvioMongo(puntoEnvio);
    } catch (error) {
        console.error('Error getting stock:', error);
        return {
            success: false,
            stock: [],
        };
    }
}


export async function createPuntoEnvioAction(data: { nombre: string; cutoffTime?: string }) {
    try {
        const result = await createPuntoEnvioMongo(data);

        if (result.success) {
            revalidatePath('/admin/express');
        }

        return result;
    } catch (error) {
        console.error('Error creating punto de envío:', error);
        return {
            success: false,
            message: 'Error al crear el punto de envío',
        };
    }
}

export async function updatePuntoEnvioAction(id: string, data: { nombre?: string; cutoffTime?: string }) {
    try {
        const { updatePuntoEnvioMongo } = await import('@/lib/services');
        const result = await updatePuntoEnvioMongo(id, data);

        if (result.success) {
            revalidatePath('/admin/express');
        }

        return result;
    } catch (error) {
        console.error('Error updating punto de envío:', error);
        return {
            success: false,
            message: 'Error al actualizar el punto de envío',
        };
    }
}

export async function getAllPuntosEnvioAction() {
    try {
        return await getAllPuntosEnvioMongo();
    } catch (error) {
        console.error('Error getting puntos de envío:', error);
        return {
            success: false,
            puntosEnvio: [],
        };
    }
}

export async function deletePuntoEnvioAction(id: string) {
    try {
        const userWithPermissions = await getCurrentUserWithPermissions();
        const isAdmin = userWithPermissions?.isAdmin || false;
        const canDelete = userWithPermissions?.permissions?.includes('stock:delete') || false;

        if (!isAdmin && !canDelete) {
            return {
                success: false,
                message: 'No tienes permiso para eliminar puntos de envío',
            };
        }

        const result = await deletePuntoEnvioMongo(id);

        if (result.success) {
            revalidatePath('/admin/express');
        }

        return result;
    } catch (error) {
        console.error('Error deleting punto de envío:', error);
        return {
            success: false,
            message: 'Error al eliminar el punto de envío',
        };
    }
}

export async function updateEstadoEnvioAction(orderId: string, estadoEnvio: 'pendiente' | 'pidiendo' | 'en-viaje' | 'listo') {
    try {
        const { updateEstadoEnvio } = await import('@/lib/services');
        const result = await updateEstadoEnvio(orderId, estadoEnvio);

        if (result.success) {
            revalidatePath('/admin/express');
        }

        return result;
    } catch (error) {
        console.error('Error updating estado de envío:', error);
        return {
            success: false,
            message: 'Error al actualizar el estado de envío',
        };
    }
}

export async function getProductsForStockAction() {
    try {
        return await getProductsForStock();
    } catch (error) {
        console.error('Error getting products for stock:', error);
        return {
            success: false,
            products: [],
        };
    }
}

export async function updateStockAction(
    id: string,
    data: {
        section?: string;
        stockInicial?: number;
        llevamos?: number;
        ajuste?: number;
        pedidosDelDia?: number;
        stockFinal?: number;
    }
) {
    try {
        const result = await updateStockMongo(id, data);

        if (result.success) {
            revalidatePath('/admin/express');
        }

        return result;
    } catch (error) {
        console.error('Error updating stock:', error);
        return {
            success: false,
            message: 'Error al actualizar el stock',
        };
    }
}

export async function getPedidosDelDiaAction(puntoEnvio: string, date: Date | string) {
    try {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        const { getPedidosDelDia } = await import('@/lib/services');
        return await getPedidosDelDia(puntoEnvio, dateStr);
    } catch (error) {
        console.error('Error getting pedidos del día:', error);
        return {
            success: false,
            count: 0,
        };
    }
}

// Acción para duplicar un pedido express en un punto de envío específico
export async function duplicateExpressOrderAction(orderId: string, targetPuntoEnvio: string) {
    return await duplicateExpressOrder(orderId, targetPuntoEnvio);
}

/**
 * Obtener el ordenamiento guardado para una fecha y punto de envío
 */
export async function getOrderPriorityAction(fecha: string, puntoEnvio: string) {
    try {
        // Validar permisos del usuario
        const userWithPermissions = await getCurrentUserWithPermissions();
        const isAdmin = userWithPermissions?.isAdmin || false;

        if (!isAdmin) {
            const userPuntosEnvio = Array.isArray(userWithPermissions?.puntoEnvio)
                ? userWithPermissions.puntoEnvio
                : (userWithPermissions?.puntoEnvio ? [userWithPermissions.puntoEnvio] : []);

            if (!userPuntosEnvio.includes(puntoEnvio)) {
                return {
                    success: false,
                    error: 'No tienes permiso para ver este punto de envío',
                };
            }
        }

        const { getOrderPriority } = await import('@/lib/services');
        return await getOrderPriority(fecha, puntoEnvio);
    } catch (error) {
        console.error('Error getting order priority:', error);
        return {
            success: false,
            error: 'Error al obtener el orden de prioridad',
        };
    }
}

/**
 * Guardar el ordenamiento de pedidos
 */
export async function saveOrderPriorityAction(
    fecha: string,
    puntoEnvio: string,
    orderIds: string[]
) {
    try {
        const result = await saveOrderPriority({ fecha, puntoEnvio, orderIds });
        return result;
    } catch (error) {
        console.error('Error saving order priority:', error);
        return {
            success: false,
            error: 'Error al guardar el orden de prioridad',
        };
    }
}

export async function initializeStockForDateAction(puntoEnvio: string, date: Date | string) {
    try {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        const { initializeStockForDate } = await import('@/lib/services');
        const result = await initializeStockForDate(puntoEnvio, dateStr);

        if (result.success && result.initialized) {
            revalidatePath('/admin/express');
        }

        return result;
    } catch (error) {
        console.error('Error initializing stock for date:', error);
        return {
            success: false,
            error: 'Error al inicializar el stock',
        };
    }
}

export async function recalculateStockChainAction(puntoEnvio: string, startDate: string) {
    try {
        const { recalculateStockChain } = await import('@/lib/services');
        const result = await recalculateStockChain(puntoEnvio, startDate);

        if (result.success) {
            revalidatePath('/admin/express');
        }

        return result;
    } catch (error) {
        console.error('Error recalculating stock chain:', error);
        return {
            success: false,
            error: 'Error al recalcular la cadena de stock',
        };
    }
}

