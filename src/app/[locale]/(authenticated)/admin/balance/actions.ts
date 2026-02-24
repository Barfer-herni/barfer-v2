'use server'

import { getBalanceMonthly } from '@/lib/services';

// Obtener balance mensual
export async function getBalanceMonthlyAction(startDate?: Date, endDate?: Date) {
    return await getBalanceMonthly(startDate, endDate);
} 