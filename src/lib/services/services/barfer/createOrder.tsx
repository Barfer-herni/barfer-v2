import 'server-only';
import { apiClient } from '@/lib/api';
import type { Order } from '../../types/barfer';

export async function createOrder(data: any): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
        const result = await apiClient.post('/orders', data);

        if (result.success === false) {
            return { success: false, error: result.error || result.message || 'Failed to create order' };
        }

        return {
            success: true,
            order: result.order || result,
        };
    } catch (error) {
        if (error instanceof Error && error.message.includes('Validation error')) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Internal server error' };
    }
}
