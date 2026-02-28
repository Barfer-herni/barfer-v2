import 'server-only';
import { apiClient } from '@/lib/api';
import type { Stock, CreateStockData, UpdateStockData } from '../../../types/barfer';

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
