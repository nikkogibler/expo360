-- Convert remaining UUID columns to TEXT
-- Only 2 columns left to convert

-- Drop policies that reference these columns first
DROP POLICY IF EXISTS user_clients_service ON public.user_clients;
DROP POLICY IF EXISTS user_clients_select_owner ON public.user_clients;
DROP POLICY IF EXISTS user_clients_insert_owner ON public.user_clients;
DROP POLICY IF EXISTS user_clients_update_owner ON public.user_clients;
DROP POLICY IF EXISTS user_clients_delete_owner ON public.user_clients;

DROP POLICY IF EXISTS variable_values_service ON public.variable_values;
DROP POLICY IF EXISTS variable_values_jwt ON public.variable_values;
DROP POLICY IF EXISTS variable_values_user_mapped ON public.variable_values;

-- Convert the 2 remaining UUID columns to TEXT
ALTER TABLE public.user_clients ALTER COLUMN client_id TYPE text USING client_id::text;
ALTER TABLE public.variable_values ALTER COLUMN id TYPE text USING id::text;

-- Recreate user_clients policies
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

-- Recreate variable_values policies
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

-- Verify all columns are now TEXT
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('clients', 'products', 'customers', 'variable_types', 'variable_values', 'user_clients')
  AND column_name IN ('id', 'user_id', 'client_id', 'variable_type_id')
ORDER BY table_name, column_name;
