-- 7_rebuild_all_text_ids.sql
-- CLEAN SLATE: Drop everything and rebuild with ALL TEXT IDs
-- This eliminates all uuid=text casting issues completely
-- WARNING: This is destructive. All data will be deleted.

-- Drop all dependent tables (one by one to avoid cascade issues)
DROP TABLE IF EXISTS public.variable_values;
DROP TABLE IF EXISTS public.variable_types;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.customers;
DROP TABLE IF EXISTS public.user_clients;
DROP TABLE IF EXISTS public.clients;

BEGIN;

-- ============================================================================
-- 1) CLIENTS table - all text IDs
-- ============================================================================
CREATE TABLE public.clients (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
-- 2) USER_CLIENTS mapping table (NO FK - managed via RLS)
-- ============================================================================
CREATE TABLE public.user_clients (
  user_id text NOT NULL,
  client_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, client_id)
);

CREATE INDEX idx_user_clients_client_id ON public.user_clients(client_id);
CREATE INDEX idx_user_clients_user_id ON public.user_clients(user_id);

-- ============================================================================
-- 3) CUSTOMERS table (NO FK - managed via RLS)
-- ============================================================================
CREATE TABLE public.customers (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_customers_client_id ON public.customers(client_id);

-- ============================================================================
-- 4) PRODUCTS table (NO FK - managed via RLS)
-- ============================================================================
CREATE TABLE public.products (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id text NOT NULL,
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
-- 5) VARIABLE_TYPES table (NO FK - managed via RLS)
-- ============================================================================
CREATE TABLE public.variable_types (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id text NOT NULL,
  key text NOT NULL,
  label text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_variable_types_client_id ON public.variable_types(client_id);

-- ============================================================================
-- 6) VARIABLE_VALUES table (NO FK - managed via RLS)
-- ============================================================================
CREATE TABLE public.variable_values (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  variable_type_id text NOT NULL,
  value text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_variable_values_variable_type_id ON public.variable_values(variable_type_id);

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variable_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variable_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_clients ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: user_clients (owner-only)
-- ============================================================================
CREATE POLICY user_clients_service ON public.user_clients
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY user_clients_select_owner ON public.user_clients
  FOR SELECT USING (user_id = (SELECT auth.uid())::text);

CREATE POLICY user_clients_insert_owner ON public.user_clients
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid())::text);

CREATE POLICY user_clients_update_owner ON public.user_clients
  FOR UPDATE USING (user_id = (SELECT auth.uid())::text)
  WITH CHECK (user_id = (SELECT auth.uid())::text);

CREATE POLICY user_clients_delete_owner ON public.user_clients
  FOR DELETE USING (user_id = (SELECT auth.uid())::text);

-- ============================================================================
-- RLS POLICIES: clients (service_role or jwt.claims.client_id or mapped user)
-- ============================================================================
CREATE POLICY clients_service ON public.clients
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY clients_jwt ON public.clients
  FOR SELECT USING (
    current_setting('jwt.claims.client_id', true) = clients.id
  );

CREATE POLICY clients_user_mapped ON public.clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = (SELECT auth.uid())::text
        AND uc.client_id = clients.id
    )
  );

-- ============================================================================
-- RLS POLICIES: products (tenant-scoped)
-- ============================================================================
CREATE POLICY products_service ON public.products
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY products_jwt ON public.products
  FOR ALL USING (
    current_setting('jwt.claims.client_id', true) = products.client_id
  )
  WITH CHECK (
    current_setting('jwt.claims.client_id', true) = products.client_id
  );

CREATE POLICY products_user_mapped ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = (SELECT auth.uid())::text
        AND uc.client_id = products.client_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = (SELECT auth.uid())::text
        AND uc.client_id = products.client_id
    )
  );

-- ============================================================================
-- RLS POLICIES: variable_types (tenant-scoped)
-- ============================================================================
CREATE POLICY variable_types_service ON public.variable_types
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY variable_types_jwt ON public.variable_types
  FOR ALL USING (
    current_setting('jwt.claims.client_id', true) = variable_types.client_id
  )
  WITH CHECK (
    current_setting('jwt.claims.client_id', true) = variable_types.client_id
  );

CREATE POLICY variable_types_user_mapped ON public.variable_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = (SELECT auth.uid())::text
        AND uc.client_id = variable_types.client_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = (SELECT auth.uid())::text
        AND uc.client_id = variable_types.client_id
    )
  );

-- ============================================================================
-- RLS POLICIES: variable_values (tenant-scoped via parent variable_type)
-- ============================================================================
CREATE POLICY variable_values_service ON public.variable_values
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY variable_values_jwt ON public.variable_values
  FOR ALL USING (
    current_setting('jwt.claims.client_id', true) IN (
      SELECT client_id FROM public.variable_types
      WHERE id = variable_values.variable_type_id
    )
  )
  WITH CHECK (
    current_setting('jwt.claims.client_id', true) IN (
      SELECT client_id FROM public.variable_types
      WHERE id = variable_values.variable_type_id
    )
  );

CREATE POLICY variable_values_user_mapped ON public.variable_values
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = (SELECT auth.uid())::text
        AND uc.client_id IN (
          SELECT client_id FROM public.variable_types
          WHERE id = variable_values.variable_type_id
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = (SELECT auth.uid())::text
        AND uc.client_id IN (
          SELECT client_id FROM public.variable_types
          WHERE id = variable_values.variable_type_id
        )
    )
  );

-- ============================================================================
-- RLS POLICIES: customers (tenant-scoped)
-- ============================================================================
CREATE POLICY customers_service ON public.customers
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY customers_jwt ON public.customers
  FOR ALL USING (
    current_setting('jwt.claims.client_id', true) = customers.client_id
  )
  WITH CHECK (
    current_setting('jwt.claims.client_id', true) = customers.client_id
  );

CREATE POLICY customers_user_mapped ON public.customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = (SELECT auth.uid())::text
        AND uc.client_id = customers.client_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = (SELECT auth.uid())::text
        AND uc.client_id = customers.client_id
    )
  );

COMMIT;

-- End rebuild
