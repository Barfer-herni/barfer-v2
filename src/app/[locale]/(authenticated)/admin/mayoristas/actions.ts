'use server';

export async function getMayoristasAction({
    pageIndex = 0,
    pageSize = 50,
    search = '',
    zona,
    activo = true,
    sortBy = 'nombre',
    sortDesc = false,
}: {
    pageIndex?: number;
    pageSize?: number;
    search?: string;
    zona?: string;
    activo?: boolean;
    sortBy?: string;
    sortDesc?: boolean;
}) {
    'use server';
    return { success: false, error: 'Servicio no disponible - migrando a backend API', mayoristas: [], pageCount: 0, total: 0 };
}

export async function getMayoristaByIdAction(id: string) {
    'use server';
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
}

export async function createMayoristaAction(data: any) {
    'use server';
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
}

export async function updateMayoristaAction(id: string, data: any) {
    'use server';
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
}

export async function deleteMayoristaAction(id: string) {
    'use server';
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
}

export async function addKilosMesAction(
    id: string,
    mes: number,
    anio: number,
    kilos: number
) {
    'use server';
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
}

export async function getVentasPorZonaAction() {
    'use server';
    return { success: false, error: 'Servicio no disponible - migrando a backend API' };
}

export async function getPuntosVentaStatsAction(from?: string, to?: string) {
    'use server';
    return { success: false, error: 'Servicio no disponible - migrando a backend API', stats: [] };
}

export async function getProductosMatrixAction(from?: string, to?: string) {
    'use server';
    return { success: false, error: 'Servicio no disponible - migrando a backend API', matrix: [], productNames: [] };
}
