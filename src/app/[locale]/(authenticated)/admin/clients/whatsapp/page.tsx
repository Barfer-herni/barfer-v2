import { getDictionary } from '@/config/i18n';
import { WhatsAppClientsViewServer } from './components/WhatsAppClientsViewServer';
import { PermissionGate } from '@/lib/auth/components/PermissionGate';

// TODO: Migrar a backend API

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

    // TODO: Migrar a backend API
    const clients: any[] = [];
    const whatsappTemplates: any[] = [];

    const dictionary = await getDictionary(locale);

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
                    totalCount: 0,
                    totalPages: 0,
                    currentPage: page,
                    hasMore: false
                }}
            />
        </PermissionGate>
    );
} 