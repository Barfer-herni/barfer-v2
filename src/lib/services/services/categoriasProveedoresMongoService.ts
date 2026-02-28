import { apiClient } from '@/lib/api';

// Tipos para el servicio MongoDB
export interface CategoriaProveedorMongoData {
    _id: string;
    nombre: string;
    descripcion?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCategoriaProveedorMongoInput {
    nombre: string;
    descripcion?: string;
    isActive?: boolean;
}

export interface UpdateCategoriaProveedorMongoInput {
    nombre?: string;
    descripcion?: string;
    isActive?: boolean;
}

// Servicios CRUD

/**
 * Obtener todas las categorías de proveedores activas
 */
export async function getAllCategoriasProveedoresMongo(): Promise<{
    success: boolean;
    categorias?: CategoriaProveedorMongoData[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/categorias-proveedores');
        return {
            success: true,
            categorias: result.categorias || result || [],
            total: result.total || (result.categorias || result || []).length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener las categorías de proveedores',
            error: 'GET_ALL_CATEGORIAS_PROVEEDORES_MONGO_ERROR'
        };
    }
}

/**
 * Obtener todas las categorías de proveedores (activas e inactivas)
 */
export async function getAllCategoriasProveedoresIncludingInactiveMongo(): Promise<{
    success: boolean;
    categorias?: CategoriaProveedorMongoData[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/categorias-proveedores/all');
        return {
            success: true,
            categorias: result.categorias || result || [],
            total: result.total || (result.categorias || result || []).length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener las categorías de proveedores',
            error: 'GET_ALL_CATEGORIAS_PROVEEDORES_INCLUDING_INACTIVE_MONGO_ERROR'
        };
    }
}

/**
 * Obtener una categoría de proveedor por ID
 */
export async function getCategoriaProveedorByIdMongo(id: string): Promise<{
    success: boolean;
    categoria?: CategoriaProveedorMongoData;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get(`/categorias-proveedores/${id}`);
        return {
            success: true,
            categoria: result.categoria || result
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener la categoría de proveedor',
            error: 'GET_CATEGORIA_PROVEEDOR_BY_ID_MONGO_ERROR'
        };
    }
}

/**
 * Crear una nueva categoría de proveedor
 */
export async function createCategoriaProveedorMongo(data: CreateCategoriaProveedorMongoInput): Promise<{
    success: boolean;
    categoria?: CategoriaProveedorMongoData;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.post('/categorias-proveedores', data);
        return {
            success: true,
            categoria: result.categoria || result,
            message: 'Categoría de proveedor creada exitosamente'
        };
    } catch (error: any) {
        const errorMessage = error?.message || '';
        if (errorMessage.includes('already exists') || errorMessage.includes('ya existe')) {
            return {
                success: false,
                message: 'Ya existe una categoría de proveedor con ese nombre',
                error: 'CATEGORIA_PROVEEDOR_ALREADY_EXISTS'
            };
        }
        return {
            success: false,
            message: 'Error al crear la categoría de proveedor',
            error: 'CREATE_CATEGORIA_PROVEEDOR_MONGO_ERROR'
        };
    }
}

/**
 * Actualizar una categoría de proveedor existente
 */
export async function updateCategoriaProveedorMongo(id: string, data: UpdateCategoriaProveedorMongoInput): Promise<{
    success: boolean;
    categoria?: CategoriaProveedorMongoData;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.patch(`/categorias-proveedores/${id}`, data);
        return {
            success: true,
            categoria: result.categoria || result,
            message: 'Categoría de proveedor actualizada exitosamente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al actualizar la categoría de proveedor',
            error: 'UPDATE_CATEGORIA_PROVEEDOR_MONGO_ERROR'
        };
    }
}

/**
 * Eliminar una categoría de proveedor (soft delete)
 */
export async function deleteCategoriaProveedorMongo(id: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        await apiClient.delete(`/categorias-proveedores/${id}`);
        return {
            success: true,
            message: 'Categoría de proveedor eliminada exitosamente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al eliminar la categoría de proveedor',
            error: 'DELETE_CATEGORIA_PROVEEDOR_MONGO_ERROR'
        };
    }
}

/**
 * Inicializar categorías de proveedores por defecto
 */
export async function initializeCategoriasProveedoresMongo(): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.post('/categorias-proveedores/initialize');
        return {
            success: true,
            message: result.message || 'Categorías de proveedores inicializadas'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al inicializar las categorías de proveedores',
            error: 'INITIALIZE_CATEGORIAS_PROVEEDORES_MONGO_ERROR'
        };
    }
}
