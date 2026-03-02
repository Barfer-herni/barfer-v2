'use server'

import * as pricesService from '@/lib/services/services/barfer/prices/prices';
import { Section, PriceType, CreatePriceInput, UpdatePriceInput } from '@/lib/services/services/barfer/prices/prices';

export async function updatePriceAction(priceId: string, newPrice: number) {
    try {
        return await pricesService.updatePrice(priceId, { price: newPrice });
    } catch (error) {
        return { success: false, message: 'Error al actualizar el precio' };
    }
}

export async function initializeDefaultPricesAction() {
    // This seems to be handled by initializePricesForPeriodAction now
    return { success: false, message: 'Función obsoleta. Use initializePricesForPeriodAction.' };
}

export async function getAllPricesAction() {
    try {
        return await pricesService.getAllPrices();
    } catch (error) {
        return { success: false, message: 'Error al obtener los precios', prices: [], total: 0 };
    }
}

export async function getPricesByMonthAction(month: number, year: number) {
    try {
        return await pricesService.getAllPrices({ month, year });
    } catch (error) {
        return { success: false, message: 'Error al obtener los precios por mes', prices: [], total: 0 };
    }
}

export async function initializePricesForPeriodAction(month: number, year: number) {
    try {
        return await pricesService.initializePricesForPeriod(month, year);
    } catch (error) {
        return { success: false, message: 'Error al inicializar los precios para el período' };
    }
}

// These functions seem to be related to a different entity or legacy, 
// leaving them as placeholders return false if not explicitly used by the new price flow
export async function getAllProductosGestorAction() {
    return { success: false, message: 'Servicio no disponible', productos: [], total: 0 };
}

export async function createProductoGestorAction(data: any) {
    return { success: false, message: 'Servicio no disponible' };
}

export async function updateProductoGestorAction(productoId: string, data: any) {
    return { success: false, message: 'Servicio no disponible' };
}

export async function deleteProductoGestorAction(productoId: string) {
    return { success: false, message: 'Servicio no disponible' };
}

export async function initializeProductosGestorAction() {
    return { success: false, message: 'Servicio no disponible' };
}

export async function createPriceAction(data: CreatePriceInput) {
    try {
        return await pricesService.createPrice(data);
    } catch (error) {
        return { success: false, message: 'Error al crear el precio' };
    }
}

export async function deletePriceAction(priceId: string) {
    try {
        return await pricesService.deletePrice(priceId);
    } catch (error) {
        return { success: false, message: 'Error al eliminar el precio' };
    }
}

export async function getAllUniqueProductsAction() {
    try {
        return await pricesService.getUniqueProducts();
    } catch (error) {
        return { success: false, message: 'Error al obtener los productos únicos', products: [] };
    }
}

export async function deleteProductAction(section: string, product: string, weight: string | null) {
    try {
        const result = await pricesService.deleteProductPrices(section as Section, product, weight);
        return { ...result, deletedCount: (result as any).deletedCount || 0 };
    } catch (error) {
        return { success: false, message: 'Error al eliminar el producto', deletedCount: 0 };
    }
}

export async function updateProductAction(
    oldSection: string,
    oldProduct: string,
    oldWeight: string | null,
    newData: {
        section?: string;
        product?: string;
        weight?: string | null;
    }
) {
    try {
        return await pricesService.updateProductPrices(
            oldSection as Section,
            oldProduct,
            oldWeight,
            newData as any
        );
    } catch (error) {
        return { success: false, message: 'Error al actualizar el producto', updatedCount: 0 };
    }
}

export async function updateProductPriceTypesAction(
    section: string,
    product: string,
    weight: string | null,
    oldPriceTypes: string[],
    newPriceTypes: string[]
) {
    try {
        return await pricesService.updateProductPriceTypes(
            section as Section,
            product,
            weight,
            oldPriceTypes as PriceType[],
            newPriceTypes as PriceType[]
        );
    } catch (error) {
        return { success: false, message: 'Error al actualizar los tipos de precio', addedCount: 0, removedCount: 0 };
    }
}

export async function normalizePricesCapitalizationAction() {
    return { success: false, message: 'Funcionalidad no implementada en el nuevo backend', updated: 0 };
}

export async function removeDuplicatePricesAction() {
    return { success: false, message: 'Funcionalidad no implementada en el nuevo backend', removed: 0 };
}
