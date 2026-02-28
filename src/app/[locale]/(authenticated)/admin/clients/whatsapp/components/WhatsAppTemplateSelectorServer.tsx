'use server';

import { WhatsAppTemplateSelectorClient } from './WhatsAppTemplateSelectorClient';
import type { WhatsAppTemplateData } from '@/lib/services';

// TODO: Migrar a backend API

interface WhatsAppTemplateSelectorServerProps {
    templates: WhatsAppTemplateData[];
    onTemplateSelect: (content: string) => void;
    selectedContent?: string | null;
    onTemplateCreated?: () => void;
}

export async function WhatsAppTemplateSelectorServer(props: WhatsAppTemplateSelectorServerProps) {
    return (
        <WhatsAppTemplateSelectorClient
            {...props}
        />
    );
} 