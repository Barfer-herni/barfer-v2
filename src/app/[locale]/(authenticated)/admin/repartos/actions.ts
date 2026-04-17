'use server'

import { revalidateTag } from 'next/cache';
import * as repartosService from '@/lib/services/services/barfer/repartos/repartos';

// Obtener todos los datos de repartos
export async function getRepartosDataAction() {
    try {
        const data = await repartosService.getRepartosData();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Error al obtener datos de repartos', data: null };
    }
}

// Guardar una semana completa
export async function saveRepartosWeekAction(weekKey: string, weekData: any) {
    try {
        const success = await repartosService.saveRepartosWeek(weekKey, weekData);
        if (success) revalidateTag('repartos');
        return { success };
    } catch (error) {
        return { success: false, error: 'Error al guardar la semana' };
    }
}

// Actualizar una entrada específica
export async function updateRepartoEntryAction(
    weekKey: string,
    dayKey: string,
    rowIndex: number,
    entry: any
) {
    try {
        const success = await repartosService.updateRepartoEntry(weekKey, dayKey, rowIndex, entry);
        if (success) revalidateTag('repartos');
        return { success };
    } catch (error) {
        return { success: false, error: 'Error al actualizar la entrada' };
    }
}

// Toggle completado de una entrada
export async function toggleRepartoCompletionAction(
    weekKey: string,
    dayKey: string,
    rowIndex: number
) {
    try {
        const success = await repartosService.toggleRepartoCompletion(weekKey, dayKey, rowIndex);
        if (success) revalidateTag('repartos');
        return { success };
    } catch (error) {
        return { success: false, error: 'Error al cambiar estado de completado' };
    }
}

// Inicializar una semana vacía
export async function initializeWeekAction(weekKey: string) {
    try {
        const success = await repartosService.initializeWeek(weekKey);
        if (success) revalidateTag('repartos');
        return { success };
    } catch (error) {
        return { success: false, error: 'Error al inicializar la semana' };
    }
}

// Limpiar semanas antiguas
export async function cleanupOldWeeksAction() {
    // Esta funcionalidad no parece estar en el controlador del backend actualmente
    // Podríamos implementarla si es necesario, o dejarla como no disponible por ahora
    return { success: false, error: 'Funcionalidad no disponible en el backend' };
}

// Agregar fila a un día
export async function addRowToDayAction(weekKey: string, dayKey: string) {
    try {
        const success = await repartosService.addRowToDay(weekKey, dayKey);
        if (success) revalidateTag('repartos');
        return { success };
    } catch (error) {
        return { success: false, error: 'Error al agregar fila' };
    }
}

// Eliminar fila de un día
export async function removeRowFromDayAction(weekKey: string, dayKey: string, rowIndex: number) {
    try {
        const success = await repartosService.removeRowFromDay(weekKey, dayKey, rowIndex);
        if (success) revalidateTag('repartos');
        return { success };
    } catch (error) {
        return { success: false, error: 'Error al eliminar fila' };
    }
}
