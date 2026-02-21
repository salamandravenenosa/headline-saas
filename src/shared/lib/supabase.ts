import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Standard client for client-side or scoped server-side use
// This is safe to use in the browser as it uses the anon/publishable key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client - ONLY for server-side operations
// We use a getter or a conditional check to prevent this from crashing the browser
// because process.env.SUPABASE_SERVICE_ROLE_KEY is not available (and shouldn't be) on the client.
export const getSupabaseAdmin = () => {
    if (!supabaseServiceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing. This operation must be run on the server with the correct environment variables.');
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};

// For backward compatibility in server-only files, but safer
export const supabaseAdmin = typeof window === 'undefined' && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null as any;
