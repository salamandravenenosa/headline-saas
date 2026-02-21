import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase';
import { isAdmin } from '@/shared/lib/admin';

export const runtime = 'nodejs';

async function checkAdmin(req: NextRequest) {
    const userEmail = req.headers.get('x-admin-email');
    if (!isAdmin(userEmail)) return false;
    return true;
}

export async function GET(
    req: NextRequest,
    { params }: { params: { table: string } }
) {
    if (!await checkAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { table } = params;

    try {
        const { data, error } = await supabaseAdmin
            .from(table)
            .select('*')
            .limit(100);

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
