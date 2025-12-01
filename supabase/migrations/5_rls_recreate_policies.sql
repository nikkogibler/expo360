-- 5_rls_recreate_policies.sql
-- Create clean RLS policies for multi-tenant behavior.
-- Assumes NO existing policies (they have been deleted).
-- All uuid comparisons are explicitly cast to text.

BEGIN;

-- 1) Ensure RLS is enabled on tenant tables
ALTER TABLE IF EXISTS public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.variable_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.variable_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_clients ENABLE ROW LEVEL SECURITY;

-- Create an index on user_clients for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_clients_user_id_client_id 
  ON public.user_clients(user_id, client_id);

-- 2) user_clients: owner-only mapping management
-- user_id is stored as text and compared to auth.uid() (text)
CREATE POLICY user_clients_select_owner ON public.user_clients
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR auth.uid() = user_id
  );

CREATE POLICY user_clients_insert_owner ON public.user_clients
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role'
    OR auth.uid() = user_id
  );

CREATE POLICY user_clients_update_owner ON public.user_clients
  FOR UPDATE USING (
    auth.role() = 'service_role'
    OR auth.uid() = user_id
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR auth.uid() = user_id
  );

CREATE POLICY user_clients_delete_owner ON public.user_clients
  FOR DELETE USING (
    auth.role() = 'service_role'
    OR auth.uid() = user_id
  );

-- 3) clients
CREATE POLICY clients_tenant_select ON public.clients
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = CAST(clients.id AS text)
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE CAST(uc.user_id AS text) = CAST(auth.uid() AS text)
        AND CAST(uc.client_id AS text) = CAST(clients.id AS text)
    )
  );

CREATE POLICY clients_tenant_modify ON public.clients
  FOR UPDATE USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = CAST(clients.id AS text)
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE CAST(uc.user_id AS text) = CAST(auth.uid() AS text)
        AND CAST(uc.client_id AS text) = CAST(clients.id AS text)
    )
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = CAST(clients.id AS text)
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE CAST(uc.user_id AS text) = CAST(auth.uid() AS text)
        AND CAST(uc.client_id AS text) = CAST(clients.id AS text)
    )
  );

-- 4) products
CREATE POLICY products_tenant_select ON public.products
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = CAST(products.client_id AS text)
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE CAST(uc.user_id AS text) = CAST(auth.uid() AS text)
        AND CAST(uc.client_id AS text) = CAST(products.client_id AS text)
    )
  );

CREATE POLICY products_tenant_modify ON public.products
  FOR ALL USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = CAST(products.client_id AS text)
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE CAST(uc.user_id AS text) = CAST(auth.uid() AS text)
        AND CAST(uc.client_id AS text) = CAST(products.client_id AS text)
    )
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = CAST(products.client_id AS text)
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE CAST(uc.user_id AS text) = CAST(auth.uid() AS text)
        AND CAST(uc.client_id AS text) = CAST(products.client_id AS text)
    )
  );

-- 5) variable_types
CREATE POLICY variable_types_tenant_select ON public.variable_types
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = CAST(variable_types.client_id AS text)
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE CAST(uc.user_id AS text) = CAST(auth.uid() AS text)
        AND CAST(uc.client_id AS text) = CAST(variable_types.client_id AS text)
    )
  );

CREATE POLICY variable_types_tenant_modify ON public.variable_types
  FOR ALL USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = CAST(variable_types.client_id AS text)
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE CAST(uc.user_id AS text) = CAST(auth.uid() AS text)
        AND CAST(uc.client_id AS text) = CAST(variable_types.client_id AS text)
    )
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = CAST(variable_types.client_id AS text)
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE CAST(uc.user_id AS text) = CAST(auth.uid() AS text)
        AND CAST(uc.client_id AS text) = CAST(variable_types.client_id AS text)
    )
  );

-- 6) variable_values (check parent variable_type.client_id)
CREATE POLICY variable_values_tenant_select ON public.variable_values
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = (
      SELECT CAST(vt.client_id AS text) FROM public.variable_types vt WHERE CAST(vt.id AS text) = CAST(variable_values.variable_type_id AS text) LIMIT 1
    )
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE CAST(uc.user_id AS text) = CAST(auth.uid() AS text)
        AND CAST(uc.client_id AS text) = (
          SELECT CAST(vt.client_id AS text) FROM public.variable_types vt WHERE CAST(vt.id AS text) = CAST(variable_values.variable_type_id AS text) LIMIT 1
        )
    )
  );

CREATE POLICY variable_values_tenant_modify ON public.variable_values
  FOR ALL USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = (
      SELECT CAST(vt.client_id AS text) FROM public.variable_types vt WHERE CAST(vt.id AS text) = CAST(variable_values.variable_type_id AS text) LIMIT 1
    )
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE CAST(uc.user_id AS text) = CAST(auth.uid() AS text)
        AND CAST(uc.client_id AS text) = (
          SELECT CAST(vt.client_id AS text) FROM public.variable_types vt WHERE CAST(vt.id AS text) = CAST(variable_values.variable_type_id AS text) LIMIT 1
        )
    )
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = (
      SELECT CAST(vt.client_id AS text) FROM public.variable_types vt WHERE CAST(vt.id AS text) = CAST(variable_values.variable_type_id AS text) LIMIT 1
    )
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE CAST(uc.user_id AS text) = CAST(auth.uid() AS text)
        AND CAST(uc.client_id AS text) = (
          SELECT CAST(vt.client_id AS text) FROM public.variable_types vt WHERE CAST(vt.id AS text) = CAST(variable_values.variable_type_id AS text) LIMIT 1
        )
    )
  );

-- 7) customers
CREATE POLICY customers_tenant_manage ON public.customers
  FOR ALL USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = CAST(customers.client_id AS text)
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE CAST(uc.user_id AS text) = CAST(auth.uid() AS text)
        AND CAST(uc.client_id AS text) = CAST(customers.client_id AS text)
    )
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = CAST(customers.client_id AS text)
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE CAST(uc.user_id AS text) = CAST(auth.uid() AS text)
        AND CAST(uc.client_id AS text) = CAST(customers.client_id AS text)
    )
  );

COMMIT;

-- End migration
