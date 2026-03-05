import 'server-only';
import { apiClient } from '@/lib/api';
import type { RepartosData, RepartosStats, WeekData, RepartoEntry } from '../../../types';

/**
 * Obtiene todos los datos de repartos.
 */
export async function getRepartosData(): Promise<RepartosData> {
    try {
        const response = await apiClient.get('/repartos');
        return response.data || {};
    } catch (error) {
        console.error('Error fetching repartos data:', error);
        return {};
    }
}

/**
 * Obtiene estadísticas de repartos.
 */
export async function getRepartosStats(): Promise<RepartosStats | null> {
    try {
        const response = await apiClient.get('/repartos/stats');
        return response.data || null;
    } catch (error) {
        console.error('Error fetching repartos stats:', error);
        return null;
    }
}

/**
 * Obtiene datos de repartos para una semana específica.
 */
export async function getRepartosByWeek(weekKey: string): Promise<WeekData | null> {
    try {
        const response = await apiClient.get(`/repartos/${weekKey}`);
        return response.data || null;
    } catch (error) {
        console.error(`Error fetching repartos for week ${weekKey}:`, error);
        return null;
    }
}

/**
 * Inicializa una semana de repartos.
 */
export async function initializeWeek(weekKey: string): Promise<boolean> {
    try {
        const response = await apiClient.post(`/repartos/initialize/${weekKey}`);
        return response.success;
    } catch (error) {
        console.error(`Error initializing week ${weekKey}:`, error);
        return false;
    }
}

/**
 * Guarda todos los datos de una semana de repartos.
 */
export async function saveRepartosWeek(weekKey: string, data: WeekData): Promise<boolean> {
    try {
        const response = await apiClient.post(`/repartos/${weekKey}`, { weekKey, data });
        return response.success;
    } catch (error) {
        console.error(`Error saving repartos for week ${weekKey}:`, error);
        return false;
    }
}

/**
 * Actualiza una entrada específica de reparto.
 */
export async function updateRepartoEntry(
    weekKey: string,
    dayKey: string,
    rowIndex: number,
    entry: Partial<RepartoEntry>
): Promise<boolean> {
    try {
        const response = await apiClient.put(`/repartos/${weekKey}/${dayKey}/${rowIndex}`, entry);
        return response.success;
    } catch (error) {
        console.error(`Error updating reparto entry ${weekKey}/${dayKey}/${rowIndex}:`, error);
        return false;
    }
}

/**
 * Cambia el estado de completado de una entrada de reparto.
 */
export async function toggleRepartoCompletion(
    weekKey: string,
    dayKey: string,
    rowIndex: number
): Promise<boolean> {
    try {
        const response = await apiClient.patch(`/repartos/toggle/${weekKey}/${dayKey}/${rowIndex}`);
        return response.success;
    } catch (error) {
        console.error(`Error toggling reparto completion ${weekKey}/${dayKey}/${rowIndex}:`, error);
        return false;
    }
}

/**
 * Agrega una nueva fila a un día específico.
 */
export async function addRowToDay(weekKey: string, dayKey: string): Promise<boolean> {
    try {
        const response = await apiClient.post(`/repartos/add-row/${weekKey}/${dayKey}`);
        return response.success;
    } catch (error) {
        console.error(`Error adding row to ${weekKey}/${dayKey}:`, error);
        return false;
    }
}

/**
 * Elimina una fila de un día específico.
 */
export async function removeRowFromDay(
    weekKey: string,
    dayKey: string,
    rowIndex: number
): Promise<boolean> {
    try {
        const response = await apiClient.delete(`/repartos/remove-row/${weekKey}/${dayKey}/${rowIndex}`);
        return response.success;
    } catch (error) {
        console.error(`Error removing row ${weekKey}/${dayKey}/${rowIndex}:`, error);
        return false;
    }
}

/**
 * Elimina todos los datos de una semana.
 */
export async function deleteRepartosWeek(weekKey: string): Promise<boolean> {
    try {
        const response = await apiClient.delete(`/repartos/${weekKey}`);
        return response.success;
    } catch (error) {
        console.error(`Error deleting repartos for week ${weekKey}:`, error);
        return false;
    }
}
