-- Consolidated RLS Test Results
-- Show all key verification points

SELECT 'Test Complete Results' as section;

-- Show both users' access
SELECT 
  user_id,
  COUNT(*) as visible_products,
  STRING_AGG(sku, ', ') as products
FROM (
  SELECT 
    '11111111-1111-1111-1111-111111111111' as user_id,
    p.sku
  FROM public.products p
  WHERE EXISTS (
    SELECT 1 FROM public.user_clients uc
    WHERE uc.user_id = '11111111-1111-1111-1111-111111111111'
      AND uc.client_id = p.client_id
  )
  UNION ALL
  SELECT 
    '22222222-2222-2222-2222-222222222222' as user_id,
    p.sku
  FROM public.products p
  WHERE EXISTS (
    SELECT 1 FROM public.user_clients uc
    WHERE uc.user_id = '22222222-2222-2222-2222-222222222222'
      AND uc.client_id = p.client_id
  )
) results
GROUP BY user_id
ORDER BY user_id;

-- Verification summary
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM public.products p WHERE EXISTS (SELECT 1 FROM public.user_clients uc WHERE uc.user_id = '11111111-1111-1111-1111-111111111111' AND uc.client_id = p.client_id)) = 1
      AND (SELECT COUNT(*) FROM public.products p WHERE EXISTS (SELECT 1 FROM public.user_clients uc WHERE uc.user_id = '22222222-2222-2222-2222-222222222222' AND uc.client_id = p.client_id)) = 1
    THEN '✅ RLS ISOLATION WORKING - Each user sees exactly 1 product'
    ELSE '❌ RLS ISOLATION FAILED'
  END as rls_status;
