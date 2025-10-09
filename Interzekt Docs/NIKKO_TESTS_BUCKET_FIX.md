# Nikko-Tests Bucket Upload Fix

## Issue Found
When `nikkogibler@gmail.com` logs in, the system was not correctly routing uploads to the `nikko-tests` bucket because:
- The code checked for UUID: `c9abd999-f0ab-4cd2-954c-db4ed288392e`
- But cookie-based auth uses the email: `nikkogibler@gmail.com`
- The UUID check failed, so uploads went to `product-images` bucket
- That bucket's RLS policies might not have been set up, causing the error

## Fix Applied

### Updated Bucket Selection Logic
**File**: `src/components/ImageStandardizer.tsx`

**Before**:
```typescript
let bucket = 'product-images';
if (userId === 'c9abd999-f0ab-4cd2-954c-db4ed288392e') {
  bucket = 'nikko-tests';
}
```

**After**:
```typescript
let bucket = 'product-images';
const isNikko = userId === 'c9abd999-f0ab-4cd2-954c-db4ed288392e' || 
               userId === 'nikkogibler@gmail.com' ||
               userId?.includes('nikkogibler');

if (isNikko) {
  bucket = 'nikko-tests';
  console.log(`[ImageStandardizer] 👨‍💻 Nikko detected - using nikko-tests bucket`);
}
```

Now it checks for:
1. ✅ Supabase Auth UUID
2. ✅ Cookie-based email
3. ✅ Any userId containing "nikkogibler"

## Testing Steps

### 1. Check Current Bucket Policies in Supabase
Run this SQL to see what policies exist:
```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%nikko-tests%';
```

### 2. Apply Policies if Needed
If the `nikko-tests` bucket doesn't have policies, run:
```sql
-- Allow authenticated upload to nikko-tests
CREATE POLICY "Allow authenticated upload to nikko-tests"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'nikko-tests');

-- Allow public read from nikko-tests
CREATE POLICY "Allow public read from nikko-tests"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'nikko-tests');
```

### 3. Test Upload as Nikko
1. Log in as `nikkogibler@gmail.com`
2. Generate an image in the Optimizador
3. Check browser console for these logs:
   ```
   [ImageStandardizer] 👨‍💻 Nikko detected - using nikko-tests bucket
   [ImageStandardizer] ☁️ Bucket: nikko-tests
   [ImageStandardizer] 🔐 Auth session status: Active
   ```
4. Image should upload successfully to `nikko-tests` bucket

### 4. Verify in Supabase Storage
Go to Supabase Dashboard → Storage → `nikko-tests` bucket
You should see the newly uploaded image there.

## Console Log Guide

### ✅ Success Logs (what you should see):
```
🔍 ImageStandardizer auth check: { user: "...", email: "nikkogibler@gmail.com", error: null }
✅ Using Supabase auth user: c9abd999-f0ab-4cd2-954c-db4ed288392e
👨‍💻 Nikko detected - using nikko-tests bucket
☁️ Bucket: nikko-tests
🔐 Auth session status: Active
👤 User ID for upload: c9abd999-f0ab-4cd2-954c-db4ed288392e
✅ Imagen subida exitosamente a Supabase Storage: [filename]
🌐 Public URL: https://dpbxyauaobvcdwdgzcxc.supabase.co/storage/v1/object/public/nikko-tests/[filename]
```

### ❌ Error Logs (what you might have seen before):
```
☁️ Bucket: product-images  ← WRONG! Should be nikko-tests
❌ Supabase upload error: new row violates row-level security policy
```

## Other Admins Working Fine

Other admins upload to `product-images` bucket successfully because:
1. Their RLS policies were already properly set up
2. They get routed to `product-images` by default
3. No special bucket routing needed

## Rollback (if needed)

If you want to revert Nikko back to using `product-images`:
```typescript
let bucket = 'product-images';
// Remove the isNikko check entirely
```

## Related Files
- ✅ `src/components/ImageStandardizer.tsx` - Bucket selection logic updated
- ✅ `storage-policies.sql` - Has policies for all buckets including nikko-tests
- 📝 `Interzekt Docs/nikko-tests-bucket-policies.sql` - Original nikko-tests policies
