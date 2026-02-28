'use server';

interface ExportParams {
    search?: string;
    from?: string;
    to?: string;
    orderType?: string;
}

export async function exportOrdersAction({
    search = '',
    from = '',
    to = '',
    orderType = '',
}: ExportParams): Promise<{ success: boolean; data?: string; error?: string }> {
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
} 