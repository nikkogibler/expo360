-- 4_rls_user_client_map.sql
-- Add a mapping table `user_clients` and update RLS policies so tenant users
-- (mapped by auth.uid() -> client_id) can manage their own client resources.
-- This migration is permissive: it allows service_role, jwt.claims.client_id, OR
-- an explicit mapping in user_clients.

BEGIN;

-- 1) Create mapping table for auth.uid() -> client_id
CREATE TABLE IF NOT EXISTS public.user_clients (
  user_id text PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- 2) Ensure customers is tenant-scoped: add client_id if missing and FK
ALTER TABLE IF EXISTS public.customers
  ADD COLUMN IF NOT EXISTS client_id uuid;

ALTER TABLE IF EXISTS public.customers
  DROP CONSTRAINT IF EXISTS customers_client_id_fkey;
ALTER TABLE IF EXISTS public.customers
  ADD CONSTRAINT customers_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- add an index for lookup by client_id for policy performance
CREATE INDEX IF NOT EXISTS user_clients_client_id_idx ON public.user_clients (client_id);

-- Enable RLS on tenant tables so policies take effect (idempotent)
ALTER TABLE IF EXISTS public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.variable_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.variable_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;

-- 3) Replace policies to allow service_role OR jwt.claims.client_id OR mapping via user_clients

-- PRODUCTS
DROP POLICY IF EXISTS products_select_for_client ON public.products;
DROP POLICY IF EXISTS products_modify_for_client ON public.products;
CREATE POLICY products_tenant_select ON public.products
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = client_id::text
    OR EXISTS (SELECT 1 FROM public.user_clients uc WHERE uc.user_id = auth.uid() AND uc.client_id::text = client_id::text)
  );

CREATE POLICY products_tenant_modify ON public.products
  FOR ALL USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = client_id::text
    OR EXISTS (SELECT 1 FROM public.user_clients uc WHERE uc.user_id = auth.uid() AND uc.client_id::text = client_id::text)
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = client_id::text
    OR EXISTS (SELECT 1 FROM public.user_clients uc WHERE uc.user_id = auth.uid() AND uc.client_id::text = client_id::text)
  );

-- VARIABLE_TYPES
DROP POLICY IF EXISTS variable_types_select_for_client ON public.variable_types;
DROP POLICY IF EXISTS variable_types_modify_for_client ON public.variable_types;
CREATE POLICY variable_types_tenant_select ON public.variable_types
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = client_id::text
    OR EXISTS (SELECT 1 FROM public.user_clients uc WHERE uc.user_id = auth.uid() AND uc.client_id::text = client_id::text)
  );

CREATE POLICY variable_types_tenant_modify ON public.variable_types
  FOR ALL USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = client_id::text
    OR EXISTS (SELECT 1 FROM public.user_clients uc WHERE uc.user_id = auth.uid() AND uc.client_id::text = client_id::text)
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = client_id::text
    OR EXISTS (SELECT 1 FROM public.user_clients uc WHERE uc.user_id = auth.uid() AND uc.client_id::text = client_id::text)
  );

-- VARIABLE_VALUES (check parent variable_type client)
DROP POLICY IF EXISTS variable_values_select_for_client ON public.variable_values;
DROP POLICY IF EXISTS variable_values_modify_for_client ON public.variable_values;
CREATE POLICY variable_values_tenant_select ON public.variable_values
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = (
      SELECT client_id::text FROM public.variable_types WHERE id = variable_type_id LIMIT 1
    )
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id::text = (
          SELECT client_id::text FROM public.variable_types WHERE id = variable_type_id LIMIT 1
        )
    )
  );

CREATE POLICY variable_values_tenant_modify ON public.variable_values
  FOR ALL USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = (
      SELECT client_id::text FROM public.variable_types WHERE id = variable_type_id LIMIT 1
    )
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id::text = (
          SELECT client_id::text FROM public.variable_types WHERE id = variable_type_id LIMIT 1
        )
    )
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = (
      SELECT client_id::text FROM public.variable_types WHERE id = variable_type_id LIMIT 1
    )
    OR EXISTS (
      SELECT 1 FROM public.user_clients uc
      WHERE uc.user_id = auth.uid()
        AND uc.client_id::text = (
          SELECT client_id::text FROM public.variable_types WHERE id = variable_type_id LIMIT 1
        )
    )
  );

-- CLIENTS: allow the mapped user to read/update their client record
DROP POLICY IF EXISTS clients_select_for_client ON public.clients;
DROP POLICY IF EXISTS clients_modify_for_client ON public.clients;
CREATE POLICY clients_tenant_select ON public.clients
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = id::text
    OR EXISTS (SELECT 1 FROM public.user_clients uc WHERE uc.user_id = auth.uid() AND uc.client_id::text = id::text)
  );

CREATE POLICY clients_tenant_modify ON public.clients
  FOR UPDATE USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = id::text
    OR EXISTS (SELECT 1 FROM public.user_clients uc WHERE uc.user_id = auth.uid() AND uc.client_id::text = id::text)
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = id::text
    OR EXISTS (SELECT 1 FROM public.user_clients uc WHERE uc.user_id = auth.uid() AND uc.client_id::text = id::text)
  );

-- CUSTOMERS: tenant-scoped management
DROP POLICY IF EXISTS customers_service_role_only ON public.customers;
CREATE POLICY customers_tenant_manage ON public.customers
  FOR ALL USING (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = client_id::text
    OR EXISTS (SELECT 1 FROM public.user_clients uc WHERE uc.user_id = auth.uid() AND uc.client_id::text = client_id::text)
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR current_setting('jwt.claims.client_id', true) = client_id::text
    OR EXISTS (SELECT 1 FROM public.user_clients uc WHERE uc.user_id = auth.uid() AND uc.client_id::text = client_id::text)
  );

COMMIT;

-- End migration
