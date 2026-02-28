'use client';

import { EmailClientsViewClient } from './EmailClientsViewClient';
import type { Dictionary } from '@/config/i18n';
import type { EmailTemplateData } from '@/lib/services';
// TODO: Migrar a backend API
type ClientForTableWithStatus = any;

// Test emails for development
const TEST_EMAILS = ['heredialucasfac22@gmail.com', 'nicolascaliari28@gmail.com'];

interface EmailClientsViewServerProps {
    category?: string;
    type?: string;
    visibility?: 'all' | 'hidden' | 'visible';
    dictionary: Dictionary;
    clients: ClientForTableWithStatus[];
    emailTemplates: EmailTemplateData[];
    paginationInfo?: {
        totalCount: number;
        totalPages: number;
        currentPage: number;
        hasMore: boolean;
    };
}

export function EmailClientsViewServer(props: EmailClientsViewServerProps) {
    return (
        <EmailClientsViewClient
            {...props}
        />
    );
} 