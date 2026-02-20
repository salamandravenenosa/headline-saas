import { NextRequest, NextResponse } from 'next/server';
import { ExperimentService } from '@/modules/experiments/experiments.service';
import { z } from 'zod';

export const runtime = 'nodejs';

const experimentSchema = z.object({
    name: z.string().min(1),
    variations: z.array(z.object({
        headlineVersionId: z.string().uuid(),
        weight: z.number().min(0).max(1)
    }))
});

export async function POST(req: NextRequest) {
    const orgId = req.headers.get('x-organization-id');

    if (!orgId) return NextResponse.json({ error: 'Org mapping failed' }, { status: 401 });

    try {
        const body = await req.json();
        const { name, variations } = experimentSchema.parse(body);

        const data = await ExperimentService.create(orgId, name, variations);
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
