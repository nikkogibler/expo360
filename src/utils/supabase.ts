// src/utils/supabase.ts

// CORRECT: Import createClient ONLY from the Supabase library
import { createClient } from '@supabase/supabase-js';

// Load these from your environment variables (e.g., .env.local)
// They should be prefixed with NEXT_PUBLIC_ for client-side access in Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// --- IMPORTANT: Add checks for environment variables ---
// This prevents runtime errors if the variables are not set,
// which can happen during build time or in development if .env.local is missing.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required environment variables.');
}

// Create a custom fetch function to inject the X-Customer-ID header
const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  // Check if we are in a browser environment before accessing localStorage
  const customerId = typeof window !== 'undefined' ? localStorage.getItem('kusam_customer_id') : null;
  const headers = new Headers(options?.headers); // Keep existing headers

  if (customerId) {
    // Set the x-customer-id header to match the RLS policy's expectation,
    // assuming 'x-customer-id' is how Postgres expects the 'customer_id' header.
    headers.set('x-customer-id', customerId); // <--- THIS IS THE ONLY LINE THAT SHOULD HAVE CHANGED
  }

  // Make the actual fetch request with the modified headers
  return fetch(url, { ...options, headers });
};

// Initialize the Supabase client
// We use the customFetch function to automatically add our customer_id header
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch, // Use our custom fetch for all global Supabase requests
  },
  auth: {
    // You might need to configure this for handling auth tokens if you implement user authentication later
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Clear any invalid auth tokens on initialization (client-side only)
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      console.log('Auth token refreshed successfully');
    }
  });
  
  // Check for invalid refresh token and clear if needed
  supabase.auth.getSession().catch((error) => {
    if (error.message?.includes('Refresh Token Not Found') || error.message?.includes('Invalid Refresh Token')) {
      console.log('Clearing invalid auth session');
      supabase.auth.signOut({ scope: 'local' }).catch(() => {
        // Fallback: manually clear localStorage
        localStorage.removeItem('supabase.auth.token');
      });
    }
  });
}