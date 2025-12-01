-- TEST 1 Results Summary
-- Quick verification of user isolation

SELECT 'TEST 1 RESULTS' as test;

-- User-1 context (Tenant-1)
SELECT 'USER-1 (Tenant-1) PRODUCTS' as context;
SET jwt.claims.client_id = '550e8400-e29b-41d4-a716-446655440001';
SELECT COUNT(*) as rows_visible, 
       STRING_AGG(sku, ', ') as skus
FROM public.products;

SELECT 'USER-1 (Tenant-1) VARIABLE_TYPES' as context;
SELECT COUNT(*) as rows_visible,
       STRING_AGG(key, ', ') as keys
FROM public.variable_types;

-- User-2 context (Tenant-2)
RESET jwt.claims.client_id;
SELECT 'USER-2 (Tenant-2) PRODUCTS' as context;
SET jwt.claims.client_id = '550e8400-e29b-41d4-a716-446655440002';
SELECT COUNT(*) as rows_visible,
       STRING_AGG(sku, ', ') as skus
FROM public.products;

SELECT 'USER-2 (Tenant-2) VARIABLE_TYPES' as context;
SELECT COUNT(*) as rows_visible,
       STRING_AGG(key, ', ') as keys
FROM public.variable_types;

RESET jwt.claims.client_id;

-- Summary
SELECT 'EXPECTED: User-1 should see 1 product (ACME-001) and User-2 should see 1 product (GLOBEX-001)' as summary;
