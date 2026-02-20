import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase';
import { z } from 'zod';

const kbSchema = z.object({
    content: z.string().min(1)
});

export async function GET(req: NextRequest) {
    const orgId = req.headers.get('x-organization-id');

    const { data, error } = await supabaseAdmin
        .from('knowledge_base_entries')
        .select('*')
        .eq('organization_id', orgId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ success: true, data });
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
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
