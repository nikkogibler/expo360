// src/utils/supabaseServiceRole.ts
// Service role client for secure backend operations (never import in client code!)
import { getSupabaseAdmin } from '../../lib/supabaseMock';

/**
 * Supabase service role client for backend operations
 * Re-exports from the mock adapter for backward compatibility.
 * Returns mock if env vars missing, real client otherwise.
 */
export const supabaseService = getSupabaseAdmin();
