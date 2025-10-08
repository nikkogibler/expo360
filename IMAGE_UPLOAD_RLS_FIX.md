# Image Upload RLS Error Fix

## Problem
Users were experiencing intermittent errors when uploading generated images to Supabase Storage:
- **Error**: "new row violates row-level security policy"
- **Cause**: RLS policies not properly configured for authenticated users
- **Filename Issue**: Generated filenames were messy like `kusam-furniture---1759963217343` with multiple dashes and unclear naming

## Solutions Implemented

### 1. Fixed Filename Generation
**File**: `src/components/ImageStandardizer.tsx`

**Changes**:
- Improved sanitization logic to remove special characters cleanly
- Added timestamp for uniqueness: `descriptive_name_1759963217343.png`
- Better fallback naming with proper formatting
- Removed multiple consecutive dashes/underscores
- Limited description length to 60 characters + timestamp

**Before**:
```typescript
const sanitized = description
  .toLowerCase()
  .replace(/[^a-z0-9\s_-]/g, '')
  .replace(/\s+/g, '_')
  .replace(/-+/g, '_')
  .replace(/_+/g, '_')
  .substring(0, 80);

const finalFilename = `${sanitized}.png`;
```

**After**:
```typescript
const sanitized = description
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s]/g, '') // Remove all special chars except spaces
  .replace(/\s+/g, '_') // Replace spaces with single underscore
  .replace(/_+/g, '_') // Replace multiple underscores with single
  .replace(/^_|_$/g, '') // Remove leading/trailing underscores
  .substring(0, 60); // Max 60 chars for description

const timestamp = Date.now();
const finalFilename = `${sanitized}_${timestamp}.png`;
```

### 2. Enhanced Error Handling and Debugging
**File**: `src/components/ImageStandardizer.tsx`

**Added**:
- Auth session check before upload
- Better error messages distinguishing RLS errors from other issues
- Public URL logging after successful upload
- User-friendly error messages in Spanish

```typescript
// Check auth status before upload
const { data: { session } } = await supabase.auth.getSession();
console.log(`[ImageStandardizer] 🔐 Auth session status:`, session ? 'Active' : 'No session');
console.log(`[ImageStandardizer] 👤 User ID for upload:`, userId);

// ... upload logic ...

if (uploadError) {
  // Check if it's an RLS policy error
  if (uploadError.message.includes('row-level security') || uploadError.message.includes('policy')) {
    setError(`Error de autenticación: No tienes permisos para subir imágenes. Por favor, inicia sesión nuevamente.`);
  } else {
    setError(`La imagen fue generada pero no se pudo guardar en Supabase: ${uploadError.message}`);
  }
}
```

### 3. Storage RLS Policies SQL
**File**: `storage-policies.sql` (NEW)

Created comprehensive SQL policies for all image storage buckets:
- `product-images` (main bucket)
- `nikko-tests` (testing bucket)
- `catalogo_new` (catalog images)
- `product_variables` (product variables)

**Policy Structure**:
```sql
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

-- Allow authenticated users to UPDATE
CREATE POLICY "Allow authenticated users to update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to DELETE
CREATE POLICY "Allow authenticated users to delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

## Deployment Steps

### 1. Apply SQL Policies in Supabase
1. Go to Supabase Dashboard → SQL Editor
2. Open `storage-policies.sql`
3. Execute the SQL to create RLS policies
4. Verify with: `SELECT * FROM pg_policies WHERE tablename = 'objects';`

### 2. Test Authentication
1. Make sure users are properly authenticated with Supabase Auth
2. Check browser console for auth status logs
3. Session should show as "Active" before upload

### 3. Test Upload Flow
1. Generate an image in ImageStandardizer
2. Check console logs for:
   - Filename generation
   - Auth session status
   - Upload success/failure
   - Public URL

## Expected Filename Format

**Good Examples**:
- `brown_leather_sofa_geometric_cushions_mountain_backdrop_1759963217343.png`
- `white_oak_dining_chair_woman_model_beach_scene_1759963218456.png`
- `gray_sectional_psychedelic_fabric_desert_landscape_1759963219567.png`
- `kusam_furniture_pearl_ecru_1759963220678.png` (fallback)

**Bad Examples** (fixed):
- ❌ `kusam-furniture---1759963217343` (too many dashes, no extension visible)
- ❌ `kusam-furniture-psychedelic--1759963118546` (double dashes, unclear)

## Troubleshooting

### If RLS Error Still Occurs:
1. **Check Auth Session**: Look for "Auth session status: Active" in console
2. **Verify Policies**: Run `SELECT * FROM pg_policies WHERE tablename = 'objects';` in Supabase
3. **Check User Role**: User must have `authenticated` role in Supabase
4. **Session Expired**: User may need to log in again

### If Filenames Still Look Wrong:
1. Check console for "Generated filename:" log
2. Verify the `describe-image` API is working properly
3. Fallback naming should still produce clean filenames

### Intermittent Issues:
- **Cause**: Auth session expiring
- **Solution**: Implement session refresh or re-authentication flow
- **Temporary Fix**: User logs out and logs back in

## Files Modified
- ✅ `src/components/ImageStandardizer.tsx` - Filename generation and error handling
- ✅ `storage-policies.sql` - New RLS policies (needs to be applied in Supabase)
- ✅ `src/app/api/upload-image/route.ts` - Created but not used (service role approach)

## Files to Review (Not Modified Yet)
- `src/app/api/describe-image/route.ts` - May need prompt adjustments if filenames still unclear
- `src/utils/supabase.ts` - Auth configuration

## Notes
- The `upload-image` API route was created but not integrated (uses service role to bypass RLS)
- Current solution uses client-side upload with proper RLS policies (cleaner approach)
- Filenames now include timestamps for guaranteed uniqueness
- AI-generated descriptions are capped at 60 chars to avoid overly long filenames
