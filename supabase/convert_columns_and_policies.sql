-- convert_columns_and_policies.sql
-- Convert all UUID columns to TEXT and recreate RLS policies
-- Run without transaction wrapper to ensure each statement succeeds

-- ============================================================================
-- STEP 1: Drop all existing policies first (they reference UUID columns)
-- ============================================================================
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

-- ============================================================================
-- STEP 2: Convert all ID columns from UUID to TEXT
-- Run each ALTER individually to ensure success
-- ============================================================================

ALTER TABLE public.clients ALTER COLUMN id TYPE text USING id::text;

ALTER TABLE public.user_clients ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE public.user_clients ALTER COLUMN client_id TYPE text USING client_id::text;

ALTER TABLE public.products ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.products ALTER COLUMN client_id TYPE text USING client_id::text;

ALTER TABLE public.customers ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.customers ALTER COLUMN client_id TYPE text USING client_id::text;

ALTER TABLE public.variable_types ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.variable_types ALTER COLUMN client_id TYPE text USING client_id::text;

ALTER TABLE public.variable_values ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.variable_values ALTER COLUMN variable_type_id TYPE text USING variable_type_id::text;

-- ============================================================================
-- STEP 3: Recreate all RLS policies with proper text type handling
-- ============================================================================

-- user_clients policies
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

-- clients policies
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

-- products policies
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

-- variable_types policies
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

-- variable_values policies
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

-- customers policies
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
