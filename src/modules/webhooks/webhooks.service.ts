import { supabaseAdmin } from '@/shared/lib/supabase';

export class WebhookService {
    static async trigger(orgId: string, eventType: string, payload: any) {
        const { data: webhooks } = await supabaseAdmin
            .from('webhooks')
            .select('*')
            .eq('organization_id', orgId)
            .eq('is_active', true)
            .contains('events', [eventType]);

        if (!webhooks) return;

        const promises = webhooks.map(webhook =>
            fetch(webhook.target_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Event': eventType,
                    'X-Webhook-Signature': 'todo_implement_signature'
                },
                body: JSON.stringify({
                    id: crypto.randomUUID(),
                    event: eventType,
                    timestamp: new Date().toISOString(),
                    payload
                })
            }).catch(err => console.error(`Webhook failed for ${webhook.target_url}`, err))
        );

        await Promise.allSettled(promises);
    }
}
