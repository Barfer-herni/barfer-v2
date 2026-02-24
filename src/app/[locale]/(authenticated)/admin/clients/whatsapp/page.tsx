import { getDictionary } from '@/config/i18n';
import { getClientsPaginatedWithStatus, getWhatsAppTemplates } from '@/lib/services';
import { getCurrentUser } from '@/lib/services/services/authService';
import { WhatsAppClientsViewServer } from './components/WhatsAppClientsViewServer';
import { PermissionGate } from '@/lib/auth/components/PermissionGate';

interface WhatsAppPageProps {
    params: Promise<{
        locale: string;
    }>;
    searchParams: Promise<{
        category?: string;
        type?: string;
        visibility?: 'all' | 'hidden' | 'visible';
        page?: string;
    }>;
}

export default async function WhatsAppPage({ params, searchParams }: WhatsAppPageProps) {
    const { locale } = await params;
    const { category, type, visibility, page: pageParam } = await searchParams;

    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Usuario no autenticado');
    }

    const page = parseInt(pageParam || '1', 10);

    const [dictionary, clientsResult, whatsappTemplates] = await Promise.all([
        getDictionary(locale),
        getClientsPaginatedWithStatus({
            category,
            type: type as 'behavior' | 'spending',
            visibility,
            page,
            pageSize: 50
        }),
        getWhatsAppTemplates(user.id || (user as any)._id)
    ]);

    // Extraer solo los clientes para mantener compatibilidad
    const clients = clientsResult.clients;

    return (
        <PermissionGate
            permission="clients:send_whatsapp"
            fallback={
                <div className="p-6 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground text-center">
                        No tienes permisos para enviar WhatsApp a clientes.
                    </p>
                </div>
            }
        >
            <WhatsAppClientsViewServer
                category={category}
                type={type}
                visibility={visibility}
                dictionary={dictionary}
                clients={clients}
                whatsappTemplates={whatsappTemplates}
                paginationInfo={{
                    totalCount: clientsResult.totalCount,
                    totalPages: clientsResult.totalPages,
                    currentPage: page,
                    hasMore: clientsResult.hasMore
                }}
            />
        </PermissionGate>
    );
} 