import { getDictionary } from '@/config/i18n';
import { WhatsAppClientsViewServer } from './components/WhatsAppClientsViewServer';
import { PermissionGate } from '@/lib/auth/components/PermissionGate';
import { getClientsForWhatsapp } from '@/lib/services/services/barfer/users/users';

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

    const page = parseInt(pageParam || '1', 10);

    const dictionary = await getDictionary(locale);

    let clients: any[] = [];
    let paginationInfo = {
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        hasMore: false,
    };

    let error: string | null = null;
    try {
        const result = await getClientsForWhatsapp({ category, type, page, limit: 50 });
        if (result && result.clients) {
            clients = result.clients;
            paginationInfo = result.pagination;
        } else {
            error = 'La respuesta del servidor no tiene el formato esperado.';
            console.error('[WhatsAppPage] Invalid API result structure:', result);
        }
    } catch (err) {
        error = err instanceof Error ? err.message : 'Error desconocido al cargar clientes';
        console.error('[WhatsAppPage] Error fetching clients:', err);
    }

    const whatsappTemplates: any[] = [];

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
            {error && (
                <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    ⚠️ <strong>Error al cargar clientes:</strong> {error}
                </div>
            )}

            <WhatsAppClientsViewServer
                category={category}
                type={type}
                visibility={visibility}
                dictionary={dictionary}
                clients={clients}
                whatsappTemplates={whatsappTemplates}
                paginationInfo={paginationInfo}
            />
        </PermissionGate>
    );
}