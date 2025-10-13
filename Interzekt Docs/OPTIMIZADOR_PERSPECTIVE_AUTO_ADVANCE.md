# Optimizador Perspective Auto-Advance Feature

## Issue
In the `/admin/pro-shot-now/optimizador` page, when users selected an image perspective in Step 3, the selection was registered but they still had to manually click the "Omitir →" (Skip) button to advance to the next step. This created an unnecessary extra click and broke the flow.

## User Experience Problem
**Before:**
1. User clicks perspective button (e.g., "Vista Frontal")
2. Button highlights in amber (selection registered)
3. User must then click "Omitir →" to continue
4. Only then does Step 4 appear

**Desired behavior:**
1. User clicks perspective button
2. Button highlights in amber
3. **Automatically advances to Step 4** (no extra click needed)

## Solution
Modified the perspective button `onClick` handler to automatically advance to the next step when a perspective is selected.

### Code Changes
**File:** `src/components/ImageStandardizer.tsx`

**Location:** Perspective selection buttons (~line 1760)

**What changed:**
```tsx
// Before: Only set the selected perspective
onClick={(e) => {
  e.preventDefault();
  const scrollPos = window.scrollY;
  setSelectedPerspective(selectedPerspective === perspective.value ? '' : perspective.value);
  requestAnimationFrame(() => {
    window.scrollTo(0, scrollPos);
  });
}}

// After: Set perspective AND auto-advance to next step
onClick={(e) => {
  e.preventDefault();
  const scrollPos = window.scrollY;
  const isCurrentlySelected = selectedPerspective === perspective.value;
  setSelectedPerspective(isCurrentlySelected ? '' : perspective.value);
  
  // Auto-advance to next step when a perspective is selected
  if (!isCurrentlySelected) {
    skipToNextStep(3);
  }
  
  requestAnimationFrame(() => {
    window.scrollTo(0, scrollPos);
  });
}}
```

## Behavior Details

### When Selecting a Perspective:
1. ✅ Perspective is saved to state
2. ✅ Button shows selected state (amber highlight)
3. ✅ Step 3 is marked complete
4. ✅ **Automatically advances to Step 4** (Prompt section)
5. ✅ Scroll position is preserved for smooth UX

### When Deselecting (clicking same button again):
1. ✅ Perspective is cleared from state
2. ✅ Button returns to normal state
3. ✅ Does NOT auto-advance (stays on Step 3)
4. ✅ User can select a different perspective

### Skip Button Behavior:
- The "Omitir →" button remains functional
- Users can still skip without selecting if they prefer
- No breaking changes to existing functionality

## Benefits
- **Faster workflow**: One less click per optimization
- **Better UX**: Feels more natural and responsive
- **Clearer intent**: Selecting = moving forward
- **Maintains flexibility**: Can still deselect or skip

## Testing
To test the fix:
1. Go to `/admin/pro-shot-now/optimizador`
2. Upload an image (complete Step 1)
3. Select variables if desired (Step 2)
4. Click any perspective option (e.g., "Vista Frontal")
5. ✅ Verify it immediately shows Step 4 without needing to click "Omitir"
6. Try clicking the same perspective again to deselect
7. ✅ Verify it stays on Step 3 and doesn't advance

## Related Files
- `src/components/ImageStandardizer.tsx` - Main component with perspective selection
- `src/app/admin/pro-shot-now/optimizador/page.tsx` - Page wrapper

## Date
January 13, 2025
