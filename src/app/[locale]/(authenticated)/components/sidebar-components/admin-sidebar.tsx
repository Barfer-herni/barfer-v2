import { getAuthorizedSidebarItems, type SidebarItem } from '@/lib/auth/server-permissions';
import { AdminSidebarClient } from './admin-sidebar-client';
import { Dictionary } from '@/config/i18n';

type AdminSidebarProps = {
    dictionary: Dictionary;
};

export async function AdminSidebar({ dictionary }: AdminSidebarProps) {
    // Obtener elementos autorizados del servidor
    const authorizedItems = await getAuthorizedSidebarItems();

    return <AdminSidebarClient items={authorizedItems} dictionary={dictionary} />;
}

