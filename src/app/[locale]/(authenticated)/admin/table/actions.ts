'use server';
import {
    createOrder,
    updateOrder,
    deleteOrder,
    duplicateOrder,
    updateOrdersStatusBulk,
    getBackupsCount,
    undoLastChange,
    clearAllBackups,
    calculatePrice,
    getProductsFromPrices,
} from '@/lib/services/services/barfer';
import { getPuntosVentaMongo } from '@/lib/services/services/barfer/puntos-ventas/puntos-ventas';
import { revalidatePath } from 'next/cache';
import { validateAndNormalizePhone } from './helpers';

export async function updateOrderAction(id: string, data: any) {
    try {
        // Validar y normalizar el número de teléfono si está presente
        if (data.address?.phone) {
            const normalizedPhone = validateAndNormalizePhone(data.address.phone);
            if (normalizedPhone) {
                data.address.phone = normalizedPhone;
            } else {
                return { success: false, error: 'El número de teléfono no es válido. Use el formato: La Plata (221 XXX-XXXX) o CABA/BA (11-XXXX-XXXX / 15-XXXX-XXXX)', order: null };
            }
        }

        const result = await updateOrder(id, data);
        if (!result.success) {
            return { success: false, error: result.error, order: null };
        }
        revalidatePath('/admin/table');
        revalidatePath('/admin/express');
        return { success: true, order: result.order };
    } catch (error) {
        return { success: false, error: (error as Error).message, order: null };
    }
}

export async function deleteOrderAction(id: string) {
    try {
        const result = await deleteOrder(id);
        if (!result.success) {
            return { success: false, error: result.error };
        }
        revalidatePath('/admin/table');
        revalidatePath('/admin/express');
        return { success: true };
    } catch (error) {
        console.error('Error in deleteOrderAction:', error);
        return { success: false, error: 'Error al eliminar la orden' };
    }
}

export async function createOrderAction(data: any) {
    try {
        // Validar y normalizar el número de teléfono si está presente
        if (data.address?.phone) {
            const normalizedPhone = validateAndNormalizePhone(data.address.phone);
            if (normalizedPhone) {
                data.address.phone = normalizedPhone;
            } else {
                return { success: false, error: 'El número de teléfono no es válido. Use el formato: La Plata (221 XXX-XXXX) o CABA/BA (11-XXXX-XXXX / 15-XXXX-XXXX)', order: null };
            }
        }
        const result = await createOrder(data);
        if (!result.success) {
            return { success: false, error: result.error };
        }
        revalidatePath('/admin/table');
        return { success: true, order: result.order };
    } catch (error) {
        console.error('[createOrderAction] ERROR:', error);
        return { success: false, error: (error as Error).message || 'Error al crear la orden' };
    }
}

export async function migrateClientTypeAction() {
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
}

export async function updateOrdersStatusBulkAction(ids: string[], status: string) {
    'use server';
    try {
        const result = await updateOrdersStatusBulk(ids, status);
        if (!result.success) {
            return { success: false, error: result.error };
        }
        revalidatePath('/admin/table');
        return { success: true };
    } catch (error) {
        console.error('Error in updateOrdersStatusBulkAction:', error);
        return { success: false, error: 'Error al actualizar las órdenes' };
    }
}

// Acción para deshacer el último cambio
export async function undoLastChangeAction() {
    try {
        const result = await undoLastChange();
        if (!result.success) {
            return { success: false, error: result.error };
        }
        revalidatePath('/admin/table');
        return { success: true };
    } catch (error) {
        console.error('Error in undoLastChangeAction:', error);
        return { success: false, error: 'Error al deshacer el cambio' };
    }
}

// Acción para limpiar todos los backups
export async function clearAllBackupsAction() {
    try {
        const result = await clearAllBackups();
        if (!result.success) {
            return { success: false, error: result.error };
        }
        return { success: true };
    } catch (error) {
        console.error('Error in clearAllBackupsAction:', error);
        return { success: false, error: 'Error al limpiar el historial' };
    }
}

// Acción para obtener la cantidad de backups disponibles
export async function getBackupsCountAction() {
    try {
        const result = await getBackupsCount();
        return { success: result.success, count: result.count };
    } catch (error) {
        console.error('Error in getBackupsCountAction:', error);
        return { success: false, count: 0, error: 'Error al obtener backups' };
    }
}

// Acción para buscar mayoristas desde puntos_venta
export async function searchMayoristasAction(searchTerm: string) {
    'use server';
    try {
        const result = await getPuntosVentaMongo({ search: searchTerm, activo: true, pageSize: 20 });
        if (!result.success) {
            return { success: false, error: result.message, puntosVenta: [] };
        }
        return { success: true, puntosVenta: result.data || [] };
    } catch (error) {
        return { success: false, error: 'Error al buscar puntos de venta', puntosVenta: [] };
    }
}

// Acción para calcular el precio automáticamente
export async function calculatePriceAction(
    items: Array<{
        name: string;
        fullName?: string;
        options: Array<{
            name: string;
            quantity: number;
        }>;
    }>,
    orderType: 'minorista' | 'mayorista',
    paymentMethod: string,
    deliveryDate?: string | Date
): Promise<{ success: boolean; error?: string; total?: number; itemPrices?: Array<{ name: string; weight: string; unitPrice: number; quantity: number; subtotal: number }> }> {
    'use server';
    try {
        const result = await calculatePrice(items, orderType, paymentMethod, deliveryDate);
        return result;
    } catch (error) {
        console.error('Error in calculatePriceAction:', error);
        return { success: false, error: 'Error al calcular el precio' };
    }
}

// Acción para obtener productos desde la colección prices
export async function getProductsFromPricesAction() {
    'use server';
    try {
        const result = await getProductsFromPrices();
        return {
            success: result.success,
            products: result.products,
            productsWithDetails: result.productsWithDetails,
            error: result.error,
        };
    } catch (error) {
        console.error('Error in getProductsFromPricesAction:', error);
        return {
            success: false,
            error: 'Error al obtener productos',
            products: [] as string[],
            productsWithDetails: [] as Array<{
                section: string;
                product: string;
                weight: string | null;
                formattedName: string;
            }>
        };
    }
}

// Acción para calcular precio usando valores exactos de la DB
export async function calculateExactPriceAction(
    formattedProduct: string,
    orderType: 'minorista' | 'mayorista',
    paymentMethod: string,
    deliveryDate?: string | Date
) {
    'use server';
    try {
        // Reusar la misma lógica de calculatePrice con un solo item
        const items = [{
            name: formattedProduct,
            fullName: formattedProduct,
            options: [{ name: '', quantity: 1 }],
        }];
        const result = await calculatePrice(items, orderType, paymentMethod, deliveryDate);
        if (result.success && result.itemPrices && result.itemPrices.length > 0) {
            return {
                success: true,
                unitPrice: result.itemPrices[0].unitPrice,
            };
        }
        return { success: false, error: result.error || 'No se encontró el precio' };
    } catch (error) {
        console.error('Error in calculateExactPriceAction:', error);
        return { success: false, error: 'Error al calcular el precio exacto' };
    }
}

// Acción para duplicar un pedido
export async function duplicateOrderAction(id: string): Promise<{ success: boolean; error?: string; order?: any; message?: string }> {
    'use server';
    try {
        const result = await duplicateOrder(id);
        if (!result.success) {
            return { success: false, error: result.error };
        }
        revalidatePath('/admin/table');
        revalidatePath('/admin/express');
        return { success: true, order: result.order, message: result.message };
    } catch (error) {
        console.error('Error in duplicateOrderAction:', error);
        return { success: false, error: 'Error al duplicar la orden' };
    }
}

// Acción para debug de productos RAW
export async function debugRawProductsAction() {
    'use server';
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
}
