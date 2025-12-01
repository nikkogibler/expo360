-- fix_missing_policies.sql
-- Recreate all missing RLS policies
-- Run this to complete the RLS setup

-- ============================================================================
-- RLS POLICIES: clients (3 policies)
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
-- RLS POLICIES: products (3 policies)
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
-- RLS POLICIES: variable_types (3 policies)
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
-- RLS POLICIES: variable_values (3 policies)
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
-- RLS POLICIES: customers (3 policies)
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

-- Add the missing user_clients_service policy
CREATE POLICY user_clients_service ON public.user_clients
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
