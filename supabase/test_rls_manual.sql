-- Manual RLS Testing Script
-- Run this in Supabase SQL Editor to test RLS policies
-- Split into separate executable blocks

-- ============================================================================
-- STEP 1: Setup Test Data (Run this first with service_role)
-- ============================================================================
-- COPY AND RUN THIS ENTIRE BLOCK FIRST

DELETE FROM public.user_clients;
DELETE FROM public.customers;
DELETE FROM public.products;
DELETE FROM public.variable_types;
DELETE FROM public.variable_values;
DELETE FROM public.clients;

INSERT INTO public.clients (id, slug, name) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'acme-corp', 'ACME Corporation'),
  ('550e8400-e29b-41d4-a716-446655440002', 'globex-inc', 'Globex Inc');

INSERT INTO public.user_clients (user_id, client_id) VALUES
  ('11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001'),
  ('22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO public.products (id, client_id, sku, name) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '550e8400-e29b-41d4-a716-446655440001', 'ACME-001', 'Acme Widget'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '550e8400-e29b-41d4-a716-446655440002', 'GLOBEX-001', 'Globex Gadget');

INSERT INTO public.variable_types (id, client_id, key, label) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '550e8400-e29b-41d4-a716-446655440001', 'color', 'Color'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '550e8400-e29b-41d4-a716-446655440002', 'size', 'Size');

INSERT INTO public.variable_values (id, variable_type_id, value) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Red'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Large');

INSERT INTO public.customers (id, client_id, name) VALUES
  ('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'Acme Customer'),
  ('11111111-1111-1111-1111-000000000000', '550e8400-e29b-41d4-a716-446655440002', 'Globex Customer');

-- Verify data was inserted
SELECT 'Clients' as table_name, COUNT(*) as row_count FROM public.clients
UNION ALL
SELECT 'Products', COUNT(*) FROM public.products
UNION ALL
SELECT 'Variable Types', COUNT(*) FROM public.variable_types
UNION ALL
SELECT 'Variable Values', COUNT(*) FROM public.variable_values
UNION ALL
SELECT 'Customers', COUNT(*) FROM public.customers;

-- ============================================================================
-- TEST 2: Service Role Access (should see ALL data)
-- ============================================================================
-- After running STEP 1 above, run this block

-- Expected: 2 products (ACME and GLOBEX)
SELECT 'TEST 2.1: Products' as test_name, id, sku, name, client_id FROM public.products;

-- Expected: 2 variable types
SELECT 'TEST 2.2: Variable Types' as test_name, id, client_id, key, label FROM public.variable_types;

-- Expected: 2 variable values
SELECT 'TEST 2.3: Variable Values' as test_name, id, variable_type_id, value FROM public.variable_values;

-- Expected: 2 customers
SELECT 'TEST 2.4: Customers' as test_name, id, client_id, name FROM public.customers;

-- ============================================================================
-- TEST 3: Check if RLS is enabled
-- ============================================================================
-- Run this to verify RLS is actually active

SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('clients', 'products', 'customers', 'variable_types', 'variable_values', 'user_clients')
ORDER BY tablename;

-- ============================================================================
-- TEST 4: Check all policies
-- ============================================================================
-- Run this to see what policies exist

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
