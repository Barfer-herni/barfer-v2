'use server';

import { setUserBlackListed } from '@/lib/services/services/barfer/users/users';
import { revalidatePath } from 'next/cache';

export async function setUserBlackListedAction(
    email: string,
    blackListed: boolean,
    orderAddress?: {
        address?: string;
        city?: string;
        floorNumber?: string;
        departmentNumber?: string;
        betweenStreets?: string;
    },
) {
    if (!email?.trim()) {
        return { success: false, message: 'Email inválido' };
    }

    const result = await setUserBlackListed(email.trim(), blackListed, orderAddress);
    if (result.success) {
        revalidatePath('/admin/table');
        revalidatePath('/admin/lista-negra');
    }
    return result;
}
