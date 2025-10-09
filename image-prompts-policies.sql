-- =====================================================
-- RLS Policies for image_prompts table
-- =====================================================
-- Run these policies in your Supabase SQL Editor
-- to allow admin users to update image_prompts table
-- =====================================================

-- Enable RLS on image_prompts table (if not already enabled)
ALTER TABLE image_prompts ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to SELECT from image_prompts
CREATE POLICY "Allow authenticated users to read image_prompts"
ON image_prompts
FOR SELECT
TO authenticated
USING (true);

-- Policy to allow public SELECT access to image_prompts (for admin dashboard)
CREATE POLICY "Allow public read access to image_prompts"
ON image_prompts
FOR SELECT
TO public
USING (true);

-- Policy to allow authenticated users to UPDATE image_prompts (for admin operations)
CREATE POLICY "Allow authenticated users to update image_prompts"
ON image_prompts
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy to allow authenticated users to INSERT image_prompts (for admin operations) 
CREATE POLICY "Allow authenticated users to insert image_prompts"
ON image_prompts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy to allow authenticated users to DELETE image_prompts (for admin operations)
CREATE POLICY "Allow authenticated users to delete image_prompts"
ON image_prompts
FOR DELETE
TO authenticated
USING (true);

-- Alternative: If you want to be more restrictive, you can create admin-only policies
-- Uncomment and use these instead of the above if needed:

-- CREATE POLICY "Allow admin users to update image_prompts"
-- ON image_prompts
-- FOR UPDATE
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM profiles 
--     WHERE profiles.id = auth.uid() 
--     AND profiles.role = 'admin'
--   )
-- )
-- WITH CHECK (
--   EXISTS (
--     SELECT 1 FROM profiles 
--     WHERE profiles.id = auth.uid() 
--     AND profiles.role = 'admin'
--   )
-- );