// lib/supabaseAdmin.ts
// Admin clients for server-side operations with service role key
// Deferred initialization to support mock/real switching

import { createClient } from '@supabase/supabase-js';

const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/* eslint-disable @typescript-eslint/no-unused-vars */
class MockSupabaseClient {
  from(_table: string) {
    return {
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve({ data: null, error: null }),
      eq: () => Promise.resolve({ data: null, error: null }),
    };
  }
  storage = {
    from: (_bucket: string) => ({
      upload: () => Promise.resolve({ data: null, error: null }),
      download: () => Promise.resolve(new Blob()),
      list: () => Promise.resolve({ data: [], error: null }),
    })
  };
  auth = {
    admin: {
      listUsers: () => Promise.resolve({ data: { users: [] }, error: null }),
    },
    getSession: () => Promise.resolve({ data: null, error: null }),
    onAuthStateChange: () => () => {},
  };
}
/* eslint-enable @typescript-eslint/no-unused-vars */

function getSupabaseAdminClient() {
  if (!isSupabaseConfigured) {
    console.warn(
      '[MOCK MODE] Using mock Supabase admin client. Set SUPABASE_SERVICE_ROLE_KEY to use real database.'
    );
    return new MockSupabaseClient() as unknown as ReturnType<typeof createClient>;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

/**
 * Supabase admin client with service role key - bypasses RLS
 * Deferred initialization for build-time env var absence
 */
export const supabaseAdmin = getSupabaseAdminClient();