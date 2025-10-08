-- =====================================================
-- Storage Bucket RLS Policies for Image Upload
-- =====================================================
-- Run these policies in your Supabase SQL Editor
-- to allow admin users to upload images
-- =====================================================

-- Policy for product-images bucket
-- =====================================================

-- Allow authenticated users to INSERT (upload) images
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow public SELECT (read/download) access
CREATE POLICY "Allow public read access to images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow authenticated users to UPDATE their uploads
CREATE POLICY "Allow authenticated users to update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to DELETE their uploads
CREATE POLICY "Allow authenticated users to delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');


-- =====================================================
-- Policy for nikko-tests bucket (for testing)
-- =====================================================

-- Allow authenticated users to INSERT (upload) images
CREATE POLICY "Allow authenticated upload to nikko-tests"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'nikko-tests');

-- Allow public SELECT (read/download) access
CREATE POLICY "Allow public read from nikko-tests"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'nikko-tests');


-- =====================================================
-- Policy for catalogo_new bucket
-- =====================================================

-- Allow authenticated users to INSERT (upload) images
CREATE POLICY "Allow authenticated upload to catalogo_new"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'catalogo_new');

-- Allow public SELECT (read/download) access
CREATE POLICY "Allow public read from catalogo_new"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'catalogo_new');


-- =====================================================
-- Policy for product_variables bucket
-- =====================================================

-- Allow authenticated users to INSERT (upload) images
CREATE POLICY "Allow authenticated upload to product_variables"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product_variables');

-- Allow public SELECT (read/download) access
CREATE POLICY "Allow public read from product_variables"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product_variables');


-- =====================================================
-- VERIFY POLICIES
-- =====================================================
-- Run this to see all current policies:
-- SELECT * FROM pg_policies WHERE tablename = 'objects';

-- Check specifically for your buckets:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%product-images%';
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%nikko-tests%';

-- =====================================================
-- CLEANUP (if needed)
-- =====================================================
-- If you need to remove old policies first, use:
-- DROP POLICY IF EXISTS "policy_name" ON storage.objects;

-- Clean up nikko-tests bucket policies if they exist:
-- DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated upload to nikko-tests" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public read from nikko-tests" ON storage.objects;
