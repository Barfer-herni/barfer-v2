'use server';

import { debugBigDogProducts } from '@/lib/services/services/barfer/analytics/getCategorySales';

export async function debugBigDogAction() {
    try {
        await debugBigDogProducts();
        return { success: true, message: 'Debug ejecutado. Revisa la consola del servidor.' };
    } catch (error) {
        console.error('Error ejecutando debug BIG DOG:', error);
        return { success: false, message: 'Error ejecutando debug' };
    }
} 