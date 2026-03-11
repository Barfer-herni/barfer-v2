import { getCurrentUserWithPermissions } from '@/lib/auth/server-permissions';
import { ClientCategoriesServer } from './ClientCategoriesServer';
import { getClientAnalyticsAction } from '../actions';
import type { Dictionary } from '@/config/i18n';

interface ClientCategoriesWrapperProps {
    dictionary: Dictionary;
}

/**
 * Server Component wrapper que obtiene las estadísticas de categorías
 * y las pasa al componente cliente interactivo
 */
export async function ClientCategoriesWrapper({ dictionary }: ClientCategoriesWrapperProps) {
    const result = await getClientAnalyticsAction();

    // Obtener permisos del usuario actual
    const userWithPermissions = await getCurrentUserWithPermissions();
    const isAdmin = userWithPermissions?.isAdmin ?? false;
    const canSendEmail = isAdmin || (userWithPermissions?.permissions.includes('clients:send_email') ?? false);
    const canSendWhatsApp = isAdmin || (userWithPermissions?.permissions.includes('clients:send_whatsapp') ?? false);

    if (!result.success || !result.data) {
        return null; // O mostrar un estado de error
    }

    return (
        <ClientCategoriesServer
            behaviorCategories={result.data.behaviorCategories}
            spendingCategories={result.data.spendingCategories}
            dictionary={dictionary}
            canSendEmail={canSendEmail}
            canSendWhatsApp={canSendWhatsApp}
        />
    );
}
