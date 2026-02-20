import { NextRequest, NextResponse } from 'next/server';
import { HeadlineService } from '@/modules/headlines/headlines.service';
import { z } from 'zod';

export const runtime = 'nodejs';

const generateSchema = z.object({
    niche: z.string().min(1),
    briefing: z.string().min(1),
    style: z.enum(['white', 'black']).default('white'),
});

export async function POST(req: NextRequest) {
    const orgId = req.headers.get('x-organization-id');
    const keyId = req.headers.get('x-api-key-id');

    if (!orgId) {
        return NextResponse.json({ error: 'Org mapping failed' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const payload = generateSchema.parse(body);

        const result = await HeadlineService.generate(orgId, keyId, payload);

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('[GENERATE_ERROR]', error);

        if (error.message === 'INSUFFICIENT_CREDITS' || error.message === 'LIMIT_EXCEEDED') {
            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient credits or limit reached' } },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: error.message } },
            { status: 500 }
        );
    }
}
