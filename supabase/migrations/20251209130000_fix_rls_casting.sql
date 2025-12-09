-- Fix RLS policies to ensure proper type casting for auth.uid()

-- 1. Update user_clients policies
DROP POLICY IF EXISTS user_clients_select_owner ON user_clients;
DROP POLICY IF EXISTS user_clients_insert_owner ON user_clients;
DROP POLICY IF EXISTS user_clients_update_owner ON user_clients;
DROP POLICY IF EXISTS user_clients_delete_owner ON user_clients;

CREATE POLICY user_clients_select_owner ON user_clients
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    auth.uid()::text = user_id::text
  );

CREATE POLICY user_clients_insert_owner ON user_clients
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR
    auth.uid()::text = user_id::text
  );

CREATE POLICY user_clients_update_owner ON user_clients
  FOR UPDATE USING (
    auth.role() = 'service_role' OR
    auth.uid()::text = user_id::text
  ) WITH CHECK (
    auth.role() = 'service_role' OR
    auth.uid()::text = user_id::text
  );

CREATE POLICY user_clients_delete_owner ON user_clients
  FOR DELETE USING (
    auth.role() = 'service_role' OR
    auth.uid()::text = user_id::text
  );

-- 2. Update clients policies
DROP POLICY IF EXISTS clients_tenant_select ON clients;
DROP POLICY IF EXISTS clients_tenant_modify ON clients;

CREATE POLICY clients_tenant_select ON clients
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM user_clients uc
      WHERE uc.user_id::text = auth.uid()::text
        AND uc.client_id::text = clients.id::text
    )
  );

CREATE POLICY clients_tenant_modify ON clients
  FOR UPDATE USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM user_clients uc
      WHERE uc.user_id::text = auth.uid()::text
        AND uc.client_id::text = clients.id::text
    )
  ) WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM user_clients uc
      WHERE uc.user_id::text = auth.uid()::text
        AND uc.client_id::text = clients.id::text
    )
  );
