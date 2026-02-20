import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase';
import { generateApiKey, hashApiKey } from '@/shared/utils/crypto';
import { z } from 'zod';

export const runtime = 'nodejs';

const createKeySchema = z.object({
    name: z.string().min(1).max(50),
    organizationId: z.string().uuid()
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, organizationId } = createKeySchema.parse(body);

        // 1. Check limit (max 3 keys)
        const { count, error: countError } = await supabaseAdmin
            .from('api_keys')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
            .is('deleted_at', null);

        if (countError) throw countError;
        if (count !== null && count >= 3) {
            return NextResponse.json(
                { success: false, error: { code: 'LIMIT_EXCEEDED', message: 'Maximum of 3 API keys allowed per organization' } },
                { status: 400 }
            );
        }

        // 2. Generate key
        const { key, prefix } = generateApiKey();
        const hash = await hashApiKey(key);

        const { error } = await supabaseAdmin
            .from('api_keys')
            .insert({
                organization_id: organizationId,
                name,
                key_hash: hash,
                prefix
            });

        if (error) throw error;

        // Key is only returned in full here, never again.
        return NextResponse.json({
            success: true,
            data: {
                key,
                prefix,
                name
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: { code: 'BAD_REQUEST', message: error.message } },
            { status: 400 }
        );
    }
}

export async function GET(req: NextRequest) {
    const orgId = req.headers.get('x-organization-id');
    if (!orgId) return NextResponse.json({ error: 'Org mapping failed' }, { status: 401 });

    const { data, error } = await supabaseAdmin
        .from('api_keys')
        .select('id, name, prefix, last_used_at, created_at')
        .eq('organization_id', orgId)
        .is('deleted_at', null);

    if (error) return NextResponse.json({ error }, { status: 500 });

    return NextResponse.json({ success: true, data });
}
