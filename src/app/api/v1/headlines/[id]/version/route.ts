import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase';
import { calculateHeadlineScore } from '@/modules/headlines/score.engine';
import { z } from 'zod';

export const runtime = 'nodejs';

const versionSchema = z.object({
    content: z.string().min(1),
    label: z.string().optional()
});

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const orgId = req.headers.get('x-organization-id');

    try {
        const body = await req.json();
        const { content, label } = versionSchema.parse(body);

        // Verify headline belongs to organization
        const { data: headline } = await supabaseAdmin
            .from('headlines')
            .select('id')
            .eq('id', params.id)
            .eq('organization_id', orgId)
            .maybeSingle();

        if (!headline) {
            return NextResponse.json({ error: 'Headline not found' }, { status: 404 });
        }

        const { total, breakdown } = calculateHeadlineScore(content);

        const { data: version, error } = await supabaseAdmin
            .from('headline_versions')
            .insert({
                headline_id: params.id,
                content,
                version_label: label
            })
            .select()
            .maybeSingle();

        if (error || !version) throw error || new Error('Failed to create version');

        await supabaseAdmin
            .from('headline_scores')
            .insert({
                headline_version_id: version.id,
                total_score: total,
                breakdown
            });

        return NextResponse.json({
            success: true,
            data: {
                id: version.id,
                content,
                score: total
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
