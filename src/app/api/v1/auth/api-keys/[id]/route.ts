import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const orgId = req.headers.get('x-organization-id');
    if (!orgId) return NextResponse.json({ error: 'Org mapping failed' }, { status: 401 });

    try {
        const { error } = await supabaseAdmin
            .from('api_keys')
            .delete()
            .eq('id', params.id)
            .eq('organization_id', orgId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
