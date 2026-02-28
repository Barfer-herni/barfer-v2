import { NextResponse } from 'next/server';
import resend from '@/lib/email';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
    const now = new Date();
    console.log(`[Campaign Cron] Job started at ${format(now, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")} (UTC)`);

    if (!resend) {
        console.error('[Campaign Cron] Resend service not configured. Missing RESEND_TOKEN.');
        return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    try {
        // TODO: Campaign email logic disabled - migrando a backend API
        // getActiveScheduledEmailCampaigns, getClientsByCategory, getCollection, ObjectId removed
        console.log('[Campaign Cron] Email campaign processing disabled - migrando a backend API');

        // TODO: Stock rollover disabled - migrando a backend API
        // Previously imported from '@/lib/services/services/barfer/stockRolloverService'
        console.log('[Stock Cron] Stock rollover disabled - migrando a backend API');

        console.log('[Campaign Cron] Job finished successfully.');
        return NextResponse.json({ message: 'Cron job executed successfully.' });

    } catch (error: any) {
        console.error('[Campaign Cron] Unhandled error in cron job:', error);
        return NextResponse.json({
            error: error?.message || 'Unknown error'
        }, { status: 500 });
    }
}
