import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const orgId = req.headers.get('x-organization-id');

    if (!orgId) {
        return NextResponse.json({ error: 'Missing organization ID' }, { status: 400 });
    }

    // Multi-query for summary
    const [headlines, usage] = await Promise.all([
        supabaseAdmin.from('headlines').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).is('deleted_at', null),
        supabaseAdmin.from('usage_meters').select('monthly_requests_count').eq('organization_id', orgId).maybeSingle()
    ]);

    // Experiments table was dropped/restructured in latest migration, 
    // but if it exists we'd check it. For now keeping it robust.

    return NextResponse.json({
        success: true,
        data: {
            totalHeadlines: headlines.count || 0,
            activeExperiments: 0, // Placeholder for restructured experiments
            totalCreditsConsumed: usage.data?.monthly_requests_count || 0,
            period: 'current_month'
        }
    });
}
