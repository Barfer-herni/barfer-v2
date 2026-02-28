'use server';

import { getCurrentUser } from '@/lib/auth/server';
import resend, { BulkEmailTemplate } from '@/lib/email';
import { revalidatePath } from 'next/cache';

// TODO: Migrar a backend API

interface ClientData {
    id: string;
    name: string;
    email: string;
}

export async function sendBulkEmailAction(
    subject: string,
    content: string,
    selectedClients: string[]
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        if (!resend) {
            return {
                success: false,
                error: 'Servicio de email no configurado. Configura RESEND_TOKEN en las variables de entorno.'
            };
        }

        if (!selectedClients || selectedClients.length === 0) {
            return {
                success: false,
                error: 'No se ha seleccionado ningún cliente.'
            };
        }

        // Para el plan gratuito de Resend y sin un dominio verificado,
        // es necesario usar el dominio `resend.dev`.
        const fromEmail = 'Barfer <ventas@barferalimento.com>';

        // 1. Construir los payloads para el envío por lotes
        const emailPayloads = selectedClients.map((client) => {
            return {
                from: fromEmail,
                to: [client],
                subject: subject,
                react: BulkEmailTemplate({
                    clientName: client,
                    content: content,
                }),
            }
        });

        // 2. Enviar el lote de emails con un solo llamado a la API
        const { data, error } = await resend.batch.send(emailPayloads);

        // 3. Manejar la respuesta del lote
        if (error) {
            return {
                success: false,
                error: `Error al enviar el lote: ${error.message}`,
            };
        }

        const successCount = data?.data.length ?? 0;

        return {
            success: successCount > 0,
            message: `${successCount} emails enviados exitosamente en un lote.`,
        };

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

export async function scheduleEmailCampaignAction(
    campaignName: string,
    scheduleCron: string,
    targetAudience: { type: 'behavior' | 'spending'; category: string },
    emailTemplateId: string
) {
    // TODO: Migrar a backend API
    return {
        success: false,
        error: 'Servicio no disponible - migrando a backend API',
        message: 'Servicio no disponible - migrando a backend API'
    };
}

export async function createEmailTemplateAction(
    name: string,
    subject: string,
    content: string,
    description?: string
) {
    "use server"
    // TODO: Migrar a backend API
    return {
        success: false,
        error: 'Servicio no disponible - migrando a backend API'
    };
}

export async function deleteEmailTemplateAction(templateId: string) {
    "use server"
    // TODO: Migrar a backend API
    return {
        success: false,
        error: 'Servicio no disponible - migrando a backend API'
    };
} 