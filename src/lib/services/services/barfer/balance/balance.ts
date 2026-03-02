import { apiClient } from '@/lib/api';

export async function getBalanceMonthly(startDate?: Date, endDate?: Date) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get(`/orders/balance-monthly${query}`);
}
