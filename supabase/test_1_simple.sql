-- TEST 1 Results Summary - Fixed Version
-- Simple user isolation test without SET commands that confuse Supabase editor

-- First, test User-1 context by directly checking what they can see
-- User-1 (11111111-1111-1111-1111-111111111111) is mapped to Tenant-1 (550e8400-e29b-41d4-a716-446655440001)

-- USER-1 Products (should see only ACME-001)
SELECT 'USER-1 PRODUCTS' as test_name;
SET jwt.claims.client_id = '550e8400-e29b-41d4-a716-446655440001';
SELECT COUNT(*) as row_count, 'PRODUCTS' as table_name FROM public.products;

-- USER-1 Variable Types (should see only color)
SELECT 'USER-1 VARIABLE_TYPES' as test_name;
SELECT COUNT(*) as row_count, 'VARIABLE_TYPES' as table_name FROM public.variable_types;

-- USER-1 Customers (should see only Acme Customer)
SELECT 'USER-1 CUSTOMERS' as test_name;
SELECT COUNT(*) as row_count, 'CUSTOMERS' as table_name FROM public.customers;

-- USER-1 Variable Values (should see only Red)
SELECT 'USER-1 VARIABLE_VALUES' as test_name;
SELECT COUNT(*) as row_count, 'VARIABLE_VALUES' as table_name FROM public.variable_values;

-- Now test User-2 context
RESET jwt.claims.client_id;
SELECT 'USER-2 PRODUCTS' as test_name;
SET jwt.claims.client_id = '550e8400-e29b-41d4-a716-446655440002';
SELECT COUNT(*) as row_count, 'PRODUCTS' as table_name FROM public.products;

-- USER-2 Variable Types (should see only size)
SELECT 'USER-2 VARIABLE_TYPES' as test_name;
SELECT COUNT(*) as row_count, 'VARIABLE_TYPES' as table_name FROM public.variable_types;

-- USER-2 Customers (should see only Globex Customer)
SELECT 'USER-2 CUSTOMERS' as test_name;
SELECT COUNT(*) as row_count, 'CUSTOMERS' as table_name FROM public.customers;

-- USER-2 Variable Values (should see only Large)
SELECT 'USER-2 VARIABLE_VALUES' as test_name;
SELECT COUNT(*) as row_count, 'VARIABLE_VALUES' as table_name FROM public.variable_values;

RESET jwt.claims.client_id;

-- Summary expectation
SELECT '✓ If all counts = 1, RLS isolation is WORKING!' as result;
