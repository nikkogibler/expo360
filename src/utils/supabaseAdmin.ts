import { getSupabaseAdmin } from '../../lib/supabaseMock';

/**
 * Server-side admin Supabase client (service role - bypasses RLS)
 * 
 * This is re-exported from the mock adapter for backward compatibility.
 * When env vars are set, returns real Supabase admin client.
 * When env vars are missing, returns mock client (safe during build).
 */
export function getSupabaseAdminClient() {
  return getSupabaseAdmin();
}

/**
 * Direct export for backward compatibility with existing code
 */
export const supabaseAdmin = getSupabaseAdmin();