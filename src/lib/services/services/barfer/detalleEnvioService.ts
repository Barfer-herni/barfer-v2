import 'server-only';
import { apiClient } from '@/lib/api';
import type {
    DetalleEnvio,
    CreateDetalleEnvioData,
    UpdateDetalleEnvioData,
} from '../../types/barfer';

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
