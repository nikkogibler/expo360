# Interzekt Client Onboarding Flow

## Overview

The client onboarding system is the **entry point** for new clients to set up their workspace in Interzekt. It handles:

1. **Workspace Creation** - Client profile setup with company info
2. **Admin User Creation** - First user account for the client
3. **Tenant Mapping** - Links user to client (multi-tenant support)
4. **Admin Handoff** - Redirects to admin dashboard for branding/products

---

## Architecture

### Database Setup

When a client onboards, the system creates:

```
clients (new tenant)
├── id: TEXT (UUID)
├── slug: TEXT (unique, e.g., "acme-corp")
├── name: TEXT (e.g., "Acme Corporation")
└── metadata: JSON (contact info, industry, etc.)

user_clients (mapping)
├── user_id: TEXT (admin user's auth.uid())
└── client_id: TEXT (reference to clients.id)

products, variable_types, etc. (empty, ready for setup)
```

### Flow Diagram

```
1. New Client
    ↓
2. Fill onboarding form (/onboarding)
    ↓
3. Submit to POST /api/onboarding/create-client
    ↓
4. System creates:
   - Supabase Auth user (admin@client.com)
   - Client record (clients table)
   - User-client mapping (user_clients table)
    ↓
5. Redirect to /admin?client=<id>&setup=true
    ↓
6. Admin sets up:
   - Branding (logo, colors)
   - Products
   - Variables
   - Customers
```

---

## File Locations

### Frontend

**`src/app/onboarding/page.tsx`** - Main onboarding landing page
- Responsive design with gradient background
- Form collects: company name, slug, admin email, password, contact info, industry
- Client-side validation for form fields
- Submits to `/api/onboarding/create-client`

### Backend

**`src/app/api/onboarding/create-client.ts`** - API endpoint for workspace creation
- Validates form data
- Creates Supabase Auth user (with service role key)
- Creates client record in `clients` table
- Creates user-client mapping
- Returns success with redirect URL

---

## Form Fields

### Required Fields
| Field | Type | Example | Purpose |
|-------|------|---------|---------|
| Company Name | Text | "Acme Corporation" | Display name for workspace |
| Workspace Slug | Text | "acme-corp" | URL identifier (lowercase, hyphens) |
| Admin Email | Email | "admin@acme.com" | Login email |
| Password | Password | "••••••••" | Login password (min 8 chars) |
| Contact Name | Text | "John Doe" | Primary contact person |
| Contact Phone | Tel | "+1 (555) 123-4567" | Primary contact number |

### Optional Fields
| Field | Type | Options | Purpose |
|-------|------|---------|---------|
| Industry | Select | Retail, Furniture, Fashion, Tech, F&B | Business category |
| Company Size | Select | 1-10, 11-50, 51-200, 201-500, 500+ | Team size |

---

## API Response

### Success (201)
```json
{
  "success": true,
  "clientId": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "11111111-1111-1111-1111-111111111111",
  "message": "Workspace created successfully",
  "redirectUrl": "/admin?client=550e8400-e29b-41d4-a716-446655440001&setup=true"
}
```

### Errors

| Status | Scenario | Message |
|--------|----------|---------|
| 400 | Missing required field | "Missing required fields" |
| 400 | Invalid slug format | "Slug must be lowercase with hyphens only" |
| 409 | Slug already taken | "Workspace slug already taken" |
| 500 | Auth user creation failed | "Failed to create user: [reason]" |
| 500 | Client record creation failed | "Failed to create client: [reason]" |
| 500 | User-client mapping failed | "Failed to set up user access: [reason]" |

---

## Multi-Tenant User Support

### Single Tenant User
```sql
-- User created during onboarding
INSERT INTO user_clients (user_id, client_id) VALUES
  ('11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001');

-- User only sees Tenant-1 data
```

### Multi-Tenant User
```sql
-- Add user to another tenant (e.g., via admin panel)
INSERT INTO user_clients (user_id, client_id) VALUES
  ('11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440002');

-- User now has access to both Tenant-1 and Tenant-2
```

---

## Security Considerations

### ✅ What We Do
- Validate all form inputs (required fields, format)
- Use Supabase Auth for secure password storage
- Use service role key only on backend (never expose to client)
- RLS policies enforce tenant isolation automatically
- Slug uniqueness prevents workspace collisions

### ⚠️ What You Should Do
- Rate limit `/api/onboarding/create-client` to prevent abuse
- Add CAPTCHA for bot protection (optional but recommended)
- Monitor for suspicious onboarding patterns
- Send confirmation emails before account activation
- Add admin approval step for high-value clients (optional)

---

## Admin Setup Redirect

After successful onboarding, user is redirected to:
```
/admin?client=<clientId>&setup=true
```

The admin dashboard should:
1. Detect `setup=true` query parameter
2. Show onboarding wizard for:
   - Upload logo & favicon
   - Set primary color
   - Create first product category
   - Invite team members
3. Store branding in metadata or separate `client_settings` table

---

## Testing the Onboarding

### Local Testing
```bash
# 1. Make sure Supabase is running and RLS schema is deployed
# 2. Start dev server
npm run dev

# 3. Visit onboarding page
open http://localhost:3000/onboarding

# 4. Fill form and submit
# - Company Name: Test Corp
# - Slug: test-corp
# - Email: admin@testcorp.com
# - Password: TestPass123!
# - Contact: John Doe
# - Phone: +1 555 1234

# 5. Check Supabase for new records:
# - clients table should have 1 new row
# - user_clients should have 1 new mapping
# - auth.users should have new user
```

### Staging Testing
```bash
# Test with real Supabase project
1. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
2. Deploy to Vercel staging
3. Test full flow: onboarding → redirect → admin setup
4. Verify RLS isolation by querying different user contexts
```

---

## Troubleshooting

### Problem: "Slug must be lowercase with hyphens only"
**Solution:** Check slug validation regex. Valid slug: `acme-corp` (lowercase, hyphens ok)
```javascript
// Valid: acme-corp, test-123, my-company-1
// Invalid: Acme-Corp, acme_corp, acme corp, acme.corp
```

### Problem: "Failed to create user"
**Solution:** Check if email already exists
```sql
-- Query Supabase auth.users
SELECT email FROM auth.users WHERE email = 'admin@example.com';
```

### Problem: "Workspace slug already taken"
**Solution:** This is expected - guide user to choose different slug
```sql
-- Check existing slugs
SELECT slug FROM public.clients;
```

### Problem: User can't log in after onboarding
**Solution:** Verify user_clients mapping was created
```sql
SELECT * FROM user_clients 
WHERE user_id = '<userId>' AND client_id = '<clientId>';
```

### Problem: RLS policies blocking queries after onboarding
**Solution:** Verify JWT includes client_id claim
```typescript
// JWT payload should include:
{
  sub: "11111111-1111-1111-1111-111111111111",  // auth.uid()
  client_id: "550e8400-e29b-41d4-a716-446655440001"  // current_setting('jwt.claims.client_id')
}
```

---

## Next Steps

1. **Branding Setup Page** - Allow clients to upload logo and set colors
2. **Email Notifications** - Send welcome email with setup instructions
3. **Admin Approval** - Add optional client approval workflow for high-value clients
4. **SSO Integration** - Support SAML/OAuth for enterprise clients
5. **Team Invitations** - Allow admin to invite team members during onboarding
6. **Onboarding Wizard** - Step-by-step guided setup (alternative to admin panel)

---

## Related Files

- **Database Schema**: `supabase/migrations/7_rebuild_all_text_ids.sql`
- **RLS Policies**: `supabase/migrations/9_convert_ids_to_text.sql`
- **Admin Dashboard**: `src/app/admin/page.tsx` (to be created)
- **Authentication**: `lib/supabaseClient.ts`, `lib/supabaseAdmin.ts`
