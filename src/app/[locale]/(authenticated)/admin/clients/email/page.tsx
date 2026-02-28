import { getDictionary } from '@/config/i18n';
import { EmailClientsViewServer } from './components/EmailClientsViewServer';
import { PermissionGate } from '@/lib/auth/components/PermissionGate';

// TODO: Migrar a backend API

interface EmailPageProps {
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

export default async function EmailPage({ params, searchParams }: EmailPageProps) {
    const { locale } = await params;
    const { category, type, visibility, page: pageParam } = await searchParams;

    const page = parseInt(pageParam || '1', 10);

    // TODO: Migrar a backend API
    const clients: any[] = [];
    const emailTemplates: any[] = [];

    const dictionary = await getDictionary(locale);

    return (
        <PermissionGate
            permission="clients:send_email"
            fallback={
                <div className="p-6 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground text-center">
                        No tienes permisos para enviar emails a clientes.
                    </p>
                </div>
            }
        >
            <EmailClientsViewServer
                category={category}
                type={type}
                visibility={visibility}
                dictionary={dictionary}
                clients={clients}
                emailTemplates={emailTemplates}
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