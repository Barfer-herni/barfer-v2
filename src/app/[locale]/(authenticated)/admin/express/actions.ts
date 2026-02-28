'use server';

import { revalidatePath } from 'next/cache';
import {
    createStockMongo,
    getStockByPuntoEnvioMongo,
    getDetalleEnvioByPuntoEnvioMongo,
    createPuntoEnvioMongo,
    getAllPuntosEnvioMongo,
    deletePuntoEnvioMongo,
    updateStockMongo,
} from '@/lib/services';
import { getCurrentUserWithPermissions } from '@/lib/auth/server-permissions';

export async function getDeliveryAreasWithPuntoEnvioAction() {
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
}

export async function getExpressOrdersAction(puntoEnvio?: string, from?: string, to?: string) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', orders: [] };
}

export async function createStockAction(data: {
    puntoEnvio: string;
    section?: string;
    producto: string;
    peso?: string;
    stockInicial: number;
    llevamos: number;
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
        // Validar que el usuario tenga permiso para ver este punto de envío
        const userWithPermissions = await getCurrentUserWithPermissions();
        const isAdmin = userWithPermissions?.isAdmin || false;

        // Si no es admin, validar que el punto esté en sus puntos asignados
        if (!isAdmin) {
            const userPuntosEnvio = Array.isArray(userWithPermissions?.puntoEnvio)
                ? userWithPermissions.puntoEnvio
                : (userWithPermissions?.puntoEnvio ? [userWithPermissions.puntoEnvio] : []);

            if (userPuntosEnvio.length === 0 || !userPuntosEnvio.includes(puntoEnvio)) {
                return {
                    success: true,
                    stock: [],
                };
            }
        }

        return await getStockByPuntoEnvioMongo(puntoEnvio);
    } catch (error) {
        console.error('Error getting stock:', error);
        return {
            success: false,
            stock: [],
        };
    }
}

export async function getDetalleEnvioByPuntoEnvioAction(puntoEnvio: string) {
    try {
        // Validar que el usuario tenga permiso para ver este punto de envío
        const userWithPermissions = await getCurrentUserWithPermissions();
        const isAdmin = userWithPermissions?.isAdmin || false;

        // Si no es admin, validar que el punto esté en sus puntos asignados
        if (!isAdmin) {
            const userPuntosEnvio = Array.isArray(userWithPermissions?.puntoEnvio)
                ? userWithPermissions.puntoEnvio
                : (userWithPermissions?.puntoEnvio ? [userWithPermissions.puntoEnvio] : []);

            if (userPuntosEnvio.length === 0 || !userPuntosEnvio.includes(puntoEnvio)) {
                return {
                    success: true,
                    detalleEnvio: [],
                };
            }
        }

        return await getDetalleEnvioByPuntoEnvioMongo(puntoEnvio);
    } catch (error) {
        console.error('Error getting detalle:', error);
        return {
            success: false,
            detalleEnvio: [],
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
        const canDelete = userWithPermissions?.permissions?.includes('express:delete') || false;

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
    return { success: false, error: 'Servicio no disponible - migrando a backend API', order: null, message: 'Servicio no disponible - migrando a backend API' };
}

export async function getProductsForStockAction() {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', products: [] };
}

export async function updateStockAction(
    id: string,
    data: {
        section?: string;
        stockInicial?: number;
        llevamos?: number;
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

export async function getPedidosDelDiaAction(puntoEnvio: string, date: Date) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', count: 0 };
}

// Acción para duplicar un pedido express en un punto de envío específico
export async function duplicateExpressOrderAction(orderId: string, targetPuntoEnvio: string) {
    'use server';
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API' };
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
                    error: 'No tienes permiso para modificar este punto de envío',
                };
            }
        }

        const { saveOrderPriority } = await import('@/lib/services');
        const result = await saveOrderPriority({ fecha, puntoEnvio, orderIds });

        // No revalidamos la ruta para evitar recargas lentas
        // El componente usa optimistic updates para actualización instantánea

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
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API' };
}

