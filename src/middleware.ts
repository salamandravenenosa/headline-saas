import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hashApiKey } from './shared/utils/crypto';
import { supabaseAdmin } from './shared/lib/supabase';
import { redis } from './shared/lib/redis';
import { Subscription, Plan } from './types';

export async function middleware(request: NextRequest) {
    // Only apply to API v1 routes
    if (!request.nextUrl.pathname.startsWith('/api/v1')) {
        return NextResponse.next();
    }

    // Skip auth for routes that don't need it (if any)
    if (request.nextUrl.pathname === '/api/v1/health') {
        return NextResponse.next();
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: { code: 'UNAUTHORIZED', message: 'Missing or invalid API key' } },
            { status: 401 }
        );
    }

    const apiKey = authHeader.split(' ')[1];
    const keyHash = await hashApiKey(apiKey); // Fixed: Added await

    // 1. Authenticate & Tenant Lookup (Cache-first)
    const cacheKey = `auth:key-v3:${keyHash}`;
    let authData = await redis.get(cacheKey) as { orgId: string, keyId: string } | null;

    if (!authData) {
        const { data, error } = await supabaseAdmin
            .from('api_keys')
            .select('id, organization_id')
            .eq('key_hash', keyHash)
            .eq('is_active', true)
            .is('deleted_at', null)
            .maybeSingle(); // Fixed: Use maybeSingle for better error handling

        if (error || !data) {
            return NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'Invalid or inactive API key' } },
                { status: 401 }
            );
        }

        authData = { orgId: data.organization_id, keyId: data.id };
        await redis.set(cacheKey, JSON.stringify(authData), { ex: 3600 });
    }

    const { orgId, keyId } = authData;

    // 2. Usage Metering & Limit Check (Optimized with Redis)
    const usageKey = `usage:org:${orgId}:month`;
    const currentUsage = await redis.incr(usageKey);

    // Check plan limits (fetch plan from cache or DB)
    const planLimitKey = `plan:limit:${orgId}`;
    let limit = await redis.get(planLimitKey) as number | null;

    if (limit === null) {
        const { data: sub } = await supabaseAdmin
            .from('subscriptions')
            .select('*, plans(*)')
            .eq('organization_id', orgId)
            .maybeSingle() as { data: (Subscription & { plans: Plan }) | null };

        limit = sub?.plans?.monthly_request_limit || 100; // Default Free
        await redis.set(planLimitKey, limit, { ex: 86400 });
    }

    if (currentUsage > (limit as number)) {
        return NextResponse.json(
            { error: { code: 'LIMIT_EXCEEDED', message: 'Monthly request limit reached' } },
            { status: 429 }
        );
    }

    // 3. Inject Context
    const response = NextResponse.next();
    response.headers.set('x-organization-id', orgId);
    response.headers.set('x-api-key-id', keyId);

    return response;
}

export const config = {
    matcher: '/api/v1/:path*',
};
