-- TEST 1: User Context Isolation
-- Tests that User-1 can ONLY see Tenant-1 data (not Tenant-2 data)

-- Step 1: Verify test data exists
SELECT 'Step 1: Verify test data' as step;
SELECT COUNT(*) as total_products FROM public.products;
SELECT COUNT(*) as total_variable_types FROM public.variable_types;

-- Step 2: Set JWT context for User-1 (who has access to Tenant-1 only)
-- In Supabase, you would set this via the JWT token
-- For manual testing, we simulate it by setting the jwt.claims.client_id

-- User-1 is mapped to Tenant-1 (550e8400-e29b-41d4-a716-446655440001)
-- User-1's auth.uid() = 11111111-1111-1111-1111-111111111111

-- Set JWT claim for Tenant-1
SET jwt.claims.client_id = '550e8400-e29b-41d4-a716-446655440001';
SET request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

-- Step 3: Query products with User-1 context
-- Expected: Should see ONLY 1 product (ACME-001 from Tenant-1)
-- Should NOT see GLOBEX-001 (Tenant-2 product)
SELECT 'Step 3a: User-1 querying products (should see only Tenant-1 data)' as step;
SELECT id, sku, name, client_id FROM public.products;

-- Step 4: Query variable_types with User-1 context
-- Expected: Should see ONLY 1 variable type (color from Tenant-1)
-- Should NOT see size (Tenant-2 variable type)
SELECT 'Step 4a: User-1 querying variable_types (should see only Tenant-1 data)' as step;
SELECT id, client_id, key, label FROM public.variable_types;

-- Step 5: Query variable_values with User-1 context
-- Expected: Should see ONLY 1 variable value (Red from Tenant-1)
-- Should NOT see Large (Tenant-2 variable value)
SELECT 'Step 5a: User-1 querying variable_values (should see only Tenant-1 data)' as step;
SELECT id, variable_type_id, value FROM public.variable_values;

-- Step 6: Query customers with User-1 context
-- Expected: Should see ONLY 1 customer (Acme Customer from Tenant-1)
-- Should NOT see Globex Customer (Tenant-2 customer)
SELECT 'Step 6a: User-1 querying customers (should see only Tenant-1 data)' as step;
SELECT id, client_id, name FROM public.customers;

-- ============================================================================
-- Now test User-2 context (should see ONLY Tenant-2 data)
-- ============================================================================

-- Reset and set JWT context for User-2
RESET jwt.claims.client_id;
RESET request.jwt.claim.sub;

-- User-2 is mapped to Tenant-2 (550e8400-e29b-41d4-a716-446655440002)
-- User-2's auth.uid() = 22222222-2222-2222-2222-222222222222

SET jwt.claims.client_id = '550e8400-e29b-41d4-a716-446655440002';
SET request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

-- Step 7: Query products with User-2 context
-- Expected: Should see ONLY 1 product (GLOBEX-001 from Tenant-2)
-- Should NOT see ACME-001 (Tenant-1 product)
SELECT 'Step 7b: User-2 querying products (should see only Tenant-2 data)' as step;
SELECT id, sku, name, client_id FROM public.products;

-- Step 8: Query variable_types with User-2 context
-- Expected: Should see ONLY 1 variable type (size from Tenant-2)
-- Should NOT see color (Tenant-1 variable type)
SELECT 'Step 8b: User-2 querying variable_types (should see only Tenant-2 data)' as step;
SELECT id, client_id, key, label FROM public.variable_types;

-- Step 9: Query variable_values with User-2 context
-- Expected: Should see ONLY 1 variable value (Large from Tenant-2)
-- Should NOT see Red (Tenant-1 variable value)
SELECT 'Step 9b: User-2 querying variable_values (should see only Tenant-2 data)' as step;
SELECT id, variable_type_id, value FROM public.variable_values;

-- Step 10: Query customers with User-2 context
-- Expected: Should see ONLY 1 customer (Globex Customer from Tenant-2)
-- Should NOT see Acme Customer (Tenant-1 customer)
SELECT 'Step 10b: User-2 querying customers (should see only Tenant-2 data)' as step;
SELECT id, client_id, name FROM public.customers;

-- Reset JWT context
RESET jwt.claims.client_id;
RESET request.jwt.claim.sub;
