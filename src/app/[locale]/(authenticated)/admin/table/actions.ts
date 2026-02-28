'use server';
import { createOrder, deleteOrder } from '@/lib/services/services/barfer';
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

        return { success: false, error: 'Servicio no disponible - migrando a backend API', order: null };
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
        console.error('Error in createOrderAction:', error);
        return { success: false, error: 'Error al crear la orden' };
    }
}

export async function migrateClientTypeAction() {
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
}

export async function updateOrdersStatusBulkAction(ids: string[], status: string) {
    'use server';
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
}

// Acción para deshacer el último cambio
export async function undoLastChangeAction() {
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
}

// Acción para limpiar todos los backups
export async function clearAllBackupsAction() {
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
}

// Acción para obtener la cantidad de backups disponibles
export async function getBackupsCountAction() {
    return { success: false, count: 0, error: 'Servicio no disponible - migrando a backend API' };
}

// Acción para buscar mayoristas desde puntos_venta
export async function searchMayoristasAction(searchTerm: string) {
    'use server';
    return { success: false, error: 'Servicio no disponible - migrando a backend API', puntosVenta: [] };
}

// Acción para calcular el precio automáticamente
export async function calculatePriceAction(
    items: Array<{
        name: string;
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
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
}

// Acción para obtener productos desde la colección prices
export async function getProductsFromPricesAction() {
    'use server';
    return {
        success: false,
        error: 'Servicio no disponible - migrando a backend API',
        products: [] as string[],
        productsWithDetails: [] as Array<{
            section: string;
            product: string;
            weight: string | null;
            formattedName: string;
        }>
    };
}

// Acción para calcular precio usando valores exactos de la DB
export async function calculateExactPriceAction(
    formattedProduct: string,
    orderType: 'minorista' | 'mayorista',
    paymentMethod: string,
    deliveryDate?: string | Date
) {
    'use server';
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
}

// Acción para duplicar un pedido
export async function duplicateOrderAction(id: string): Promise<{ success: boolean; error?: string; order?: any; message?: string }> {
    'use server';
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
}

// Acción para debug de productos RAW
export async function debugRawProductsAction() {
    'use server';
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
}
