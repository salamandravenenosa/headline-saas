import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase';
import { Subscription, UsageMeter, Plan } from '@/types';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const orgId = req.headers.get('x-organization-id');

    if (!orgId) {
        return NextResponse.json({ error: 'Missing organization ID' }, { status: 400 });
    }

    // 1. Get usage meter
    const { data: meter } = await supabaseAdmin
        .from('usage_meters')
        .select('monthly_requests_count, last_reset_at')
        .eq('organization_id', orgId)
        .maybeSingle() as { data: UsageMeter | null };

    // 2. Get subscription & plan limits
    const { data: sub } = await supabaseAdmin
        .from('subscriptions')
        .select('*, plans(*)')
        .eq('organization_id', orgId)
        .maybeSingle() as { data: (Subscription & { plans: Plan }) | null };

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
