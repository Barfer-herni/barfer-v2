import { apiClient } from '@/lib/api';

// ==========================================
// CATEGORÍAS GENERALES
// ==========================================

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

export async function getAllCategoriasMongo() {
    try {
        const result = await apiClient.get('/categorias-gestor/all');
        return {
            success: true,
            categorias: result.categorias || result || [],
            total: result.total || (result.categorias || result || []).length
        };
    } catch (error) {
        return { success: false, message: 'Error al obtener las categorías' };
    }
}

export async function getAllCategoriasIncludingInactiveMongo() {
    try {
        const result = await apiClient.get('/categorias-gestor/all');
        return {
            success: true,
            categorias: result.categorias || result || [],
            total: result.total || (result.categorias || result || []).length
        };
    } catch (error) {
        return { success: false, message: 'Error al obtener las categorías' };
    }
}

export async function getCategoriaByIdMongo(id: string) {
    try {
        const result = await apiClient.get(`/categorias-gestor/${id}`);
        return { success: true, categoria: result.categoria || result };
    } catch (error) {
        return { success: false, message: 'Error al obtener la categoría' };
    }
}

export async function createCategoriaMongo(data: CreateCategoriaMongoInput) {
    try {
        const result = await apiClient.post('/categorias-gestor', data);
        return { success: true, categoria: result.categoria || result, message: 'Categoría creada exitosamente' };
    } catch (error: any) {
        return { success: false, message: 'Error al crear la categoría' };
    }
}

export async function updateCategoriaMongo(id: string, data: UpdateCategoriaMongoInput) {
    try {
        const result = await apiClient.patch(`/categorias-gestor/${id}`, data);
        return { success: true, categoria: result.categoria || result, message: 'Categoría actualizada exitosamente' };
    } catch (error) {
        return { success: false, message: 'Error al actualizar la categoría' };
    }
}

export async function deleteCategoriaMongo(id: string) {
    try {
        await apiClient.delete(`/categorias-gestor/${id}`);
        return { success: true, message: 'Categoría desactivada exitosamente' };
    } catch (error) {
        return { success: false, message: 'Error al desactivar la categoría' };
    }
}

export async function deleteCategoriaPermanentlyMongo(id: string) {
    try {
        await apiClient.delete(`/categorias-gestor/${id}/permanent`);
        return { success: true, message: 'Categoría eliminada permanentemente' };
    } catch (error) {
        return { success: false, message: 'Error al eliminar la categoría' };
    }
}

export async function initializeCategoriasMongo() {
    try {
        const result = await apiClient.post('/categorias-gestor/initialize');
        return { success: true, message: result.message || 'Inicialización completada', created: result.created || 0 };
    } catch (error) {
        return { success: false, message: 'Error al inicializar las categorías' };
    }
}

export async function ensureSueldosCategoryMongo() {
    try {
        const result = await apiClient.post('/categorias-gestor/ensure-sueldos');
        return { success: true, categoria: result.categoria || result, message: result.message || 'Categoría SUELDOS verificada' };
    } catch (error) {
        return { success: false, message: 'Error al crear la categoría SUELDOS' };
    }
}

export async function searchCategoriasMongo(searchTerm: string) {
    try {
        const result = await apiClient.get(`/categorias-gestor/search?q=${encodeURIComponent(searchTerm)}`);
        return {
            success: true,
            categorias: result.categorias || result || [],
            total: result.total || (result.categorias || result || []).length
        };
    } catch (error) {
        return { success: false, message: 'Error al buscar las categorías' };
    }
}

export async function getCategoriasStatsMongo() {
    try {
        const result = await apiClient.get('/categorias-gestor/stats');
        return { success: true, stats: result.stats || result };
    } catch (error) {
        return { success: false, message: 'Error al obtener estadísticas de categorías' };
    }
}

// ==========================================
// CATEGORÍAS DE PROVEEDORES
// ==========================================

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

export async function getAllCategoriasProveedoresMongo() {
    try {
        const result = await apiClient.get('/categorias-proveedores');
        return {
            success: true,
            categorias: result.categorias || result || [],
            total: result.total || (result.categorias || result || []).length
        };
    } catch (error) {
        return { success: false, message: 'Error al obtener las categorías de proveedores' };
    }
}

export async function getAllCategoriasProveedoresIncludingInactiveMongo() {
    try {
        const result = await apiClient.get('/categorias-proveedores/all');
        return {
            success: true,
            categorias: result.categorias || result || [],
            total: result.total || (result.categorias || result || []).length
        };
    } catch (error) {
        return { success: false, message: 'Error al obtener las categorías de proveedores' };
    }
}

export async function getCategoriaProveedorByIdMongo(id: string) {
    try {
        const result = await apiClient.get(`/categorias-proveedores/${id}`);
        return { success: true, categoria: result.categoria || result };
    } catch (error) {
        return { success: false, message: 'Error al obtener la categoría de proveedor' };
    }
}

export async function createCategoriaProveedorMongo(data: CreateCategoriaProveedorMongoInput) {
    try {
        const result = await apiClient.post('/categorias-proveedores', data);
        return { success: true, categoria: result.categoria || result, message: 'Categoría de proveedor creada exitosamente' };
    } catch (error: any) {
        return { success: false, message: 'Error al crear la categoría de proveedor' };
    }
}

export async function updateCategoriaProveedorMongo(id: string, data: UpdateCategoriaProveedorMongoInput) {
    try {
        const result = await apiClient.patch(`/categorias-proveedores/${id}`, data);
        return { success: true, categoria: result.categoria || result, message: 'Categoría de proveedor actualizada exitosamente' };
    } catch (error) {
        return { success: false, message: 'Error al actualizar la categoría de proveedor' };
    }
}

export async function deleteCategoriaProveedorMongo(id: string) {
    try {
        await apiClient.delete(`/categorias-proveedores/${id}`);
        return { success: true, message: 'Categoría de proveedor eliminada exitosamente' };
    } catch (error) {
        return { success: false, message: 'Error al eliminar la categoría de proveedor' };
    }
}

export async function initializeCategoriasProveedoresMongo() {
    try {
        const result = await apiClient.post('/categorias-proveedores/initialize');
        return { success: true, message: result.message || 'Categorias de proveedores inicializadas' };
    } catch (error) {
        return { success: false, message: 'Error al inicializar las categorías de proveedores' };
    }
}
