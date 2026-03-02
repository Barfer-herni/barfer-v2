'use server'

import { getBalanceMonthly } from '@/lib/services/services/barfer/balance/balance';

export async function getBalanceMonthlyAction(startDate?: Date, endDate?: Date) {
    try {
        const result = await getBalanceMonthly(startDate, endDate);
        console.log('[balance] result:', JSON.stringify(result).slice(0, 500));
        return { success: true as const, data: result.data || [] };
    } catch (error) {
        console.error('Error fetching balance monthly:', error);
        return { success: false as const, error: (error as Error).message, data: null };
    }
}
