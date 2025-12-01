import fs from 'fs';
import { Client } from 'pg';
import process from 'process';

// Load env from .env.local if present
const dotenvPath = './.env.local';
if (fs.existsSync(dotenvPath)) {
  const env = fs.readFileSync(dotenvPath, 'utf8');
  env.split(/\n/).forEach(line => {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (m) {
      const k = m[1];
      let v = m[2];
      // strip surrounding quotes
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const PGPASSWORD = process.env.SUPABASE_DATABASE_PASSWORD || process.env.PGPASSWORD || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL in env');
  process.exit(1);
}
if (!PGPASSWORD) {
  console.error('Missing SUPABASE_DATABASE_PASSWORD (or PGPASSWORD) in env');
  process.exit(1);
}

// derive host
let host = SUPABASE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
const PGHOST = host;
const PGPORT = process.env.SUPABASE_DB_PORT || '5432';
const PGUSER = process.env.SUPABASE_DB_USER || 'postgres';
const PGDATABASE = process.env.SUPABASE_DB_NAME || 'postgres';

const connectionString = `postgresql://${PGUSER}:${encodeURIComponent(PGPASSWORD)}@${PGHOST}:${PGPORT}/${PGDATABASE}`;
console.log('Connecting to', connectionString.replace(/:[^:@]+@/, ':*****@'));

const sql = `
BEGIN;

-- 1) Create mapping table if missing
CREATE TABLE IF NOT EXISTS public.user_clients (
  user_id text PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- 2) Ensure customers has client_id and FK
ALTER TABLE IF EXISTS public.customers
  ADD COLUMN IF NOT EXISTS client_id uuid;

ALTER TABLE IF EXISTS public.customers
  DROP CONSTRAINT IF EXISTS customers_client_id_fkey;

ALTER TABLE IF EXISTS public.customers
  ADD CONSTRAINT customers_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- 3) Enable RLS and install policies with explicit casts
ALTER TABLE IF EXISTS public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;

-- CLIENTS policies (drop any previous ones first)
DROP POLICY IF EXISTS clients_tenant_select ON public.clients;
DROP POLICY IF EXISTS clients_tenant_modify ON public.clients;

CREATE POLICY clients_tenant_select ON public.clients
  FOR SELECT
  USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = id::text
    OR EXISTS (
      SELECT 1
      FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id::text = id::text
    )
  );

CREATE POLICY clients_tenant_modify ON public.clients
  FOR UPDATE
  USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = id::text
    OR EXISTS (
      SELECT 1
      FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id::text = id::text
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = id::text
    OR EXISTS (
      SELECT 1
      FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id::text = id::text
    )
  );

-- CUSTOMERS policies (tenant-scoped)
DROP POLICY IF EXISTS customers_tenant_manage ON public.customers;

CREATE POLICY customers_tenant_manage ON public.customers
  FOR ALL
  USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = client_id::text
    OR EXISTS (
      SELECT 1
      FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id::text = client_id::text
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = client_id::text
    OR EXISTS (
      SELECT 1
      FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id::text = client_id::text
    )
  );

COMMIT;
`;

(async () => {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected. Running migration...');
    const res = await client.query(sql);
    console.log('Migration executed. Result:', res.command || 'OK');

    // Verification queries
    const v1 = await client.query("SELECT to_regclass('public.user_clients') AS user_clients_exists;");
    const v2 = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='customers' AND column_name='client_id';");
    const v3 = await client.query("SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('clients','customers') ORDER BY tablename, policyname;");

    console.log('\nVerification outputs:');
    console.log('user_clients_exists:', v1.rows);
    console.log('customers.client_id column:', v2.rows);
    console.log('policies for clients/customers:');
    console.table(v3.rows);

  } catch (err) {
    console.error('Error running migration:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
