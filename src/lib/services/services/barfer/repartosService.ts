import 'server-only';
import { apiClient } from '@/lib/api';
import { getCollection } from '@/lib/database';
import type { RepartoEntry, WeekData, RepartosData } from '../../types/repartos';

/**
 * Obtiene todos los datos de repartos
 */
export async function getRepartosData(): Promise<RepartosData> {
    try {
        const result = await apiClient.get<RepartosData>('/repartos');
        return result || {};
    } catch (error) {
        return {};
    }
}

/**
 * Obtiene los datos de repartos para una semana especifica
 */
export async function getRepartosByWeek(weekKey: string): Promise<WeekData | null> {
    try {
        const result = await apiClient.get<WeekData>(`/repartos/${weekKey}`);
        return result || null;
    } catch (error) {
        return null;
    }
}

/**
 * Guarda o actualiza los datos de repartos para una semana especifica
 */
export async function saveRepartosWeek(weekKey: string, weekData: WeekData): Promise<boolean> {
    try {
        await apiClient.post(`/repartos/${weekKey}`, weekData);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Actualiza una entrada especifica de repartos
 */
export async function updateRepartoEntry(
    weekKey: string,
    dayKey: string,
    rowIndex: number,
    entry: Partial<RepartoEntry>
): Promise<boolean> {
    try {
        await apiClient.put(`/repartos/${weekKey}/${dayKey}/${rowIndex}`, entry);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Marca una entrada como completada
 */
export async function toggleRepartoCompletion(
    weekKey: string,
    dayKey: string,
    rowIndex: number
): Promise<boolean> {
    try {
        await apiClient.patch(`/repartos/toggle/${weekKey}/${dayKey}/${rowIndex}`);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Elimina una semana completa de repartos
 */
export async function deleteRepartosWeek(weekKey: string): Promise<boolean> {
    try {
        await apiClient.delete(`/repartos/${weekKey}`);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Obtiene estadisticas de repartos
 */
export async function getRepartosStats(): Promise<{
    totalWeeks: number;
    completedEntries: number;
    totalEntries: number;
    completionRate: number;
}> {
    try {
        const result = await apiClient.get('/repartos/stats');
        return result || {
            totalWeeks: 0,
            completedEntries: 0,
            totalEntries: 0,
            completionRate: 0,
        };
    } catch (error) {
        return {
            totalWeeks: 0,
            completedEntries: 0,
            totalEntries: 0,
            completionRate: 0,
        };
    }
}

/**
 * Inicializa una semana con datos vacios
 */
export async function initializeWeek(weekKey: string): Promise<boolean> {
    try {
        await apiClient.post(`/repartos/initialize/${weekKey}`);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Agrega una fila adicional a un dia especifico
 */
export async function addRowToDay(weekKey: string, dayKey: string): Promise<boolean> {
    try {
        await apiClient.post(`/repartos/add-row/${weekKey}/${dayKey}`);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Elimina una fila especifica de un dia
 */
export async function removeRowFromDay(weekKey: string, dayKey: string, rowIndex: number): Promise<boolean> {
    try {
        await apiClient.delete(`/repartos/remove-row/${weekKey}/${dayKey}/${rowIndex}`);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Limpia semanas muy antiguas (mas de 6 meses) - MongoDB directo
 */
export async function cleanupOldWeeks(): Promise<number> {
    try {
        const collection = await getCollection('repartos');

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const result = await collection.deleteMany({
            weekKey: {
                $lt: sixMonthsAgo.toISOString().split('T')[0]
            }
        });

        return result.deletedCount;
    } catch (error) {
        return 0;
    }
}

/**
 * Limpia documentos duplicados - MongoDB directo
 */
export async function cleanupDuplicateWeeks(): Promise<number> {
    try {
        const collection = await getCollection('repartos');

        const allWeeks = await collection.find({}).sort({ updatedAt: -1 }).toArray();

        const weekKeyMap = new Map<string, any>();
        const duplicatesToDelete: any[] = [];

        allWeeks.forEach(week => {
            if (!week.weekKey) return;

            if (!weekKeyMap.has(week.weekKey)) {
                weekKeyMap.set(week.weekKey, week);
            } else {
                duplicatesToDelete.push(week._id);
            }
        });

        if (duplicatesToDelete.length === 0) {
            return 0;
        }

        const result = await collection.deleteMany({
            _id: { $in: duplicatesToDelete }
        });

        return result.deletedCount;
    } catch (error) {
        return 0;
    }
}

// ===== API FUNCTIONS =====

export async function apiGetRepartosData() {
    try {
        const data = await getRepartosData();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed to get repartos data' };
    }
}

export async function apiSaveRepartosWeek(weekKey: string, weekData: WeekData) {
    try {
        if (!weekKey || !weekData) {
            return { success: false, error: 'Missing weekKey or weekData' };
        }

        const saved = await saveRepartosWeek(weekKey, weekData);
        if (saved) {
            return { success: true, message: 'Week saved successfully' };
        } else {
            return { success: false, error: 'Failed to save week' };
        }
    } catch (error) {
        return { success: false, error: 'Internal server error' };
    }
}

export async function apiInitializeWeek(weekKey: string) {
    try {
        if (!weekKey) {
            return { success: false, error: 'Missing weekKey' };
        }

        const initialized = await initializeWeek(weekKey);
        if (initialized) {
            return { success: true, message: 'Week initialized successfully' };
        } else {
            return { success: false, error: 'Failed to initialize week' };
        }
    } catch (error) {
        return { success: false, error: 'Internal server error' };
    }
}

export async function apiUpdateRepartoEntry(
    weekKey: string,
    dayKey: string,
    rowIndex: number,
    entry: Partial<RepartoEntry>
) {
    try {
        if (!weekKey || !dayKey || rowIndex === undefined || !entry) {
            return { success: false, error: 'Missing required fields' };
        }

        const updated = await updateRepartoEntry(weekKey, dayKey, rowIndex, entry);

        if (updated) {
            return { success: true, message: 'Entry updated successfully' };
        } else {
            return { success: false, error: 'Failed to update entry' };
        }
    } catch (error) {
        return { success: false, error: 'Internal server error' };
    }
}

export async function apiToggleRepartoCompletion(
    weekKey: string,
    dayKey: string,
    rowIndex: number
) {
    try {
        if (!weekKey || !dayKey || rowIndex === undefined) {
            return { success: false, error: 'Missing required fields' };
        }

        const toggled = await toggleRepartoCompletion(weekKey, dayKey, rowIndex);

        if (toggled) {
            return { success: true, message: 'Completion status toggled successfully' };
        } else {
            return { success: false, error: 'Failed to toggle completion status' };
        }
    } catch (error) {
        return { success: false, error: 'Internal server error' };
    }
}
