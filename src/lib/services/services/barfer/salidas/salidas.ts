import 'server-only';
import { apiClient } from '@/lib/api';
import { canViewSalidaCategory } from '@/lib/services/services/barfer/auth/auth';

// ==========================================
// TIPOS PARA ANALYTICS DE SALIDAS
// ==========================================

export interface SalidaCategoryStats {
    categoriaId: string;
    categoriaNombre: string;
    totalMonto: number;
    cantidad: number;
    porcentaje: number;
}

export interface SalidaTipoStats {
    tipo: 'ORDINARIO' | 'EXTRAORDINARIO';
    totalMonto: number;
    cantidad: number;
    porcentaje: number;
}

export interface SalidaMonthlyStats {
    year: number;
    month: number;
    monthName: string;
    totalMonto: number;
    cantidad: number;
    categorias: {
        [key: string]: {
            nombre: string;
            monto: number;
            cantidad: number;
        };
    };
}

export interface SalidasAnalyticsSummary {
    totalGasto: number;
    totalSalidas: number;
    gastoPromedio: number;
    ordinarioVsExtraordinario: {
        ordinario: { monto: number; cantidad: number; porcentaje: number };
        extraordinario: { monto: number; cantidad: number; porcentaje: number };
    };
    blancoVsNegro: {
        blanco: { monto: number; cantidad: number; porcentaje: number };
        negro: { monto: number; cantidad: number; porcentaje: number };
    };
}

// Tipos para el servicio MongoDB
export interface SalidaMongoData {
    _id: string;
    fechaFactura: Date | string;
    detalle: string;
    tipo: 'ORDINARIO' | 'EXTRAORDINARIO';
    marca?: string | null;
    monto: number;
    tipoRegistro: 'BLANCO' | 'NEGRO';
    categoriaId: string;
    metodoPagoId: string;
    proveedorId?: string | null;
    fechaPago?: Date | string | null;
    comprobanteNumber?: string | null;
    categoria?: {
        _id: string;
        nombre: string;
    };
    metodoPago?: {
        _id: string;
        nombre: string;
    };
    proveedor?: {
        _id: string;
        nombre: string;
        detalle: string;
        telefono: string;
        personaContacto: string;
        registro: 'BLANCO' | 'NEGRO';
    } | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface CreateSalidaMongoInput {
    fechaFactura: Date | string;
    detalle: string;
    categoriaId: string;
    tipo: 'ORDINARIO' | 'EXTRAORDINARIO';
    marca?: string;
    monto: number;
    metodoPagoId: string;
    tipoRegistro: 'BLANCO' | 'NEGRO';
    proveedorId?: string;
    fechaPago?: Date | string;
    comprobanteNumber?: string;
}

export interface UpdateSalidaMongoInput {
    fechaFactura?: Date | string;
    detalle?: string;
    categoriaId?: string;
    tipo?: 'ORDINARIO' | 'EXTRAORDINARIO';
    marca?: string;
    monto?: number;
    metodoPagoId?: string;
    tipoRegistro?: 'BLANCO' | 'NEGRO';
    proveedorId?: string;
    fechaPago?: Date | string;
    comprobanteNumber?: string;
}

export interface SalidasFilters {
    searchTerm?: string;
    categoriaId?: string;
    marca?: string;
    metodoPagoId?: string;
    tipo?: 'ORDINARIO' | 'EXTRAORDINARIO';
    tipoRegistro?: 'BLANCO' | 'NEGRO';
    fecha?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
}

// ==========================================
// SERVICIOS CRUD
// ==========================================



export async function getAllSalidasWithPermissionFilterMongo(): Promise<{
    success: boolean;
    salidas?: SalidaMongoData[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await getAllSalidasMongo();
        if (!result.success || !result.salidas) {
            return result;
        }

        // Filtrar salidas según permisos de categorías
        const filteredSalidas = [];
        for (const salida of result.salidas) {
            if (salida.categoria) {
                const canView = await canViewSalidaCategory(salida.categoria.nombre);
                if (canView) {
                    filteredSalidas.push(salida);
                }
            }
        }

        return {
            success: true,
            salidas: filteredSalidas,
            total: filteredSalidas.length
        };
    } catch (error) {
        console.error('Error in getAllSalidasWithPermissionFilterMongo:', error);
        return {
            success: false,
            message: 'Error al obtener las salidas',
            error: 'GET_ALL_SALIDAS_WITH_PERMISSION_FILTER_MONGO_ERROR'
        };
    }
}



export async function getAllSalidasMongo(): Promise<{
    success: boolean;
    salidas?: SalidaMongoData[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/salidas');
        console.log(result);
        return {
            success: true,
            salidas: result.salidas || result || [],
            total: result.total || (result.salidas || result || []).length
        };
    } catch (error) {
        return { success: false, message: 'Error al obtener las salidas' };
    }
}

export async function getSalidasPaginatedMongo({
    pageIndex = 0,
    pageSize = 50,
    filters = {},
}: {
    pageIndex?: number;
    pageSize?: number;
    filters?: SalidasFilters;
}) {
    try {
        const params = new URLSearchParams();
        params.set('pageIndex', String(pageIndex));
        params.set('pageSize', String(pageSize));
        if (filters.searchTerm) params.set('searchTerm', filters.searchTerm);
        if (filters.categoriaId) params.set('categoriaId', filters.categoriaId);
        if (filters.marca) params.set('marca', filters.marca);
        if (filters.metodoPagoId) params.set('metodoPagoId', filters.metodoPagoId);
        if (filters.tipo) params.set('tipo', filters.tipo);
        if (filters.tipoRegistro) params.set('tipoRegistro', filters.tipoRegistro);
        if (filters.fecha) params.set('fecha', filters.fecha);
        if (filters.fechaDesde) params.set('fechaDesde', filters.fechaDesde.toISOString());
        if (filters.fechaHasta) params.set('fechaHasta', filters.fechaHasta.toISOString());

        const result = await apiClient.get(`/salidas/paginated?${params.toString()}`);
        return {
            success: true,
            salidas: result.salidas || result.data || [],
            total: result.total || 0,
            pageCount: result.pageCount || 0
        };
    } catch (error) {
        return { success: false, message: 'Error al obtener las salidas paginadas' };
    }
}

export async function createSalidaMongo(data: CreateSalidaMongoInput) {
    try {
        const result = await apiClient.post('/salidas', data);
        return { success: true, salida: result.salida || result, message: 'Salida creada exitosamente' };
    } catch (error) {
        return { success: false, message: 'Error al crear la salida' };
    }
}

export async function updateSalidaMongo(id: string, data: UpdateSalidaMongoInput) {
    try {
        const result = await apiClient.patch(`/salidas/${id}`, data);
        return { success: true, salida: result.salida || result, message: 'Salida actualizada exitosamente' };
    } catch (error) {
        return { success: false, message: 'Error al actualizar la salida' };
    }
}

export async function deleteSalidaMongo(id: string) {
    try {
        await apiClient.delete(`/salidas/${id}`);
        return { success: true, message: 'Salida eliminada exitosamente' };
    } catch (error) {
        return { success: false, message: 'Error al eliminar la salida' };
    }
}

export async function getSalidaByIdMongo(id: string) {
    try {
        const result = await apiClient.get(`/salidas/${id}`);
        return { success: true, salida: result.salida || result };
    } catch (error) {
        return { success: false, message: 'Error al obtener la salida' };
    }
}

// ==========================================
// ANALYTICS
// ==========================================

export async function getSalidasCategoryAnalyticsMongo(startDate?: Date, endDate?: Date) {
    try {
        const params = new URLSearchParams();
        if (startDate) params.set('startDate', startDate.toISOString());
        if (endDate) params.set('endDate', endDate.toISOString());

        const queryString = params.toString();
        const result = await apiClient.get(`/salidas/analytics/category${queryString ? `?${queryString}` : ''}`);
        return result.stats || result || [];
    } catch (error) {
        throw error;
    }
}

export async function getSalidasTypeAnalyticsMongo(startDate?: Date, endDate?: Date) {
    try {
        const params = new URLSearchParams();
        if (startDate) params.set('startDate', startDate.toISOString());
        if (endDate) params.set('endDate', endDate.toISOString());

        const queryString = params.toString();
        const result = await apiClient.get(`/salidas/analytics/type${queryString ? `?${queryString}` : ''}`);
        return result.stats || result || [];
    } catch (error) {
        throw error;
    }
}

export async function getSalidasMonthlyAnalyticsMongo(categoriaId?: string, startDate?: Date, endDate?: Date) {
    try {
        const params = new URLSearchParams();
        if (categoriaId) params.set('categoriaId', categoriaId);
        if (startDate) params.set('startDate', startDate.toISOString());
        if (endDate) params.set('endDate', endDate.toISOString());

        const queryString = params.toString();
        const result = await apiClient.get(`/salidas/analytics/monthly${queryString ? `?${queryString}` : ''}`);
        return result.stats || result || [];
    } catch (error) {
        throw error;
    }
}

export async function getSalidasOverviewAnalyticsMongo(startDate?: Date, endDate?: Date) {
    try {
        const params = new URLSearchParams();
        if (startDate) params.set('startDate', startDate.toISOString());
        if (endDate) params.set('endDate', endDate.toISOString());

        const queryString = params.toString();
        const result = await apiClient.get(`/salidas/analytics/overview${queryString ? `?${queryString}` : ''}`);
        return result.summary || result;
    } catch (error) {
        throw error;
    }
}

export async function getSalidasStatsByMonthMongo(year: number, month: number) {
    try {
        const result = await apiClient.get(`/salidas/stats?year=${year}&month=${month}`);
        return result;
    } catch (error) {
        throw error;
    }
}
