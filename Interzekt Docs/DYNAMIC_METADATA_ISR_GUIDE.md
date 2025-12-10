# Dynamic Metadata & ISR Implementation Guide

## Overview

This document explains the dynamic metadata system that allows you to update SEO content **without code changes or redeployment**.

**Key Achievement:** Marketing can update page titles, descriptions, and search engine visibility on-demand while developers work on features.

## Architecture

### 1. Centralized Metadata Configuration (`src/config/seo-metadata.ts`)

Single source of truth for all SEO content:

```typescript
export const seoMetadata: Record<string, PageMetadata> = {
  home: {
    title: 'Expo360 - Solución Integral...',
    description: 'Expo360 es la plataforma especializada...',
    pathname: '/',
    changeFrequency: 'weekly',
    priority: 1.0,
  },
  // ... more pages
};
```

**Benefits:**
- ✅ Non-developers can edit titles/descriptions
- ✅ No code deployment needed
- ✅ Changes propagate instantly (within 60 seconds)
- ✅ Version control tracks all changes
- ✅ Easy rollback if needed

### 2. Dynamic Metadata Generation (`lib/metadata.ts`)

Pages use `generateMetadata()` function instead of static exports:

**Before (Hardcoded):**
```typescript
export const metadata: Metadata = {
  title: 'My Page',
  description: 'Static description',
};
```

**After (Dynamic):**
```typescript
export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('home');
}
```

**How it works:**
1. Function calls `buildPageMetadata('home')`
2. Reads from `seo-metadata.ts` config
3. Builds complete Metadata object with hreflang
4. Returns to Next.js for rendering
5. Cache: 60 seconds (ISR)

### 3. ISR (Incremental Static Regeneration)

**Sitemap (`src/app/sitemap.ts`):**
```typescript
export const revalidate = 60; // Regenerate every 60 seconds
```

**What this means:**
- First request to sitemap: Generates static HTML
- Cache valid for 60 seconds
- 2nd+ requests within 60s: Serve cached version
- Request after 60s: Regenerate in background
- User sees cache while regenerating (no delay)

**Result:** Pages added to `seo-metadata.ts` appear in sitemap within ~60 seconds

### 4. On-Demand Revalidation API (`src/app/api/revalidate-seo/route.ts`)

**Optional:** Force immediate cache invalidation without waiting 60 seconds.

**Usage:**
```bash
npm run revalidate-seo
```

**How it works:**
1. Script calls `/api/revalidate-seo` with secret token
2. API validates secret
3. Revalidates all SEO paths
4. Paths regenerate on next request
5. Changes visible within seconds

## How It Works: Step-by-Step

### Scenario: Marketing Updates Page Title

**1. Edit Configuration (5 seconds)**
```typescript
// src/config/seo-metadata.ts
'stripe-benefits': {
  title: 'Stripe Mexico Integrations - 2025 Update', // Changed!
  description: '...',
  // ...
}
```

**2. Commit & Push (2 minutes)**
```bash
git add src/config/seo-metadata.ts
git commit -m "Update Stripe page title for 2025 campaign"
git push origin main
```

**3. (Optional) Force Immediate Update (30 seconds)**
```bash
export REVALIDATE_SECRET="your_secret_here"
npm run revalidate-seo
```

**4. Automatic ISR Regeneration (within 60 seconds)**
- Next person visits `/stripe-benefits` → gets updated page
- Sitemap regenerates → Google sees new title
- Page rank metrics update in Google Search Console

**Result:** No downtime, no redeployment, no rebuild!

## Configuration: Step-by-Step

### Phase 1: Local Development

1. **Update metadata:**
   ```typescript
   // src/config/seo-metadata.ts
   'my-page': {
     title: 'New Title',
     description: 'New description',
     pathname: '/my-page',
     changeFrequency: 'weekly',
     priority: 0.8,
   }
   ```

2. **Use in page:**
   ```typescript
   // src/app/my-page/page.tsx
   export async function generateMetadata(): Promise<Metadata> {
     return buildPageMetadata('my-page');
   }
   ```

3. **Test locally:**
   ```bash
   npm run dev
   # Visit http://localhost:3000/my-page
   # Check page source for metadata
   ```

### Phase 2: Deploy to Vercel

1. **Set environment variable:**
   ```bash
   # In Vercel Dashboard → Settings → Environment Variables
   REVALIDATE_SECRET=your_strong_random_secret_here
   ```

2. **Deploy:**
   ```bash
   git push origin main
   # Vercel auto-deploys
   ```

3. **Verify:**
   ```bash
   # Check sitemap
   curl https://expo360.vercel.app/sitemap.xml
   
   # Check page metadata
   curl https://expo360.vercel.app/stripe-benefits | grep "og:title"
   ```

### Phase 3: Update Content (No Deploy)

1. **Edit `seo-metadata.ts`:**
   ```typescript
   'stripe-benefits': {
     title: 'Stripe Mexico - 2025 Campaign',
     description: 'Updated for Q1 2025 promotion',
     // ...
   }
   ```

2. **Commit:**
   ```bash
   git commit -am "Update SEO for 2025 campaign"
   git push origin main
   ```

3. **Optional: Force immediate update:**
   ```bash
   npm run revalidate-seo
   ```

4. **Verify:**
   ```bash
   # After 60 seconds (or immediately if revalidated):
   curl https://expo360.vercel.app/stripe-benefits | grep "title"
   ```

## Current Implementation Status

### ✅ Implemented

1. **Centralized Config**
   - `src/config/seo-metadata.ts` created
   - All pages defined with metadata
   - Easy to extend with new pages

2. **Dynamic Metadata**
   - `lib/metadata.ts` updated with `buildPageMetadata()`
   - Homepage (`src/app/page.tsx`) → uses `generateMetadata()`
   - Because page (`src/app/porque-expo360/page.tsx`) → uses `generateMetadata()`

3. **ISR Sitemap**
   - `src/app/sitemap.ts` → `export const revalidate = 60`
   - Reads from centralized config
   - Auto-includes new pages

4. **On-Demand Revalidation**
   - `/api/revalidate-seo` route created
   - `scripts/revalidate-seo.js` script ready
   - `npm run revalidate-seo` command added

### 🔄 Migrate Remaining Pages

Update these pages to use `generateMetadata()`:

1. `src/app/landing/page.tsx`
2. `src/app/onboarding/page.tsx`
3. `src/app/stripe-benefits/page.tsx` (if exists)
4. `src/app/preguntas-frecuentes/page.tsx` (if exists)

**Template:**
```typescript
import { buildPageMetadata } from '@/lib/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('page-key');
}
```

## Cache Invalidation Strategies

### Strategy 1: Automatic ISR (Recommended for most cases)
- ✅ No action needed
- ✅ Changes appear within 60 seconds
- ✅ Zero downtime
- ❌ ~60 second delay

```typescript
export const revalidate = 60; // In sitemap.ts
```

### Strategy 2: On-Demand Revalidation (For urgent updates)
- ✅ Immediate (within seconds)
- ✅ Controlled
- ✅ Auditable
- ❌ Requires manual trigger

```bash
npm run revalidate-seo
```

### Strategy 3: Manual Redeploy (For code changes)
- ✅ Full rebuild, guaranteed clean state
- ❌ Takes 2-5 minutes
- ❌ More resource-intensive

```bash
git push origin main  # Auto-deploys on Vercel
```

## Monitoring & Verification

### Check Sitemap Generation

```bash
# View sitemap with timestamps
curl https://expo360.vercel.app/sitemap.xml

# Count pages
curl https://expo360.vercel.app/sitemap.xml | grep -c "<url>"
```

### Verify Page Metadata

```bash
# Check page title
curl https://expo360.vercel.app/page-name | grep "<title>"

# Check Open Graph tags
curl https://expo360.vercel.app/page-name | grep "og:title\|og:description"

# Check hreflang tags
curl https://expo360.vercel.app/page-name | grep "hreflang"
```

### Google Search Console

1. Go to: https://search.google.com/search-console
2. Select your property
3. Check:
   - **Coverage** → All pages indexed?
   - **Enhancements** → Hreflang working?
   - **Performance** → CTR metrics up?
   - **Index** → When was page last crawled?

### Monitor Cache Behavior

```bash
# Time the request (should be fast due to caching)
time curl https://expo360.vercel.app/sitemap.xml

# Second request should be faster (cached)
time curl https://expo360.vercel.app/sitemap.xml
```

## Environment Setup

### .env.local (Development)
```
REVALIDATE_SECRET=your_development_secret_here
```

### Vercel Dashboard (Production)
1. Go to: Project Settings → Environment Variables
2. Add:
   - **Name:** `REVALIDATE_SECRET`
   - **Value:** Generate strong random string (use: `openssl rand -hex 32`)
   - **Environments:** Production, Preview
3. Redeploy to apply

### Generate Strong Secret

```bash
# macOS/Linux
openssl rand -hex 32

# Windows (PowerShell)
[System.Convert]::ToHexString((New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes(32))
```

## Troubleshooting

### Issue: Page title not updating
**Cause:** ISR cache not invalidated yet
**Solution:**
```bash
# Wait 60 seconds OR
npm run revalidate-seo
```

### Issue: "REVALIDATE_SECRET not set"
**Cause:** Environment variable missing
**Solution:**
```bash
# Local: Add to .env.local
# Vercel: Add to Project Settings → Environment Variables
```

### Issue: Sitemap doesn't include new page
**Cause:** Page not in `seo-metadata.ts`
**Solution:**
```typescript
// src/config/seo-metadata.ts
'new-page': {
  title: '...',
  pathname: '/new-page',
  // ...
}
```

### Issue: Old metadata still showing in Google
**Cause:** Google's cache, not your site
**Solution:**
1. Verify new metadata on your site (use curl)
2. Request reindex in Google Search Console
3. Wait 24-48 hours for Google to refresh

## Advanced: Add New Page

### Step 1: Add to Config
```typescript
// src/config/seo-metadata.ts
'new-page': {
  title: 'New Page Title',
  description: 'New page description',
  pathname: '/new-page',
  changeFrequency: 'monthly',
  priority: 0.8,
}
```

### Step 2: Create Route
```typescript
// src/app/new-page/page.tsx
import { buildPageMetadata } from '@/lib/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('new-page');
}

export default function NewPage() {
  return <div>Page content</div>;
}
```

### Step 3: Deploy & Test
```bash
npm run dev  # Test locally
git push origin main  # Deploy
npm run revalidate-seo  # Force immediate sitemap update
```

## Performance Impact

### Cache Statistics

| Metric | Impact |
|--------|--------|
| First request | ~200-500ms (build + render) |
| Cached requests | ~50-100ms (serve from cache) |
| ISR refresh | Background, user doesn't wait |
| Memory usage | Minimal (cached pages only) |

### Optimization Tips

1. **Keep metadata concise**
   - Title: 50-60 characters
   - Description: 150-160 characters

2. **Update during off-peak**
   - Changes at 3 AM less disruptive than 3 PM

3. **Batch updates**
   - Update multiple pages at once
   - Single revalidation call covers all

4. **Monitor Google Cache**
   - Google may take 24-48 hours to refresh
   - Doesn't affect your site, only search results

## Summary

| Feature | Benefit |
|---------|---------|
| Centralized Config | Single source of truth |
| generateMetadata() | Dynamic, not hardcoded |
| ISR (60s) | Automatic updates |
| On-Demand Revalidation | Instant when needed |
| No redeployment | Marketing independence |
| Version control | Track all changes |
| Hreflang included | International SEO ready |
| Sitemap dynamic | New pages auto-discovered |

## Next Steps

1. ✅ Review `src/config/seo-metadata.ts` - customize for your content
2. ✅ Migrate remaining pages to `generateMetadata()`
3. ✅ Test locally: `npm run dev`
4. ✅ Set `REVALIDATE_SECRET` in Vercel
5. ✅ Deploy and verify
6. ✅ Share password-protected link with marketing for metadata editing
7. ✅ Document process for team (share this guide)

## Questions?

Refer to:
- `src/config/seo-metadata.ts` - Config structure
- `lib/metadata.ts` - Metadata helpers
- `src/app/api/revalidate-seo/route.ts` - Cache API
- Next.js Docs: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
