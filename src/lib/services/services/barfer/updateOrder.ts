import 'server-only';
import { apiClient } from '@/lib/api';
import { getCollection, ObjectId } from '@/lib/database';

export async function updateOrder(id: string, data: any) {
    try {
        const result = await apiClient.patch(`/orders/${id}`, data);
        return result;
    } catch (error) {
        throw new Error('Order not found or update failed');
    }
}

export async function updateOrdersStatusBulk(ids: string[], status: string) {
    const collection = await getCollection('orders');
    const objectIds = ids.map(id => new ObjectId(id));
    const result = await collection.updateMany(
        { _id: { $in: objectIds } },
        { $set: { status, updatedAt: new Date() } }
    );
    return { success: true, modifiedCount: result.modifiedCount };
}
