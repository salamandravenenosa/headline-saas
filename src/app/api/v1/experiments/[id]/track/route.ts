import { NextRequest, NextResponse } from 'next/server';
import { ExperimentService } from '@/modules/experiments/experiments.service';
import { z } from 'zod';

const trackSchema = z.object({
    variationId: z.string().uuid(),
    type: z.enum(['impression', 'conversion'])
});

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const { variationId, type } = trackSchema.parse(body);

        await ExperimentService.track(params.id, variationId, type);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
