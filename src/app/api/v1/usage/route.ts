import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase';

export async function GET(req: NextRequest) {
    const orgId = req.headers.get('x-organization-id');

    // 1. Get usage meter
    const { data: meter } = await supabaseAdmin
        .from('usage_meters')
        .select('monthly_requests_count, last_reset_at')
        .eq('organization_id', orgId)
        .single();

    // 2. Get subscription & plan limits
    const { data: sub } = await supabaseAdmin
        .from('subscriptions')
        .select('plans(*)')
        .eq('organization_id', orgId)
        .single();

    // @ts-ignore
    const plan = sub?.plans || { name: 'Free', monthly_request_limit: 100 };
    const consumed = meter?.monthly_requests_count || 0;

    return NextResponse.json({
        success: true,
        data: {
            plan: {
                name: plan.name,
                limit: plan.monthly_request_limit
            },
            usage: {
                consumed,
                remaining: Math.max(0, plan.monthly_request_limit - consumed),
                percent: Math.min(100, (consumed / plan.monthly_request_limit) * 100),
                lastResetAt: meter?.last_reset_at
            }
        }
    });
}
