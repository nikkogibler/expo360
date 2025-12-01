-- 6_debug_policies.sql
-- Test each policy one at a time to find the exact error

BEGIN;

-- Test 1: Simple user_clients policy (text comparison - should work)
CREATE POLICY test_user_clients_select ON public.user_clients
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR auth.uid() = user_id
  );

-- Test 2: Simple clients policy (uuid cast to text - should work)
CREATE POLICY test_clients_select ON public.clients
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = CAST(clients.id AS text)
  );

-- Test 3: Products with EXISTS (uuid comparison in WHERE - THIS IS THE CULPRIT)
-- Rewrite: use CAST in the WHERE clause comparison
CREATE POLICY test_products_select ON public.products
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = CAST(products.client_id AS text)
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE CAST(uc.user_id AS text) = CAST(auth.uid() AS text)
        AND CAST(uc.client_id AS text) = CAST(products.client_id AS text)
    )
  );

COMMIT;
