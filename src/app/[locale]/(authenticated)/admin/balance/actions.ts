'use server'

// Obtener balance mensual
export async function getBalanceMonthlyAction(startDate?: Date, endDate?: Date) {
    return { success: false as const, error: 'Servicio no disponible - migrando a backend API', data: null };
}
