# Image Attribution & Thumbnail Generation Flow

## ✅ Image Attribution is CORRECT

### Current Flow (Working as Expected)

When you generate an image in the **Optimizador de Imágenes**, here's what happens:

1. **User fills form in ImageStandardizer:**
   - Uploads main image
   - Selects fabric (tela) variable
   - Selects frame (estructura) variable
   - Adds additional prompt text
   - Uploads optional reference images

2. **Image generation happens:**
   - POST to `/api/process-furniture`
   - OpenAI generates the standardized image
   - Returns base64 image data

3. **Image uploaded to Supabase Storage:**
   - AI generates descriptive filename (e.g., `modern-grey-sofa-wooden-frame-20250109.jpg`)
   - Uploads to `product-images` bucket (or `nikko-tests` for Nikko)
   - Gets public URL

4. **Prompt logged to `image_prompts` table:**
```sql
INSERT INTO image_prompts (
  prompt_text,      -- Your user prompt
  tokens_used,      -- API token count
  output_image,     -- ✅ PUBLIC SUPABASE URL (links image to prompt)
  user,             -- Display name from profiles
  tela,             -- ✅ Fabric variable used
  estructura,       -- ✅ Frame variable used
  created_at
)
```

5. **✨ NEW: Thumbnail auto-generated:**
   - Calls `/api/generate-thumbnail`
   - Downloads original from Storage
   - Creates 200x200 JPEG thumbnail with Sharp
   - Uploads to `thumbnails/[filename]` in same bucket
   - Happens asynchronously (won't block user)

### Key Points:

✅ **Image Attribution Link:** The `output_image` field stores the **full public Supabase URL**, which directly links the prompt to the generated image.

✅ **Variable Tracking:** Both `tela` and `estructura` are stored with the prompt, so you know exactly which variables were used.

✅ **Correct Display:** When viewing the prompts page, the `output_image` URL is used to display the actual generated image.

✅ **Thumbnail Support:** New images automatically get thumbnails generated, so they load instantly in the gallery.

---

## 🎯 What Changed (Automatic Thumbnails)

### Before:
- Images generated in Optimizador
- Manual script run required: `node scripts/generate-thumbnails.js`
- Thumbnails created in batch
- New images show slowly until thumbnail exists

### After:
- Images generated in Optimizador
- ✨ **Thumbnail automatically created** during upload
- No manual step needed
- New images load instantly in gallery

---

## 📁 New Files Created

### 1. `/src/utils/thumbnailGenerator.ts`
Reusable utility functions:
- `generateThumbnail(buffer)` - Creates 200x200 JPEG from buffer
- `getThumbnailPath(filename)` - Returns `thumbnails/[filename]`
- `extractFilenameFromUrl(url)` - Extracts filename from Supabase URL

Can be used in:
- API routes (server-side)
- Node scripts (scripts/generate-thumbnails.js)
- Any server component

### 2. `/src/app/api/generate-thumbnail/route.ts`
POST endpoint that:
1. Receives `{ fileName, bucket }`
2. Downloads original image from Supabase Storage
3. Generates 200x200 thumbnail with Sharp
4. Uploads to `thumbnails/[fileName]` in same bucket
5. Returns thumbnail URL

### 3. Updated `/src/components/ImageStandardizer.tsx`
Added thumbnail generation call after successful upload:
```typescript
// After image uploads successfully...
const thumbnailResponse = await fetch('/api/generate-thumbnail', {
  method: 'POST',
  body: JSON.stringify({ fileName, bucket })
});
```

---

## 🧪 Testing the Flow

### Test 1: Generate New Image
1. Go to **Admin > Pro Shot Now > Optimizador de Imágenes**
2. Upload a furniture image
3. Select fabric and frame variables
4. Click "Procesar Imagen"
5. Wait for generation

**Expected Result:**
- ✅ Image displays in spotlight modal
- ✅ Image uploaded to Supabase Storage
- ✅ Thumbnail automatically created in `thumbnails/` folder
- ✅ Prompt logged to `image_prompts` table with correct `output_image` URL

### Test 2: View in Prompts Page
1. Go to **Admin > Pro Shot Now > Prompts**
2. Find your newly generated prompt
3. Look at the thumbnail

**Expected Result:**
- ✅ Thumbnail loads instantly (not slowly like before)
- ✅ Click thumbnail opens preview modal
- ✅ "Replace Image" button works
- ✅ Variables (tela, estructura) shown correctly

### Test 3: Verify Database Link
```sql
-- Check the most recent prompt
SELECT 
  prompt_text,
  output_image,
  tela,
  estructura,
  created_at
FROM image_prompts
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**
- ✅ `output_image` contains full Supabase public URL
- ✅ `tela` matches your fabric selection
- ✅ `estructura` matches your frame selection
- ✅ URL actually works (paste in browser to see image)

---

## 🔍 Debugging

If thumbnails don't appear:

1. **Check Console Logs:**
```
[ImageStandardizer] 📸 Generating thumbnail...
[generate-thumbnail API] 📸 Generating thumbnail for: [filename]
[generate-thumbnail API] ✅ Thumbnail generated, size: [bytes]
[ImageStandardizer] ✅ Thumbnail generated: thumbnails/[filename]
```

2. **Check Supabase Storage:**
- Go to Storage > product-images (or nikko-tests)
- Look for `thumbnails/` folder
- Verify your image has a thumbnail

3. **Check Network Tab:**
- Look for POST to `/api/generate-thumbnail`
- Should return `{ success: true, thumbnailPath: "thumbnails/...", thumbnailUrl: "..." }`

4. **Fallback:**
If automatic generation fails (non-critical), you can still run:
```bash
node scripts/generate-thumbnails.js
```

---

## 📊 Performance Impact

### Before:
- Gallery loads all full-size images
- Slow loading times
- High bandwidth usage
- Timeouts on slow connections

### After:
- Gallery loads 200x200 thumbnails (tiny)
- Instant loading
- Minimal bandwidth
- No timeouts

**Thumbnail Size Comparison:**
- Original: ~2-5 MB per image
- Thumbnail: ~20-50 KB per image
- **~100x smaller!**

---

## ✅ Summary

**Q: Will new images be attributed to the right prompt?**
✅ **YES** - The `output_image` field in `image_prompts` stores the full Supabase URL, which directly links the prompt to the generated image.

**Q: Should we generate thumbnails automatically?**
✅ **DONE** - Thumbnails are now generated immediately after image upload. No manual script needed.

**Q: Will the correct image link to the correct prompt?**
✅ **YES** - The flow is:
1. Generate image → Get base64
2. Upload to Storage → Get public URL
3. Log prompt → Save public URL in `output_image`
4. Generate thumbnail → Create `thumbnails/[filename]`
5. Display in gallery → Use thumbnail for preview, full image for modal

Everything is linked correctly! 🎉
