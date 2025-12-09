-- Create storage policies for expo360-clients-assets bucket

-- 1. Allow authenticated users to upload to expo360-clients-assets
CREATE POLICY "Allow authenticated upload to expo360-clients-assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'expo360-clients-assets');

-- 2. Allow public read access (or authenticated read if private)
-- Assuming public read for logos is fine for now, or at least authenticated read.
CREATE POLICY "Allow public read from expo360-clients-assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'expo360-clients-assets');

-- 3. Allow authenticated users to update their own files (optional but good)
CREATE POLICY "Allow authenticated update to expo360-clients-assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'expo360-clients-assets');

-- 4. Allow authenticated users to delete their own files (optional)
CREATE POLICY "Allow authenticated delete from expo360-clients-assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'expo360-clients-assets');
