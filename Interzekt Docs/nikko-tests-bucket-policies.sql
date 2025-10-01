-- SQL policies for nikko-tests bucket
-- Allow authenticated upload
create policy "Allow authenticated upload"
  on storage.objects for insert
  with check (
    bucket_id = 'nikko-tests' AND auth.role() = 'authenticated'
  );

-- Allow public read
create policy "Allow public read"
  on storage.objects for select
  using (
    bucket_id = 'nikko-tests'
  );
