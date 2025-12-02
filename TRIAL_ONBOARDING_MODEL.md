# Trial Model Onboarding - Simplified

## Overview

New clients get a **30-day free trial** with:
- **1 expo landing page** (QR code activation)
- **1 admin dashboard** (Kusam-style)
- **1 location** for the trial period

After 30 days, they can:
- **Upgrade** (yearly fee + license) for multi-location/multi-event access
- **Extend trial** (contact support)
- **Downgrade** (lose access)

---

## Database Schema Changes

### New Fields on `clients` Table

```sql
ALTER TABLE clients ADD COLUMN trial_status TEXT;  -- 'active', 'expired', 'upgraded'
ALTER TABLE clients ADD COLUMN trial_end_date TIMESTAMP;  -- Date trial ends
```

### New Table: `expos` (optional, for tracking events)

```sql
CREATE TABLE expos (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES clients(id),
  name TEXT,
  location TEXT,
  status TEXT,  -- 'active', 'archived', 'completed'
  trial_expo BOOLEAN,  -- True if created during trial
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Onboarding Flow

```
User visits /onboarding
    ↓
Fills form:
  - Company name
  - Email & password
  - Contact name & phone
  - Store/location name
    ↓
Submits to POST /api/onboarding/create-trial
    ↓
Backend creates:
  1. Supabase Auth user
  2. Client record (trial_status='active', trial_end_date=now+30days)
  3. User-client mapping
  4. One expo event
    ↓
Redirects to /admin?client=<id>&expo=<id>&trial=true
    ↓
Admin dashboard loads with trial branding
    ↓
Admin adds products, creates QR codes, shares with customers
    ↓
Customers scan QR, access landing page, customize products
    ↓
Day 30: Trial expires
    ↓
Admin sees "upgrade required" prompt
    ↓
(Optional) Admin upgrades to yearly subscription
```

---

## API Endpoint: `POST /api/onboarding/create-trial`

### Request
```json
{
  "companyName": "Acme Furniture",
  "email": "admin@acme.com",
  "password": "SecurePass123!",
  "contactName": "John Doe",
  "phone": "+1-555-1234",
  "locationName": "Downtown Showroom"
}
```

### Success Response (201)
```json
{
  "success": true,
  "clientId": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "11111111-1111-1111-1111-111111111111",
  "expoId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "trialEndDate": "2025-01-31T15:30:00Z",
  "redirectUrl": "/admin?client=550e8400...&expo=aaaaaaaa...&trial=true"
}
```

### Error Response (400/500)
```json
{
  "error": "Missing required fields" | "Failed to create user" | etc.
}
```

---

## What Gets Created

### 1. Supabase Auth User
- Email & password set by client
- Auto-confirmed (no email verification needed)
- Metadata: contact name, phone

### 2. Client Record
```sql
INSERT INTO clients (
  id,
  slug,
  name,
  trial_status,
  trial_end_date,
  metadata
) VALUES (
  'uuid',
  'acme-furniture-1234567',  -- Auto-generated unique slug
  'Acme Furniture',
  'active',
  '2025-01-31T15:30:00Z',  -- 30 days from now
  '{"contact_name": "John Doe", "phone": "+1-555-1234", "trial_location": "Downtown Showroom"}'
);
```

### 3. User-Client Mapping
```sql
INSERT INTO user_clients (user_id, client_id) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '550e8400-e29b-41d4-a716-446655440001'
);
```

### 4. Default Expo Event (optional)
```sql
INSERT INTO expos (
  id,
  client_id,
  name,
  location,
  status,
  trial_expo,
  metadata
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '550e8400-e29b-41d4-a716-446655440001',
  'Downtown Showroom - Trial Event',
  'Downtown Showroom',
  'active',
  true,
  '{"created_at": "2024-12-01T15:30:00Z", "trial": true}'
);
```

---

## Admin Dashboard Changes

### Trial Badge
Show a badge in admin dashboard:
```
🔔 TRIAL MODE
Expires: December 31, 2024
[Upgrade Now]
```

### Single Expo View
For trial clients, show only 1 expo (the trial event).
After upgrade, show ability to create more.

### QR Code Generation
Generate QR codes pointing to the expo landing page:
```
https://interzekt.app/expo/{expoId}/landing
```

### Limited Features (Trial)
- ✅ Add products to catalog
- ✅ Create variations (sizes, colors, etc.)
- ✅ Generate QR codes
- ✅ View customer activations
- ❌ Create new expos (locked until upgrade)
- ❌ Invite team members (locked until upgrade)
- ❌ Advanced analytics (locked until upgrade)

---

## Upgrade Flow

### Day 30 Notification
```typescript
// Check if trial is expiring
if (client.trial_end_date < new Date()) {
  // Show upgrade prompt
  return <TrialExpiredPrompt client={client} />;
}
```

### Upgrade Page (`/upgrade`)
- Show pricing: Yearly fee + one-time license
- Integrate Stripe for payment
- On success:
  - Update `trial_status = 'upgraded'`
  - Create first paid year: `paid_until = now + 1 year`
  - Unlock multi-location features
  - Allow creating new expos

---

## Security/RLS Implications

### Trial Clients Use Same RLS as Full Clients
- No special treatment needed
- RLS policies automatically isolate trial clients

### Trial Expiry Enforcement (Application Level)
```typescript
// Before rendering admin dashboard
if (client.trial_status === 'active' && new Date() > client.trial_end_date) {
  return <TrialExpiredPage />;
}
```

---

## Testing Trial Flow

```bash
# 1. Fill onboarding form
# - Company: Test Furniture
# - Email: admin@test.com
# - Password: TestPass123!
# - Contact: Jane Doe
# - Phone: +1-555-1234
# - Location: Test Store

# 2. Should be redirected to:
# /admin?client=<id>&expo=<id>&trial=true

# 3. Verify database:
SELECT * FROM clients WHERE trial_status = 'active';
# Should have: trial_end_date = now + 30 days

SELECT * FROM expos WHERE client_id = '<clientId>';
# Should have: 1 expo record with trial_expo = true

# 4. Sign in with admin@test.com / TestPass123!
# Should see admin dashboard with trial badge
```

---

## Roadmap

**Phase 1** (Current)
- ✅ Trial onboarding page
- ✅ 30-day trial with 1 expo
- ✅ Kusam-style admin dashboard
- ✅ QR code generation
- ⏳ Customer landing page (using existing /build)

**Phase 2**
- Upgrade/payment flow
- Trial expiry notifications
- Post-upgrade: multi-expo/multi-location support

**Phase 3**
- Team member invitations
- Advanced analytics
- Custom branding per expo

---

## Files Modified

- **`src/app/onboarding/page.tsx`** - Simplified trial signup form
- **`src/app/api/onboarding/create-trial.ts`** - Trial creation endpoint
- **`src/app/page.tsx`** - Homepage with onboarding link
- **Database schema** - Add `trial_status` and `trial_end_date` to clients table

---

**Status**: ✅ Ready for trial period implementation
