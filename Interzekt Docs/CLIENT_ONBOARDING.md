**Client Onboarding & Deployment Guide**

This document is a concise, step-by-step guide to onboard a new client and deploy the Expo360 template to Vercel. It's written for a tight timeline — follow each section and use the checklists to move quickly.

**Scope:**
- Prepare client assets and env vars
- Configure Vercel + Supabase + Stripe (optional)
- Deploy staging, run smoke tests
- Hand off for QA and production

**Prerequisites**
- GitHub repository access (this repo)
- Vercel account with permissions to create a new Project
- (Optional) Supabase project + credentials
- (Optional) Stripe account for real payments and webhooks

**Files & locations**
- Project root: `CLIENT_ONBOARDING.md` (this file)
- Env example: `.env.example` (create if missing)
- Mock adapter: `lib/supabaseMock.ts`
- Branding hooks: `src/app/layout.tsx`, `src/components/MainLeadForm.tsx`

**Quick Start (5–10 minutes, staging with mock data)**
1. Fork/clone the repo and switch to `main`.
2. Install deps and build locally:

```bash
npm ci
npm run build
npm run dev  # for local preview
```

3. By default the app runs in MOCK mode (no env vars required). Visit `http://localhost:3000` and verify pages load and admin routes respond with mock data.

**Required environment variables (per-client)**
Create a `.env` or configure Vercel project with these keys as needed. For staging/mock you do NOT need these (mock adapter will be used).

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (only for real DB)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (admin operations)
- `STRIPE_SECRET_KEY` — Stripe secret key (for real payments)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `GA4_PROPERTY_ID` — Google Analytics 4 property id (optional)

Create `.env.example` with these keys present but empty values for quick onboarding.

**Onboarding checklist (detailed)**
1. Branding
   - Obtain client logo (PNG/SVG), favicon (48x48/any), and primary color hex.
   - Update `public/` assets (or provide an assets bundle) and set values in Vercel env or theming config.
   - Edit `src/app/layout.tsx` metadata (title, description, og:image) for the client — prefer automation via a `themes/<client>/` directory later.

2. Repo & Project Setup
   - Add a Vercel project and link the GitHub repo branch (`main`).
   - Add build command: `npm run build` (default is set in `package.json`).
   - Add environment variables in Vercel (if using real Supabase/Stripe).

3. Database (Supabase) — Optional for staging (mock mode supported)
   - Create Supabase project.
   - Create required tables and schema (we'll provide a migration script later). For now, deploy schema in `supabase/schema.sql` if supplied.
   - Set Vercel env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
   - If these are set, the app will use the real DB instead of mock.

4. Payments
   - Stripe: add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to Vercel. Configure webhook endpoint in Stripe dashboard: `https://<project>.vercel.app/api/stripe-webhook`.
   - MercadoPago: configure keys if used (documented elsewhere in repo).

5. Webhooks & Secrets
   - Ensure webhooks are configured in provider dashboards to point to the Vercel deployment.
   - For local testing, use `stripe listen` or `ngrok` to forward events to local dev server.

6. CI & Quality Gates
   - Add GitHub Actions (we will add a starter workflow). PRs should run: `npm ci`, `npm run lint`, `npm run build`, and your tests (when added).

7. Staging Deploy & Smoke Tests
   - Trigger a deployment on Vercel.
   - Smoke test: main pages load, admin API routes return OK, build-simplified page loads, Stripe webhook endpoint returns 400 (empty) or 500 if not configured (that's expected until secrets are set).

**Minimal Smoke Test Script (manual)**
- Visit `/` and confirm page loads without server errors.
- Visit `/build` and `/build-simplified`.
- Call critical API endpoints (use `curl`):

```bash
curl -I https://<your-deploy>/api/test
curl -I https://<your-deploy>/api/create-stripe-session -X POST -d '{}'
```

**Troubleshooting common issues**
- Build fails because of module-level initializations: ensure we are on the latest `main` (we converted to factory pattern). If a new error references missing envs, search for `createClient(` or `new Stripe(` at module top level.
- Stripe webhook 500: verify `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are set and match dashboard configuration.
- Supabase auth errors: check `SUPABASE_SERVICE_ROLE_KEY` and that RLS policies match your queries.

**QA Checklist before Production**
- All critical flows exercised: checkout, create-order, image upload, thumbnail generation.
- Logs monitored (Sentry or console) during staging testing.
- Perf check: run Lighthouse on home and product pages, address LCP issues (replace high-impact `<img>` with `next/image`).
- Confirm vendor webhooks and emails are functional.

**Handoff package (what to deliver to client)**
- Vercel project with `main` branch configured
- Environment variables list and instructions for adding secrets
- Branding asset bundle (logo, favicon, color palette)
- Short runbook for support (how to restart, how to enable real DB)

**Next immediate items (I will do next)**
- Add a starter GitHub Actions workflow that runs build+lint on PRs (CI). I'll create `.github/workflows/ci.yml` for this repo.
- Create `.env.example` and a small `scripts/validate-env.js` (optional) to validate required envs before production deploy.

---
If this looks good I will create the file in the repo (so it's immediately available) and then add the CI workflow next. Let me know if you want the doc adjusted (tone, more/less detail) before I commit it.