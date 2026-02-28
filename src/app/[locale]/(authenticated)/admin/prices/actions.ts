'use server'

export async function updatePriceAction(priceId: string, newPrice: number) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API' };
}

export async function initializeDefaultPricesAction() {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API' };
}

export async function getAllPricesAction() {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API', prices: [], total: 0 };
}

export async function getPricesByMonthAction(month: number, year: number) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API', prices: [], total: 0 };
}

export async function initializePricesForPeriodAction(month: number, year: number) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API' };
}

export async function getAllProductosGestorAction() {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API', productos: [], total: 0 };
}

export async function createProductoGestorAction(data: any) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API' };
}

export async function updateProductoGestorAction(productoId: string, data: any) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API' };
}

export async function deleteProductoGestorAction(productoId: string) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API' };
}

export async function initializeProductosGestorAction() {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API' };
}

export async function createPriceAction(data: any) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API' };
}

export async function deletePriceAction(priceId: string) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API' };
}

export async function getAllUniqueProductsAction() {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API', products: [] };
}

export async function deleteProductAction(section: string, product: string, weight: string | null) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API', deletedCount: 0 };
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
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API', updatedCount: 0 };
}

export async function updateProductPriceTypesAction(
    section: string,
    product: string,
    weight: string | null,
    oldPriceTypes: string[],
    newPriceTypes: string[]
) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API', addedCount: 0, removedCount: 0 };
}

export async function normalizePricesCapitalizationAction() {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API', updated: 0 };
}

export async function removeDuplicatePricesAction() {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', message: 'Servicio no disponible - migrando a backend API', removed: 0 };
}
