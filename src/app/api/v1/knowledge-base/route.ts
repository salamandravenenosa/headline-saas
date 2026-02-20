import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase';
import { z } from 'zod';

export const runtime = 'nodejs';

const kbSchema = z.object({
    content: z.string().min(1)
});

export async function GET(req: NextRequest) {
    const orgId = req.headers.get('x-organization-id');

    if (!orgId) return NextResponse.json({ error: 'Org mapping failed' }, { status: 401 });

    const { data, error } = await supabaseAdmin
        .from('knowledge_base_entries')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(req: NextRequest) {
    const orgId = req.headers.get('x-organization-id');

    try {
        const body = await req.json();
        const { content } = kbSchema.parse(body);

        const { data, error } = await supabaseAdmin
            .from('knowledge_base_entries')
            .insert({ organization_id: orgId, content })
            .select()
            .maybeSingle();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
