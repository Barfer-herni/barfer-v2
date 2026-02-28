'use client';

import { WhatsAppClientsViewClient } from './WhatsAppClientsViewClient';
import type { Dictionary } from '@/config/i18n';
import type { WhatsAppTemplateData } from '@/lib/services';
// TODO: Migrar a backend API
type ClientForTableWithStatus = any;

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