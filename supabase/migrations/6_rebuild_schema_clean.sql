-- 6_rebuild_schema_clean.sql
-- NUCLEAR OPTION: Drop all tenant tables and rebuild from scratch with correct schema and RLS
-- KEY FIX: Cast JWT claims to UUID before comparison (not the other way around)
-- WARNING: This is destructive. All data will be deleted.

BEGIN;

-- Drop all dependent tables first (cascade will help)
DROP TABLE IF EXISTS public.variable_values CASCADE;
DROP TABLE IF EXISTS public.variable_types CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.user_clients CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;

-- ============================================================================
-- 1) CLIENTS table (the tenant/account root)
-- ============================================================================
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  logo_path text,
  theme jsonb DEFAULT '{}'::jsonb,
  env_overrides jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_clients_slug ON public.clients(slug);

-- ============================================================================
-- 2) USER_CLIENTS mapping table (auth.uid -> client_id for per-user admin access)
-- ============================================================================
CREATE TABLE public.user_clients (
  user_id text NOT NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, client_id)
);

CREATE INDEX idx_user_clients_client_id ON public.user_clients(client_id);
CREATE INDEX idx_user_clients_user_id ON public.user_clients(user_id);

-- ============================================================================
-- 3) CUSTOMERS table (per-tenant customer data)
-- ============================================================================
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_customers_client_id ON public.customers(client_id);

-- ============================================================================
-- 4) PRODUCTS table (per-tenant product catalog)
-- ============================================================================
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  sku text NOT NULL,
  name text NOT NULL,
  description text,
  price numeric,
  image_url text,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_products_client_id ON public.products(client_id);
CREATE INDEX idx_products_sku ON public.products(sku);

-- ============================================================================
-- 5) VARIABLE_TYPES table (per-tenant variable configuration)
-- ============================================================================
CREATE TABLE public.variable_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  key text NOT NULL,
  label text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_variable_types_client_id ON public.variable_types(client_id);

-- ============================================================================
-- 6) VARIABLE_VALUES table (per-variable-type value options)
-- ============================================================================
CREATE TABLE public.variable_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variable_type_id uuid NOT NULL REFERENCES public.variable_types(id) ON DELETE CASCADE,
  value text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_variable_values_variable_type_id ON public.variable_values(variable_type_id);

-- ============================================================================
-- ENABLE RLS ON ALL TENANT TABLES
-- ============================================================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variable_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variable_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_clients ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: user_clients (owner-only, permissive for FK checks)
-- ============================================================================
CREATE POLICY user_clients_all_service ON public.user_clients
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY user_clients_select_owner ON public.user_clients
  FOR SELECT USING (user_clients.user_id = auth.uid());

CREATE POLICY user_clients_insert_owner ON public.user_clients
  FOR INSERT WITH CHECK (user_clients.user_id = auth.uid());

CREATE POLICY user_clients_update_owner ON public.user_clients
  FOR UPDATE USING (user_clients.user_id = auth.uid())
  WITH CHECK (user_clients.user_id = auth.uid());

CREATE POLICY user_clients_delete_owner ON public.user_clients
  FOR DELETE USING (user_clients.user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: clients (service_role, jwt.claims.client_id, or mapped user)
-- ============================================================================
CREATE POLICY clients_select ON public.clients
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true)::uuid = clients.id
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id = clients.id
    )
  );

CREATE POLICY clients_all ON public.clients
  FOR ALL USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true)::uuid = clients.id
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id = clients.id
    )
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true)::uuid = clients.id
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id = clients.id
    )
  );

-- ============================================================================
-- RLS POLICIES: products (tenant-scoped)
-- ============================================================================
CREATE POLICY products_select ON public.products
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true)::uuid = products.client_id
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id = products.client_id
    )
  );

CREATE POLICY products_all ON public.products
  FOR ALL USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true)::uuid = products.client_id
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id = products.client_id
    )
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true)::uuid = products.client_id
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id = products.client_id
    )
  );

-- ============================================================================
-- RLS POLICIES: variable_types (tenant-scoped)
-- ============================================================================
CREATE POLICY variable_types_select ON public.variable_types
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true)::uuid = variable_types.client_id
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id = variable_types.client_id
    )
  );

CREATE POLICY variable_types_all ON public.variable_types
  FOR ALL USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true)::uuid = variable_types.client_id
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id = variable_types.client_id
    )
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true)::uuid = variable_types.client_id
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id = variable_types.client_id
    )
  );

-- ============================================================================
-- RLS POLICIES: variable_values (tenant-scoped via parent variable_type)
-- ============================================================================
CREATE POLICY variable_values_select ON public.variable_values
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true)::uuid IN (
      SELECT client_id FROM public.variable_types
      WHERE id = variable_values.variable_type_id
    )
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id IN (
          SELECT client_id FROM public.variable_types
          WHERE id = variable_values.variable_type_id
        )
    )
  );

CREATE POLICY variable_values_all ON public.variable_values
  FOR ALL USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true)::uuid IN (
      SELECT client_id FROM public.variable_types
      WHERE id = variable_values.variable_type_id
    )
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id IN (
          SELECT client_id FROM public.variable_types
          WHERE id = variable_values.variable_type_id
        )
    )
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true)::uuid IN (
      SELECT client_id FROM public.variable_types
      WHERE id = variable_values.variable_type_id
    )
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id IN (
          SELECT client_id FROM public.variable_types
          WHERE id = variable_values.variable_type_id
        )
    )
  );

-- ============================================================================
-- RLS POLICIES: customers (tenant-scoped)
-- ============================================================================
CREATE POLICY customers_select ON public.customers
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true)::uuid = customers.client_id
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id = customers.client_id
    )
  );

CREATE POLICY customers_all ON public.customers
  FOR ALL USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true)::uuid = customers.client_id
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id = customers.client_id
    )
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true)::uuid = customers.client_id
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id = customers.client_id
    )
  );

COMMIT;

-- End rebuild
