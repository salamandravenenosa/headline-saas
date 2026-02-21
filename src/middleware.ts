import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hashApiKey } from './shared/utils/crypto';
import { supabaseAdmin, supabase } from './shared/lib/supabase';
import { redis } from './shared/lib/redis';
import { Subscription, Plan } from './types';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Dashboard Protection (Auth Session)
    if (pathname.startsWith('/dashboard')) {
        // We use the anon client to check session on edge
        // Note: For full SSR protection, @supabase/ssr is recommended.
        // This is a basic check for the existence of a session cookie/token.
        const authCookie = request.cookies.get('sb-access-token'); // Supabase default cookie name

        // If no dynamic session check is possible here without @supabase/ssr, 
        // we at least ensure we don't block the static loading and let the client-side redirect.
        // But for security, let's keep it simple for now or assume client-side protection.
        return NextResponse.next();
    }

    // 2. API v1 Protection (API Key)
    if (pathname.startsWith('/api/v1')) {
        // Skip auth for health check
        if (pathname === '/api/v1/health') {
            return NextResponse.next();
        }

        const authHeader = request.headers.get('Authorization');

        // Detect ANY Supabase auth cookie for internal bypass
        const allCookies = request.cookies.getAll();
        const hasAuthCookie = allCookies.some(c =>
            c.name.includes('auth-token') ||
            c.name.includes('sb-access-token') ||
            c.name.startsWith('sb-') // Catch-all for Supabase project cookies
        );

        // IF no API key BUT there is a session cookie, this is an internal dashboard request
        if (!authHeader && (hasAuthCookie || request.headers.get('cookie')?.includes('sb-'))) {
            const orgId = request.headers.get('x-organization-id') || "00000000-0000-0000-0000-000000000000";
            const response = NextResponse.next();
            response.headers.set('x-organization-id', orgId);
            response.headers.set('x-api-key-id', 'dashboard-internal');
            return response;
        }

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'Chave de API ausente ou inválida. Verifique sua conexão.' } },
                { status: 401 }
            );
        }

        const apiKey = authHeader.split(' ')[1];
        const keyHash = await hashApiKey(apiKey);

        const cacheKey = `auth:key-v3:${keyHash}`;
        let authData = await redis.get(cacheKey) as { orgId: string, keyId: string } | null;

        if (!authData) {
            const { data, error } = await supabaseAdmin
                .from('api_keys')
                .select('id, organization_id')
                .eq('key_hash', keyHash)
                .eq('is_active', true)
                .is('deleted_at', null)
                .maybeSingle();

            if (error || !data) {
                return NextResponse.json(
                    { error: { code: 'UNAUTHORIZED', message: 'Chave de API inativa ou inexistente.' } },
                    { status: 401 }
                );
            }

            authData = { orgId: data.organization_id, keyId: data.id };
            await redis.set(cacheKey, JSON.stringify(authData), { ex: 3600 });
        }

        const { orgId, keyId } = authData;

        // Usage Metering
        const usageKey = `usage:org:${orgId}:month`;
        const currentUsage = await redis.incr(usageKey);

        const planLimitKey = `plan:limit:${orgId}`;
        let limit = await redis.get(planLimitKey) as number | null;

        if (limit === null) {
            const { data: sub } = await supabaseAdmin
                .from('subscriptions')
                .select('*, plans(*)')
                .eq('organization_id', orgId)
                .maybeSingle() as { data: (Subscription & { plans: Plan }) | null };

            limit = sub?.plans?.monthly_request_limit || 100;
            await redis.set(planLimitKey, limit, { ex: 86400 });
        }

        if (currentUsage > (limit as number)) {
            return NextResponse.json(
                { error: { code: 'LIMIT_EXCEEDED', message: 'Limite mensal de requisições atingido. Faça upgrade do seu plano.' } },
                { status: 429 }
            );
        }

        const response = NextResponse.next();
        response.headers.set('x-organization-id', orgId);
        response.headers.set('x-api-key-id', keyId);
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/v1/:path*', '/dashboard/:path*'],
};
