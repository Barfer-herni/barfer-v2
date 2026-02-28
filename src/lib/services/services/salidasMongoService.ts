import { apiClient } from '@/lib/api';
import { canViewSalidaCategory, getViewableCategories } from '@/lib/auth/server-permissions';

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

/**
 * Obtener todas las salidas ordenadas por fecha
 */
export async function getAllSalidasMongo(): Promise<{
    success: boolean;
    salidas?: SalidaMongoData[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get('/salidas');
        return {
            success: true,
            salidas: result.salidas || result || [],
            total: result.total || (result.salidas || result || []).length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener las salidas',
            error: 'GET_ALL_SALIDAS_MONGO_ERROR'
        };
    }
}

/**
 * Obtener todas las salidas filtradas por permisos de categorias del usuario
 */
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
        return {
            success: false,
            message: 'Error al obtener las salidas',
            error: 'GET_ALL_SALIDAS_WITH_PERMISSION_FILTER_MONGO_ERROR'
        };
    }
}

/**
 * Obtener salidas por nombre de categoria (case insensitive)
 */
export async function getSalidasByCategoryMongo(categoria: string): Promise<{
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

        const categoriaLower = categoria.toLowerCase();
        const filteredSalidas = result.salidas.filter(
            salida => salida.categoria?.nombre?.toLowerCase().includes(categoriaLower)
        );

        return {
            success: true,
            salidas: filteredSalidas,
            total: filteredSalidas.length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener salidas por categoria',
            error: 'GET_SALIDAS_BY_CATEGORY_MONGO_ERROR'
        };
    }
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

/**
 * Obtener salidas paginadas con filtros
 */
export async function getSalidasPaginatedMongo({
    pageIndex = 0,
    pageSize = 50,
    filters = {},
}: {
    pageIndex?: number;
    pageSize?: number;
    filters?: SalidasFilters;
}): Promise<{
    success: boolean;
    salidas?: SalidaMongoData[];
    total?: number;
    pageCount?: number;
    message?: string;
    error?: string;
}> {
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
        return {
            success: false,
            message: 'Error al obtener las salidas paginadas',
            error: 'GET_SALIDAS_PAGINATED_MONGO_ERROR'
        };
    }
}

/**
 * Crear una nueva salida
 */
export async function createSalidaMongo(data: CreateSalidaMongoInput): Promise<{
    success: boolean;
    salida?: SalidaMongoData;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.post('/salidas', data);
        return {
            success: true,
            salida: result.salida || result,
            message: 'Salida creada exitosamente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al crear la salida',
            error: 'CREATE_SALIDA_MONGO_ERROR'
        };
    }
}

/**
 * Actualizar una salida existente
 */
export async function updateSalidaMongo(id: string, data: UpdateSalidaMongoInput): Promise<{
    success: boolean;
    salida?: SalidaMongoData;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.patch(`/salidas/${id}`, data);
        return {
            success: true,
            salida: result.salida || result,
            message: 'Salida actualizada exitosamente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al actualizar la salida',
            error: 'UPDATE_SALIDA_MONGO_ERROR'
        };
    }
}

/**
 * Eliminar una salida
 */
export async function deleteSalidaMongo(id: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    try {
        await apiClient.delete(`/salidas/${id}`);
        return {
            success: true,
            message: 'Salida eliminada exitosamente'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al eliminar la salida',
            error: 'DELETE_SALIDA_MONGO_ERROR'
        };
    }
}

/**
 * Obtener salidas por rango de fechas
 */
export async function getSalidasByDateRangeMongo(startDate: Date, endDate: Date): Promise<{
    success: boolean;
    salidas?: SalidaMongoData[];
    total?: number;
    message?: string;
    error?: string;
}> {
    try {
        const params = new URLSearchParams();
        params.set('startDate', startDate.toISOString());
        params.set('endDate', endDate.toISOString());

        const result = await apiClient.get(`/salidas/date-range?${params.toString()}`);
        return {
            success: true,
            salidas: result.salidas || result || [],
            total: result.total || (result.salidas || result || []).length
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener salidas por rango de fechas',
            error: 'GET_SALIDAS_BY_DATE_RANGE_MONGO_ERROR'
        };
    }
}

/**
 * Obtener estadisticas de salidas por mes
 */
export async function getSalidasStatsByMonthMongo(year: number, month: number): Promise<{
    success: boolean;
    stats?: {
        totalSalidas: number;
        totalMonto: number;
        salidasOrdinarias: number;
        salidasExtraordinarias: number;
        montoOrdinario: number;
        montoExtraordinario: number;
        salidasBlancas: number;
        salidasNegras: number;
        montoBlanco: number;
        montoNegro: number;
    };
    message?: string;
    error?: string;
}> {
    try {
        const params = new URLSearchParams();
        params.set('year', String(year));
        params.set('month', String(month));

        const result = await apiClient.get(`/salidas/stats?${params.toString()}`);
        return {
            success: true,
            stats: result.stats || result
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener estadisticas de salidas',
            error: 'GET_SALIDAS_STATS_BY_MONTH_MONGO_ERROR'
        };
    }
}

/**
 * Obtener una salida por ID
 */
export async function getSalidaByIdMongo(id: string): Promise<{
    success: boolean;
    salida?: SalidaMongoData;
    message?: string;
    error?: string;
}> {
    try {
        const result = await apiClient.get(`/salidas/${id}`);
        return {
            success: true,
            salida: result.salida || result
        };
    } catch (error) {
        return {
            success: false,
            message: 'Error al obtener la salida',
            error: 'GET_SALIDA_BY_ID_MONGO_ERROR'
        };
    }
}
