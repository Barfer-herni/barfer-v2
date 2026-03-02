import 'server-only';
import { apiClient } from '@/lib/api';
import type {
    PuntoVenta,
    CreatePuntoVentaData,
    UpdatePuntoVentaData,
} from '../../../types/barfer';


export async function getPuntosVentaMongo(query: any = {}): Promise<{
    success: boolean;
    data?: PuntoVenta[];
    total?: number;
    pageCount?: number;
    message?: string;
}> {
    try {
        const params = new URLSearchParams();
        if (query.pageIndex !== undefined) params.set('pageIndex', String(query.pageIndex));
        if (query.pageSize !== undefined) params.set('pageSize', String(query.pageSize));
        if (query.search) params.set('search', query.search);
        if (query.zona) params.set('zona', query.zona);
        if (query.activo !== undefined) params.set('activo', String(query.activo));
        if (query.sortBy) params.set('sortBy', query.sortBy);
        if (query.sortDesc !== undefined) params.set('sortDesc', String(query.sortDesc));

        const queryString = params.toString();
        const result = await apiClient.get(`/puntos-venta${queryString ? `?${queryString}` : ''}`);

        return {
            success: true,
            data: result.data || [],
            total: result.total || 0,
            pageCount: result.pageCount || 0,
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener los puntos de venta',
            data: [],
            total: 0,
            pageCount: 0,
        };
    }
}


export async function getPuntoVentaByIdMongo(id: string): Promise<{
    success: boolean;
    puntoVenta?: PuntoVenta;
    message?: string;
}> {
    try {
        const result = await apiClient.get(`/puntos-venta/${id}`);
        return {
            success: true,
            puntoVenta: result.puntoVenta || result,
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener el punto de venta',
        };
    }
}


export async function createPuntoVentaMongo(data: CreatePuntoVentaData): Promise<{
    success: boolean;
    puntoVenta?: PuntoVenta;
    message?: string;
}> {
    try {
        const result = await apiClient.post('/puntos-venta/create', data);
        return {
            success: true,
            puntoVenta: result.puntoVenta || result,
            message: 'Punto de venta creado exitosamente',
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Error al crear el punto de venta',
        };
    }
}

/**
 * Actualizar un punto de venta existente
 */
export async function updatePuntoVentaMongo(
    id: string,
    data: UpdatePuntoVentaData
): Promise<{
    success: boolean;
    puntoVenta?: PuntoVenta;
    message?: string;
}> {
    try {
        const cleanData = { ...data };

        if (cleanData.contacto && (cleanData.contacto as any)._id) {
            const { _id, ...contactoWithoutId } = cleanData.contacto as any;
            cleanData.contacto = contactoWithoutId;
        }
        const result = await apiClient.patch(`/puntos-venta/${id}`, cleanData);
        return {
            success: true,
            puntoVenta: result.puntoVenta || result,
            message: 'Punto de venta actualizado exitosamente',
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Error al actualizar el punto de venta',
        };
    }
}

/**
 * Eliminar (desactivar) un punto de venta
 */
export async function deletePuntoVentaMongo(id: string): Promise<{
    success: boolean;
    message?: string;
}> {
    try {
        await apiClient.delete(`/puntos-venta/${id}`);
        return {
            success: true,
            message: 'Punto de venta eliminado exitosamente',
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al eliminar el punto de venta',
        };
    }
}

/**
 * Agregar registro de kilos vendidos por mes
 */
export async function addKilosMesMongo(
    id: string,
    mes: number,
    anio: number,
    kilos: number
): Promise<{
    success: boolean;
    message?: string;
}> {
    try {
        // Nota: Segun el backend (getPuntoVentaById), parece que espera un POST o similar
        // Pero en el service de NestJS se llama addKilosMes. 
        // El controlador no tiene un endpoint explícito para esto todavia.
        // Asumo que se implementará siguiendo la convención:
        await apiClient.post(`/puntos-venta/${id}/kilos`, { mes, anio, kilos });
        return {
            success: true,
            message: 'Kilos agregados exitosamente',
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al agregar kilos',
        };
    }
}


export async function getVentasPorZonaMongo(): Promise<{
    success: boolean;
    data?: any[];
    message?: string;
}> {
    try {
        // Similar al anterior, el controlador no tiene este endpoint explícito aún.
        // Pero el service sí. Lo implemento anticipando el endpoint.
        const result = await apiClient.get('/puntos-venta/stats/por-zona');
        return {
            success: true,
            data: result || [],
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener estadísticas por zona',
        };
    }
}
