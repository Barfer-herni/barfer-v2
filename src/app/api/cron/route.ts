import { NextResponse } from 'next/server';
import resend from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
    if (!resend) {
        return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }
    try {
        return NextResponse.json({ message: 'Cron job executed successfully.' });
    } catch (error: any) {
        return NextResponse.json({
            error: error?.message || 'Unknown error'
        }, { status: 500 });
    }
}
