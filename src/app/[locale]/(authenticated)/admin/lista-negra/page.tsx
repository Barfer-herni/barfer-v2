import { getDictionary } from '@/config/i18n';
import type { Locale } from '@/config/i18n';
import { PermissionGate } from '@/lib/auth/components/PermissionGate';
import { getCurrentUserWithPermissions } from '@/lib/auth/server-permissions';
import { getBlacklistedUsersAction } from './actions';
import { BlacklistedUsersTable } from './components/BlacklistedUsersTable';

export default async function ListaNegraPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: Locale }>;
    searchParams: Promise<{ page?: string; search?: string }>;
}) {
    const { locale } = await params;
    const { page: pageParam, search } = await searchParams;
    const page = Math.max(1, parseInt(pageParam || '1', 10));
    const dictionary = await getDictionary(locale);

    const userWithPermissions = await getCurrentUserWithPermissions();
    const isAdmin = userWithPermissions?.isAdmin || false;
    const canEdit = isAdmin || userWithPermissions?.permissions.includes('table:edit') || false;

    const { users, total, totalPages } = await getBlacklistedUsersAction({
        page,
        limit: 50,
        search: search?.trim() || undefined,
    });

    const nav = dictionary.app.admin.navigation as Record<string, string>;

    return (
        <PermissionGate
            permission="table:view"
            fallback={
                <div className="p-6 m-4 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground text-center">
                        No tienes permisos para ver la lista negra.
                    </p>
                </div>
            }
        >
            <div className="space-y-6 p-4 sm:p-6">
                <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        {nav.blacklist ?? 'Lista negra'}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Clientes marcados como posibles estafadores. Las órdenes con la misma dirección (o muy similar) se resaltan en rojo en la tabla de pedidos, aunque usen otro email.
                    </p>
                </div>

                <BlacklistedUsersTable
                    users={users}
                    total={total}
                    page={page}
                    totalPages={totalPages}
                    search={search?.trim() || ''}
                    canEdit={canEdit}
                    locale={locale}
                />
            </div>
        </PermissionGate>
    );
}
