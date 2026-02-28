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
export async function getAllProveedoresMongo(): Promise<{
    success: boolean;
    proveedores?: ProveedorMongoData[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/proveedores');
        return {
            success: true,
            proveedores: result.proveedores || result || [],
            total: result.total || (result.proveedores || result || []).length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener los proveedores',
            error: 'GET_ALL_PROVEEDORES_MONGO_ERROR'
        };
    }
}

/**
 * Obtener todos los proveedores (activos e inactivos) con datos relacionados
 */
export async function getAllProveedoresIncludingInactiveMongo(): Promise<{
    success: boolean;
    proveedores?: ProveedorMongoData[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/proveedores/all');
        return {
            success: true,
            proveedores: result.proveedores || result || [],
            total: result.total || (result.proveedores || result || []).length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener los proveedores',
            error: 'GET_ALL_PROVEEDORES_INCLUDING_INACTIVE_MONGO_ERROR'
        };
    }
}

/**
 * Obtener un proveedor por ID con datos relacionados
 */
export async function getProveedorByIdMongo(id: string): Promise<{
    success: boolean;
    proveedor?: ProveedorMongoData;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get(`/proveedores/${id}`);
        return {
            success: true,
            proveedor: result.proveedor || result
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener el proveedor',
            error: 'GET_PROVEEDOR_BY_ID_MONGO_ERROR'
        };
    }
}

/**
 * Crear un nuevo proveedor
 */
export async function createProveedorMongo(data: CreateProveedorMongoInput): Promise<{
    success: boolean;
    proveedor?: ProveedorMongoData;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.post('/proveedores', data);
        return {
            success: true,
            proveedor: result.proveedor || result,
            message: 'Proveedor creado exitosamente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al crear el proveedor',
            error: 'CREATE_PROVEEDOR_MONGO_ERROR'
        };
    }
}

/**
 * Actualizar un proveedor existente
 */
export async function updateProveedorMongo(id: string, data: UpdateProveedorMongoInput): Promise<{
    success: boolean;
    proveedor?: ProveedorMongoData;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.patch(`/proveedores/${id}`, data);
        return {
            success: true,
            proveedor: result.proveedor || result,
            message: 'Proveedor actualizado exitosamente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al actualizar el proveedor',
            error: 'UPDATE_PROVEEDOR_MONGO_ERROR'
        };
    }
}

/**
 * Eliminar un proveedor (soft delete)
 */
export async function deleteProveedorMongo(id: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        await apiClient.delete(`/proveedores/${id}`);
        return {
            success: true,
            message: 'Proveedor eliminado exitosamente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al eliminar el proveedor',
            error: 'DELETE_PROVEEDOR_MONGO_ERROR'
        };
    }
}

/**
 * Buscar proveedores por termino de busqueda
 */
export async function searchProveedoresMongo(searchTerm: string): Promise<{
    success: boolean;
    proveedores?: ProveedorMongoData[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get(`/proveedores/search?q=${encodeURIComponent(searchTerm)}`);
        return {
            success: true,
            proveedores: result.proveedores || result || [],
            total: result.total || (result.proveedores || result || []).length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al buscar proveedores',
            error: 'SEARCH_PROVEEDORES_MONGO_ERROR'
        };
    }
}

/**
 * Funcion de prueba simple
 */
export async function testSearchProveedoresMongo(searchTerm: string): Promise<{
    success: boolean;
    proveedores?: any[];
    message?: string;
}> {
    try {
        const result = await searchProveedoresMongo(searchTerm);
        return {
            success: true,
            proveedores: result.proveedores || []
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al buscar proveedores'
        };
    }
}
