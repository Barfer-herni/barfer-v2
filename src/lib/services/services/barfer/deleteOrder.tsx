import 'server-only';
import { apiClient } from '@/lib/api';

export async function deleteOrder(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await apiClient.delete(`/orders/${id}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Internal server error' };
    }
}
