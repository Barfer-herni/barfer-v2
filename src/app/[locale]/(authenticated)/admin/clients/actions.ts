'use server';

import { getClientAnalytics } from '@/lib/services/services/barfer/users/users';

// TODO: Migrar a backend API

/**
 * Marca clientes como contactados por WhatsApp
 */
export async function markClientsAsWhatsAppContacted(clientEmails: string[]) {
    return {
        success: false,
        error: 'Servicio no disponible - migrando a backend API',
        message: 'Servicio no disponible - migrando a backend API'
    };
}

/**
 * Desmarca clientes como contactados por WhatsApp
 */
export async function unmarkClientsAsWhatsAppContacted(clientEmails: string[]) {
    return {
        success: false,
        error: 'Servicio no disponible - migrando a backend API',
        message: 'Servicio no disponible - migrando a backend API'
    };
}

/**
 * Obtiene el estado de contacto por WhatsApp para una lista de clientes
 */
export async function getClientsWhatsAppContactStatus(clientEmails: string[]) {
    return {
        success: false,
        error: 'Servicio no disponible - migrando a backend API',
        message: 'Servicio no disponible - migrando a backend API'
    };
}

/**
 * Oculta clientes seleccionados
 */
export async function hideSelectedClients(clientEmails: string[]) {
    return {
        success: false,
        error: 'Servicio no disponible - migrando a backend API',
        message: 'Servicio no disponible - migrando a backend API'
    };
}

/**
 * Muestra clientes ocultados
 */
export async function showSelectedClients(clientEmails: string[]) {
    return {
        success: false,
        error: 'Servicio no disponible - migrando a backend API',
        message: 'Servicio no disponible - migrando a backend API'
    };
}

/**
 * Obtiene el estado de visibilidad para una lista de clientes
 */
export async function getClientsVisibilityStatus(clientEmails: string[]) {
    return {
        success: false,
        error: 'Servicio no disponible - migrando a backend API',
        message: 'Servicio no disponible - migrando a backend API'
    };
}

/**
 * Obtiene las estadísticas analíticas de los clientes
 */
export async function getClientAnalyticsAction() {
    try {
        const result = await getClientAnalytics();
        return {
            success: true,
            data: result
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al obtener analytics'
        };
    }
}
