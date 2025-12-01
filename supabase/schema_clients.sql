-- supabase/schema_clients.sql
-- Schema for per-client configuration and assets (single shared Supabase project approach)

-- Extension for UUID generation (if available)
create extension if not exists pgcrypto;

-- Clients table: stores metadata, asset paths, and theme JSON
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  logo_path text,             -- e.g. "clients/{slug}/logo.png"
  theme jsonb default '{}'::jsonb,  -- { "primaryColor": "#...", "font": "..." }
  env_overrides jsonb default '{}'::jsonb, -- optional per-client runtime flags
  metadata jsonb default '{}'::jsonb, -- extra fields (contact, phone, etc.)
  created_at timestamptz default now()
);

create index if not exists idx_clients_slug on clients (slug);

-- NOTE: Storage bucket convention
-- Create a storage bucket (via Supabase UI or API) named: expo360-clients-assets
-- Recommended object paths:
--   clients/{slug}/logo.png
--   clients/{slug}/site-assets/<files...>

-- Row-Level Security (RLS) guidance (keep simple for MVP):
-- We'll use server-side (service role) queries for admin actions and previews
-- If you later allow client-side reads with the anon key, enable RLS and create
-- a small check function that validates a request header or current_setting.

-- Example: enable RLS on clients (disabled by default until you design access rules)
-- alter table clients enable row level security;

-- Example policy (placeholder) - do NOT enable unless you implement the matching header or function
-- create policy client_select_only on clients for select using (
--   slug = current_setting('app.client_slug', true)
-- );

-- Backups & migration notes (add to runbook):
-- - Export schema with `supabase db dump` or use SQL editor to copy table definition.
-- - Backup client assets periodically (download bucket prefix clients/{slug}/).
-- - To migrate one client: export rows where slug = 'acme' and upload assets under clients/acme/ to target project.

-- Example helper view for admin listings (optional)
create view if not exists public.client_list as
select id, slug, name, description, logo_path, created_at
from clients
order by created_at desc;

-- Add ADMIN_API_KEY placeholder (server-side only) in your deployment environment.

-- End of schema
