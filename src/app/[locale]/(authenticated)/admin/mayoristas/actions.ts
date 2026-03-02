'use server';

import {
    getPuntosVentaMongo,
    getPuntoVentaByIdMongo,
    createPuntoVentaMongo,
    updatePuntoVentaMongo,
    deletePuntoVentaMongo,
    addKilosMesMongo,
    getVentasPorZonaMongo
} from '@/lib/services/services/barfer/puntos-ventas/puntos-ventas';
import { CreatePuntoVentaData, UpdatePuntoVentaData } from '@/lib/services/types/barfer';

export async function getMayoristasAction(query: {
    pageIndex?: number;
    pageSize?: number;
    search?: string;
    zona?: string;
    activo?: boolean;
    sortBy?: string;
    sortDesc?: boolean;
}) {
    'use server';
    const result = await getPuntosVentaMongo(query);
    if (!result.success) {
        return { success: false, error: result.message, mayoristas: [], pageCount: 0, total: 0 };
    }
    return {
        success: true,
        mayoristas: result.data,
        pageCount: result.pageCount,
        total: result.total
    };
}

export async function getPuntoVentaByIdAction(id: string) {
    'use server';
    const result = await getPuntoVentaByIdMongo(id);
    if (!result.success) {
        return { success: false, error: result.message };
    }
    return { success: true, puntoVenta: result.puntoVenta };
}

export async function createPuntoVentaAction(data: CreatePuntoVentaData) {
    'use server';
    const result = await createPuntoVentaMongo(data);
    if (!result.success) {
        return { success: false, error: result.message };
    }
    return { success: true, puntoVenta: result.puntoVenta };
}

export async function updatePuntoVentaAction(id: string, data: UpdatePuntoVentaData) {
    'use server';
    const result = await updatePuntoVentaMongo(id, data);
    if (!result.success) {
        return { success: false, error: result.message };
    }
    return { success: true, puntoVenta: result.puntoVenta };
}

export async function deletePuntoVentaAction(id: string) {
    'use server';
    const result = await deletePuntoVentaMongo(id);
    if (!result.success) {
        return { success: false, error: result.message };
    }
    return { success: true };
}

export async function addKilosMesAction(
    id: string,
    mes: number,
    anio: number,
    kilos: number
) {
    'use server';
    const result = await addKilosMesMongo(id, mes, anio, kilos);
    if (!result.success) {
        return { success: false, error: result.message };
    }
    return { success: true };
}

export async function getVentasPorZonaAction() {
    'use server';
    const result = await getVentasPorZonaMongo();
    if (!result.success) {
        return { success: false, error: result.message };
    }
    return { success: true, data: result.data };
}

export async function getPuntosVentaStatsAction(from?: string, to?: string) {
    'use server';
    // Mantenemos como placeholder si no hay endpoint de stats generales aún
    return { success: false, error: 'Estadísticas no implementadas aún', stats: [] };
}

export async function getProductosMatrixAction(from?: string, to?: string) {
    'use server';
    // Mantenemos como placeholder si no hay endpoint de matriz aún
    return { success: false, error: 'Matriz de productos no implementada aún', matrix: [], productNames: [] };
}

