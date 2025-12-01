-- 8_validate_rls.sql
-- Comprehensive RLS validation test suite
-- Tests data isolation across tenants

-- ============================================================================
-- SETUP: Create test data with 2 tenants and 2 users
-- ============================================================================

-- Clean slate (for testing)
DELETE FROM public.user_clients;
DELETE FROM public.customers;
DELETE FROM public.products;
DELETE FROM public.variable_types;
DELETE FROM public.variable_values;
DELETE FROM public.clients;

-- Create 2 test tenants
INSERT INTO public.clients (id, slug, name) VALUES 
  (gen_random_uuid()::text, 'acme-corp', 'ACME Corporation'),
  (gen_random_uuid()::text, 'globex-inc', 'Globex Inc');

-- Store tenant IDs for reference (you'll see these in the output)
-- Tenant 1 ID will be shown after first insert
-- Tenant 2 ID will be shown after second insert

-- For easier testing, let's use predictable UUIDs cast to text
-- Actually insert with specific UUIDs
DELETE FROM public.clients;
INSERT INTO public.clients (id, slug, name) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'acme-corp', 'ACME Corporation'),
  ('550e8400-e29b-41d4-a716-446655440002', 'globex-inc', 'Globex Inc');

-- Create user-tenant mappings
-- User 1 maps to Tenant 1 only
-- User 2 maps to Tenant 2 only
INSERT INTO public.user_clients (user_id, client_id) VALUES
  ('11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001'),
  ('22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440002');

-- Create products for each tenant
INSERT INTO public.products (id, client_id, sku, name) VALUES
  (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440001', 'ACME-001', 'Acme Widget'),
  (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440002', 'GLOBEX-001', 'Globex Gadget');

-- Create variable types for each tenant
INSERT INTO public.variable_types (id, client_id, key, label) VALUES
  (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440001', 'color', 'Color'),
  (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440002', 'size', 'Size');

-- Create variable values
INSERT INTO public.variable_values (id, variable_type_id, value) VALUES
  (gen_random_uuid()::text, (SELECT id FROM public.variable_types LIMIT 1), 'Red'),
  (gen_random_uuid()::text, (SELECT id FROM public.variable_types OFFSET 1 LIMIT 1), 'Large');

-- Create customers for each tenant
INSERT INTO public.customers (id, client_id, name) VALUES
  (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440001', 'Acme Customer'),
  (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440002', 'Globex Customer');

-- ============================================================================
-- TEST 1: User-1 should ONLY see Tenant-1 data
-- ============================================================================
-- Run this with user-1-id's JWT token (jwt.claims.client_id should be '550e8400-e29b-41d4-a716-446655440001')

-- Expected: Returns products from tenant-1 only
SELECT id, sku, name, client_id FROM public.products 
WHERE client_id = '550e8400-e29b-41d4-a716-446655440001';

-- Expected: Returns products from tenant-1 only (via RLS)
SELECT id, sku, name, client_id FROM public.products;

-- Expected: Empty result (user would not see tenant-2 data)
-- This would require setting jwt.claims.client_id to '550e8400-e29b-41d4-a716-446655440002' to test

-- ============================================================================
-- TEST 2: Service role should see ALL data
-- ============================================================================
-- Run this with service_role (no RLS restrictions)

-- Expected: Returns both prod-1 and prod-2
SELECT id, sku, name, client_id FROM public.products;

-- Expected: Returns var-type-1 and var-type-2
SELECT id, client_id, key, label FROM public.variable_types;

-- Expected: Returns all variable values
SELECT id, variable_type_id, value FROM public.variable_values;

-- ============================================================================
-- TEST 3: User_clients table - owner-only access
-- ============================================================================
-- Run as user-1-id (11111111-1111-1111-1111-111111111111)

-- Expected: user-1 can see their own mapping to tenant-1
SELECT user_id, client_id FROM public.user_clients 
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Expected: Empty result (user-1 cannot see user-2's mapping)
SELECT user_id, client_id FROM public.user_clients 
WHERE user_id = '22222222-2222-2222-2222-222222222222';

-- ============================================================================
-- TEST 4: INSERT/UPDATE/DELETE restrictions
-- ============================================================================
-- Run as user-1-id (jwt.claims.client_id = '550e8400-e29b-41d4-a716-446655440001')

-- Expected: Success (user-1 can insert into their tenant)
INSERT INTO public.customers (id, client_id, name) 
VALUES (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440001', 'New Acme Customer');

-- Expected: Failure (user-1 cannot insert into tenant-2 products)
-- INSERT INTO public.products (id, client_id, sku, name) 
-- VALUES (gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655440002', 'GLOBEX-002', 'Unauthorized Product');

-- Expected: Success (user-1 can update their own tenant data)
UPDATE public.products 
SET name = 'Updated Acme Widget' 
WHERE client_id = '550e8400-e29b-41d4-a716-446655440001';

-- Expected: Failure (user-1 cannot update tenant-2 data)
-- UPDATE public.products 
-- SET name = 'Hacked Name' 
-- WHERE client_id = '550e8400-e29b-41d4-a716-446655440002';

-- Expected: Success (user-1 can delete their own tenant data)
DELETE FROM public.customers 
WHERE client_id = '550e8400-e29b-41d4-a716-446655440001'
  AND name = 'New Acme Customer';

-- ============================================================================
-- TEST 5: Nested RLS - variable_values through variable_types
-- ============================================================================
-- Run as user-1-id (jwt.claims.client_id = '550e8400-e29b-41d4-a716-446655440001')

-- Expected: Returns only variable values from tenant-1's variable types
SELECT vv.id, vv.variable_type_id, vv.value 
FROM public.variable_values vv
WHERE vv.variable_type_id IN (SELECT id FROM public.variable_types WHERE client_id = '550e8400-e29b-41d4-a716-446655440001');

-- Expected: Empty result (user-1 cannot see tenant-2's variable values)
SELECT vv.id, vv.variable_type_id, vv.value 
FROM public.variable_values vv
WHERE vv.variable_type_id IN (SELECT id FROM public.variable_types WHERE client_id = '550e8400-e29b-41d4-a716-446655440002');

-- ============================================================================
-- CLEANUP: Remove test data
-- ============================================================================
-- DELETE FROM public.variable_values;
-- DELETE FROM public.variable_types;
-- DELETE FROM public.products;
-- DELETE FROM public.customers;
-- DELETE FROM public.user_clients;
-- DELETE FROM public.clients;

-- End validation
