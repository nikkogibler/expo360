import { getSupabaseClient } from './supabaseMock';

/**
 * Public Supabase client (anon key - respects RLS)
 * 
 * This is a re-export of getSupabaseClient() from the mock adapter.
 * When env vars are set, returns real Supabase client.
 * When env vars are missing, returns mock client.
 */
export const supabase = getSupabaseClient();
