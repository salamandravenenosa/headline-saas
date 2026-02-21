import { NextRequest, NextResponse } from 'next/server';
import { HeadlineService } from '@/modules/headlines/headlines.service';
import { z } from 'zod';

export const runtime = 'nodejs';

const generateSchema = z.object({
    niche: z.string().min(1),
    briefing: z.string().min(1),
    style: z.enum(['white', 'black']).default('white'),
});

import { isOrgAdmin } from '@/shared/lib/admin';

export async function POST(req: NextRequest) {
    const orgId = req.headers.get('x-organization-id');
    const keyId = req.headers.get('x-api-key-id');

    if (!orgId) {
        return NextResponse.json({ error: 'Mapeamento de organização falhou' }, { status: 401 });
    }

    const isAdmin = await isOrgAdmin(orgId);

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
            if (isAdmin) {
                // If it's an admin, we might have hit a database constraint or limit that we should ignore
                // But usually service-side checks are what throw this.
                // For now, let's just translate.
            }

            return NextResponse.json(
                { success: false, error: { code: 'FORBIDDEN', message: 'Créditos insuficientes ou limite atingido. Faça upgrade do seu plano.' } },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: `Erro interno: ${error.message}` } },
            { status: 500 }
        );
    }
}
