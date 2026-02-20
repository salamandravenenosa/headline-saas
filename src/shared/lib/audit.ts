import { supabaseAdmin } from '@/shared/lib/supabase';

export class AuditService {
    static async log(orgId: string, userId: string | null, eventType: string, payload: any) {
        const { error } = await supabaseAdmin
            .from('event_logs')
            .insert({
                organization_id: orgId,
                user_id: userId,
                event_type: eventType,
                payload
            });

        if (error) console.error('[AUDIT_LOG_ERROR]', error);
    }
}
