'use client';

import { WhatsAppClientsViewClient } from './WhatsAppClientsViewClient';
import type { Dictionary } from '@/config/i18n';
import type { ClientForTableWithStatus } from '@/lib/services';
import type { WhatsAppTemplateData } from '@/lib/services';

interface WhatsAppClientsViewServerProps {
    category?: string;
    type?: string;
    visibility?: 'all' | 'hidden' | 'visible';
    dictionary: Dictionary;
    clients: ClientForTableWithStatus[];
    whatsappTemplates: WhatsAppTemplateData[];
    paginationInfo?: {
        totalCount: number;
        totalPages: number;
        currentPage: number;
        hasMore: boolean;
    };
}

export function WhatsAppClientsViewServer(props: WhatsAppClientsViewServerProps) {
    return (
        <WhatsAppClientsViewClient
            {...props}
        />
    );
} 