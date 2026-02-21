export const ADMIN_EMAILS = [
    'davikko18dias@gmail.com',
    'gustavofpbraga@gmail.com',
    'davidiaspontes10@gmail.com',
    'davikko1dias@gmail.com',
    'davikkodias@gmail.com',
    'salamandravenenosa1@gmail.com',
    'bia.almedaa@gmail.com'
];

import { supabaseAdmin } from './supabase';

export const isAdmin = (email?: string | null) => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
};

export const isOrgAdmin = async (orgId: string) => {
    try {
        // Try the standard profiles first
        const { data: member } = await supabaseAdmin
            .from('memberships')
            .select(`
                user_id,
                profiles!inner(email)
            `)
            .eq('organization_id', orgId)
            .maybeSingle();

        if (member?.profiles) {
            return isAdmin((member.profiles as any).email);
        }

        // Try the QuiziCopy_profiles schema
        const { data: qcMember } = await supabaseAdmin
            .from('memberships')
            .select(`
                user_id,
                QuiziCopy_profiles:user_id(email)
            `)
            .eq('organization_id', orgId)
            .maybeSingle();

        if (qcMember && (qcMember as any).QuiziCopy_profiles) {
            return isAdmin((qcMember as any).QuiziCopy_profiles.email);
        }

        return false;
    } catch (e) {
        console.error('Error in isOrgAdmin:', e);
        return false;
    }
};
