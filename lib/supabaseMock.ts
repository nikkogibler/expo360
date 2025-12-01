/**
 * Mock Supabase Adapter
 * 
 * When Supabase environment variables are missing (dev/free tier), this module
 * provides mock implementations of Supabase client methods.
 * 
 * TODO: When you set up real Supabase:
 * 1. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Vercel env vars
 * 2. Remove the mock checks in getSupabaseAdmin() and getSupabaseClient()
 * 3. The rest of the code stays the same - no component changes needed!
 */

import { createClient } from '@supabase/supabase-js';

// Determine which parts of Supabase are configured independently:
const hasAnonKeys = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const hasServiceRole = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
const isSupabaseConfigured = hasAnonKeys && hasServiceRole;

// ============================================================================
// MOCK IMPLEMENTATIONS
// ============================================================================

/**
 * Mock Supabase client for testing without real database
 * Returns successful responses with empty/dummy data
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
class MockSupabaseClient {
  from(_table: string) {
    return {
      select: (_columns?: string) => ({
        gte: (_column: string, _value: unknown) => 
          Promise.resolve({ data: [], error: null }),
        in: (_column: string, _values: unknown[]) =>
          Promise.resolve({ data: [], error: null }),
        then: (callback: (result: { data: unknown[]; error: null }) => void) => {
          callback({ data: [], error: null });
          return Promise.resolve({ data: [], error: null });
        },
      }),
      insert: (record: unknown) =>
        Promise.resolve({ data: [record], error: null }),
      update: (record: unknown) =>
        Promise.resolve({ data: [record], error: null }),
      delete: () =>
        Promise.resolve({ data: null, error: null }),
    };
  }

  storage = {
    from: (_bucket: string) => ({
      upload: (_path: string, _file: unknown) =>
        Promise.resolve({ data: { path: _path }, error: null }),
      download: (_path: string) =>
        Promise.resolve({ data: new Blob(), error: null }),
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `/mock-storage/${path}` },
      }),
    }),
  };
}
/* eslint-enable @typescript-eslint/no-unused-vars */

// ============================================================================
// REAL IMPLEMENTATIONS
// ============================================================================

function getRealSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getRealSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseAnonKey);
}

// ============================================================================
// PUBLIC API - Use these exports
// ============================================================================

/**
 * Get Supabase admin client (service role - bypasses RLS)
 * Returns mock if env vars not configured, real client otherwise
 */
export function getSupabaseAdmin() {
  if (hasServiceRole) {
    return getRealSupabaseAdmin();
  }
  console.warn('[MOCK MODE] Using mock Supabase admin client. Set SUPABASE_SERVICE_ROLE_KEY to use real database.');
  return new MockSupabaseClient() as unknown as ReturnType<typeof getRealSupabaseAdmin>;
}

/**
 * Get Supabase client (anon key - respects RLS)
 * Returns mock if env vars not configured, real client otherwise
 */
export function getSupabaseClient() {
  if (hasAnonKeys) {
    return getRealSupabaseClient();
  }
  console.warn('[MOCK MODE] Using mock Supabase client. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to use real database.');
  return new MockSupabaseClient() as unknown as ReturnType<typeof getRealSupabaseClient>;
}

/**
 * Check if using mock or real Supabase
 */
export function isUsingMock() {
  // Backwards-compatible: true if either admin or client is missing
  return !(hasAnonKeys && hasServiceRole);
}

/**
 * Whether the anonymous (client) keys are missing.
 */
export function isUsingMockClient() {
  return !hasAnonKeys;
}

/**
 * Whether the admin/service-role key is missing.
 */
export function isUsingMockAdmin() {
  return !hasServiceRole;
}
