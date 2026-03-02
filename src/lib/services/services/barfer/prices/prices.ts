import 'server-only';
import { apiClient } from '@/lib/api';

//types para prices

export type PriceType = 'EFECTIVO' | 'TRANSFERENCIA' | 'MAYORISTA';

export type Section = 'PERRO' | 'GATO' | 'OTROS' | 'RAW';

export interface Price {
    _id: string;
    section: Section;
    product: string;
    weight?: string;
    priceType: PriceType;
    price: number;
    isActive: boolean;
    effectiveDate: string;
    month: number;
    year: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePriceInput {
    section: Section;
    product: string;
    weight?: string;
    priceType: PriceType;
    price: number;
    isActive: boolean;
    effectiveDate: string;
    month: number;
    year: number;
}

export interface UpdatePriceInput {
    section?: Section;
    product?: string;
    weight?: string;
    priceType?: PriceType;
    price?: number;
    isActive?: boolean;
    effectiveDate?: string;
    month?: number;
    year?: number;
}

export interface PricesFilters {
    searchTerm?: string;
    section?: Section;
    product?: string;
    weight?: string;
    priceType?: PriceType;
    isActive?: boolean;
    effectiveDate?: string;
    month?: number;
    year?: number;
}


//apis

//apis

export async function getAllPrices(filters?: PricesFilters): Promise<{
    success: boolean;
    prices?: Price[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        let url = '/prices';
        if (filters && Object.keys(filters).length > 0) {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value.toString());
                }
            });
            url += `?${params.toString()}`;
        }
        const result = await apiClient.get(url);
        return {
            success: true,
            prices: result.prices || result || [],
            total: result.total || (result.prices || result || []).length
        };
    } catch (error) {
        return { success: false, message: 'Error al obtener los precios' };
    }
}

export async function createPrice(
    data: CreatePriceInput
): Promise<{
    success: boolean;
    price?: Price;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.post('/prices', data);
        return {
            success: true,
            price: result.price || result || null,
            message: result.message
        };
    } catch (error) {
        return { success: false, message: 'Error al crear el precio' };
    }
}

export async function getCurrentPrices(): Promise<{
    success: boolean;
    prices?: Price[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/prices/current');
        return {
            success: true,
            prices: result.prices || result || [],
            total: result.total || (result.prices || result || []).length
        };
    } catch (error) {
        return { success: false, message: 'Error al obtener los precios' };
    }
}

export async function getUniqueProducts(): Promise<{
    success: boolean;
    products?: any[]; // Change string[] to any[] as it now returns objects with priceTypes etc
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/prices/unique-products');
        return {
            success: true,
            products: result.products || result || [],
            total: result.total || (result.products || result || []).length
        };
    } catch (error) {
        return { success: false, message: 'Error al obtener los productos' };
    }
}

export async function getProductsForSelect(): Promise<{
    success: boolean;
    products?: string[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/prices/select');
        return {
            success: true,
            products: result.products || result || [],
            total: result.total || (result.products || result || []).length
        };
    } catch (error) {
        return { success: false, message: 'Error al obtener los productos' };
    }
}

export async function getPriceHistory(
    section: Section,
    product: string,
    weight: string,
    priceType: PriceType
): Promise<{
    success: boolean;
    prices?: Price[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get(`/prices/history?section=${section}&product=${product}&weight=${weight}&priceType=${priceType}`);
        return {
            success: true,
            prices: result.prices || result || [],
            total: result.total || (result.prices || result || []).length
        };
    } catch (error) {
        return { success: false, message: 'Error al obtener el historial de precios' };
    }
}

export async function getPriceStats(): Promise<{
    success: boolean;
    stats?: any;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/prices/stats');
        return {
            success: true,
            stats: result.stats || result || {},
            message: result.message
        };
    } catch (error) {
        return { success: false, message: 'Error al obtener las estadísticas de precios' };
    }
}

export async function updatePrice(
    id: string,
    data: UpdatePriceInput
): Promise<{
    success: boolean;
    price?: Price;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.patch(`/prices/${id}`, data);
        return {
            success: true,
            price: result.price || result || null,
            message: result.message
        };
    } catch (error) {
        return { success: false, message: 'Error al actualizar el precio' };
    }
}

export async function updateProductPrices(
    oldSection: Section,
    oldProduct: string,
    oldWeight: string | null,
    newData: { section?: Section; product?: string; weight?: string | null }
): Promise<{
    success: boolean;
    updatedCount?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.patch(`/prices/product?section=${oldSection}&product=${oldProduct}&weight=${oldWeight}`, newData);
        return {
            success: true,
            updatedCount: result.updatedCount,
            message: result.message
        };
    } catch (error) {
        return { success: false, message: 'Error al actualizar los productos' };
    }
}

export async function updateProductPriceTypes(
    section: Section,
    product: string,
    weight: string | null,
    oldPriceTypes: PriceType[],
    newPriceTypes: PriceType[]
): Promise<{
    success: boolean;
    addedCount?: number;
    removedCount?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.patch('/prices/product/price-types', {
            section,
            product,
            weight,
            oldPriceTypes,
            newPriceTypes
        });
        return {
            success: true,
            addedCount: result.addedCount,
            removedCount: result.removedCount,
            message: result.message
        };
    } catch (error) {
        return { success: false, message: 'Error al actualizar los tipos de precio del producto' };
    }
}

export async function deletePrice(
    id: string
): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.delete(`/prices/${id}`);
        return {
            success: true,
            message: result.message
        };
    } catch (error) {
        return { success: false, message: 'Error al eliminar el precio' };
    }
}

export async function deleteProductPrices(
    section: Section,
    product: string,
    weight: string | null
): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.delete(`/prices/product?section=${section}&product=${product}&weight=${weight}`);
        return {
            success: true,
            message: result.message
        };
    } catch (error) {
        return { success: false, message: 'Error al eliminar los precios del producto' };
    }
}

export async function initializePricesForPeriod(
    month: number,
    year: number
): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.post('/prices/initialize-period', { month, year });
        return {
            success: true,
            message: result.message
        };
    } catch (error) {
        return { success: false, message: 'Error al inicializar los precios para el período' };
    }
}
