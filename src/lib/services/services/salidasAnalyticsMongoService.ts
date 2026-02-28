import 'server-only';
import { apiClient } from '@/lib/api';

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

// ==========================================
// SERVICIOS DE ANALYTICS
// ==========================================

/**
 * Obtiene estadísticas de salidas por categoría para gráfico de torta
 */
export async function getSalidasCategoryAnalyticsMongo(
    startDate?: Date,
    endDate?: Date
): Promise<SalidaCategoryStats[]> {
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

/**
 * Obtiene estadísticas de salidas ordinarias vs extraordinarias
 */
export async function getSalidasTypeAnalyticsMongo(
    startDate?: Date,
    endDate?: Date
): Promise<SalidaTipoStats[]> {
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

/**
 * Obtiene estadísticas de salidas por mes
 */
export async function getSalidasMonthlyAnalyticsMongo(
    categoriaId?: string,
    startDate?: Date,
    endDate?: Date
): Promise<SalidaMonthlyStats[]> {
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

/**
 * Obtiene resumen general de salidas
 */
export async function getSalidasOverviewAnalyticsMongo(
    startDate?: Date,
    endDate?: Date
): Promise<SalidasAnalyticsSummary> {
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
