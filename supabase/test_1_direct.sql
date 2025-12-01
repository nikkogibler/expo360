-- Direct RLS Test - Without SET commands
-- Check if policies are working by examining the policy logic directly

-- Test 1: Can we see products from both tenants with service_role?
SELECT 'SERVICE ROLE TEST (should see both products)' as test;
SELECT COUNT(*) as total_products FROM public.products;

-- Test 2: Manually check JWT policy logic for Tenant-1
-- The jwt policy checks: current_setting('jwt.claims.client_id', true) = products.client_id
SELECT 'MANUAL JWT POLICY CHECK for Tenant-1' as test;
SELECT id, sku, name, client_id,
       CASE WHEN client_id = '550e8400-e29b-41d4-a716-446655440001' THEN 'MATCHES T1'
            WHEN client_id = '550e8400-e29b-41d4-a716-446655440002' THEN 'MATCHES T2'
            ELSE 'NO MATCH' END as jwt_match
FROM public.products;

-- Test 3: Check user_clients mappings
SELECT 'USER-CLIENT MAPPINGS' as test;
SELECT user_id, client_id FROM public.user_clients;

-- Test 4: Verify user_mapped policy logic for User-1
-- User-1 (11111111-1111-1111-1111-111111111111) should see Tenant-1 (550e8400-e29b-41d4-a716-446655440001)
SELECT 'USER-MAPPED POLICY CHECK for User-1' as test;
SELECT p.id, p.sku, p.name, p.client_id,
       CASE WHEN EXISTS (
         SELECT 1 FROM public.user_clients uc
         WHERE uc.user_id = '11111111-1111-1111-1111-111111111111'
           AND uc.client_id = p.client_id
       ) THEN 'USER-1 CAN SEE'
       ELSE 'USER-1 CANNOT SEE' END as user_1_access
FROM public.products p;

-- Test 5: Verify user_mapped policy logic for User-2
SELECT 'USER-MAPPED POLICY CHECK for User-2' as test;
SELECT p.id, p.sku, p.name, p.client_id,
       CASE WHEN EXISTS (
         SELECT 1 FROM public.user_clients uc
         WHERE uc.user_id = '22222222-2222-2222-2222-222222222222'
           AND uc.client_id = p.client_id
       ) THEN 'USER-2 CAN SEE'
       ELSE 'USER-2 CANNOT SEE' END as user_2_access
FROM public.products p;

-- Test 6: Summary - what each user should see
SELECT 'SUMMARY: Expected access per user' as test;
SELECT 
  '11111111-1111-1111-1111-111111111111' as user_id,
  COUNT(*) as visible_products,
  STRING_AGG(sku, ', ') as products
FROM public.products p
WHERE EXISTS (
  SELECT 1 FROM public.user_clients uc
  WHERE uc.user_id = '11111111-1111-1111-1111-111111111111'
    AND uc.client_id = p.client_id
);

SELECT 
  '22222222-2222-2222-2222-222222222222' as user_id,
  COUNT(*) as visible_products,
  STRING_AGG(sku, ', ') as products
FROM public.products p
WHERE EXISTS (
  SELECT 1 FROM public.user_clients uc
  WHERE uc.user_id = '22222222-2222-2222-2222-222222222222'
    AND uc.client_id = p.client_id
);
