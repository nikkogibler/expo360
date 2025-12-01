-- Recreate all RLS policies for the 6 tables
-- Run this to complete full RLS setup

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

-- ============================================================================
-- Verify all 18 policies created
-- ============================================================================
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
