'use server'

import 'server-only';
import { revalidatePath } from 'next/cache';
import { getCollection, ObjectId } from '@/lib/database';
import { apiClient } from '@/lib/api';
import type {
    Price,
    PriceSection,
    PriceType,
    CreatePriceData,
    UpdatePriceData,
    PriceHistoryQuery,
    PriceHistory,
    PriceStats
} from '../../types/barfer';

// Interfaz para productos del template
interface TemplateProduct {
    _id?: string;
    section: PriceSection;
    product: string;
    weight?: string;
    priceTypes: PriceType[];
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Convierte un documento de MongoDB a un objeto Price serializable
 */
function transformMongoPrice(mongoDoc: any): Price {
    return {
        _id: String(mongoDoc._id),
        section: mongoDoc.section,
        product: mongoDoc.product,
        weight: mongoDoc.weight,
        priceType: mongoDoc.priceType,
        price: mongoDoc.price,
        isActive: mongoDoc.isActive,
        effectiveDate: mongoDoc.effectiveDate,
        month: mongoDoc.month,
        year: mongoDoc.year,
        createdAt: mongoDoc.createdAt,
        updatedAt: mongoDoc.updatedAt
    };
}

/**
 * Obtener todos los precios activos
 */
export async function getAllPrices(): Promise<{
    success: boolean;
    prices: Price[];
    total: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/prices');
        const prices = result.prices || result || [];
        return {
            success: true,
            prices,
            total: prices.length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener los precios',
            error: 'GET_PRICES_ERROR',
            prices: [],
            total: 0
        };
    }
}

/**
 * Obtener precios por filtros específicos (incluye historial)
 */
export async function getPrices(query: PriceHistoryQuery): Promise<{
    success: boolean;
    prices: Price[];
    total: number;
    message?: string;
    error?: string;
}> {
    try {
        const collection = await getCollection('prices');

        // Construir el filtro
        const filter: any = {};

        if (query.section) filter.section = query.section;
        if (query.product) filter.product = query.product;
        if (query.weight !== undefined) filter.weight = query.weight;
        if (query.priceType) filter.priceType = query.priceType;
        if (query.isActive !== undefined) filter.isActive = query.isActive;
        if (query.month) filter.month = query.month;
        if (query.year) filter.year = query.year;
        if (query.effectiveDate) filter.effectiveDate = query.effectiveDate;

        const mongoPrices = await collection.find(filter, {
            sort: {
                section: 1,
                product: 1,
                weight: 1,
                priceType: 1,
                effectiveDate: -1
            }
        }).toArray();

        const prices = mongoPrices.map(transformMongoPrice);

        return {
            success: true,
            prices,
            total: prices.length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener los precios filtrados',
            error: 'GET_FILTERED_PRICES_ERROR',
            prices: [],
            total: 0
        };
    }
}

/**
 * Obtener historial de precios para un producto especifico
 */
export async function getPriceHistory(
    section: PriceSection,
    product: string,
    weight: string | undefined,
    priceType: PriceType
): Promise<{
    success: boolean;
    history?: PriceHistory;
    message?: string;
    error?: string;
}> {
    try {
        const params = new URLSearchParams();
        params.set('section', section);
        params.set('product', product);
        if (weight !== undefined) params.set('weight', weight);
        params.set('priceType', priceType);

        const result = await apiClient.get(`/prices/history?${params.toString()}`);
        return {
            success: true,
            history: result.history || result
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener el historial de precios',
            error: 'GET_PRICE_HISTORY_ERROR'
        };
    }
}

/**
 * Crear un nuevo precio (con fecha efectiva)
 */
export async function createPrice(data: CreatePriceData): Promise<{
    success: boolean;
    price?: Price;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.post('/prices', data);

        revalidatePath('/admin/prices');

        return {
            success: true,
            price: result.price || result,
            message: 'Precio creado exitosamente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al crear el precio',
            error: 'CREATE_PRICE_ERROR'
        };
    }
}

/**
 * Actualizar un precio existente
 */
export async function updatePrice(priceId: string, data: UpdatePriceData): Promise<{
    success: boolean;
    price?: Price;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.patch(`/prices/${priceId}`, data);

        revalidatePath('/admin/prices');

        return {
            success: true,
            price: result.price || result,
            message: 'Precio actualizado exitosamente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al actualizar el precio',
            error: 'UPDATE_PRICE_ERROR'
        };
    }
}

/**
 * Eliminar un precio por ID
 */
export async function deletePrice(priceId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        await apiClient.delete(`/prices/${priceId}`);

        revalidatePath('/admin/prices');

        return {
            success: true,
            message: 'Precio eliminado exitosamente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al eliminar el precio',
            error: 'DELETE_PRICE_ERROR'
        };
    }
}

/**
 * Obtener todos los productos unicos con sus metadatos
 */
export async function getAllUniqueProducts(): Promise<{
    success: boolean;
    products: Array<{
        section: PriceSection;
        product: string;
        weight: string | null;
        priceTypes: PriceType[];
        totalPrices: number;
        isActive: boolean;
    }>;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/prices/unique-products');
        return {
            success: true,
            products: result.products || result || []
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener los productos unicos',
            error: 'GET_UNIQUE_PRODUCTS_ERROR',
            products: []
        };
    }
}

/**
 * Obtener productos unicos formateados para select de items
 */
export async function getProductsForSelect(): Promise<{
    success: boolean;
    products: string[];
    productsWithDetails: Array<{
        section: PriceSection;
        product: string;
        weight: string | null;
        formattedName: string;
    }>;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/prices/select');
        return {
            success: true,
            products: result.products || [],
            productsWithDetails: result.productsWithDetails || []
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener los productos para el select',
            error: 'GET_PRODUCTS_FOR_SELECT_ERROR',
            products: [],
            productsWithDetails: []
        };
    }
}

/**
 * Eliminar todos los precios de un producto especifico
 */
export async function deleteProductPrices(section: PriceSection, product: string, weight: string | null): Promise<{
    success: boolean;
    deletedCount: number;
    message?: string;
    error?: string;
}> {
    try {
        const params = new URLSearchParams();
        params.set('section', section);
        params.set('product', product);
        if (weight !== null) params.set('weight', weight);

        const result = await apiClient.delete(`/prices/product?${params.toString()}`);

        revalidatePath('/admin/prices');

        return {
            success: true,
            deletedCount: result.deletedCount || 0,
            message: result.message || `Precios del producto ${product} eliminados`
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al eliminar los precios del producto',
            error: 'DELETE_PRODUCT_PRICES_ERROR',
            deletedCount: 0
        };
    }
}

/**
 * Actualizar todos los precios de un producto específico
 */
export async function updateProductPrices(
    oldSection: PriceSection,
    oldProduct: string,
    oldWeight: string | null,
    newData: {
        section?: PriceSection;
        product?: string;
        weight?: string | null;
    }
): Promise<{
    success: boolean;
    updatedCount: number;
    message?: string;
    error?: string;
}> {
    try {
        const collection = await getCollection('prices');

        const filter: any = {
            section: oldSection,
            product: oldProduct
        };

        if (oldWeight !== null) {
            filter.weight = oldWeight;
        } else {
            // Para productos sin peso específico, buscar documentos donde weight es null o no existe
            filter.$or = [
                { weight: null },
                { weight: { $exists: false } }
            ];
        }


        const updateData: any = {
            updatedAt: new Date().toISOString()
        };

        if (newData.section) updateData.section = newData.section;
        if (newData.product) updateData.product = newData.product;

        // Solo agregar weight si no es null
        if (newData.weight !== undefined && newData.weight !== null) {
            updateData.weight = newData.weight;
        }

        // Preparar la operación de actualización
        let updateOperation: any = { $set: updateData };

        // Si el peso es null, necesitamos usar $unset para eliminar el campo
        if (newData.weight !== undefined && newData.weight === null) {
            updateOperation = {
                $set: updateData,
                $unset: { weight: "" }
            };
        }


        const result = await collection.updateMany(filter, updateOperation);


        revalidatePath('/admin/prices');

        return {
            success: true,
            updatedCount: result.modifiedCount,
            message: `Se actualizaron ${result.modifiedCount} precios del producto`
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al actualizar los precios del producto',
            error: 'UPDATE_PRODUCT_PRICES_ERROR',
            updatedCount: 0
        };
    }
}

/**
 * Actualizar tipos de precio de un producto
 */
export async function updateProductPriceTypes(
    section: PriceSection,
    product: string,
    weight: string | null,
    oldPriceTypes: PriceType[],
    newPriceTypes: PriceType[]
): Promise<{
    success: boolean;
    addedCount: number;
    removedCount: number;
    message?: string;
    error?: string;
}> {
    try {
        const collection = await getCollection('prices');

        const filter: any = {
            section,
            product
        };

        if (weight !== null) {
            filter.weight = weight;
        } else {
            filter.$or = [
                { weight: null },
                { weight: { $exists: false } }
            ];
        }

        // Tipos de precio a agregar
        const typesToAdd = newPriceTypes.filter(type => !oldPriceTypes.includes(type));
        // Tipos de precio a quitar
        const typesToRemove = oldPriceTypes.filter(type => !newPriceTypes.includes(type));

        let addedCount = 0;
        let removedCount = 0;

        // Eliminar precios de tipos que ya no se necesitan
        if (typesToRemove.length > 0) {
            const removeFilter = { ...filter, priceType: { $in: typesToRemove } };
            const removeResult = await collection.deleteMany(removeFilter);
            removedCount = removeResult.deletedCount;
        }

        // Agregar precios para tipos nuevos (con precio 0)
        if (typesToAdd.length > 0) {
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();

            const newPrices = typesToAdd.map(priceType => ({
                section,
                product,
                weight: weight || null,
                priceType,
                price: 0,
                isActive: true,
                effectiveDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`,
                month: currentMonth,
                year: currentYear,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }));

            const insertResult = await collection.insertMany(newPrices);
            addedCount = insertResult.insertedCount;
        }

        revalidatePath('/admin/prices');

        // Actualizar el template con los nuevos tipos de precio
        await updateTemplateProductPriceTypes(section, product, weight || undefined, newPriceTypes);

        return {
            success: true,
            addedCount,
            removedCount,
            message: `Se agregaron ${addedCount} tipos de precio y se eliminaron ${removedCount} tipos de precio`
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al actualizar los tipos de precio del producto',
            error: 'UPDATE_PRODUCT_PRICE_TYPES_ERROR',
            addedCount: 0,
            removedCount: 0
        };
    }
}

/**
 * Obtener precios actuales (ultimo precio activo por producto)
 */
export async function getCurrentPrices(): Promise<{
    success: boolean;
    prices: Price[];
    total: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/prices/current');
        const prices = result.prices || result || [];
        return {
            success: true,
            prices,
            total: prices.length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener los precios actuales',
            error: 'GET_CURRENT_PRICES_ERROR',
            prices: [],
            total: 0
        };
    }
}

/**
 * Obtener estadisticas de precios
 */
export async function getPriceStats(): Promise<{
    success: boolean;
    stats?: PriceStats;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/prices/stats');
        return {
            success: true,
            stats: result.stats || result
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener las estadisticas de precios',
            error: 'GET_PRICE_STATS_ERROR'
        };
    }
}

/**
 * Obtener template de productos desde la base de datos
 */
export async function getProductTemplate(): Promise<{
    success: boolean;
    template: TemplateProduct[];
    message?: string;
    error?: string;
}> {
    try {
        const collection = await getCollection('template_prices_products');

        const templates = await collection.find({}).toArray();

        const templateProducts: TemplateProduct[] = templates.map((doc: any) => ({
            _id: String(doc._id),
            section: doc.section,
            product: doc.product,
            weight: doc.weight,
            priceTypes: doc.priceTypes,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        }));

        return {
            success: true,
            template: templateProducts
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener el template de productos',
            error: 'GET_PRODUCT_TEMPLATE_ERROR',
            template: []
        };
    }
}

/**
 * Agregar producto al template
 */
export async function addProductToTemplate(
    section: PriceSection,
    product: string,
    weight: string | undefined,
    priceTypes: PriceType[]
): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        const collection = await getCollection('template_prices_products');

        // Verificar si ya existe
        const existing = await collection.findOne({
            section,
            product,
            weight: weight || null
        });

        if (existing) {
            return {
                success: true,
                message: 'El producto ya existe en el template'
            };
        }

        const now = new Date().toISOString();
        const newTemplate: any = {
            section,
            product,
            weight: weight || null,
            priceTypes,
            createdAt: now,
            updatedAt: now
        };

        await collection.insertOne(newTemplate);

        return {
            success: true,
            message: 'Producto agregado al template exitosamente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al agregar producto al template',
            error: 'ADD_PRODUCT_TO_TEMPLATE_ERROR'
        };
    }
}

/**
 * Actualizar tipos de precio en el template
 */
export async function updateTemplateProductPriceTypes(
    section: PriceSection,
    product: string,
    weight: string | undefined,
    priceTypes: PriceType[]
): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        const collection = await getCollection('template_prices_products');

        const filter: any = {
            section,
            product
        };

        if (weight !== undefined && weight !== null) {
            filter.weight = weight;
        } else {
            filter.weight = null;
        }

        const result = await collection.updateOne(
            filter,
            {
                $set: {
                    priceTypes,
                    updatedAt: new Date().toISOString()
                }
            }
        );

        if (result.matchedCount === 0) {
            // Si no existe, crearlo
            return await addProductToTemplate(section, product, weight, priceTypes);
        }

        return {
            success: true,
            message: 'Tipos de precio actualizados en el template'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al actualizar tipos de precio en el template',
            error: 'UPDATE_TEMPLATE_PRICE_TYPES_ERROR'
        };
    }
}

/**
 * Eliminar producto del template
 */
export async function removeProductFromTemplate(
    section: PriceSection,
    product: string,
    weight: string | undefined
): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        const collection = await getCollection('template_prices_products');

        const filter: any = {
            section,
            product
        };

        if (weight !== undefined && weight !== null) {
            filter.weight = weight;
        } else {
            filter.weight = null;
        }

        const result = await collection.deleteOne(filter);

        return {
            success: true,
            message: `Producto eliminado del template (${result.deletedCount} documentos)`
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al eliminar producto del template',
            error: 'REMOVE_PRODUCT_FROM_TEMPLATE_ERROR'
        };
    }
}

/**
 * Inicializar precios por defecto para un periodo especifico
 */
export async function initializePricesForPeriod(month: number, year: number): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    created?: number;
}> {
    try {
        const result = await apiClient.post('/prices/initialize-period', { month, year });

        revalidatePath('/admin/prices');

        return {
            success: true,
            message: result.message || `Precios inicializados para ${month}/${year}`,
            created: result.created || 0
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al inicializar precios para el periodo',
            error: 'INITIALIZE_PERIOD_ERROR'
        };
    }
}

/**
 * Inicializar precios por defecto de Barfer en MongoDB
 */
export async function initializeBarferPrices(): Promise<{
    success: boolean;
    message?: string;
    stats?: { created: number; skipped: number };
    error?: string;
}> {
    try {
        const collection = await getCollection('prices');

        const defaultPrices = [
            // PERRO - POLLO
            { section: 'PERRO' as PriceSection, product: 'POLLO', weight: '5KG', priceType: 'EFECTIVO' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'POLLO', weight: '5KG', priceType: 'TRANSFERENCIA' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'POLLO', weight: '5KG', priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'POLLO', weight: '10KG', priceType: 'EFECTIVO' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'POLLO', weight: '10KG', priceType: 'TRANSFERENCIA' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'POLLO', weight: '10KG', priceType: 'MAYORISTA' as PriceType, price: 0 },

            // PERRO - VACA
            { section: 'PERRO' as PriceSection, product: 'VACA', weight: '5KG', priceType: 'EFECTIVO' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'VACA', weight: '5KG', priceType: 'TRANSFERENCIA' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'VACA', weight: '5KG', priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'VACA', weight: '10KG', priceType: 'EFECTIVO' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'VACA', weight: '10KG', priceType: 'TRANSFERENCIA' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'VACA', weight: '10KG', priceType: 'MAYORISTA' as PriceType, price: 0 },

            // PERRO - CERDO
            { section: 'PERRO' as PriceSection, product: 'CERDO', weight: '5KG', priceType: 'EFECTIVO' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'CERDO', weight: '5KG', priceType: 'TRANSFERENCIA' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'CERDO', weight: '5KG', priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'CERDO', weight: '10KG', priceType: 'EFECTIVO' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'CERDO', weight: '10KG', priceType: 'TRANSFERENCIA' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'CERDO', weight: '10KG', priceType: 'MAYORISTA' as PriceType, price: 0 },

            // PERRO - CORDERO
            { section: 'PERRO' as PriceSection, product: 'CORDERO', weight: '5KG', priceType: 'EFECTIVO' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'CORDERO', weight: '5KG', priceType: 'TRANSFERENCIA' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'CORDERO', weight: '5KG', priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'CORDERO', weight: '10KG', priceType: 'EFECTIVO' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'CORDERO', weight: '10KG', priceType: 'TRANSFERENCIA' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'CORDERO', weight: '10KG', priceType: 'MAYORISTA' as PriceType, price: 0 },

            // PERRO - BIG DOG
            { section: 'PERRO' as PriceSection, product: 'BIG DOG VACA', weight: '15KG', priceType: 'EFECTIVO' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'BIG DOG VACA', weight: '15KG', priceType: 'TRANSFERENCIA' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'BIG DOG VACA', weight: '15KG', priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'BIG DOG POLLO', weight: '15KG', priceType: 'EFECTIVO' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'BIG DOG POLLO', weight: '15KG', priceType: 'TRANSFERENCIA' as PriceType, price: 0 },
            { section: 'PERRO' as PriceSection, product: 'BIG DOG POLLO', weight: '15KG', priceType: 'MAYORISTA' as PriceType, price: 0 },

            // GATO
            { section: 'GATO' as PriceSection, product: 'POLLO', weight: '5KG', priceType: 'EFECTIVO' as PriceType, price: 0 },
            { section: 'GATO' as PriceSection, product: 'POLLO', weight: '5KG', priceType: 'TRANSFERENCIA' as PriceType, price: 0 },
            { section: 'GATO' as PriceSection, product: 'POLLO', weight: '5KG', priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'GATO' as PriceSection, product: 'VACA', weight: '5KG', priceType: 'EFECTIVO' as PriceType, price: 0 },
            { section: 'GATO' as PriceSection, product: 'VACA', weight: '5KG', priceType: 'TRANSFERENCIA' as PriceType, price: 0 },
            { section: 'GATO' as PriceSection, product: 'VACA', weight: '5KG', priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'GATO' as PriceSection, product: 'CORDERO', weight: '5KG', priceType: 'EFECTIVO' as PriceType, price: 0 },
            { section: 'GATO' as PriceSection, product: 'CORDERO', weight: '5KG', priceType: 'TRANSFERENCIA' as PriceType, price: 0 },
            { section: 'GATO' as PriceSection, product: 'CORDERO', weight: '5KG', priceType: 'MAYORISTA' as PriceType, price: 0 },

            // OTROS
            { section: 'OTROS' as PriceSection, product: 'HUESOS CARNOSOS 5KG', weight: undefined, priceType: 'EFECTIVO' as PriceType, price: 0 },
            { section: 'OTROS' as PriceSection, product: 'HUESOS CARNOSOS 5KG', weight: undefined, priceType: 'TRANSFERENCIA' as PriceType, price: 0 },
            { section: 'OTROS' as PriceSection, product: 'HUESOS CARNOSOS 5KG', weight: undefined, priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'OTROS' as PriceSection, product: 'BOX DE COMPLEMENTOS', weight: undefined, priceType: 'EFECTIVO' as PriceType, price: 0 },
            { section: 'OTROS' as PriceSection, product: 'BOX DE COMPLEMENTOS', weight: undefined, priceType: 'TRANSFERENCIA' as PriceType, price: 0 },
            { section: 'OTROS' as PriceSection, product: 'BOX DE COMPLEMENTOS', weight: undefined, priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'OTROS' as PriceSection, product: 'CORNALITOS', weight: '200GRS', priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'OTROS' as PriceSection, product: 'GARRAS', weight: undefined, priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'OTROS' as PriceSection, product: 'CALDO DE HUESOS', weight: undefined, priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'OTROS' as PriceSection, product: 'HUESOS RECREATIVOS', weight: undefined, priceType: 'MAYORISTA' as PriceType, price: 0 },

            // RAW - Productos solo para mayorista
            { section: 'RAW' as PriceSection, product: 'HIGADO 100GRS', weight: undefined, priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'RAW' as PriceSection, product: 'HIGADO 40GRS', weight: undefined, priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'RAW' as PriceSection, product: 'POLLO 100GRS', weight: undefined, priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'RAW' as PriceSection, product: 'POLLO 40GRS', weight: undefined, priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'RAW' as PriceSection, product: 'CORNALITOS 30GRS', weight: undefined, priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'RAW' as PriceSection, product: 'TRAQUEA X1', weight: undefined, priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'RAW' as PriceSection, product: 'TRAQUEA X2', weight: undefined, priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'RAW' as PriceSection, product: 'OREJA X1', weight: undefined, priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'RAW' as PriceSection, product: 'OREJA X50', weight: undefined, priceType: 'MAYORISTA' as PriceType, price: 0 },
            { section: 'RAW' as PriceSection, product: 'OREJAS X100', weight: undefined, priceType: 'MAYORISTA' as PriceType, price: 0 },
        ];

        let created = 0;
        let skipped = 0;
        const now = new Date();
        const effectiveDate = now.toISOString().split('T')[0];
        const nowIso = now.toISOString();

        for (const priceData of defaultPrices) {
            try {
                // Verificar si ya existe un precio activo para esta combinación
                const existing = await collection.findOne({
                    section: priceData.section,
                    product: priceData.product,
                    weight: priceData.weight,
                    priceType: priceData.priceType,
                    isActive: true
                });

                if (!existing) {
                    const newPrice: Omit<Price, '_id'> = {
                        section: priceData.section,
                        product: priceData.product,
                        weight: priceData.weight,
                        priceType: priceData.priceType,
                        price: priceData.price,
                        isActive: true,
                        effectiveDate,
                        month: now.getMonth() + 1,
                        year: now.getFullYear(),
                        createdAt: nowIso,
                        updatedAt: nowIso
                    };

                    await collection.insertOne(newPrice as any);
                    created++;
                } else {
                    skipped++;
                }
            } catch (error) {
                skipped++;
            }
        }

        revalidatePath('/admin/prices');

        return {
            success: true,
            message: `Inicialización completada: ${created} precios creados, ${skipped} precios omitidos (ya existían)`,
            stats: { created, skipped }
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al inicializar los precios por defecto',
            error: 'INITIALIZE_BARFER_PRICES_ERROR'
        };
    }
} 