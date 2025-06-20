// src/utils/supabase.ts

import { createClient } from '@supabase/supabase-js';

// Load these from your environment variables (e.g., .env.local)
// They should be prefixed with NEXT_PUBLIC_ for client-side access in Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a custom fetch function to inject the X-Customer-ID header
const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  // Check if we are in a browser environment before accessing localStorage
  const customerId = typeof window !== 'undefined' ? localStorage.getItem('kusam_customer_id') : null;
  const headers = new Headers(options?.headers); // Keep existing headers

  if (customerId) {
    // Set the X-Customer-ID header if a customerId exists in localStorage
    headers.set('X-Customer-ID', customerId);
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