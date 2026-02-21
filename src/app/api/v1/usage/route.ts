import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase';
import { Subscription, UsageMeter, Plan } from '@/types';

export const runtime = 'nodejs';

import { isOrgAdmin } from '@/shared/lib/admin';

export async function GET(req: NextRequest) {
    const orgId = req.headers.get('x-organization-id');

    if (!orgId) {
        return NextResponse.json({ error: 'Missing organization ID' }, { status: 400 });
    }

    // Special case for mock org or if org doesn't exist yet but user is admin
    const isAdminOrg = await isOrgAdmin(orgId);

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

    let plan = sub?.plans || { name: 'Free', monthly_request_limit: 100 };

    // Override for Admins
    if (isAdminOrg) {
        plan = {
            name: 'Enterprise',
            monthly_request_limit: 999999,
        } as any;
    }

    const consumed = meter?.monthly_requests_count || 0;
    const limit = plan.monthly_request_limit;

    return NextResponse.json({
        success: true,
        data: {
            plan: {
                name: plan.name,
                limit: isAdminOrg ? 'Ilimitado' : limit
            },
            usage: {
                consumed,
                remaining: isAdminOrg ? 999999 : Math.max(0, limit - consumed),
                percent: isAdminOrg ? 0 : Math.min(100, (consumed / limit) * 100),
                lastResetAt: meter?.last_reset_at
            }
        }
    });
}
