'use server'

// Obtener todos los datos de repartos
export async function getRepartosDataAction() {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', data: null };
}

// Guardar una semana completa
export async function saveRepartosWeekAction(weekKey: string, weekData: any) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', data: null };
}

// Actualizar una entrada específica
export async function updateRepartoEntryAction(
    weekKey: string,
    dayKey: string,
    rowIndex: number,
    entry: any
) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', data: null };
}

// Toggle completado de una entrada
export async function toggleRepartoCompletionAction(
    weekKey: string,
    dayKey: string,
    rowIndex: number
) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', data: null };
}

// Inicializar una semana vacía
export async function initializeWeekAction(weekKey: string) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', data: null };
}

// Limpiar semanas antiguas
export async function cleanupOldWeeksAction() {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', data: null };
}

// Agregar fila a un día
export async function addRowToDayAction(weekKey: string, dayKey: string) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', data: null };
}

// Eliminar fila de un día
export async function removeRowFromDayAction(weekKey: string, dayKey: string, rowIndex: number) {
    return { success: false, error: 'Servicio no disponible - migrando a backend API', data: null };
}
