# Expo360 SaaS Project - Development Checklist

This document outlines all the necessary steps to take the Expo360 template from its current state to a fully functional, multi-tenant SaaS application ready for customer launch.

---

## Phase 1: Foundational Setup (Local Environment)

This phase ensures your local machine is ready for development and connected to the correct backend services.

### Architecture Decisions
- [x] **Decide on Core Architecture:**
  - [x] Opted for a single Supabase project using a multi-tenant schema with Row-Level Security (RLS) for cost-effective development.
  - [x] Decided to keep the marketing site, customer account management, and the app editor within a single Next.js project for simplicity and speed.
  - [x] Chose to rename `/admin` route to `/editor` for a more customer-friendly naming convention.

### Local Environment Setup
- [ ] **Set Up Supabase Project:**
  - [ ] Create a new, free-tier project on [supabase.com](https://supabase.com).
  - [ ] Securely save the database password.
  - [ ] Enable Row-Level Security (RLS) on all tables.

- [ ] **Configure Local Environment Variables:**
  - [ ] In the `expo360-template-app` directory, create or edit the `.env.local` file.
  - [ ] Find your new Supabase project's URL and `anon` key in **Project Settings > API**.
  - [ ] Add the keys to your `.env.local` file:
    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
    ```
  - [ ] **IMPORTANT:** Never commit `.env.local` to version control. Add it to `.gitignore`.

- [ ] **Install Project Dependencies:**
  - [ ] Open a terminal in the `expo360-template-app` folder.
  - [ ] Run `npm install` to download all required libraries.

- [ ] **Run the Application Locally:**
  - [ ] Run `npm run dev` in the terminal.
  - [ ] Confirm the application loads at `http://localhost:3000`.

---

## Phase 1.5: Version Control & GitHub Setup

This phase establishes your code repository and version control workflow.

### GitHub Repository Setup
- [ ] **Create GitHub Repository:**
  - [ ] Go to [github.com](https://github.com) and log in to your account.
  - [ ] Click "New Repository" to create a new repo.
  - [ ] Name it `expo360` (or your preferred name).
  - [ ] Add a description: "Multi-tenant SaaS platform for creating interactive product showcases."
  - [ ] Choose "Private" if you want to restrict access, "Public" if you want open-source collaboration.
  - [ ] Add a `.gitignore` file (select "Node" template).
  - [ ] Add a `README.md` file.
  - [ ] Initialize with MIT license or your preferred license.
  - [ ] Click "Create repository".

- [ ] **Initialize Local Git Repository:**
  - [ ] Open terminal in the `expo360-template-app` folder.
  - [ ] Run `git init` to initialize git locally.
  - [ ] Run `git add .` to stage all files.
  - [ ] Run `git commit -m "Initial commit: Expo360 SaaS template with multi-tenant setup"`.
  - [ ] Run `git branch -M main` to rename the default branch to `main`.
  - [ ] Add the remote: `git remote add origin https://github.com/YOUR_USERNAME/expo360.git`.
  - [ ] Push to GitHub: `git push -u origin main`.

- [ ] **Update `.gitignore`:**
  - [ ] Ensure `.env.local` is in `.gitignore` (CRITICAL - never commit secrets).
  - [ ] Add `.env.production.local` to `.gitignore`.
  - [ ] Add `node_modules/` to `.gitignore`.
  - [ ] Add `.next/` to `.gitignore`.
  - [ ] Add `out/` to `.gitignore`.
  - [ ] Add `.DS_Store` to `.gitignore` (macOS).
  - [ ] Add `*.pem` to `.gitignore` (for SSL certificates, if applicable).

- [ ] **Set Up GitHub Branch Protection (Optional but Recommended):**
  - [ ] Go to repository settings: **Settings > Branches**.
  - [ ] Click "Add rule" under "Branch protection rules".
  - [ ] Create a rule for `main` branch:
    - [ ] Require pull request reviews before merging.
    - [ ] Require status checks to pass before merging (CI/CD).
    - [ ] Require branches to be up to date before merging.

- [ ] **Create Development Workflow:**
  - [ ] Create a `develop` branch: `git checkout -b develop` and `git push -u origin develop`.
  - [ ] Establish Git workflow: Feature branches → Pull Requests → Code Review → Merge to `main`.
  - [ ] Document branch naming conventions (e.g., `feature/`, `bugfix/`, `hotfix/`).

### Create README Documentation
- [ ] **Update Root `README.md`:**
  - [ ] Add project title and tagline.
  - [ ] Add a brief description of Expo360.
  - [ ] Add **Getting Started** section with setup instructions.
  - [ ] Add **Technologies Used** section (Next.js, Supabase, Tailwind CSS, etc.).
  - [ ] Add **Project Structure** overview.
  - [ ] Add **Environment Variables** template.
  - [ ] Add **Running Locally** instructions.
  - [ ] Add **Deployment** section.
  - [ ] Add **License** section.
  - [ ] Add **Contact/Support** information.

---

## Phase 2: Database and Backend Configuration

This phase involves setting up the database schema to securely handle multiple customers.

### Multi-Tenant Schema
- [x] **Create Multi-Tenant SQL Schema:**
  - [x] A schema file has been created at `supabase/multitenant_schema.sql`.
  - [x] This schema creates the `customers` table and adds a `customer_id` to other tables to enforce data isolation.
  - [x] It includes Row-Level Security (RLS) policies to ensure users can only access data belonging to their organization.

- [ ] **Apply the Schema to Supabase:**
  - [ ] Go to the **SQL Editor** in your new Supabase project.
  - [ ] Copy the contents of `supabase/multitenant_schema.sql`.
  - [ ] Paste the SQL into the editor and click **"RUN"**. This will set up your tables and security policies.
  - [ ] Verify that all tables were created successfully and RLS policies are enabled.

### Additional Database Configuration
- [ ] **Create Additional Tables for Multi-Tenancy:**
  - [ ] Ensure the `customers` table has columns: `id`, `name`, `created_at`, and any other metadata you need (e.g., `subscription_tier`, `domain`, `logo_url`).
  - [ ] Add `customer_id` foreign keys to all data tables: `products`, `orders`, `users`, `settings`, etc.
  - [ ] Create indexes on `customer_id` columns for optimal query performance.

- [ ] **Set Up Storage Buckets:**
  - [ ] Create a new storage bucket in Supabase for `customer-assets`.
  - [ ] Set up RLS policies for storage to ensure customers can only access their own files.
  - [ ] Configure a bucket for `product-images`, `logos`, `banners`, etc.

- [ ] **Create Utility Functions (Optional but Recommended):**
  - [ ] Create a Supabase Edge Function to handle customer creation upon signup.
  - [ ] Create a function to initialize default settings for new customers.

---

## Phase 3: Core Application Features - Guided Onboarding

This phase focuses on building the guided onboarding wizard that customers use when they first sign up.

### Onboarding Wizard Structure
- [x] **Create Guided Onboarding Flow:**
  - [x] A new route has been created at `/build`.
  - [x] A `BuildWizard.tsx` component has been created to manage the multi-step setup process.
  - [x] Implemented a professional, polished UI matching design guidelines with:
    - [x] Circular step indicator (1, 2, 3) at the top
    - [x] Background gradient (blue to orange)
    - [x] Theme/template selector on Step 1
    - [x] Responsive card layout for template selection
    - [x] Template images loaded from `/public/themes/`

- [ ] **Step 1: Pick a Theme**
  - [x] Create a grid of 6 template options (Coolness, Moody Blues, Etsyting, Hypemaker, Clean & Crisp, Showcase).
  - [x] Display template preview images.
  - [x] Allow user to select a theme.
  - [ ] Save the selected theme to the database.
  - [ ] Store theme configuration as a starting point for the customer's app.

- [ ] **Step 2: Design Studio**
  - [ ] Create a form for users to input their company details:
    - [ ] Company name
    - [ ] Company logo upload (with image preview and optimization)
    - [ ] Company description/tagline
    - [ ] Primary brand color picker
    - [ ] Secondary brand color picker
  - [ ] Implement image upload to Supabase Storage under `customer-assets/{customer_id}/logo/`.
  - [ ] Preview how colors will look in the app.

- [ ] **Step 3: Initial Data**
  - [ ] Create forms for users to upload their initial product data:
    - [ ] Option 1: Upload CSV file with product information
    - [ ] Option 2: Add products manually one by one
    - [ ] Option 3: Skip for now and add later
  - [ ] Parse and validate uploaded data.
  - [ ] Create product records in the database linked to the customer's account.

- [ ] **Step 4: Confirmation & Launch**
  - [ ] Show a summary of what was configured.
  - [ ] Create the `customer` record in the database.
  - [ ] Create the first `user` record (the person who signed up) linked to that customer.
  - [ ] Set default role to 'admin' for the first user.
  - [ ] Redirect to the `/editor` dashboard upon completion.

### Wizard Enhancements
- [ ] **Add Progress Persistence:**
  - [ ] Save wizard progress to local storage so users can close and return to the wizard.
  - [ ] Add a "Save & Continue Later" option.

- [ ] **Add Data Validation:**
  - [ ] Validate all form inputs before submission.
  - [ ] Show clear error messages for invalid data.
  - [ ] Provide helpful hints for required fields.

- [ ] **Add Help & Support:**
  - [ ] Include tooltips or "?" icons explaining each field.
  - [ ] Add a "Help" button linking to relevant documentation or support.

---

## Phase 4: Core Application Features - Admin Dashboard Adaptation

This phase adapts the existing admin dashboard (`/admin`) to work with the multi-tenant system.

### Route Restructuring
- [ ] **Rename `/admin` route to `/editor`:**
  - [ ] Move all files from `/src/app/admin/` to `/src/app/editor/`.
  - [ ] Update all internal links and redirects to point to `/editor` instead of `/admin`.
  - [ ] Update the `AdminDashboard` component naming if desired (optional).

### Multi-Tenancy Integration
- [ ] **Update Supabase Queries in `/editor` Pages:**
  - [ ] Modify `catalogo/page.tsx` to leverage RLS policies. Remove manual `customer_id` filters.
  - [ ] Modify `reportes/page.tsx` to only show data for the current customer.
  - [ ] Ensure all other pages in `/editor/*` respect customer data isolation.

- [ ] **File Upload Organization:**
  - [ ] Update product image uploads to save to `/customer-assets/{customer_id}/products/`.
  - [ ] Update variable/option image uploads to save to `/customer-assets/{customer_id}/variables/`.
  - [ ] Ensure storage RLS policies allow only the customer's users to access their files.

- [ ] **Authentication Context:**
  - [ ] Ensure the app always has access to the current `customer_id` and `user_id`.
  - [ ] Create a custom hook `useCurrentCustomer()` to fetch the customer's information.
  - [ ] Create a custom hook `useCustomerData()` to fetch any customer-specific settings.

- [ ] **Add Customer Settings Page:**
  - [ ] Create a new page at `/editor/settings` for the customer to manage their account.
  - [ ] Allow customers to update their company name, logo, and brand colors.
  - [ ] Show subscription information and billing status.

- [ ] **Add Multi-User Management (Optional for MVP):**
  - [ ] Create a page at `/editor/team` to invite and manage team members.
  - [ ] Implement role-based access control (admin, editor, viewer).
  - [ ] Create RLS policies that respect user roles.

---

## Phase 5: Customer-Facing Website & Authentication

This phase involves building the public-facing marketing site and authentication systems.

### Public Marketing Pages
- [ ] **Build Landing Page (`/`):**
  - [ ] Create an engaging hero section.
  - [ ] Showcase key features of Expo360.
  - [ ] Include social proof (testimonials, case studies).
  - [ ] Add a clear call-to-action button ("Get Started" or "Start Free Trial").

- [ ] **Create Pricing Page (`/pricing`):**
  - [ ] Display pricing tiers (Free, Pro, Enterprise, etc.).
  - [ ] Show features included in each tier.
  - [ ] Add a "Select Plan" button for each tier that directs to signup.

- [ ] **Create Features Page (`/features`):**
  - [ ] Detail all the capabilities of Expo360.
  - [ ] Include screenshots or videos.
  - [ ] Explain benefits for different types of businesses.

- [ ] **Create About Page (`/about`):**
  - [ ] Tell the story of Expo360/your company.
  - [ ] Build trust with potential customers.

- [ ] **Create FAQ Page (`/faq`):**
  - [ ] Answer common questions about pricing, features, support, etc.

### Authentication System
- [ ] **Implement User Sign-Up (`/signup`):**
  - [ ] Create a signup form with:
    - [ ] Email address
    - [ ] Password (with strength requirements)
    - [ ] Full name
    - [ ] Company name
  - [ ] Use Supabase Auth to create a new user.
  - [ ] Upon successful signup, trigger the `/build` onboarding wizard.
  - [ ] Create a `customer` record associated with the new user.

- [ ] **Implement User Login (`/login`):**
  - [ ] Create a login form with email and password fields.
  - [ ] Redirect authenticated users to `/editor`.
  - [ ] Show appropriate error messages for failed login attempts.
  - [ ] Add a "Forgot Password?" link.

- [ ] **Implement Password Reset:**
  - [ ] Create a `/forgot-password` page.
  - [ ] Send password reset emails via Supabase.
  - [ ] Create a `/reset-password` page with a token-based reset form.
  - [ ] Validate tokens and update passwords securely.

- [ ] **Implement Email Verification (Recommended):**
  - [ ] Send a verification email upon signup.
  - [ ] Require email verification before accessing the editor.
  - [ ] Provide a link to resend verification emails.

### Customer Account Management Dashboard
- [ ] **Create Account Section (`/account`):**
  - [ ] Create a layout for account pages with a sidebar menu.

- [ ] **Build `/account/profile` Page:**
  - [ ] Allow users to view and update their profile information.
  - [ ] Allow users to upload and update their company logo.
    - [ ] Spec: 1536x576 px, PNG/WEBP with transparency, max 500 KB
    - [ ] Store in Supabase Storage with customer isolation via RLS
  - [ ] Allow users to update company name and description.
  - [ ] Show the current subscription tier.
  - [ ] Allow users to upload/update favicon (32x32 px, PNG/ICO/WEBP).

- [ ] **Build `/account/billing` Page:**
  - [ ] Integrate with a payment provider (Stripe recommended).
  - [ ] Show current subscription and billing information.
  - [ ] Display upcoming renewal date.
  - [ ] Allow users to upgrade, downgrade, or cancel their subscription.
  - [ ] Show invoice history.
  - [ ] Provide a "Download Invoice" option.

- [ ] **Build `/account/team` Page (Optional for MVP):**
  - [ ] Show list of team members.
  - [ ] Allow users to invite new team members via email.
  - [ ] Show member roles and permissions.
  - [ ] Allow removal of team members.

- [ ] **Build `/account/settings` Page:**
  - [ ] Allow users to update email address.
  - [ ] Allow users to change password.
  - [ ] Allow users to enable/disable two-factor authentication (2FA).
  - [ ] Show connected integrations (if applicable).
  - [ ] Provide a "Delete Account" option (with confirmation).

---

## Phase 5.5: N8N Automations & CRM Integrations

This phase sets up workflow automation using N8N to integrate with CRM systems, communication tools, and other business software. This allows customers to automatically sync their product data and customer interactions with their existing tools.

### N8N Setup & Infrastructure
- [ ] **Set Up N8N Instance:**
  - [ ] Choose deployment option:
    - [ ] Self-hosted N8N (Docker container on your server)
    - [ ] N8N Cloud (managed hosting at n8n.cloud)
  - [ ] Recommended: N8N Cloud for MVP (easier maintenance, built-in SSL, backups)
  - [ ] Create N8N account at [n8n.cloud](https://n8n.cloud)
  - [ ] Configure user roles and permissions.

- [ ] **Secure N8N Access:**
  - [ ] Enable authentication for N8N dashboard.
  - [ ] Set up webhook URLs for receiving data from Expo360.
  - [ ] Generate and store API keys securely in Supabase.
  - [ ] Configure CORS policies to allow requests from your Expo360 domain.

- [ ] **Create N8N Workflow Templates:**
  - [ ] Design reusable workflow templates for common integrations.
  - [ ] Test templates with sample data.
  - [ ] Document each workflow with inputs, outputs, and configuration steps.

### CRM Integrations

#### Airtable Integration
- [ ] **Set Up Airtable Workflow:**
  - [ ] Create N8N workflow that connects Expo360 to Airtable.
  - [ ] Trigger: When a new product is created in Expo360, push data to Airtable.
  - [ ] Map Expo360 fields to Airtable columns:
    - [ ] Product name → Airtable "Product Name" field
    - [ ] Product description → Airtable "Description" field
    - [ ] Product images → Airtable "Images" attachment field
    - [ ] Customer ID → Airtable "Customer" field
    - [ ] Created date → Airtable "Created" field
  - [ ] Handle image uploads to Airtable attachments.
  - [ ] Implement error handling and retry logic.

- [ ] **Bi-Directional Sync (Optional):**
  - [ ] Allow updates from Airtable to sync back to Expo360.
  - [ ] Airtable webhook triggers N8N workflow.
  - [ ] Update product data in Expo360 database.
  - [ ] Handle conflicts and prevent duplicate syncing.

#### Google Sheets Integration
- [ ] **Set Up Google Sheets Workflow:**
  - [ ] Create N8N workflow to append product data to Google Sheets.
  - [ ] Authorize N8N to access customer's Google Sheets.
  - [ ] Create workflow template:
    - [ ] Trigger: Product created/updated in Expo360
    - [ ] Append new row to designated Google Sheet
    - [ ] Include all relevant product information
  - [ ] Format data consistently (headers, data types).
  - [ ] Implement automatic backup/archival of old data.

#### Pipedrive Integration
- [ ] **Set Up Pipedrive Workflow:**
  - [ ] Create N8N workflow to sync products to Pipedrive deals/products.
  - [ ] Authenticate with Pipedrive API.
  - [ ] Map Expo360 products to Pipedrive product catalog.
  - [ ] Auto-create Pipedrive deals for customer projects.
  - [ ] Sync project status updates bidirectionally.
  - [ ] Track sales pipeline with Expo360 project data.

#### HubSpot Integration (Optional)
- [ ] **Set Up HubSpot Workflow:**
  - [ ] Create N8N workflow to sync with HubSpot CRM.
  - [ ] Push product data to HubSpot objects/deals.
  - [ ] Sync customer contact information.
  - [ ] Log customer interactions as HubSpot activities.
  - [ ] Create deals based on Expo360 project opportunities.

### Project Management & Collaboration Integrations

#### Monday.com Integration
- [ ] **Set Up Monday.com Workflow:**
  - [ ] Create N8N workflow to sync projects to Monday.com boards.
  - [ ] Trigger: New Expo360 project created
  - [ ] Actions:
    - [ ] Create new Monday.com item for each project
    - [ ] Set project name, description, customer info
    - [ ] Link to product images from Expo360
    - [ ] Create milestone tasks for project phases
  - [ ] Bi-directional sync:
    - [ ] Monday status updates sync to Expo360 project status
    - [ ] Task comments sync to project notes
  - [ ] Implement automatic archival of completed projects.

#### Asana Integration (Optional)
- [ ] **Set Up Asana Workflow:**
  - [ ] Create N8N workflow to sync with Asana projects.
  - [ ] Create Asana tasks for each Expo360 project.
  - [ ] Assign tasks to team members based on roles.
  - [ ] Sync timeline and milestones.
  - [ ] Update Expo360 when Asana tasks are completed.

#### Jira Integration (Optional - For Development Teams)
- [ ] **Set Up Jira Workflow:**
  - [ ] Create N8N workflow for technical feedback management.
  - [ ] Auto-create Jira tickets from customer feature requests.
  - [ ] Link Jira issues to related Expo360 projects.
  - [ ] Sync issue status with product feedback status.

### Communication & Notification Integrations

#### Slack Integration
- [ ] **Set Up Slack Workflow:**
  - [ ] Create N8N workflow for Slack notifications.
  - [ ] Triggers:
    - [ ] New product created → Notification to project channel
    - [ ] Project status changed → Update Slack channel
    - [ ] Customer requested new feature → Alert to team
    - [ ] Payment received → Confirmation notification
  - [ ] Format Slack messages with rich formatting (blocks, buttons).
  - [ ] Create slash commands for common actions:
    - [ ] `/expo-projects` - List active projects
    - [ ] `/expo-status` - Get project status
    - [ ] `/expo-notify` - Send notifications to customer
  - [ ] Set up Slack app in workspace.

#### Microsoft Teams Integration (Optional)
- [ ] **Set Up Teams Workflow:**
  - [ ] Create N8N workflow for Teams notifications.
  - [ ] Similar triggers as Slack integration.
  - [ ] Send rich formatted messages to Teams channels.
  - [ ] Create adaptive cards with project details.
  - [ ] Implement Teams-based approvals for key actions.

#### Discord Integration (Optional - For Communities)
- [ ] **Set Up Discord Workflow:**
  - [ ] Create N8N workflow for Discord notifications.
  - [ ] Send project updates to Discord server.
  - [ ] Create Discord bots for customer communities.
  - [ ] Embed project images and data in Discord messages.

### Email & Marketing Automations

#### Email Automation
- [ ] **Set Up Email Workflow:**
  - [ ] Create N8N workflow to trigger emails from Expo360 events.
  - [ ] Triggers:
    - [ ] New product created → Welcome email to customer
    - [ ] Project milestone reached → Celebration/reminder email
    - [ ] Customer inactivity (7 days) → Re-engagement email
  - [ ] Integrate with SendGrid/AWS SES/Resend.
  - [ ] Use dynamic templates with customer/project data.
  - [ ] Track email opens and clicks.

#### SMS Notifications (Optional)
- [ ] **Set Up SMS Workflow:**
  - [ ] Create N8N workflow for SMS alerts.
  - [ ] Integrate with Twilio or AWS SNS.
  - [ ] Send critical alerts via SMS (payment received, project approved).
  - [ ] Keep SMS messages concise with tracking links.

### Workflow Monitoring & Management

- [ ] **Create Workflow Dashboard in N8N:**
  - [ ] Set up monitoring for all active workflows.
  - [ ] Create alerts for workflow failures.
  - [ ] Track workflow execution history and performance.
  - [ ] Log all data syncs and errors to Supabase audit table.

- [ ] **Error Handling & Logging:**
  - [ ] Implement retry logic for failed API calls.
  - [ ] Create error notification workflow (alerts to admin Slack).
  - [ ] Log all workflow executions to database.
  - [ ] Set up alerting for failed integrations.

- [ ] **User-Configurable Integrations:**
  - [ ] Create admin dashboard where customers can toggle integrations.
  - [ ] Store customer API keys securely in Supabase (encrypted).
  - [ ] Allow customers to map custom fields between Expo360 and external systems.
  - [ ] Test integrations before enabling.
  - [ ] Provide logs and debugging information to customers.

### Integration Documentation & Support

- [ ] **Create Integration Setup Guides:**
  - [ ] Write step-by-step guides for each integration (Airtable, Google Sheets, Pipedrive, etc.).
  - [ ] Include screenshots and video walkthroughs.
  - [ ] Document required permissions and API keys.
  - [ ] Provide troubleshooting sections.
  - [ ] Post guides at `/docs/integrations`.

- [ ] **Set Up Integration Settings Page:**
  - [ ] Create `/account/integrations` page in app.
  - [ ] Show list of available integrations with status.
  - [ ] Allow users to:
    - [ ] Connect/disconnect each integration
    - [ ] Configure field mappings
    - [ ] Test connection
    - [ ] View sync history and logs
    - [ ] Enable/disable specific workflows

- [ ] **Create Webhook Documentation:**
  - [ ] Document how customers can build their own N8N workflows.
  - [ ] Provide Expo360 webhook endpoints and payload examples.
  - [ ] Allow customers to create custom integrations beyond pre-built templates.

---

## Phase 6: Payment & Billing Integration

This phase sets up the payment infrastructure to handle customer subscriptions.

### Stripe Integration
- [ ] **Set Up Stripe Account:**
  - [ ] Create a Stripe account at [stripe.com](https://stripe.com).
  - [ ] Obtain your publishable and secret API keys.
  - [ ] Add keys to your environment variables (keep secret keys private).

- [ ] **Create Stripe Products & Prices:**
  - [ ] Define pricing tiers in Stripe (Free, Pro, Enterprise).
  - [ ] Set up recurring subscriptions (monthly and/or annual).
  - [ ] Configure trial periods if offering free trials.

- [ ] **Integrate Stripe Checkout:**
  - [ ] Install Stripe library: `npm install @stripe/react-stripe-js @stripe/js`.
  - [ ] Create a checkout page that uses Stripe's hosted checkout.
  - [ ] Handle successful and failed payments.
  - [ ] Redirect users after successful payment.

- [ ] **Implement Webhook Handlers:**
  - [ ] Create a Supabase Edge Function to handle Stripe webhooks.
  - [ ] Listen for `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted` events.
  - [ ] Update the customer's subscription status in the database when webhook events occur.

- [ ] **Create Customer Portal:**
  - [ ] Use Stripe's Customer Portal for users to manage their subscriptions.
  - [ ] Link to the portal from `/account/billing`.

### Subscription Management
- [ ] **Add Subscription Tier Logic to Database:**
  - [ ] Add `subscription_tier` and `subscription_status` columns to the `customers` table.
  - [ ] Add `subscription_expires_at` column for trial tracking.

- [ ] **Implement Feature Gating (Optional):**
  - [ ] Create functions to check if a customer's tier allows access to specific features.
  - [ ] Show upgrade prompts when users try to access premium features on a free tier.

---

## Phase 7: Email Communications

This phase sets up automated email sending for important customer communications.

### Email Service Setup
- [ ] **Choose Email Provider:**
  - [ ] Recommended: SendGrid, Resend, or AWS SES.
  - [ ] Get API keys and configure in environment variables.

- [ ] **Email Templates:**
  - [ ] Welcome email after signup.
  - [ ] Email verification email.
  - [ ] Password reset email.
  - [ ] Subscription confirmation email.
  - [ ] Subscription renewal email.
  - [ ] Invoice email.
  - [ ] Support/Help emails.

- [ ] **Implement Email Functions:**
  - [ ] Create Supabase Edge Functions to send emails.
  - [ ] Trigger emails on key events (signup, payment, password reset, etc.).

---

## Phase 8: Security & Compliance

This phase ensures your application meets security and compliance requirements.

### Security Best Practices
- [ ] **API Security:**
  - [ ] Ensure all Supabase queries use RLS policies.
  - [ ] Validate and sanitize all user inputs.
  - [ ] Use HTTPS for all communications.
  - [ ] Implement rate limiting on login and signup endpoints.

- [ ] **Data Protection:**
  - [ ] Enable encryption at rest for sensitive data in Supabase.
  - [ ] Encrypt sensitive data in transit.
  - [ ] Implement proper password hashing (Supabase handles this).
  - [ ] Add two-factor authentication (2FA) option for user accounts.

- [ ] **Backup & Disaster Recovery:**
  - [ ] Set up automated database backups in Supabase.
  - [ ] Test restore procedures regularly.
  - [ ] Document disaster recovery plan.

### Compliance
- [ ] **Privacy Policy:**
  - [ ] Create a clear privacy policy.
  - [ ] Include information about data collection, usage, and protection.
  - [ ] Post at `/privacy`.

- [ ] **Terms of Service:**
  - [ ] Create comprehensive terms of service.
  - [ ] Include acceptable use policies.
  - [ ] Post at `/terms`.

- [ ] **GDPR Compliance (If serving EU customers):**
  - [ ] Implement right to be forgotten (data deletion).
  - [ ] Provide data export functionality.
  - [ ] Get explicit consent for marketing emails.

- [ ] **CCPA Compliance (If serving California customers):**
  - [ ] Implement data access and deletion requests.
  - [ ] Provide privacy notice at collection.

---

## Phase 9: Code Quality, Linting & Debugging

This phase ensures your code is clean, well-formatted, and free of errors before deployment.

### Set Up Linting & Formatting
- [ ] **Install ESLint:**
  - [ ] Install ESLint: `npm install --save-dev eslint`
  - [ ] Initialize ESLint: `npx eslint --init`
  - [ ] Choose "To check syntax, find problems, and enforce code style".
  - [ ] Select your JavaScript framework (React).
  - [ ] Choose "JavaScript modules (import/export)".
  - [ ] Select "Browser" for the environment.
  - [ ] Review and accept the ESLint configuration.

- [ ] **Install & Configure Prettier:**
  - [ ] Install Prettier: `npm install --save-dev prettier`
  - [ ] Create `.prettierrc` file in the root with your formatting preferences:
    ```json
    {
      "semi": true,
      "trailingComma": "es5",
      "singleQuote": true,
      "printWidth": 100,
      "tabWidth": 2
    }
    ```
  - [ ] Create `.prettierignore` file to exclude certain files from formatting.

- [ ] **Configure ESLint to Work with Prettier:**
  - [ ] Install `eslint-config-prettier`: `npm install --save-dev eslint-config-prettier`
  - [ ] Install `eslint-plugin-prettier`: `npm install --save-dev eslint-plugin-prettier`
  - [ ] Update `.eslintrc.json` to include prettier configuration.

- [ ] **Add NPM Scripts for Linting:**
  - [ ] Open `package.json` and add to the `scripts` section:
    ```json
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,md}\""
    ```

- [ ] **Set Up Pre-Commit Hooks (Husky):**
  - [ ] Install Husky: `npm install --save-dev husky`
  - [ ] Install lint-staged: `npm install --save-dev lint-staged`
  - [ ] Initialize Husky: `npx husky install`
  - [ ] Create a pre-commit hook: `npx husky add .husky/pre-commit "npm run lint:fix && npm run format"`
  - [ ] This ensures code is automatically linted and formatted before commits.

### Run Code Quality Checks
- [ ] **Run ESLint Manually:**
  - [ ] Run `npm run lint` to check for linting issues.
  - [ ] Review any errors or warnings reported.
  - [ ] Run `npm run lint:fix` to automatically fix issues where possible.
  - [ ] Manually fix any remaining issues.

- [ ] **Run Prettier Formatting:**
  - [ ] Run `npm run format` to format all code consistently.
  - [ ] Commit the formatted code: `git add . && git commit -m "Code formatting with Prettier"`.

- [ ] **Check for TypeScript Errors:**
  - [ ] Run `npx tsc --noEmit` to check for TypeScript compilation errors.
  - [ ] Fix any type-related issues.

- [ ] **Run Next.js Build Check:**
  - [ ] Run `npm run build` to check if the project builds successfully.
  - [ ] This will catch any build-time errors before deployment.
  - [ ] Review any warnings and address critical ones.

### Debugging & Testing Locally
- [ ] **Use React DevTools:**
  - [ ] Install React DevTools browser extension (Chrome/Firefox).
  - [ ] Use it to inspect component props, state, and hierarchy.
  - [ ] Debug performance issues using the Profiler tab.

- [ ] **Use Next.js Debug Mode:**
  - [ ] Set environment variable: `DEBUG=* npm run dev` to see detailed logs.
  - [ ] Use VS Code debugger: Add breakpoints and step through code.
  - [ ] Use browser DevTools (F12) to inspect network requests and console logs.

- [ ] **Check for Console Warnings:**
  - [ ] Run the app and check the browser console for any warnings or errors.
  - [ ] Address all console warnings before deployment.

- [ ] **Test API Requests:**
  - [ ] Use browser DevTools Network tab to verify API calls to Supabase.
  - [ ] Ensure all requests return expected data.
  - [ ] Check for any failed requests or 404/500 errors.

### Dependency Management
- [ ] **Check for Outdated Dependencies:**
  - [ ] Run `npm outdated` to see which packages have updates available.
  - [ ] Review changelogs for major updates.
  - [ ] Update non-breaking dependencies: `npm update`.
  - [ ] Test thoroughly after updates.

- [ ] **Audit Dependencies for Security Issues:**
  - [ ] Run `npm audit` to check for known vulnerabilities.
  - [ ] Run `npm audit fix` to automatically fix vulnerability issues.
  - [ ] Review any remaining vulnerabilities and address them.

- [ ] **Clean Up Unused Dependencies:**
  - [ ] Use tools like `depcheck` to find unused packages.
  - [ ] Remove unused dependencies: `npm uninstall <package-name>`.

---

## Phase 10: Deployment Preparation & Vercel Setup

This phase prepares your application for production deployment on Vercel.

### Vercel Account & Project Setup
- [ ] **Create Vercel Account:**
  - [ ] Go to [vercel.com](https://vercel.com) and sign up or log in.
  - [ ] Preferred: Sign up with GitHub for seamless integration.
  - [ ] Complete account setup (email verification, etc.).

- [ ] **Create New Vercel Project:**
  - [ ] Click "New Project" on the Vercel dashboard.
  - [ ] Select "Import Git Repository".
  - [ ] Find and select your GitHub `expo360` repository.
  - [ ] Click "Import".

- [ ] **Configure Project Settings:**
  - [ ] Set the **Framework** to "Next.js".
  - [ ] Set the **Root Directory** to `expo360-template-app` (if using monorepo structure).
  - [ ] Set the **Build Command** to `npm run build` (default is usually correct).
  - [ ] Set the **Output Directory** to `.next` (default).

- [ ] **Add Environment Variables:**
  - [ ] Go to **Project Settings > Environment Variables**.
  - [ ] Add all production environment variables:
    - [ ] `NEXT_PUBLIC_SUPABASE_URL` (from your production Supabase project)
    - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from your production Supabase project)
    - [ ] Any other API keys or configuration (Stripe, email service, etc.)
  - [ ] **CRITICAL:** Never commit these to GitHub. Always use Vercel's environment variable management.
  - [ ] Set variables for all environments: Development, Preview, Production.

- [ ] **Configure Domain:**
  - [ ] Go to **Project Settings > Domains**.
  - [ ] Add your custom domain (e.g., `expo360.com`).
  - [ ] Configure DNS records as instructed by Vercel.
  - [ ] Set up SSL/TLS certificate (automatic with Vercel).
  - [ ] Set up www subdomain redirect if desired.

- [ ] **Set Up Preview Deployments:**
  - [ ] Go to **Project Settings > Git**.
  - [ ] Ensure "Preview Deployments" are enabled for all branches.
  - [ ] This allows you to test pull requests before merging to `main`.

### Prepare Production Database
- [ ] **Set Up Production Supabase Project:**
  - [ ] Create a separate, production-grade Supabase project (not free tier).
  - [ ] This ensures your production data is isolated from development.
  - [ ] Apply the multi-tenant schema to the production database.
  - [ ] Set up automated backups.

- [ ] **Configure Production Environment:**
  - [ ] Add the production Supabase credentials to Vercel environment variables.
  - [ ] Ensure RLS policies are correctly configured for production.
  - [ ] Test authentication and data access on the production database.

### Pre-Deployment Testing
- [ ] **Test Production Build Locally:**
  - [ ] Run `npm run build` to create a production build.
  - [ ] Run `npm run start` to start the production server locally.
  - [ ] Test all major features in production mode.
  - [ ] Check for any differences in behavior compared to development.

- [ ] **Test All Critical User Flows:**
  - [ ] Test signup and onboarding wizard.
  - [ ] Test login and password reset.
  - [ ] Test editor dashboard.
  - [ ] Test payment flow (use Stripe test mode).
  - [ ] Test email notifications.

- [ ] **Performance Testing:**
  - [ ] Use Lighthouse (in Chrome DevTools) to test page performance.
  - [ ] Aim for scores >90 in all categories.
  - [ ] Fix any performance issues before deployment.
  - [ ] Test on slow 3G network conditions.

- [ ] **Cross-Browser & Device Testing:**
  - [ ] Test on Chrome, Firefox, Safari, Edge browsers.
  - [ ] Test on iPhone, Android phones and tablets.
  - [ ] Use BrowserStack or similar service for comprehensive testing.
  - [ ] Ensure responsive design works across all devices.

### First Deployment
- [ ] **Deploy to Vercel:**
  - [ ] Go to Vercel dashboard for your project.
  - [ ] Click "Deploy" to deploy the current `main` branch.
  - [ ] Monitor deployment logs for errors.
  - [ ] Wait for deployment to complete (usually 2-5 minutes).

- [ ] **Post-Deployment Verification:**
  - [ ] Visit your production domain (e.g., https://expo360.com).
  - [ ] Verify the site loads correctly.
  - [ ] Check that all features work as expected.
  - [ ] Monitor error logs in Vercel for any runtime errors.
  - [ ] Test critical flows one more time on production.

- [ ] **Set Up Automatic Deployments:**
  - [ ] By default, Vercel automatically deploys when you push to `main`.
  - [ ] Test this by making a small commit and push to verify auto-deployment works.

- [ ] **Set Up Rollback Strategy:**
  - [ ] Understand how to rollback to a previous deployment if issues arise.
  - [ ] Go to **Deployments** tab in Vercel to see deployment history.
  - [ ] You can re-deploy any previous version if needed.

---

## Phase 11: Monitoring & Analytics

This phase sets up monitoring to track application health and user behavior.

### Application Monitoring
- [ ] **Set Up Error Tracking:**
  - [ ] Integrate Sentry or similar service for error logging.
  - [ ] Get alerts for critical errors in production.

- [ ] **Set Up Performance Monitoring:**
  - [ ] Monitor page load times.
  - [ ] Monitor API response times.
  - [ ] Set up alerts for performance degradation.

### User Analytics
- [ ] **Implement Analytics:**
  - [ ] Integrate Google Analytics or Mixpanel.
  - [ ] Track key events (signup, login, feature usage, etc.).
  - [ ] Monitor user behavior to identify pain points.

- [ ] **Create Admin Analytics Dashboard:**
  - [ ] Display key metrics: total customers, active subscriptions, revenue, churn rate, etc.
  - [ ] Create reports for business insights.

---

## Phase 10: Deployment & Launch

The final phase to get your application live on the internet.

### Hosting Setup
- [ ] **Choose Hosting Provider:**
  - [ ] Vercel (recommended - built by Next.js creators, seamless integration).
  - [ ] Netlify, AWS, or other providers are also viable.

- [ ] **Connect Repository to Hosting:**
  - [ ] Connect your GitHub repository to Vercel.
  - [ ] Set up automatic deployments on push to `main` branch.

- [ ] **Configure Production Environment Variables:**
  - [ ] Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to production.
  - [ ] Add any other production-specific variables (API keys, etc.).
  - [ ] **NEVER** commit secrets to version control.

### Domain & DNS
- [ ] **Set Up Custom Domain:**
  - [ ] Register a domain (Namecheap, GoDaddy, etc.).
  - [ ] Configure DNS records to point to your hosting provider.
  - [ ] Set up SSL/TLS certificate (usually automatic with Vercel).

- [ ] **Set Up Email Domain (Optional but Recommended):**
  - [ ] Configure email domain for transactional emails (e.g., noreply@expo360.com).
  - [ ] Set up SPF, DKIM, DMARC records for email authentication.

### Final Testing
- [ ] **End-to-End Testing:**
  - [ ] Run through the entire signup flow on production.
  - [ ] Test the onboarding wizard on production.
  - [ ] Test the editor dashboard.
  - [ ] Test payment flow (use Stripe test cards).
  - [ ] Test password reset.
  - [ ] Test email notifications.

- [ ] **Cross-Browser Testing:**
  - [ ] Test on Chrome, Firefox, Safari, Edge.
  - [ ] Test on mobile devices (iPhone, Android).
  - [ ] Test on tablets.

- [ ] **Load Testing (Optional but Recommended):**
  - [ ] Use tools like Apache JMeter or LoadImpact to simulate traffic.
  - [ ] Ensure your infrastructure can handle expected load.

### Launch Day
- [ ] **Pre-Launch Checklist:**
  - [ ] Database backups are configured and tested.
  - [ ] Error monitoring is active.
  - [ ] Analytics are tracking correctly.
  - [ ] Support systems are in place (email, chat, etc.).
  - [ ] Team is trained on customer support.

- [ ] **Announce Launch:**
  - [ ] Send launch announcement to email list (if you have one).
  - [ ] Post on social media.
  - [ ] Reach out to press/industry contacts.

- [ ] **Monitor First Week:**
  - [ ] Monitor error logs closely.
  - [ ] Monitor performance metrics.
  - [ ] Be responsive to customer support requests.
  - [ ] Be ready to deploy hotfixes if issues arise.

---

## Phase 12: Post-Launch Maintenance & Growth

This phase outlines ongoing maintenance and growth activities after launch.

### Regular Maintenance
- [ ] **Weekly Tasks:**
  - [ ] Review error logs and fix critical issues.
  - [ ] Monitor performance metrics.
  - [ ] Check customer support requests.

- [ ] **Monthly Tasks:**
  - [ ] Review analytics and user behavior.
  - [ ] Plan feature improvements.
  - [ ] Test backup and recovery procedures.
  - [ ] Review security logs for suspicious activity.

- [ ] **Quarterly Tasks:**
  - [ ] Conduct security audit.
  - [ ] Review and update documentation.
  - [ ] Plan next quarter's features.
  - [ ] Review customer feedback and prioritize improvements.

### Growth Initiatives
- [ ] **Gather Customer Feedback:**
  - [ ] Create surveys to understand customer needs.
  - [ ] Conduct customer interviews.
  - [ ] Monitor support tickets for common issues.

- [ ] **Implement Feature Requests:**
  - [ ] Prioritize features based on customer feedback.
  - [ ] Plan development roadmap.

- [ ] **Marketing & Acquisition:**
  - [ ] Create case studies from successful customers.
  - [ ] Optimize SEO for discoverability.
  - [ ] Create content marketing (blog, videos, etc.).
  - [ ] Explore paid advertising opportunities.

- [ ] **Customer Success:**
  - [ ] Create onboarding documentation and videos.
  - [ ] Reach out to new customers for feedback.
  - [ ] Identify and support at-risk customers (churn prevention).

---

## Additional Considerations & Best Practices

### Code Quality & Organization
- [ ] **Set Up Linting & Formatting:**
  - [ ] Install ESLint and Prettier for code quality.
  - [ ] Configure pre-commit hooks to auto-format code.

- [ ] **Set Up Version Control Workflow:**
  - [ ] Use Git feature branches for development.
  - [ ] Require pull request reviews before merging.
  - [ ] Maintain clean commit history.

- [ ] **Document Your Codebase:**
  - [ ] Add README files to key directories.
  - [ ] Document API endpoints and data models.
  - [ ] Create architecture documentation for future developers.

### Testing
- [ ] **Unit Tests:**
  - [ ] Write tests for utility functions and components.
  - [ ] Aim for >80% code coverage for critical paths.

- [ ] **Integration Tests:**
  - [ ] Test API interactions with Supabase.
  - [ ] Test user flows (signup, login, payment, etc.).

- [ ] **E2E Tests:**
  - [ ] Use Cypress or Playwright for end-to-end testing.
  - [ ] Test critical user journeys.

### Documentation
- [ ] **User Documentation:**
  - [ ] Create a help center or knowledge base.
  - [ ] Write guides for common tasks.
  - [ ] Record tutorial videos.

- [ ] **Admin Documentation:**
  - [ ] Document deployment procedures.
  - [ ] Document database schema and migrations.
  - [ ] Document environment configuration.

### Customer Support
- [ ] **Support System:**
  - [ ] Set up email support (support@expo360.com).
  - [ ] Consider adding live chat (Zendesk, Intercom, etc.).
  - [ ] Create FAQ/Help center.

- [ ] **SLA (Service Level Agreement):**
  - [ ] Define response times for support requests.
  - [ ] Define uptime guarantees.

---

## Summary

This checklist is your complete roadmap to launching Expo360 as a fully functional SaaS product. Work through the phases systematically, and you'll have a professional, secure, and scalable platform ready for customers.

**Key Milestones:**
- ✅ Phase 1-2: Foundation is set (database, local environment)
- Phase 3-4: Core product is functional (wizard, editor)
- Phase 5-6: Customer-facing features and payments
- Phase 7-8: Email and security
- Phase 9-11: Monitoring, analytics, and growth

Good luck with Expo360! 🚀
