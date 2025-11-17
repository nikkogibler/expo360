// src/utils/supabase.ts
// Client-side Supabase client factory for browser environments
// Re-exports from mock adapter for seamless mock/real switching

import { getSupabaseClient } from '../../lib/supabaseMock';

/**
 * Supabase client for client-side operations
 * Uses mock adapter factory for automatic env var checking.
 * Browser-safe: only initializes when accessed from client code.
 */
export const supabase = getSupabaseClient();