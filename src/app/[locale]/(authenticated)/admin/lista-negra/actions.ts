'use server';

import { getBlacklistedUsers, setUserBlackListed } from '@/lib/services/services/barfer/users/users';
import { revalidatePath } from 'next/cache';

export async function getBlacklistedUsersAction(params?: {
    page?: number;
    limit?: number;
    search?: string;
}) {
    try {
        return await getBlacklistedUsers(params);
    } catch (error) {
        console.error('Error fetching blacklisted users:', error);
        return {
            users: [],
            total: 0,
            page: 1,
            totalPages: 1,
        };
    }
}

export async function removeFromBlacklistAction(email: string) {
    const result = await setUserBlackListed(email, false);
    if (result.success) {
        revalidatePath('/admin/lista-negra');
        revalidatePath('/admin/table');
    }
    return result;
}
