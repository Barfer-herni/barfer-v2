import { getCurrentUserWithPermissions } from '@/lib/auth/server-permissions';
import { ClientCategoriesServer } from './ClientCategoriesServer';
import type { Dictionary } from '@/config/i18n';

// TODO: Migrar a backend API

interface ClientCategoriesWrapperProps {
    dictionary: Dictionary;
}

/**
 * Server Component wrapper que obtiene las estadísticas de categorías
 * y las pasa al componente cliente interactivo
 * Actualmente devuelve datos vacíos - migrando a backend API
 */
export async function ClientCategoriesWrapper({ dictionary }: ClientCategoriesWrapperProps) {
    // TODO: Migrar a backend API
    const behaviorCategories: never[] = [];
    const spendingCategories: never[] = [];

    // Obtener permisos del usuario actual
    const userWithPermissions = await getCurrentUserWithPermissions();
    const canSendEmail = userWithPermissions?.permissions.includes('clients:send_email') ?? false;
    const canSendWhatsApp = userWithPermissions?.permissions.includes('clients:send_whatsapp') ?? false;

    return (
        <ClientCategoriesServer
            behaviorCategories={behaviorCategories}
            spendingCategories={spendingCategories}
            dictionary={dictionary}
            canSendEmail={canSendEmail}
            canSendWhatsApp={canSendWhatsApp}
        />
    );
} 