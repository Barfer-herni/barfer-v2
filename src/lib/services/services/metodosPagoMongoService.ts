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

// Servicios CRUD

/**
 * Obtener todos los métodos de pago activos
 */
export async function getAllMetodosPagoMongo(): Promise<{
    success: boolean;
    metodosPago?: MetodoPagoMongoData[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/metodos-pago');
        return {
            success: true,
            metodosPago: result.metodosPago || result || [],
            total: result.total || (result.metodosPago || result || []).length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener los métodos de pago',
            error: 'GET_ALL_METODOS_PAGO_MONGO_ERROR'
        };
    }
}

/**
 * Obtener todos los métodos de pago (incluyendo inactivos)
 */
export async function getAllMetodosPagoIncludingInactiveMongo(): Promise<{
    success: boolean;
    metodosPago?: MetodoPagoMongoData[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/metodos-pago/all');
        return {
            success: true,
            metodosPago: result.metodosPago || result || [],
            total: result.total || (result.metodosPago || result || []).length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener los métodos de pago',
            error: 'GET_ALL_METODOS_PAGO_INCLUDING_INACTIVE_MONGO_ERROR'
        };
    }
}

/**
 * Obtener un método de pago por ID
 */
export async function getMetodoPagoByIdMongo(id: string): Promise<{
    success: boolean;
    metodoPago?: MetodoPagoMongoData;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get(`/metodos-pago/${id}`);
        return {
            success: true,
            metodoPago: result.metodoPago || result
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener el método de pago',
            error: 'GET_METODO_PAGO_BY_ID_MONGO_ERROR'
        };
    }
}

/**
 * Crear un nuevo método de pago
 */
export async function createMetodoPagoMongo(data: CreateMetodoPagoMongoInput): Promise<{
    success: boolean;
    metodoPago?: MetodoPagoMongoData;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.post('/metodos-pago', data);
        return {
            success: true,
            metodoPago: result.metodoPago || result,
            message: 'Método de pago creado exitosamente'
        };
    } catch (error: any) {
        const errorMessage = error?.message || '';
        if (errorMessage.includes('already exists') || errorMessage.includes('ya existe')) {
            return {
                success: false,
                message: 'Ya existe un método de pago con ese nombre',
                error: 'METODO_PAGO_ALREADY_EXISTS'
            };
        }
        return {
            success: false,
            message: 'Error al crear el método de pago',
            error: 'CREATE_METODO_PAGO_MONGO_ERROR'
        };
    }
}

/**
 * Actualizar un método de pago existente
 */
export async function updateMetodoPagoMongo(id: string, data: UpdateMetodoPagoMongoInput): Promise<{
    success: boolean;
    metodoPago?: MetodoPagoMongoData;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.patch(`/metodos-pago/${id}`, data);
        return {
            success: true,
            metodoPago: result.metodoPago || result,
            message: 'Método de pago actualizado exitosamente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al actualizar el método de pago',
            error: 'UPDATE_METODO_PAGO_MONGO_ERROR'
        };
    }
}

/**
 * Desactivar un método de pago (soft delete)
 */
export async function deleteMetodoPagoMongo(id: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        await apiClient.delete(`/metodos-pago/${id}`);
        return {
            success: true,
            message: 'Método de pago desactivado exitosamente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al desactivar el método de pago',
            error: 'DELETE_METODO_PAGO_MONGO_ERROR'
        };
    }
}

/**
 * Eliminar un método de pago permanentemente
 */
export async function deleteMetodoPagoPermanentlyMongo(id: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        await apiClient.delete(`/metodos-pago/${id}/permanent`);
        return {
            success: true,
            message: 'Método de pago eliminado permanentemente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al eliminar el método de pago',
            error: 'DELETE_METODO_PAGO_PERMANENTLY_MONGO_ERROR'
        };
    }
}

/**
 * Inicializar métodos de pago por defecto
 */
export async function initializeMetodosPagoMongo(): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    created?: number;
}> {
    try {
        const result = await apiClient.post('/metodos-pago/initialize');
        return {
            success: true,
            message: result.message || 'Inicialización completada',
            created: result.created || 0
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al inicializar los métodos de pago',
            error: 'INITIALIZE_METODOS_PAGO_MONGO_ERROR'
        };
    }
}

/**
 * Buscar métodos de pago por nombre
 */
export async function searchMetodosPagoMongo(searchTerm: string): Promise<{
    success: boolean;
    metodosPago?: MetodoPagoMongoData[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get(`/metodos-pago/search?q=${encodeURIComponent(searchTerm)}`);
        return {
            success: true,
            metodosPago: result.metodosPago || result || [],
            total: result.total || (result.metodosPago || result || []).length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al buscar los métodos de pago',
            error: 'SEARCH_METODOS_PAGO_MONGO_ERROR'
        };
    }
}

/**
 * Obtener estadísticas de métodos de pago
 */
export async function getMetodosPagoStatsMongo(): Promise<{
    success: boolean;
    stats?: {
        totalMetodosPago: number;
        metodosPagoActivos: number;
        metodosPagoInactivos: number;
    };
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/metodos-pago/stats');
        return {
            success: true,
            stats: result.stats || result
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener estadísticas de métodos de pago',
            error: 'GET_METODOS_PAGO_STATS_MONGO_ERROR'
        };
    }
}
