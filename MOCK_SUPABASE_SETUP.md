# Mock Supabase Setup & Migration Guide

## Overview

This project currently uses **mock Supabase clients** to allow development and deployment without requiring real database infrastructure or payment. This document explains how the mock system works and how to migrate to real Supabase (or Firebase) later.

## Current Architecture

### Mock Implementation

**File:** `lib/supabaseMock.ts`

The mock layer provides:
- `getSupabaseAdmin()` - Returns mock admin client (service role, bypasses RLS)
- `getSupabaseClient()` - Returns mock anon client (respects RLS)
- `isUsingMock()` - Check if running in mock mode

```typescript
import { getSupabaseAdmin, isUsingMock } from '../lib/supabaseMock';

// In API routes or server components:
const supabaseAdmin = getSupabaseAdmin();

// Mock mode check:
if (isUsingMock()) {
  console.log('[MOCK MODE] Using mock database');
  return { success: true, data: [] };
}
```

### Mock Behavior

The mock client returns:
- **Empty arrays** for `select()` queries: `{ data: [], error: null }`
- **Success responses** for `insert()` / `update()`: `{ data: [record], error: null }`
- **Mock URLs** for storage: `/mock-storage/{path}`

### What Actually Uses Mocks

1. **API Routes** (when env vars missing):
   - `/api/admin/customer-data` - Returns empty favorites data
   - `/api/analyze-prompts` - Returns empty prompts
   - `/api/delete-prompt` - Silently succeeds
   - `/api/update-prompt-image` - Silently succeeds
   - All other routes that use `supabase` from `lib/supabaseClient.ts`

2. **Components** (when env vars missing):
   - `MainLeadForm.tsx` - Form still works, but data isn't persisted
   - `BuildWizardSimplified.tsx` - Uses localStorage instead of database
   - Any component importing from `lib/supabaseClient.ts`

3. **Default Behavior**:
   - Data is **stored in localStorage** on client (not persisted to server)
   - No real authentication
   - No image uploads to cloud storage
   - No analytics or metrics collection
   - All Supabase queries return empty/mock responses

## How to Switch to Real Supabase

### How to Switch to Real Supabase

The beautiful part: **No code changes needed!** Just add environment variables.

**How it works:**
```typescript
// In lib/supabaseMock.ts
const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// If all three env vars exist → uses real Supabase
// If any are missing → uses mock
```

When env vars are added to Vercel, the entire app automatically switches from mock to real. Every component using `supabase` from `lib/supabaseClient.ts` will start persisting data to the real database.

### Step 1: Set Up Supabase Project (Free Tier)

1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project (free tier available)
3. Go to **Settings → API** and copy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add three new variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxx...
   ```
4. **Important**: Mark `NEXT_PUBLIC_*` variables as available to "Browser" and "Built Function" (default)
5. Mark `SUPABASE_SERVICE_ROLE_KEY` as available to "Built Function" only (production only)

### Step 3: Deploy Supabase Schema

The schema is defined in `supabase/multitenant_schema.sql`. You need to:

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/multitenant_schema.sql`
4. Paste and run the query
5. This creates all tables and RLS policies

**Key Tables Created:**
- `customers` - Customer profiles
- `customer_favorites` - Favorite products per customer
- `products` - Product catalog
- `admin_credits` - Admin account credits
- `admin_credit_usage` - Credit usage logs
- `orders` - Order records
- `image_prompts` - Furniture design prompts/images

### Step 4: Update Code (AUTOMATIC - No Changes Needed!)

Once env vars are set in Vercel, the code **automatically switches** from mock to real Supabase:

**The switch happens in THREE places:**

1. **`lib/supabaseClient.ts`** - Public anon client
   ```typescript
   export const supabase = getSupabaseClient();
   // Returns real if env vars set, mock otherwise
   ```

2. **`lib/supabaseAdmin.ts`** (legacy, can be removed) 
   - Now routes import from `supabaseMock.ts` instead

3. **API Routes** - All use `getSupabaseAdmin()` factory
   ```typescript
   import { getSupabaseAdmin } from '../../../../../lib/supabaseMock';
   
   const supabaseAdmin = getSupabaseAdmin();
   // Returns real if env vars set, mock otherwise
   ```

**All components and API routes automatically get real clients.** No refactoring needed!

## How to Switch to Firebase

If you prefer Firebase instead of Supabase, follow this process:

### Step 1: Create Firebase Project

1. Go to [firebase.google.com](https://firebase.google.com)
2. Create a new project
3. Enable Firestore Database (use EU or US region)
4. Go to **Project Settings** and copy your config:
   ```javascript
   {
     apiKey: "xxx",
     authDomain: "xxx.firebaseapp.com",
     projectId: "xxx",
     storageBucket: "xxx.appspot.com",
     messagingSenderId: "xxx",
     appId: "xxx"
   }
   ```

### Step 2: Create Firebase Adapter

Create `lib/firebaseMock.ts` (similar structure to `supabaseMock.ts`):

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

class MockFirestore {
  collection(_name: string) {
    return {
      doc: (_id: string) => ({
        get: () => Promise.resolve({ data: () => ({}) }),
        set: (data: unknown) => Promise.resolve(),
      }),
      add: (data: unknown) => Promise.resolve({ id: 'mock-id' }),
    };
  }
}

export function getFirestore() {
  if (isFirebaseConfigured) {
    const app = initializeApp(firebaseConfig);
    return getFirestore(app);
  }
  return new MockFirestore() as unknown as any;
}
```

### Step 3: Add Environment Variables

Same process as Supabase, but different variable names:
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

### Step 4: Update Components

Replace Supabase imports with Firebase:
```typescript
// Before
import { getSupabaseClient } from '../lib/supabaseMock';

// After
import { getFirestore } from '../lib/firebaseMock';
```

Then update the query syntax from Supabase to Firestore:
```typescript
// Supabase
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .eq('id', customerId);

// Firestore
const doc = await firestore.collection('customers').doc(customerId).get();
const data = doc.data();
```

## Testing the Mock

To verify mock mode is working:

1. **Locally** (without env vars):
   ```bash
   npm run dev
   # Check browser console → should see:
   # "[MOCK MODE] Using mock Supabase client..."
   ```

2. **Deployed to Vercel** (without env vars):
   - Build will succeed
   - API routes return empty/mock data
   - Browser console shows mock warnings

3. **With real Supabase** (env vars set):
   - No "[MOCK MODE]" warnings
   - Real data persists
   - API routes connect to actual database

## File Structure

```
lib/
  ├── supabaseMock.ts           ← Factory: creates mock OR real clients
  ├── supabaseClient.ts         ← Public client (uses supabaseMock)
  ├── supabaseAdmin.ts          ← (Deprecated, use supabaseMock instead)
  └── firebaseMock.ts           ← (Create when ready for Firebase)

src/app/api/
  ├── admin/customer-data/route.ts    ← Uses getSupabaseAdmin()
  ├── analyze-prompts/route.ts        ← Uses getSupabaseAdmin()
  ├── delete-prompt/route.ts          ← Uses getSupabaseAdmin()
  ├── update-prompt-image/route.ts    ← Uses getSupabaseAdmin()
  └── (other routes use supabase from supabaseClient.ts)

supabase/
  └── multitenant_schema.sql          ← Schema to deploy to real Supabase

MOCK_SUPABASE_SETUP.md                ← This file
```

## Cost Considerations

### Supabase (Free Tier)
- **500 MB** storage
- **2 GB** bandwidth/month
- Unlimited API requests
- No credit card required

**When to upgrade:** If you exceed storage/bandwidth limits

### Firebase (Free Tier)
- **1 GB** Firestore storage
- **50,000** reads, 20,000 writes, 20,000 deletes per day
- **12 GB** bandwidth per month
- No credit card required

**When to upgrade:** If you exceed these limits

## Migration Checklist

- [ ] Set up Supabase/Firebase project
- [ ] Copy API credentials
- [ ] Add environment variables to Vercel
- [ ] Deploy database schema (Supabase only)
- [ ] Test locally with real database
- [ ] Monitor first week of production usage
- [ ] Set up billing alerts in Vercel dashboard
- [ ] Document any custom configurations

## Troubleshooting

### "supabaseUrl is required" error during build
- **Cause**: Old code tried to initialize Supabase at module level with empty env vars
- **Fix**: All routes now use `getSupabaseAdmin()` factory or `supabaseClient.ts` which defers initialization
- **Status**: ✅ Already fixed in this codebase

### API routes return empty data
- **Check 1**: Are env vars set in Vercel?
- **Check 2**: Is build in mock mode? (Look for "[MOCK MODE]" warning in logs)
- **Check 3**: Is Supabase schema deployed? (Run `supabase/multitenant_schema.sql`)
- **Check 4**: Do you have data in your Supabase tables? (Mock returns empty arrays)

### "Provider did not return a session" error
- **Cause**: Using old supabaseAdmin.ts instead of new mock adapter
- **Fix**: Import from `supabaseMock.ts` instead
- **Example**: `import { getSupabaseAdmin } from '../lib/supabaseMock';`

### RLS errors on queries
- **Cause**: Missing `x-customer-id` header or incorrect table policies
- **Fix**: Use `src/utils/supabase.ts` custom client that injects headers
- **Note**: Admin client bypasses RLS (service role key)

### Storage uploads failing
- **Check**: Is bucket `product-images` created in Supabase Storage?
- **Check**: Are RLS policies allowing uploads?
- **Reference**: See `supabase/multitenant_schema.sql` for policy setup

### Storage uploads failing
### Storage uploads failing
- **Check**: Is bucket `product-images` created in Supabase Storage?
- **Check**: Are RLS policies allowing uploads?
- **Reference**: See `supabase/multitenant_schema.sql` for policy setup

## Support

For questions about this setup, refer to:
- Supabase Docs: https://supabase.com/docs
- Firebase Docs: https://firebase.google.com/docs
- Next.js Environment Variables: https://nextjs.org/docs/basic-features/environment-variables
- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables

## Summary

**Current State**: ✅ Mock mode enabled, app is fully functional without real database

**To Enable Supabase**: Add 3 env vars to Vercel, deploy schema, done! No code changes needed.

**To Switch to Firebase**: Create Firebase adapter following the pattern in `supabaseMock.ts`, then update component imports. ~2-3 hours of work.

**The beauty of this approach**: You can deploy today without paying, and upgrade the database backend later without touching your business logic. 🚀
