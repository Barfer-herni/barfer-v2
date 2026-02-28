import 'server-only';
import { apiClient } from '@/lib/api';
import type {
    DetalleEnvio,
    CreateDetalleEnvioData,
    UpdateDetalleEnvioData,
} from '../../../types/barfer';

/**
 * Crear un nuevo detalle de envío
 */
export async function createDetalleEnvioMongo(
    data: CreateDetalleEnvioData
): Promise<{ success: boolean; detalleEnvio?: DetalleEnvio; message?: string }> {
    try {
        const result = await apiClient.post('/detalle-envio', data);
        return {
            success: true,
            detalleEnvio: result.detalleEnvio || result,
            message: 'Detalle de envío creado exitosamente',
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al crear el detalle de envío',
        };
    }
}

/**
 * Obtener todos los detalles de envío de un punto de envío
 */
export async function getDetalleEnvioByPuntoEnvioMongo(
    puntoEnvio: string
): Promise<{ success: boolean; detalleEnvio?: DetalleEnvio[]; message?: string }> {
    try {
        const result = await apiClient.get(`/detalle-envio/punto-envio/${encodeURIComponent(puntoEnvio)}`);
        return {
            success: true,
            detalleEnvio: result.detalleEnvio || result || [],
        };
    } catch (error) {
        return {
            success: false,
            detalleEnvio: [],
            message: 'Error al obtener los detalles de envío',
        };
    }
}

/**
 * Obtener un detalle de envío por ID
 */
export async function getDetalleEnvioByIdMongo(
    id: string
): Promise<{ success: boolean; detalleEnvio?: DetalleEnvio; message?: string }> {
    try {
        const result = await apiClient.get(`/detalle-envio/${id}`);
        return {
            success: true,
            detalleEnvio: result.detalleEnvio || result,
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener el detalle de envío',
        };
    }
}

/**
 * Actualizar un detalle de envío
 */
export async function updateDetalleEnvioMongo(
    id: string,
    data: UpdateDetalleEnvioData
): Promise<{ success: boolean; detalleEnvio?: DetalleEnvio; message?: string }> {
    try {
        const result = await apiClient.patch(`/detalle-envio/${id}`, data);
        return {
            success: true,
            detalleEnvio: result.detalleEnvio || result,
            message: 'Detalle de envío actualizado exitosamente',
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al actualizar el detalle de envío',
        };
    }
}

/**
 * Eliminar un detalle de envío
 */
export async function deleteDetalleEnvioMongo(
    id: string
): Promise<{ success: boolean; message?: string }> {
    try {
        await apiClient.delete(`/detalle-envio/${id}`);
        return {
            success: true,
            message: 'Detalle de envío eliminado exitosamente',
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al eliminar el detalle de envío',
        };
    }
}

import type { PuntoEnvio, CreatePuntoEnvioData, UpdatePuntoEnvioData } from '../../../types/barfer';

/**
 * Obtener todos los puntos de envío
 */
export async function getAllPuntosEnvioMongo(): Promise<{
    success: boolean;
    puntosEnvio?: PuntoEnvio[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/puntos-envio');
        return {
            success: true,
            puntosEnvio: result.puntosEnvio || result || [],
            total: result.total || (result.puntosEnvio || result || []).length,
        };
    } catch (error) {
        return {
            success: false,
            puntosEnvio: [],
            total: 0,
            error: 'GET_ALL_PUNTOS_ENVIO_MONGO_ERROR',
        };
    }
}

/**
 * Obtener un punto de envío por Nombre
 */
export async function getPuntoEnvioByNameMongo(nombre: string): Promise<{
    success: boolean;
    puntoEnvio?: PuntoEnvio;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get(`/puntos-envio/by-name/${encodeURIComponent(nombre)}`);
        return {
            success: true,
            puntoEnvio: result.puntoEnvio || result,
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener el punto de envío',
            error: 'GET_PUNTO_ENVIO_BY_NAME_MONGO_ERROR',
        };
    }
}

/**
 * Obtener un punto de envío por ID
 */
export async function getPuntoEnvioByIdMongo(id: string): Promise<{
    success: boolean;
    puntoEnvio?: PuntoEnvio;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get(`/puntos-envio/${id}`);
        return {
            success: true,
            puntoEnvio: result.puntoEnvio || result,
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener el punto de envío',
            error: 'GET_PUNTO_ENVIO_BY_ID_MONGO_ERROR',
        };
    }
}

/**
 * Crear un nuevo punto de envío
 */
export async function createPuntoEnvioMongo(data: CreatePuntoEnvioData): Promise<{
    success: boolean;
    puntoEnvio?: PuntoEnvio;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.post('/puntos-envio', data);
        return {
            success: true,
            puntoEnvio: result.puntoEnvio || result,
            message: 'Punto de envío creado exitosamente',
        };
    } catch (error: any) {
        const errorMessage = error?.message || '';
        if (errorMessage.includes('already exists') || errorMessage.includes('ya existe')) {
            return {
                success: false,
                message: 'Ya existe un punto de envío con ese nombre',
                error: 'PUNTO_ENVIO_ALREADY_EXISTS',
            };
        }
        return {
            success: false,
            message: 'Error al crear el punto de envío',
            error: 'CREATE_PUNTO_ENVIO_MONGO_ERROR',
        };
    }
}

/**
 * Actualizar un punto de envío existente
 */
export async function updatePuntoEnvioMongo(
    id: string,
    data: UpdatePuntoEnvioData
): Promise<{
    success: boolean;
    puntoEnvio?: PuntoEnvio;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.patch(`/puntos-envio/${id}`, data);
        return {
            success: true,
            puntoEnvio: result.puntoEnvio || result,
            message: 'Punto de envío actualizado exitosamente',
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al actualizar el punto de envío',
            error: 'UPDATE_PUNTO_ENVIO_MONGO_ERROR',
        };
    }
}

/**
 * Eliminar un punto de envío
 */
export async function deletePuntoEnvioMongo(id: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        await apiClient.delete(`/puntos-envio/${id}`);
        return {
            success: true,
            message: 'Punto de envío eliminado exitosamente',
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al eliminar el punto de envío',
            error: 'DELETE_PUNTO_ENVIO_MONGO_ERROR',
        };
    }
}
