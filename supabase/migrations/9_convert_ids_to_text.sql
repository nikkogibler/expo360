-- 9_convert_ids_to_text.sql
-- Convert all ID columns from UUID to TEXT to match rebuilt schema intent
-- Ensures schema matches migration 7's all-text design

BEGIN;

-- Ensure pgcrypto is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- DROP ALL POLICIES FIRST (they depend on column types)
DROP POLICY IF EXISTS user_clients_service ON public.user_clients;
DROP POLICY IF EXISTS user_clients_select_owner ON public.user_clients;
DROP POLICY IF EXISTS user_clients_insert_owner ON public.user_clients;
DROP POLICY IF EXISTS user_clients_update_owner ON public.user_clients;
DROP POLICY IF EXISTS user_clients_delete_owner ON public.user_clients;

DROP POLICY IF EXISTS clients_service ON public.clients;
DROP POLICY IF EXISTS clients_jwt ON public.clients;
DROP POLICY IF EXISTS clients_user_mapped ON public.clients;

DROP POLICY IF EXISTS products_service ON public.products;
DROP POLICY IF EXISTS products_jwt ON public.products;
DROP POLICY IF EXISTS products_user_mapped ON public.products;

DROP POLICY IF EXISTS variable_types_service ON public.variable_types;
DROP POLICY IF EXISTS variable_types_jwt ON public.variable_types;
DROP POLICY IF EXISTS variable_types_user_mapped ON public.variable_types;

DROP POLICY IF EXISTS variable_values_service ON public.variable_values;
DROP POLICY IF EXISTS variable_values_jwt ON public.variable_values;
DROP POLICY IF EXISTS variable_values_user_mapped ON public.variable_values;

DROP POLICY IF EXISTS customers_service ON public.customers;
DROP POLICY IF EXISTS customers_jwt ON public.customers;
DROP POLICY IF EXISTS customers_user_mapped ON public.customers;

-- Convert clients.id to text
ALTER TABLE public.clients
  ALTER COLUMN id TYPE text USING id::text;

-- Convert user_clients columns to text
ALTER TABLE public.user_clients
  ALTER COLUMN user_id TYPE text USING user_id::text,
  ALTER COLUMN client_id TYPE text USING client_id::text;

-- Convert products columns to text
ALTER TABLE public.products
  ALTER COLUMN id TYPE text USING id::text,
  ALTER COLUMN client_id TYPE text USING client_id::text;

-- Convert customers columns to text
ALTER TABLE public.customers
  ALTER COLUMN id TYPE text USING id::text,
  ALTER COLUMN client_id TYPE text USING client_id::text;

-- Convert variable_types columns to text
ALTER TABLE public.variable_types
  ALTER COLUMN id TYPE text USING id::text,
  ALTER COLUMN client_id TYPE text USING client_id::text;

-- Convert variable_values columns to text
ALTER TABLE public.variable_values
  ALTER COLUMN id TYPE text USING id::text,
  ALTER COLUMN variable_type_id TYPE text USING variable_type_id::text;

-- RECREATE ALL POLICIES with proper text type handling

-- ============================================================================
-- RLS POLICIES: user_clients
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
-- RLS POLICIES: clients
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
-- RLS POLICIES: products
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
-- RLS POLICIES: variable_types
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
-- RLS POLICIES: variable_values
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
-- RLS POLICIES: customers
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

-- End conversion
