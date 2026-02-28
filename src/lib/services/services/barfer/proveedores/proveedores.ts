import { apiClient } from '@/lib/api';

// Tipos para el servicio MongoDB
export interface ProveedorMongoData {
    _id: string;
    nombre: string;
    detalle: string;
    telefono: string;
    personaContacto: string;
    registro: 'BLANCO' | 'NEGRO';
    categoriaId?: string | null;
    metodoPagoId?: string | null;
    categoria?: {
        _id: string;
        nombre: string;
    };
    metodoPago?: {
        _id: string;
        nombre: string;
    };
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface CreateProveedorMongoInput {
    nombre: string;
    detalle: string;
    telefono: string;
    personaContacto: string;
    registro: 'BLANCO' | 'NEGRO';
    categoriaId?: string;
    metodoPagoId?: string;
    isActive?: boolean;
}

export interface UpdateProveedorMongoInput {
    nombre?: string;
    detalle?: string;
    telefono?: string;
    personaContacto?: string;
    registro?: 'BLANCO' | 'NEGRO';
    categoriaId?: string;
    metodoPagoId?: string;
    isActive?: boolean;
}

/**
 * Obtener todos los proveedores activos con datos relacionados
 */
export async function getAllProveedoresMongo() {
    try {
        const result = await apiClient.get('/proveedores');
        return {
            success: true,
            proveedores: result.proveedores || result || [],
            total: result.total || (result.proveedores || result || []).length
        };
    } catch (error) {
        return { success: false, message: 'Error al obtener los proveedores' };
    }
}

/**
 * Obtener todos los proveedores (activos e inactivos) con datos relacionados
 */
export async function getAllProveedoresIncludingInactiveMongo() {
    try {
        const result = await apiClient.get('/proveedores/all');
        return {
            success: true,
            proveedores: result.proveedores || result || [],
            total: result.total || (result.proveedores || result || []).length
        };
    } catch (error) {
        return { success: false, message: 'Error al obtener los proveedores' };
    }
}

/**
 * Obtener un proveedor por ID con datos relacionados
 */
export async function getProveedorByIdMongo(id: string) {
    try {
        const result = await apiClient.get(`/proveedores/${id}`);
        return { success: true, proveedor: result.proveedor || result };
    } catch (error) {
        return { success: false, message: 'Error al obtener el proveedor' };
    }
}

/**
 * Crear un nuevo proveedor
 */
export async function createProveedorMongo(data: CreateProveedorMongoInput) {
    try {
        const result = await apiClient.post('/proveedores', data);
        return { success: true, proveedor: result.proveedor || result, message: 'Proveedor creado exitosamente' };
    } catch (error) {
        return { success: false, message: 'Error al crear el proveedor' };
    }
}

/**
 * Actualizar un proveedor existente
 */
export async function updateProveedorMongo(id: string, data: UpdateProveedorMongoInput) {
    try {
        const result = await apiClient.patch(`/proveedores/${id}`, data);
        return { success: true, proveedor: result.proveedor || result, message: 'Proveedor actualizado exitosamente' };
    } catch (error) {
        return { success: false, message: 'Error al actualizar el proveedor' };
    }
}

/**
 * Eliminar un proveedor (soft delete)
 */
export async function deleteProveedorMongo(id: string) {
    try {
        await apiClient.delete(`/proveedores/${id}`);
        return { success: true, message: 'Proveedor eliminado exitosamente' };
    } catch (error) {
        return { success: false, message: 'Error al eliminar el proveedor' };
    }
}

/**
 * Buscar proveedores por termino de busqueda
 */
export async function searchProveedoresMongo(searchTerm: string) {
    try {
        const result = await apiClient.get(`/proveedores/search?q=${encodeURIComponent(searchTerm)}`);
        return {
            success: true,
            proveedores: result.proveedores || result || [],
            total: result.total || (result.proveedores || result || []).length
        };
    } catch (error) {
        return { success: false, message: 'Error al buscar proveedores' };
    }
}

/**
 * Funcion de prueba simple
 */
export async function testSearchProveedoresMongo(searchTerm: string) {
    try {
        const result = await searchProveedoresMongo(searchTerm);
        return { success: true, proveedores: result.proveedores || [] };
    } catch (error) {
        return { success: false, message: 'Error al buscar proveedores' };
    }
}
