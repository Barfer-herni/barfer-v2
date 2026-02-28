import { apiClient } from '@/lib/api';

// Tipos para el servicio MongoDB
export interface CategoriaMongoData {
    _id: string;
    nombre: string;
    descripcion?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCategoriaMongoInput {
    nombre: string;
    descripcion?: string;
    isActive?: boolean;
}

export interface UpdateCategoriaMongoInput {
    nombre?: string;
    descripcion?: string;
    isActive?: boolean;
}

// Servicios CRUD

/**
 * Obtener todas las categorías activas
 */
export async function getAllCategoriasMongo(): Promise<{
    success: boolean;
    categorias?: CategoriaMongoData[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/categorias');
        return {
            success: true,
            categorias: result.categorias || result || [],
            total: result.total || (result.categorias || result || []).length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener las categorías',
            error: 'GET_ALL_CATEGORIAS_MONGO_ERROR'
        };
    }
}

/**
 * Obtener todas las categorías (incluyendo inactivas)
 */
export async function getAllCategoriasIncludingInactiveMongo(): Promise<{
    success: boolean;
    categorias?: CategoriaMongoData[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/categorias/all');
        return {
            success: true,
            categorias: result.categorias || result || [],
            total: result.total || (result.categorias || result || []).length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener las categorías',
            error: 'GET_ALL_CATEGORIAS_INCLUDING_INACTIVE_MONGO_ERROR'
        };
    }
}

/**
 * Obtener una categoría por ID
 */
export async function getCategoriaByIdMongo(id: string): Promise<{
    success: boolean;
    categoria?: CategoriaMongoData;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get(`/categorias/${id}`);
        return {
            success: true,
            categoria: result.categoria || result
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener la categoría',
            error: 'GET_CATEGORIA_BY_ID_MONGO_ERROR'
        };
    }
}

/**
 * Crear una nueva categoría
 */
export async function createCategoriaMongo(data: CreateCategoriaMongoInput): Promise<{
    success: boolean;
    categoria?: CategoriaMongoData;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.post('/categorias', data);
        return {
            success: true,
            categoria: result.categoria || result,
            message: 'Categoría creada exitosamente'
        };
    } catch (error: any) {
        const errorMessage = error?.message || '';
        if (errorMessage.includes('already exists') || errorMessage.includes('ya existe')) {
            return {
                success: false,
                message: `Ya existe una categoría con ese nombre`,
                error: 'CATEGORIA_ALREADY_EXISTS'
            };
        }
        return {
            success: false,
            message: 'Error al crear la categoría',
            error: 'CREATE_CATEGORIA_MONGO_ERROR'
        };
    }
}

/**
 * Actualizar una categoría existente
 */
export async function updateCategoriaMongo(id: string, data: UpdateCategoriaMongoInput): Promise<{
    success: boolean;
    categoria?: CategoriaMongoData;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.patch(`/categorias/${id}`, data);
        return {
            success: true,
            categoria: result.categoria || result,
            message: 'Categoría actualizada exitosamente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al actualizar la categoría',
            error: 'UPDATE_CATEGORIA_MONGO_ERROR'
        };
    }
}

/**
 * Desactivar una categoría (soft delete)
 */
export async function deleteCategoriaMongo(id: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        await apiClient.delete(`/categorias/${id}`);
        return {
            success: true,
            message: 'Categoría desactivada exitosamente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al desactivar la categoría',
            error: 'DELETE_CATEGORIA_MONGO_ERROR'
        };
    }
}

/**
 * Eliminar una categoría permanentemente
 */
export async function deleteCategoriaPermanentlyMongo(id: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        await apiClient.delete(`/categorias/${id}/permanent`);
        return {
            success: true,
            message: 'Categoría eliminada permanentemente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al eliminar la categoría',
            error: 'DELETE_CATEGORIA_PERMANENTLY_MONGO_ERROR'
        };
    }
}

/**
 * Inicializar categorías por defecto
 */
export async function initializeCategoriasMongo(): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    created?: number;
}> {
    try {
        const result = await apiClient.post('/categorias/initialize');
        return {
            success: true,
            message: result.message || 'Inicialización completada',
            created: result.created || 0
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al inicializar las categorías',
            error: 'INITIALIZE_CATEGORIAS_MONGO_ERROR'
        };
    }
}

/**
 * Crear categoría SUELDOS si no existe
 */
export async function ensureSueldosCategoryMongo(): Promise<{
    success: boolean;
    categoria?: CategoriaMongoData;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.post('/categorias/ensure-sueldos');
        return {
            success: true,
            categoria: result.categoria || result,
            message: result.message || 'Categoría SUELDOS verificada'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al crear la categoría SUELDOS',
            error: 'CREATE_SUELDOS_CATEGORY_MONGO_ERROR'
        };
    }
}

/**
 * Buscar categorías por nombre
 */
export async function searchCategoriasMongo(searchTerm: string): Promise<{
    success: boolean;
    categorias?: CategoriaMongoData[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get(`/categorias/search?q=${encodeURIComponent(searchTerm)}`);
        return {
            success: true,
            categorias: result.categorias || result || [],
            total: result.total || (result.categorias || result || []).length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al buscar las categorías',
            error: 'SEARCH_CATEGORIAS_MONGO_ERROR'
        };
    }
}

/**
 * Obtener estadísticas de categorías
 */
export async function getCategoriasStatsMongo(): Promise<{
    success: boolean;
    stats?: {
        totalCategorias: number;
        categoriasActivas: number;
        categoriasInactivas: number;
    };
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/categorias/stats');
        return {
            success: true,
            stats: result.stats || result
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener estadísticas de categorías',
            error: 'GET_CATEGORIAS_STATS_MONGO_ERROR'
        };
    }
}
