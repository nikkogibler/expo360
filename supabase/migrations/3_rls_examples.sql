-- 3_rls_examples.sql
-- Example Row-Level Security policies for tenant isolation by `client_id`.
-- Adapt these to how your tokens are issued. The examples assume JWTs include
-- a `client_id` claim (string) accessible via current_setting('jwt.claims.client_id', true).

BEGIN;

-- Enable RLS on the tenant-scoped tables
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.variable_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.variable_values ENABLE ROW LEVEL SECURITY;

-- PRODUCTS: allow select if JWT claim matches client_id or if using service role
CREATE POLICY IF NOT EXISTS products_select_for_client ON public.products
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = client_id::text
  );

CREATE POLICY IF NOT EXISTS products_modify_for_client ON public.products
  FOR INSERT, UPDATE, DELETE USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = client_id::text
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = client_id::text
  );

-- VARIABLE TYPES: same model as products
CREATE POLICY IF NOT EXISTS variable_types_select_for_client ON public.variable_types
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = client_id::text
  );

CREATE POLICY IF NOT EXISTS variable_types_modify_for_client ON public.variable_types
  FOR INSERT, UPDATE, DELETE USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = client_id::text
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = client_id::text
  );

-- VARIABLE VALUES: ensure variable values are only visible/modified when their
-- parent variable_type belongs to the same client as the JWT claim.
CREATE POLICY IF NOT EXISTS variable_values_select_for_client ON public.variable_values
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR (
      current_setting('jwt.claims.client_id', true) = (
        SELECT client_id::text FROM public.variable_types WHERE id = variable_type_id LIMIT 1
      )
    )
  );

CREATE POLICY IF NOT EXISTS variable_values_modify_for_client ON public.variable_values
  FOR INSERT, UPDATE, DELETE USING (
    auth.role() = 'service_role'
    OR (
      current_setting('jwt.claims.client_id', true) = (
        SELECT client_id::text FROM public.variable_types WHERE id = variable_type_id LIMIT 1
      )
    )
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR (
      current_setting('jwt.claims.client_id', true) = (
        SELECT client_id::text FROM public.variable_types WHERE id = variable_type_id LIMIT 1
      )
    )
  );

-- Helpful note:
-- - Supabase automatically makes JWT claims available to Postgres as
--   "jwt.claims.<name>" when those claims are embedded in the access token.
-- - If you cannot or do not want to embed `client_id` in JWTs, consider
--   using a mapping table from `auth.uid()` -> `client_id` and rewrite the
--   USING/WITH CHECK clauses to consult that mapping instead.

COMMIT;

-- End of RLS examples
