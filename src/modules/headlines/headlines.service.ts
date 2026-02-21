import { supabaseAdmin } from '@/shared/lib/supabase';
import { calculateHeadlineScore, ScoreBreakdown } from './score.engine';
import { Groq } from 'groq-sdk';
import { WebhookService } from '../webhooks/webhooks.service';
import { Headline } from '@/types';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface GeneratePayload {
    niche: string;
    briefing: string;
    style: 'white' | 'black';
}

export interface GenerationResult {
    id: string;
    content: string;
    score: number;
    breakdown: ScoreBreakdown;
}

export class HeadlineService {
    static async generate(
        orgId: string,
        keyId: string | null,
        { niche, briefing, style }: GeneratePayload
    ): Promise<GenerationResult> {
        const start = performance.now();

        try {
            // 1. IA Prompt Generation
            const systemPrompt = `Você é um copywriter especialista em conversão de alto nível.
Sua tarefa é criar uma headline poderosa seguindo estritamente as instruções abaixo.

ESTILO: ${style === 'black' ? 'BLACK - Agressivo, direto, toca na dor latente, foca em lucro imediato e promessas fortes.' : 'WHITE - Suave, focado em autoridade, confiança, curiosidade inteligente e storytelling.'}

NICHO: ${niche}
BRIEFING/CONTEXTO: ${briefing}

REGRAS CRÍTICAS:
1. Responda APENAS com a headline.
2. Não use aspas, introduções ou explicações.
3. Use gatilhos mentais adequados ao estilo escolhido.
4. A headline deve ser específica para o nicho e briefing fornecidos.`;

            const completion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Gere a headline para o nicho ${niche} seguindo o briefing: ${briefing}.` }
                ],
                model: 'llama3-70b-8192',
                temperature: 0.8,
            });

            const content = completion.choices[0]?.message?.content?.replace(/^"|"$/g, '') || '';

            // 2. Internal Scoring
            const { total, breakdown } = calculateHeadlineScore(content);

            // 3. Persistence
            const { data: headline, error: hError } = await supabaseAdmin
                .from('headlines')
                .insert({
                    organization_id: orgId,
                    content,
                    niche,
                    style,
                    score: total
                })
                .select()
                .maybeSingle() as { data: Headline | null, error: any };

            if (hError || !headline) throw hError || new Error('Failed to persist headline');

            // 4. Usage Logging (Sync back to DB)
            const duration = Math.round(performance.now() - start);
            await supabaseAdmin.from('api_usage_logs').insert({
                organization_id: orgId,
                api_key_id: keyId,
                path: '/api/v1/headlines/generate',
                method: 'POST',
                status_code: 200,
                response_time_ms: duration
            });

            // 5. Atomic Meter Update
            const { error: rpcError } = await supabaseAdmin.rpc('increment_usage_meter', { org_id: orgId });
            if (rpcError) console.error('[RPC_ERROR] Meter increment failed:', rpcError);

            // 6. External Triggers (Webhooks)
            const result: GenerationResult = {
                id: headline.id,
                content,
                score: total,
                breakdown
            };

            await WebhookService.trigger(orgId, 'headline.generated', result);

            return result;
        } catch (error: any) {
            // Log failure even if generation fails
            const duration = Math.round(performance.now() - start);
            await supabaseAdmin.from('api_usage_logs').insert({
                organization_id: orgId,
                api_key_id: keyId,
                path: '/api/v1/headlines/generate',
                method: 'POST',
                status_code: 500,
                response_time_ms: duration
            });
            throw error;
        }
    }
}
