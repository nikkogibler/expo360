# Error Handling & Troubleshooting - Multi-Image Optimizador

## Common Errors & Solutions

### 1. **503 Service Unavailable (OpenRouter/Cloudflare)**

**Error Message**: 
```
El servicio de procesamiento de imágenes está temporalmente no disponible.
```

**Cause**: 
- OpenRouter API is temporarily down (Cloudflare protection)
- External service maintenance
- High traffic on OpenRouter

**Solution**:
- Wait 5-10 minutes and try again
- Check OpenRouter status: https://status.openrouter.ai
- Not a bug in your code - external service issue

**User-Facing Message**:
> "⚠️ El servicio de procesamiento está temporalmente no disponible. Esto es un problema del proveedor externo. Por favor, intenta de nuevo en 5-10 minutos."

---

### 2. **413 Payload Too Large**

**Error Message**:
```
La solicitud es demasiado grande. Intenta reducir el número de imágenes de referencia.
```

**Cause**:
- Too many reference images (>5)
- Images are too large (>3MB each)
- Total payload exceeds 15MB
- Base64 encoding adds ~33% overhead

**Solutions**:
1. Reduce number of reference images (use 2-3 instead of 5)
2. Compress images before uploading
3. Use lower resolution reference images
4. Prioritize most important references

**Frontend Validation**:
- Max 5 reference images
- Max 3MB per image
- Max 15MB total payload

---

### 3. **400 Bad Request**

**Possible Causes**:
- Malformed request
- Invalid image format (not JPG/PNG)
- Corrupted base64 data
- Missing required fields

**Solution**:
- Ensure all images are JPG or PNG
- Check console logs for details
- Verify base64 conversion was successful

---

## Performance Optimization

### Recommended Reference Image Count
- **Optimal**: 2-3 reference images
- **Maximum**: 5 reference images
- **Why**: More images = longer processing time + higher bandwidth

### Image Size Guidelines
| Type | Recommended | Maximum |
|------|------------|---------|
| Main Product Image | 1-2MB | 3MB |
| Reference Images | 500KB-1MB | 3MB each |
| Total Payload | 5-8MB | 15MB |

### Best Practices
1. ✅ Use only essential reference images
2. ✅ Compress images before upload (80-85% quality)
3. ✅ Prioritize: Fabric → Structure → Other contexts
4. ✅ Use Supabase images when available (already optimized)
5. ❌ Avoid uploading full-resolution photos (4K, RAW)

---

## Error Handling Improvements Made

### Backend API (`route.ts`)
```typescript
// Enhanced error messages
if (errorData.includes('Cloudflare') || status === 503) {
  throw new Error('El servicio está temporalmente no disponible...');
}

if (status === 413 || status === 400) {
  throw new Error('La solicitud es demasiado grande...');
}
```

### Frontend (`ImageStandardizer.tsx`)
```typescript
// User-friendly error categorization
if (errorMsg.includes('temporalmente no disponible')) {
  setError('⚠️ Servicio no disponible (problema externo)...');
} else if (errorMsg.includes('demasiado grande')) {
  setError('Reduce imágenes o tamaño...');
}
```

### Validation
- ✅ Pre-flight validation before credit deduction
- ✅ File type checking (JPG, PNG only)
- ✅ Size limits per image and total
- ✅ Warning when approaching limits

---

## Monitoring & Debugging

### Console Logs to Check
```javascript
[ImageStandardizer] Total images in content array: X
Content array length: X
Total images being sent: X
```

### Expected Values
- Content array length: 3-7 (1 text + 2-6 images)
- Total images: 2-6 (blank + main + 0-4 references)

### Red Flags
- ⚠️ Total images > 6 (too many)
- ⚠️ Content array > 10MB (too large)
- ⚠️ Processing time > 30s (API timeout risk)

---

## User Guidance

### When to Use Reference Images
✅ **Good Use Cases**:
- Need specific fabric color match
- Want specific finish/material
- Setting a particular mood/style
- Matching an environment

❌ **Avoid**:
- Adding random images for no reason
- Using 5 images "just because you can"
- Uploading very high-res images

### Optimal Workflow
1. Upload main product image (required)
2. Add 1-2 key references (fabric, structure)
3. Optionally add 1 style/mood reference
4. Keep total under 3-4 reference images
5. Process and iterate

---

## Future Improvements (Optional)

### Short Term
- [ ] Add image compression on client-side
- [ ] Show estimated processing time based on image count
- [ ] Add "retry" button on error
- [ ] Cache successful configurations

### Long Term
- [ ] Batch processing with same references
- [ ] Image optimization service integration
- [ ] Alternative AI model fallback
- [ ] Progress bar for long uploads

---

**Status**: Error handling implemented and tested
**Date**: January 8, 2025
**Last Updated**: After OpenRouter 503 error incident
