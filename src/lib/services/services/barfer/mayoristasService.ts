'use server';

import { apiClient } from '@/lib/api';
import { getCollection, ObjectId } from '@/lib/database';

export type MayoristaZona = 'CABA' | 'LA_PLATA' | 'OESTE' | 'NOROESTE' | 'NORTE' | 'SUR';
export type MayoristaFrecuencia = 'SEMANAL' | 'QUINCENAL' | 'MENSUAL' | 'OCASIONAL';
export type MayoristaTipoNegocio = 'PET_SHOP' | 'VETERINARIA' | 'PELUQUERIA';

export interface Mayorista {
    _id?: string;
    nombre: string;
    zona: MayoristaZona;
    frecuencia: MayoristaFrecuencia;
    fechaInicioVentas: Date | string;
    fechaPrimerPedido?: Date | string;
    fechaUltimoPedido?: Date | string;
    tieneFreezer: boolean;
    cantidadFreezers?: number;
    capacidadFreezer?: number;
    tiposNegocio: MayoristaTipoNegocio[];
    horarios?: string;
    kilosPorMes: Array<{
        mes: number;
        anio: number;
        kilos: number;
    }>;
    contacto?: {
        telefono?: string;
        email?: string;
        direccion?: string;
    };
    notas?: string;
    activo: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface MayoristaCreateInput {
    nombre: string;
    zona: MayoristaZona;
    frecuencia: MayoristaFrecuencia;
    fechaInicioVentas: Date | string;
    fechaPrimerPedido?: Date | string;
    fechaUltimoPedido?: Date | string;
    tieneFreezer: boolean;
    cantidadFreezers?: number;
    capacidadFreezer?: number;
    tiposNegocio: MayoristaTipoNegocio[];
    horarios?: string;
    contacto?: {
        telefono?: string;
        email?: string;
        direccion?: string;
    };
    notas?: string;
}

export interface MayoristaUpdateInput extends Partial<MayoristaCreateInput> {
    activo?: boolean;
}

/**
 * Obtener todos los mayoristas con paginacion y filtros
 */
export async function getMayoristas({
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
    zona?: MayoristaZona;
    activo?: boolean;
    sortBy?: string;
    sortDesc?: boolean;
}): Promise<{
    success: boolean;
    mayoristas?: Mayorista[];
    total?: number;
    pageCount?: number;
    error?: string;
}> {
    try {
        const params = new URLSearchParams();
        params.set('pageIndex', String(pageIndex));
        params.set('pageSize', String(pageSize));
        if (search) params.set('search', search);
        if (zona) params.set('zona', zona);
        if (!activo) params.set('activo', 'false');
        params.set('sortBy', sortBy);
        if (sortDesc) params.set('sortDesc', 'true');

        const result = await apiClient.get(`/puntos-venta?${params.toString()}`);
        return {
            success: true,
            mayoristas: result.mayoristas || result.data || result || [],
            total: result.total || 0,
            pageCount: result.pageCount || 0,
        };
    } catch (error) {
        return {
            success: false,
            error: 'Error al obtener los mayoristas',
        };
    }
}

/**
 * Obtener un mayorista por ID
 */
export async function getMayoristaById(
    id: string
): Promise<{
    success: boolean;
    mayorista?: Mayorista;
    error?: string;
}> {
    try {
        const result = await apiClient.get(`/puntos-venta/${id}`);
        return {
            success: true,
            mayorista: result.mayorista || result,
        };
    } catch (error) {
        return {
            success: false,
            error: 'Error al obtener el mayorista',
        };
    }
}

/**
 * Crear un nuevo mayorista
 */
export async function createMayorista(
    data: MayoristaCreateInput
): Promise<{
    success: boolean;
    mayorista?: Mayorista;
    error?: string;
}> {
    try {
        const result = await apiClient.post('/puntos-venta', data);
        return {
            success: true,
            mayorista: result.mayorista || result,
        };
    } catch (error) {
        return {
            success: false,
            error: 'Error al crear el mayorista',
        };
    }
}

/**
 * Actualizar un mayorista
 */
export async function updateMayorista(
    id: string,
    data: MayoristaUpdateInput
): Promise<{
    success: boolean;
    mayorista?: Mayorista;
    error?: string;
}> {
    try {
        const result = await apiClient.patch(`/puntos-venta/${id}`, data);
        return {
            success: true,
            mayorista: result.mayorista || result,
        };
    } catch (error) {
        return {
            success: false,
            error: 'Error al actualizar el mayorista',
        };
    }
}

/**
 * Eliminar (desactivar) un mayorista
 */
export async function deleteMayorista(
    id: string
): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        await apiClient.delete(`/puntos-venta/${id}`);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: 'Error al eliminar el mayorista',
        };
    }
}

/**
 * Agregar registro de kilos vendidos en un mes - MongoDB directo (sin endpoint)
 */
export async function addKilosMes(
    id: string,
    mes: number,
    anio: number,
    kilos: number
): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const mayoristasCollection = await getCollection('puntos_venta');

        const mayorista = await mayoristasCollection.findOne({ _id: new ObjectId(id) });

        if (!mayorista) {
            return {
                success: false,
                error: 'Mayorista no encontrado',
            };
        }

        const existingIndex = mayorista.kilosPorMes?.findIndex(
            (k: any) => k.mes === mes && k.anio === anio
        ) ?? -1;

        if (existingIndex >= 0) {
            await mayoristasCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        [`kilosPorMes.${existingIndex}.kilos`]: kilos,
                        updatedAt: new Date(),
                    },
                }
            );
        } else {
            await mayoristasCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $push: {
                        kilosPorMes: { mes, anio, kilos },
                    } as any,
                    $set: {
                        updatedAt: new Date(),
                    },
                }
            );
        }

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: 'Error al agregar los kilos del mes',
        };
    }
}

/**
 * Buscar puntos de venta para autocompletar ordenes
 */
export async function searchPuntosVenta(
    searchTerm: string
): Promise<{
    success: boolean;
    puntosVenta?: Mayorista[];
    error?: string;
}> {
    try {
        if (!searchTerm || searchTerm.trim().length < 2) {
            return { success: true, puntosVenta: [] };
        }

        const result = await apiClient.get(`/mayoristas/search?q=${encodeURIComponent(searchTerm)}`);
        return {
            success: true,
            puntosVenta: result.puntosVenta || result.data || result || [],
        };
    } catch (error) {
        return {
            success: false,
            error: 'Error al buscar puntos de venta',
        };
    }
}

/**
 * Obtener estadisticas de ventas por zona - MongoDB directo (sin endpoint)
 */
export async function getVentasPorZona(): Promise<{
    success: boolean;
    data?: Array<{
        zona: MayoristaZona;
        totalMayoristas: number;
        totalKilosUltimoMes: number;
    }>;
    error?: string;
}> {
    try {
        const mayoristasCollection = await getCollection('puntos_venta');

        const now = new Date();
        const mesActual = now.getMonth() + 1;
        const anioActual = now.getFullYear();

        const result = await mayoristasCollection
            .aggregate([
                { $match: { activo: true } },
                {
                    $project: {
                        zona: 1,
                        kilosUltimoMes: {
                            $filter: {
                                input: '$kilosPorMes',
                                as: 'kilo',
                                cond: {
                                    $and: [
                                        { $eq: ['$$kilo.mes', mesActual] },
                                        { $eq: ['$$kilo.anio', anioActual] },
                                    ],
                                },
                            },
                        },
                    },
                },
                {
                    $group: {
                        _id: '$zona',
                        totalMayoristas: { $sum: 1 },
                        totalKilosUltimoMes: {
                            $sum: {
                                $sum: '$kilosUltimoMes.kilos',
                            },
                        },
                    },
                },
                {
                    $project: {
                        zona: '$_id',
                        totalMayoristas: 1,
                        totalKilosUltimoMes: 1,
                        _id: 0,
                    },
                },
            ])
            .toArray();

        return {
            success: true,
            data: result as any,
        };
    } catch (error) {
        return {
            success: false,
            error: 'Error al obtener las ventas por zona',
        };
    }
}
