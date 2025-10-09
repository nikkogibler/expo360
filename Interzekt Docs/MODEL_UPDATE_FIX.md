# Model Update Fix - January 8, 2025

## Issue
OpenRouter API was returning 503 errors, which we initially thought was a service outage, but it was actually a **model name error**.

## Root Cause
We were using: `google/gemini-2.5-flash-image`
This model doesn't exist or is deprecated.

## Fix
Updated to the correct model from OpenRouter documentation: `google/gemini-2.0-flash-001`

## Changes Made
**File**: `src/app/api/process-furniture/route.ts`

### Before:
```typescript
model: 'google/gemini-2.5-flash-image'
```

### After:
```typescript
model: 'google/gemini-2.0-flash-001'
```

## Additional Improvements
- Added detailed logging of content array structure
- Kept all other functionality the same
- Content array structure matches official documentation

## Testing
Try the optimizador again with multiple reference images. It should now work correctly!

## Official Documentation Reference
OpenRouter supports these Gemini models:
- `google/gemini-2.0-flash-001` ✅ (Current, supports images)
- `google/gemini-2.0-flash-thinking-exp` (Thinking variant)
- `google/gemini-pro-vision` (Older, deprecated)

Always check: https://openrouter.ai/docs for latest model names
