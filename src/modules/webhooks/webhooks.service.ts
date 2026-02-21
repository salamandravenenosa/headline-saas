import { supabaseAdmin } from '@/shared/lib/supabase';

export interface Webhook {
    id: string;
    organization_id: string;
    target_url: string;
    events: string[];
    is_active: boolean;
    created_at: string;
}

export interface WebhookEvent<T = object> {
    id: string;
    event: string;
    timestamp: string;
    payload: T;
}

export class WebhookService {
    /**
     * Triggers active webhooks for a specific event type in an organization.
     */
    static async trigger<T extends object>(
        orgId: string, 
        eventType: string, 
        payload: T
    ): Promise<void> {
        const { data: webhooks, error } = await supabaseAdmin
            .from('webhooks')
            .select('*')
            .eq('organization_id', orgId)
            .eq('is_active', true)
            .contains('events', [eventType]);

        if (error) {
            console.error('[WEBHOOK_FETCH_ERROR]', error);
            return;
        }

        if (!webhooks || webhooks.length === 0) return;

        // Cast webhooks safely from Supabase response
        const typedWebhooks = webhooks as Webhook[];

        const promises = typedWebhooks.map((webhook: Webhook) =>
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
                } as WebhookEvent<T>)
            }).catch(err => console.error(`[WEBHOOK_EXECUTION_FAILED] for ${webhook.target_url}`, err))
        );

        await Promise.allSettled(promises);
    }
}
