import { apiClient } from '@/lib/api';

// Tipos para el servicio MongoDB
export interface MetodoPagoMongoData {
    _id: string;
    nombre: string;
    descripcion?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateMetodoPagoMongoInput {
    nombre: string;
    descripcion?: string;
    isActive?: boolean;
}

export interface UpdateMetodoPagoMongoInput {
    nombre?: string;
    descripcion?: string;
    isActive?: boolean;
}

/**
 * Obtener todos los métodos de pago activos
 */
export async function getAllMetodosPagoMongo() {
    try {
        const result = await apiClient.get('/metodos-pago');
        return {
            success: true,
            metodosPago: result.metodosPago || result || [],
            total: result.total || (result.metodosPago || result || []).length
        };
    } catch (error) {
        return { success: false, message: 'Error al obtener los métodos de pago' };
    }
}

/**
 * Obtener todos los métodos de pago (incluyendo inactivos)
 */
export async function getAllMetodosPagoIncludingInactiveMongo() {
    try {
        const result = await apiClient.get('/metodos-pago/all');
        return {
            success: true,
            metodosPago: result.metodosPago || result || [],
            total: result.total || (result.metodosPago || result || []).length
        };
    } catch (error) {
        return { success: false, message: 'Error al obtener los métodos de pago' };
    }
}

/**
 * Obtener un método de pago por ID
 */
export async function getMetodoPagoByIdMongo(id: string) {
    try {
        const result = await apiClient.get(`/metodos-pago/${id}`);
        return { success: true, metodoPago: result.metodoPago || result };
    } catch (error) {
        return { success: false, message: 'Error al obtener el método de pago' };
    }
}

/**
 * Crear un nuevo método de pago
 */
export async function createMetodoPagoMongo(data: CreateMetodoPagoMongoInput) {
    try {
        const result = await apiClient.post('/metodos-pago', data);
        return { success: true, metodoPago: result.metodoPago || result, message: 'Método de pago creado exitosamente' };
    } catch (error: any) {
        return { success: false, message: 'Error al crear el método de pago' };
    }
}

/**
 * Actualizar un método de pago existente
 */
export async function updateMetodoPagoMongo(id: string, data: UpdateMetodoPagoMongoInput) {
    try {
        const result = await apiClient.patch(`/metodos-pago/${id}`, data);
        return { success: true, metodoPago: result.metodoPago || result, message: 'Método de pago actualizado exitosamente' };
    } catch (error) {
        return { success: false, message: 'Error al actualizar el método de pago' };
    }
}

/**
 * Desactivar un método de pago (soft delete)
 */
export async function deleteMetodoPagoMongo(id: string) {
    try {
        await apiClient.delete(`/metodos-pago/${id}`);
        return { success: true, message: 'Método de pago desactivado exitosamente' };
    } catch (error) {
        return { success: false, message: 'Error al desactivar el método de pago' };
    }
}

/**
 * Eliminar un método de pago permanentemente
 */
export async function deleteMetodoPagoPermanentlyMongo(id: string) {
    try {
        await apiClient.delete(`/metodos-pago/${id}/permanent`);
        return { success: true, message: 'Método de pago eliminado permanentemente' };
    } catch (error) {
        return { success: false, message: 'Error al eliminar el método de pago' };
    }
}

/**
 * Inicializar métodos de pago por defecto
 */
export async function initializeMetodosPagoMongo() {
    try {
        const result = await apiClient.post('/metodos-pago/initialize');
        return { success: true, message: result.message || 'Inicialización completada', created: result.created || 0 };
    } catch (error) {
        return { success: false, message: 'Error al inicializar los métodos de pago' };
    }
}

/**
 * Buscar métodos de pago por nombre
 */
export async function searchMetodosPagoMongo(searchTerm: string) {
    try {
        const result = await apiClient.get(`/metodos-pago/search?q=${encodeURIComponent(searchTerm)}`);
        return {
            success: true,
            metodosPago: result.metodosPago || result || [],
            total: result.total || (result.metodosPago || result || []).length
        };
    } catch (error) {
        return { success: false, message: 'Error al buscar los métodos de pago' };
    }
}

/**
 * Obtener estadísticas de métodos de pago
 */
export async function getMetodosPagoStatsMongo() {
    try {
        const result = await apiClient.get('/metodos-pago/stats');
        return { success: true, stats: result.stats || result };
    } catch (error) {
        return { success: false, message: 'Error al obtener estadísticas de métodos de pago' };
    }
}
