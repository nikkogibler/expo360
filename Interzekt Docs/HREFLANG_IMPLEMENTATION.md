# Hreflang Implementation Guide

## Overview
This document explains the hreflang SEO implementation for Expo360, which enables proper multi-regional indexing for Google and other search engines.

## What is Hreflang?
Hreflang tags tell search engines which page version to show to users in different regions/languages:
- **es-MX**: Spanish (Mexico) - Your primary market
- **en**: English - International audience fallback
- **x-default**: Default version for all other regions not explicitly covered

## Architecture

### 1. Core Utilities (`lib/hreflang.ts`)
- `generateHrefLangLinks()` - Creates hreflang link objects for any pathname
- `getLanguageFromPathname()` - Detects language from URL
- `convertPathnameLang()` - Converts URLs between language versions
- `hrefLangToMetadata()` - Formats for Next.js Metadata API

### 2. Global Implementation

#### Root Layout (`src/app/layout.tsx`)
```typescript
// Metadata includes alternates with hreflang
alternates: {
  languages: {
    'es-MX': 'https://expo360.vercel.app/',
    'en': 'https://expo360.vercel.app/en/',
    'x-default': 'https://expo360.vercel.app/',
  },
}
```

#### Dynamic Hreflang Component (`src/components/HrefLangMeta.tsx`)
- Client-side component that updates hreflang tags on route changes
- Automatically injects proper hreflang links based on current pathname
- Handles client-side navigation (when users click links)

### 3. Page-Level Implementation (`lib/metadata.ts`)

#### Usage in Page Files
```typescript
// src/app/porque-expo360/page.tsx
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata(
  '/porque-expo360',
  'Por Qué Expo360 | Solución para Ferias Comerciales',
  'Descubre cómo Expo360 revoluciona la captación de leads en ferias y exposiciones comerciales.'
);

export default function PorqueExpo360Page() {
  // Component code...
}
```

## How It Works

### Server-Side (Initial Page Load)
1. Next.js generates `<link rel="alternate" hreflang="...">` tags via `metadata.alternates.languages`
2. These tags appear in the HTML `<head>` during server-side rendering
3. Google bot immediately sees the hreflang signals

### Client-Side (Navigation)
1. User navigates to a new page via link/router
2. `HrefLangMeta` component detects pathname change via `usePathname()`
3. Component removes old hreflang tags and injects new ones
4. Updated hreflang tags reflect the new page

## Current Implementation Status

✅ **Global hreflang tags** - Root layout metadata configured
✅ **Dynamic client-side updates** - HrefLangMeta component handles navigation
✅ **Utility functions** - Ready for page-level customization

## Next Steps: Update Individual Pages

To implement hreflang on individual pages, update their metadata:

### Example: `/porque-expo360` page

**Before:**
```typescript
export const metadata: Metadata = {
  title: "Por Qué Expo360",
  description: "...",
};
```

**After:**
```typescript
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata(
  '/porque-expo360',
  'Por Qué Expo360 | Solución para Ferias Comerciales',
  'Descubre cómo Expo360 revoluciona la captación de leads en ferias y exposiciones comerciales.'
);
```

### Pages to Update
Priority pages for manual hreflang implementation:
1. `/` (homepage)
2. `/porque-expo360`
3. `/landing`
4. `/onboarding`
5. `/contact` (or wherever your contact form is)
6. Any other key pages

## Verification

### Checking Hreflang Tags

#### In HTML Source
```bash
curl https://expo360.vercel.app | grep hreflang
```

Expected output:
```html
<link rel="alternate" hrefLang="es-MX" href="https://expo360.vercel.app/" />
<link rel="alternate" hrefLang="en" href="https://expo360.vercel.app/en/" />
<link rel="alternate" hrefLang="x-default" href="https://expo360.vercel.app/" />
```

#### In Browser DevTools
1. Open page in browser
2. Right-click → Inspect
3. Go to `<head>` section
4. Look for `<link rel="alternate" hreflang="...">` tags

### Google Search Console
1. Go to Google Search Console
2. Select your property
3. Check "Coverage" and "Enhancements" for hreflang status
4. Verify that regional URLs are properly grouped

## Best Practices

### 1. **Consistent Structure**
- Keep URL structure consistent across language versions
- Example: `/about` (es-MX) ↔ `/en/about` (en)

### 2. **Bi-directional Links**
- All language versions should reference each other
- If es-MX links to en, en should link back to es-MX

### 3. **Unique Content**
- Make sure actual content differs between versions
- Spanish version: All Spanish
- English version: All English (not auto-translated)

### 4. **Homepage Strategy**
- `x-default` should point to your most general audience
- Currently points to es-MX (your primary market)

### 5. **Testing**
- Use Google's hreflang testing tool: https://search.google.com/test/rich-results
- Check Search Console for errors

## How Google Uses Hreflang

1. **Regional Targeting**: Shows es-MX version to Mexico users, en to rest of world
2. **Consolidation**: Prevents duplicate content penalties
3. **Proper Indexing**: Each version indexed separately with language signal
4. **User Experience**: Users see appropriate language version

## SEO Benefits

✅ Prevents duplicate content penalties
✅ Proper international search visibility
✅ Users see their language version
✅ Better CTR in regional search results
✅ Clearer content signals to search engines

## Files Modified/Created

1. `lib/hreflang.ts` - Core hreflang utilities
2. `src/components/HrefLangMeta.tsx` - Dynamic client-side component
3. `lib/metadata.ts` - Page metadata helpers
4. `src/app/layout.tsx` - Updated with global hreflang configuration

## Support for Future Locales

To add more languages (e.g., Spanish for Spain - es-ES):

1. Update `generateHrefLangLinks()` in `lib/hreflang.ts`:
```typescript
return [
  {
    rel: 'alternate',
    hrefLang: 'es-MX',
    href: `${baseUrl}${cleanPath || '/'}`,
  },
  {
    rel: 'alternate',
    hrefLang: 'es-ES',
    href: `${baseUrl}/es-es${cleanPath || '/'}`,
  },
  {
    rel: 'alternate',
    hrefLang: 'en',
    href: `${baseUrl}/en${cleanPath || '/'}`,
  },
  {
    rel: 'alternate',
    hrefLang: 'x-default',
    href: `${baseUrl}${cleanPath || '/'}`,
  },
];
```

2. Update route structure to support `/es-es/...` paths
3. Update metadata.alternates in layout

## Common Issues & Troubleshooting

### Issue: Hreflang tags not appearing
**Solution**: 
- Check if page uses `metadata` export (server-side)
- Verify `alternates.languages` is configured
- Clear browser cache

### Issue: Hreflang tags inconsistent during client navigation
**Solution**:
- Ensure `HrefLangMeta` component is mounted
- Check browser console for errors
- Verify `usePathname()` is detecting correct path

### Issue: Google Search Console shows hreflang errors
**Solution**:
- Verify all hreflang URLs are valid and indexable
- Check for 404 or redirect chains
- Ensure bi-directional linking (all versions reference each other)
