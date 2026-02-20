import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase';

export async function GET(req: NextRequest) {
    const orgId = req.headers.get('x-organization-id');

    // Multi-query for summary
    const [headlines, experiments, credits] = await Promise.all([
        supabaseAdmin.from('headlines').select('id', { count: 'exact' }).eq('organization_id', orgId),
        supabaseAdmin.from('experiments').select('id', { count: 'exact' }).eq('organization_id', orgId).eq('status', 'running'),
        supabaseAdmin.from('usage_credits').select('total_used').eq('organization_id', orgId).single()
    ]);

    return NextResponse.json({
        success: true,
        data: {
            totalHeadlines: headlines.count || 0,
            activeExperiments: experiments.count || 0,
            totalCreditsConsumed: credits.data?.total_used || 0,
            period: 'last_30_days'
        }
    });
}
