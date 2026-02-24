import { getClientCategoriesStats } from '@/lib/services';
import { getCurrentUserWithPermissions } from '@/lib/auth/server-permissions';
import { ClientCategoriesServer } from './ClientCategoriesServer';
import type { Dictionary } from '@/config/i18n';

interface ClientCategoriesWrapperProps {
    dictionary: Dictionary;
}

/**
 * Server Component wrapper que obtiene las estadísticas de categorías
 * y las pasa al componente cliente interactivo
 */
export async function ClientCategoriesWrapper({ dictionary }: ClientCategoriesWrapperProps) {
    const { behaviorCategories, spendingCategories } = await getClientCategoriesStats();

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