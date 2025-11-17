# Expo360 Platform Architecture & Setup Guide

## Overview

Expo360 is a white-label e-commerce platform for events and expos. The platform consists of:

1. **Master Project** - The Expo360 wizard/builder where clients configure their sites
2. **Client Projects** - Individual cloned projects deployed per client

---

## Part 1: Master Project (Expo360 Builder)

### Purpose
The master project hosts the configuration wizard where clients:
- Choose their theme
- Enter company information (logo, name, details)
- Customize design (colors, banners, backgrounds)
- Configure navigation
- Complete setup to generate their site

### Technology Stack
- Next.js (TypeScript)
- Framer Motion (animations)
- Tailwind CSS (styling)
- Supabase (client management & configuration storage)

### Master Supabase Schema

The master Supabase project tracks:

**clients** table
```sql
- client_id (UUID, PK)
- company_name (TEXT)
- email (TEXT, unique)
- phone (TEXT)
- subscription_tier (TEXT) -- 'free', 'pro', 'enterprise'
- wizard_completed (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**client_wizard_configs** table
```sql
- config_id (UUID, PK)
- client_id (UUID, FK → clients)
- theme_selected (TEXT) -- Theme name chosen
- company_logo_url (TEXT) -- URL to uploaded logo
- company_data (JSONB) -- All company info from Step 2
- design_config (JSONB) -- Colors, banner, favicon, background settings
- navigation_config (JSONB) -- Nav style, alignment, colors
- site_url (TEXT) -- Where their site will be deployed
- supabase_project_ref (TEXT) -- Reference to their client Supabase project
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**deployed_sites** table
```sql
- site_id (UUID, PK)
- client_id (UUID, FK → clients)
- site_url (TEXT, unique) -- subdomain or custom domain
- github_repo_url (TEXT) -- Their cloned repo
- deployment_status (TEXT) -- 'pending', 'deployed', 'failed'
- deployed_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

---

## Part 2: Client Projects (Generated Sites)

### Architecture

When a client completes the wizard:

1. **Site Generation Process**
   - Clone the Kusam template (our base template)
   - Customize with wizard inputs (branding, colors, nav)
   - Deploy to a subdomain or custom domain
   - Connect to their own Supabase project/schema

2. **Deployment Strategy** (Recommended for "least work" approach)
   - Use **Vercel** with GitHub integration
   - Each client gets a cloned GitHub repo
   - Deploy to `{client-slug}.expo360.com` (subdomains)
   - Auto-deploys from their GitHub repo

### Client Project Supabase Schema

Each client gets their own database with tables:

**products** table
```sql
- product_id (UUID, PK)
- name (TEXT)
- description (TEXT)
- price (DECIMAL)
- images (JSONB) -- Array of image URLs
- variables (JSONB) -- Product options/variants
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- created_by (UUID, FK → admin_users)
```

**product_variables** table
```sql
- variable_id (UUID, PK)
- product_id (UUID, FK → products)
- variable_name (TEXT)
- variable_type (TEXT) -- 'multi-select', 'nested', 'text', 'color', etc.
- options (JSONB) -- Array of available options
- created_at (TIMESTAMP)
```

**store_locations** (Sucursales y Expos) table
```sql
- location_id (UUID, PK)
- name (TEXT)
- address (TEXT)
- phone (TEXT)
- featured_products (JSONB) -- Array of product IDs
- banner_image_url (TEXT)
- created_at (TIMESTAMP)
```

**orders** table
```sql
- order_id (UUID, PK)
- customer_email (TEXT)
- customer_phone (TEXT)
- items (JSONB) -- Cart contents
- total (DECIMAL)
- payment_status (TEXT) -- 'pending', 'completed', 'failed'
- payment_method (TEXT) -- 'stripe', 'mercado_pago', etc.
- transaction_id (TEXT)
- created_at (TIMESTAMP)
```

**admin_users** table
```sql
- user_id (UUID, PK)
- email (TEXT, unique)
- password_hash (TEXT)
- role (TEXT) -- 'admin', 'editor'
- created_at (TIMESTAMP)
```

---

## Part 3: Setup & Deployment Strategy

### "Least Work" Approach (Recommended)

Since we already have a working Kusam project:

1. **Don't rebuild from scratch** - Clone the existing Kusam project structure
2. **Parameterize the customization** - Make the design/nav/branding dynamic based on database configs
3. **Use template variables** - Store client configs in their Supabase, pull at runtime
4. **Automate with GitHub + Vercel** - Clone repo → customize `.env` → push to GitHub → Vercel auto-deploys

### Step-by-Step Client Setup

**When client completes wizard:**

1. Create new row in `clients` table
2. Store wizard config in `client_wizard_configs`
3. Trigger automated process:
   ```
   a) Create new Supabase project for client (or new schema in shared project)
   b) Clone GitHub repo: kusam-template → client-{slug}
   c) Update .env with their Supabase credentials
   d) Create their database schema
   e) Push to GitHub
   f) Connect to Vercel → auto-deploy
   g) Update DNS/subdomains
   h) Mark as deployed in database
   ```

### Master Project Environment Variables

```env
# Master Supabase (tracks clients & configurations)
NEXT_PUBLIC_MASTER_SUPABASE_URL=your_master_supabase_url
NEXT_PUBLIC_MASTER_SUPABASE_ANON_KEY=your_key

# GitHub for cloning repos
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_github_org

# Vercel for deployments
VERCEL_TOKEN=your_vercel_token
VERCEL_TEAM_ID=your_team_id
```

### Client Project Environment Variables

Each client project needs:

```env
# Their own Supabase instance
NEXT_PUBLIC_SUPABASE_URL=their_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=their_key
SUPABASE_SERVICE_ROLE_KEY=their_service_key

# Payment gateways (shared or per-client)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=key
STRIPE_SECRET_KEY=key

# Optional: Webhooks, Analytics, AI
```

---

## Part 4: Current Project Structure

The existing Kusam template is your base:
- ✅ Working checkout flow
- ✅ Product management
- ✅ Admin dashboard
- ✅ Payment integration
- ✅ Store location pages
- ✅ Product variables

**What we're adding:**
- Wizard (configuration builder) - ✅ DONE
- Site generator (clone & customize) - TODO
- Multi-client Supabase management - TODO
- Theme variations - TODO

---

## Part 5: Implementation Priority

1. **Phase 1** - Master Supabase setup + basic site generator
2. **Phase 2** - Automate GitHub cloning & Vercel deployment
3. **Phase 3** - Theme variations & customization
4. **Phase 4** - Self-service client portal

---

## Part 6: Client Site Customization (Runtime)

Once deployed, client sites are customized at runtime by:

1. **Fetching Wizard Config** from their Supabase on page load
2. **Applying Dynamic Styling**:
   - Logo displayed in header
   - Colors applied (primary, secondary)
   - Navigation rendered with their style/alignment/colors
   - Banner displayed (gradient/solid/image)
   - Background applied (fullscreen/tile)
3. **Storing in Client Database**:
   - Products managed in their Supabase
   - Orders stored in their Supabase
   - Admin users authenticated to their project

### How Customization Works

**On client site load:**
```
1. Get client_id from URL (subdomain or path)
2. Query their Supabase: SELECT * FROM wizard_config WHERE client_id = X
3. Load all design/nav/branding settings
4. Apply to Tailwind/CSS dynamically
5. Render site with their branding
```

**Example: Logo in Header**
```tsx
// Header component pulls logo from their Supabase config
const logo = wizardConfig.company_data.logo;
<img src={logo} alt="Company Logo" />
```

**Example: Colors**
```tsx
<div style={{ 
  backgroundColor: wizardConfig.design_config.primaryColor,
  color: wizardConfig.design_config.navTextColor 
}}>
```

---

## Part 7: Environment Variables Reference

### Master Project (.env)

```env
# Master Supabase
NEXT_PUBLIC_MASTER_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_MASTER_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# GitHub & Automation
GITHUB_TOKEN=ghp_xxx
GITHUB_OWNER=your-org

# Vercel & Deployment
VERCEL_TOKEN=xxx
VERCEL_TEAM_ID=xxx

# File Storage
NEXT_PUBLIC_STORAGE_BUCKET=client-uploads
```

### Client Project Template (.env.example)

Each cloned client project needs:

```env
# Their Supabase instance
NEXT_PUBLIC_SUPABASE_URL=https://client-xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Payment Processing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR_xxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx

# Analytics & Webhooks (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-xxx
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxx

# Image Optimization
NEXT_PUBLIC_STORAGE_BUCKET=products
```

---

## Part 8: Current Project Locations

**Master Project (Builder/Wizard)**
- Location: `/expo360-template-app/`
- Key files:
  - `src/components/BuildWizard.tsx` - Main wizard component
  - Steps 1-4: Theme, Company Info, Design Studio, Navigation

**Base Template (Kusam - to be cloned)**
- Location: Already exists in your codebase
- Will be cloned per client
- Contains: Products, Orders, Admin, Checkout, etc.

---

## Part 9: Next Steps

1. ✅ **Wizard UI** - Complete (5 steps)
2. ⏳ **Master Supabase** - Create schema
3. ⏳ **Site Generator** - Build automation script
4. ⏳ **GitHub/Vercel Integration** - Setup auto-deployment
5. ⏳ **Theme Variations** - Create variations for other 5 themes
6. ⏳ **Client Portal** - Self-service dashboard

---

## Part 10: Branding & Customization Details

### Logos & Images

- **Company Logo** (uploaded in Step 2)
  - Recommended: 1500 × 500 px
  - Formats: PNG, WEBP with transparency
  - Max: 500 KB
  - Stored in: Master Supabase + client site logo display

- **Favicon** (uploaded in Step 3)
  - Recommended: 32 × 32 px
  - Formats: PNG, ICO, WEBP
  - Stored in: Client public folder

- **Catalog Banner** (uploaded in Step 3)
  - Recommended: 1500 × 500 px
  - Formats: PNG, JPG, WEBP
  - Max: 2 MB
  - Display: Below company info, above products

- **Background Image** (uploaded in Step 3)
  - Formats: PNG, JPG, WEBP
  - Modes: Fullscreen (cover) or Tile (300x300px)
  - Applied to: Entire site background

### Color Customization

- **Primary Color** - Main brand color
- **Secondary Color** - Accent/CTA color
- **Navigation Background** - Nav bar background
- **Navigation Text** - Nav bar text color
- **Dark Mode** - Toggle for dark theme

### Navigation Customization

- **Styles**: Horizontal, Vertical, Sticky/Fixed
- **Alignment**: Left, Center, Right
- **Logo Display**: Show/hide company logo in nav
- **Colors**: Background & text colors

---

## Troubleshooting

**Site not showing custom branding:**
- Verify client_id is correctly stored
- Check Supabase connection in client project
- Confirm wizard_config table has client's data

**Images not loading:**
- Verify Supabase storage bucket permissions
- Check image URLs are accessible
- Confirm file sizes within limits

**Deployment failed:**
- Check GitHub token permissions
- Verify Vercel project settings
- Confirm environment variables passed correctly
