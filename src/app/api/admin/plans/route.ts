import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/shared/lib/supabase';
import { isAdmin } from '@/shared/lib/admin';

export const runtime = 'nodejs';

async function checkAdmin(req: NextRequest) {
    const userEmail = req.headers.get('x-admin-email');
    if (!isAdmin(userEmail)) return false;
    return true;
}

export async function POST(req: NextRequest) {
    if (!await checkAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { userId, planName } = await req.json();

        if (!userId || !planName) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // 1. Get plan ID from name
        const { data: plan } = await supabaseAdmin
            .from('plans')
            .select('id')
            .eq('name', planName)
            .single();

        if (!plan) throw new Error('Plan not found: ' + planName);

        // 2. Get organization of the user
        let { data: membership } = await supabaseAdmin
            .from('memberships')
            .select('organization_id')
            .eq('user_id', userId) // Check both user_id and profile_id just in case
            .maybeSingle();

        if (!membership) {
            // Check profile_id as fallback
            const { data: m2 } = await supabaseAdmin
                .from('memberships')
                .select('organization_id')
                .eq('profile_id', userId)
                .maybeSingle();
            membership = m2;
        }

        let orgId = membership?.organization_id;

        // 3. If no org, create one (safety for admins or first-time users)
        if (!orgId) {
            const { data: profile } = await supabaseAdmin
                .from('QuiziCopy_profiles')
                .select('full_name')
                .eq('id', userId)
                .single();

            const fullName = profile?.full_name || 'Usuário';
            const orgName = `${fullName}'s Org`;
            const orgSlug = fullName
                .toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
                .replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(7);

            const { data: newOrg, error: orgError } = await supabaseAdmin
                .from('organizations')
                .insert({
                    name: orgName,
                    slug: orgSlug
                })
                .select()
                .single();

            if (orgError) throw orgError;
            orgId = newOrg.id;

            // Fix: Ensure a record exists in the 'profiles' table (referenced by memberships)
            // since QuiziCopy_profiles might be the one populated but memberships points to profiles.
            const { data: existingProfile } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('id', userId)
                .maybeSingle();

            if (!existingProfile) {
                // Get basic info from QuiziCopy_profiles if available
                const { data: qp } = await supabaseAdmin
                    .from('QuiziCopy_profiles')
                    .select('full_name, email')
                    .eq('id', userId)
                    .single();

                await supabaseAdmin.from('profiles').insert({
                    id: userId,
                    full_name: qp?.full_name || fullName,
                    email: qp?.email || 'user@example.com'
                });
            }

            // Updated: memberships table uses profile_id, not user_id
            const { error: memError } = await supabaseAdmin.from('memberships').insert({
                organization_id: orgId,
                profile_id: userId,
                role: 'owner'
            });
            if (memError) throw memError;
        }

        // 4. Update or Insert subscription
        const now = new Date();
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(now.getMonth() + 1);

        const subscriptionData = {
            organization_id: orgId,
            plan_id: plan.id,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: oneMonthLater.toISOString(),
            updated_at: now.toISOString()
        };

        // We use a more robust way to handle the update if upsert fails or behaves oddly
        const { data: existingSub } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('organization_id', orgId)
            .maybeSingle();

        if (existingSub) {
            const { error: subError } = await supabaseAdmin
                .from('subscriptions')
                .update(subscriptionData)
                .eq('id', existingSub.id);
            if (subError) throw subError;
        } else {
            const { error: subError } = await supabaseAdmin
                .from('subscriptions')
                .insert(subscriptionData);
            if (subError) throw subError;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[ADMIN_PLAN_POST]', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
