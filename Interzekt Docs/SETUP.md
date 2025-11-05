# Expo360-Template Customer Setup Guide

This document outlines the steps required to configure and deploy the Expo360-Template for a new client.

## 1. Environment Variables

Create a `.env` file in the root of the `expo360-template-app` directory. You can use the `.env.example` file as a template.

### Supabase
- `SUPABASE_DATABASE_PASSWORD`: The password for your Supabase database.
- `NEXT_PUBLIC_SUPABASE_URL`: The URL for your Supabase project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anonymous key for your Supabase project.
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`: The service role key for your Supabase project.
- `SUPABASE_SERVICE_ROLE_KEY`: The service role key for your Supabase project.

### Payment Gateways

#### Mercado Pago
- `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`: Your Mercado Pago public key.
- `MERCADOPAGO_ACCESS_TOKEN`: Your Mercado Pago access token.

#### Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key.
- `STRIPE_SECRET_KEY`: Your Stripe secret key.
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret.

### Webhooks
- `NEXT_PUBLIC_SUCCESS_WEBHOOK_URL`: The webhook URL for success notifications (e.g., from n8n or Zapier).
- `NEXT_PUBLIC_CUSTOMER_INFO_WEBHOOK_URL`: The webhook URL for capturing customer information.
- `NEXT_PUBLIC_ADMIN_CHATBOT_WEBHOOK`: The webhook URL for the admin chatbot.

### Analytics

#### Vercel Analytics
- `NEXT_PUBLIC_VERCEL_TOKEN`: Your Vercel API token.
- `NEXT_PUBLIC_VERCEL_PROJECT_ID`: Your Vercel project ID.
- `NEXT_PUBLIC_VERCEL_TEAM_ID`: Your Vercel team ID.

#### Google Analytics
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Your Google Analytics measurement ID.
- `GA4_PROPERTY_ID`: Your Google Analytics 4 property ID.

### AI Tools
- `OPENROUTER_API_KEY`: Your OpenRouter API key.

## 2. Branding and Customization

- **Logo**: The client's logo will be uploaded via the admin dashboard. This will automatically update the logo across the application. The logo is referenced in the following locations:
  - `expo360-template-app/src/components/AdminDashboard.tsx`
- **"Sucursales y Expos" Banner**: The client needs to upload their own banner for the "Sucursales y expos" section. The image must be named `sucursalesyexpos.png`, be `2242x848` pixels, under `2.5MB`, and placed in the `expo360-template-app/public/admin/` directory, replacing the existing one.
- **"Catalogo De Productos" Banner**: The client needs to upload their own banner for the "Catalogo De Productos" section. The image must be named `catalog_header1.png`, be `1536x512` pixels, under `2MB`, and placed in the `expo360-template-app/public/` directory, replacing the existing one.
- **Favicon**: The client should upload their own favicon. The file must be named `favicon.png` and placed in the `expo360-template-app/public/` directory, replacing the existing one.
- **Company Name**: The placeholder `YOUR COMPANY` is used throughout the application. This should be replaced with the client's actual company name. A global find and replace is recommended. The placeholder is used in:
  - Page titles and metadata
  - On-screen text and labels
  - Chatbot messages

## 3. Deployment

Follow the standard deployment procedures for a Next.js application on your preferred hosting provider (e.g., Vercel, Netlify).

## 4. Event and Landing Page Setup

- **Initial Expo Event**: The client will need to provide details for their first expo event, including the event name and a banner image.
- **Event Landing Page**: The application will dynamically generate a landing page for the event at `[your-domain]/[event-name]`.
- **Event Banner**: The banner image for the event should be uploaded. The application will handle the storage and display of this image. The current placeholder is `expo1.png` located in `expo360-template-app/public/`.
