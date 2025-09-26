# Stripe Credit Purchase System - Setup Guide

## Overview
The Stripe credit purchase system has been implemented with the following components:

### ✅ Completed Features
1. **Credit Purchase Modal** - Professional 4-package selection interface
2. **Clickable Credit Counter** - Opens purchase modal when clicked in admin panel
3. **API Routes** - Stripe checkout session creation and webhook handling
4. **Purchase Result Pages** - Success and cancellation handling with auto-redirect
5. **Credit Package Configuration** - Centralized configuration with your Stripe Price IDs

### 🔧 Setup Required
To complete the integration, you need to:

1. **Update Stripe Keys in `.env` file**:
   ```bash
   # Replace with your actual Stripe keys
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_key_here
   STRIPE_SECRET_KEY=sk_live_your_actual_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
   ```

2. **🚨 CRITICAL: Add Environment Variables to Vercel**:
   - Go to your Vercel Dashboard
   - Navigate to your project settings
   - Go to "Environment Variables" section
   - **MANUALLY ADD** each Stripe variable:
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_SECRET_KEY` 
     - `STRIPE_WEBHOOK_SECRET`
   - **Important**: Vercel does NOT automatically sync your `.env` file
   - Deploy after adding variables to ensure they're available in production

3. **Configure Stripe Webhook**:
   - Go to your Stripe Dashboard
   - Navigate to Webhooks
   - Add endpoint: `https://kusam.vercel.app/api/stripe-webhook`
   - Select event: `checkout.session.completed`
   - Copy the webhook secret to both your `.env` file AND Vercel environment variables

4. **Update Credit Package Prices**:
   Your current configuration in `/src/config/creditPackages.ts`:
   ```typescript
   {
     priceId: 'price_1SBeMEH0qG3oBxFOGsys2N8B', // 100 credits - "Most Popular"
     priceId: 'price_1SBeMEH0qG3oBxFOb6UEGCpP', // 1300 credits - "Best Value"
     // Update the other two price IDs with actual values
   }
   ```

## How It Works

### Purchase Flow
1. User clicks credit counter in admin panel
2. Modal opens showing 4 credit packages
3. User selects package and clicks "Comprar Créditos"
4. Redirects to Stripe Checkout
5. After payment:
   - **Success**: Redirects to success page, credits added automatically
   - **Cancel**: Redirects to cancellation page

### Technical Implementation

#### Components
- **`CreditPurchaseModal.tsx`**: Main purchase interface
- **`ImageStandardizer.tsx`**: Updated with clickable credit counter
- **`/admin/purchase-result/page.tsx`**: Success/cancellation handling

#### API Routes
- **`/api/create-stripe-session`**: Creates secure checkout sessions
- **`/api/stripe-webhook`**: Handles successful payments and adds credits

#### Database Integration
- Automatically adds purchased credits to `admin_credits` table
- Uses Supabase admin client for secure database operations
- Handles both new users and existing credit balance updates

## Security Features
- ✅ Server-side validation of price IDs
- ✅ Webhook signature verification
- ✅ Credit amount validation against package configuration
- ✅ Secure database operations with admin client
- ✅ Customer email validation

## Testing
1. **Local Testing**: Use Stripe test keys and test webhook endpoint
2. **Production**: Update to live keys and production webhook URL

## ⚠️ Common Deployment Issues
1. **Environment Variables Missing in Production**:
   - Symptom: "Stripe key undefined" errors in production
   - Solution: Manually add ALL Stripe variables in Vercel Dashboard → Environment Variables
   - Remember: `.env` files are NOT automatically deployed to Vercel

2. **Webhook Endpoint Not Found**:
   - Symptom: Stripe webhook shows "404 Not Found"
   - Solution: Ensure your deployment includes the `/api/stripe-webhook` route
   - Check: Visit `https://kusam.vercel.app/api/stripe-webhook` (should not show 404)

3. **Webhook Secret Mismatch**:
   - Symptom: "Webhook signature verification failed"
   - Solution: Copy webhook secret from Stripe Dashboard to both `.env` AND Vercel environment variables

## Credit Packages Configuration
Current packages configured:
- **Recarga Básica**: 25 credits
- **Recarga Popular**: 100 credits (confirmed) - "Más Elegido"
- **Recarga Profesional**: 500 credits
- **Recarga Empresarial**: 1300 credits (confirmed) - "Mejor Valor"

## Next Steps
1. **Add all Stripe environment variables to Vercel Dashboard manually**
2. Set up webhook endpoint in Stripe dashboard: `https://kusam.vercel.app/api/stripe-webhook`
3. Test purchase flow with test cards (if using test mode)
4. Update remaining 2 price IDs in `/src/config/creditPackages.ts` if needed
5. Deploy to production and verify webhook is working

## 🚀 Final Checklist
- [ ] Stripe keys added to Vercel environment variables
- [ ] Webhook endpoint configured in Stripe Dashboard
- [ ] Application deployed to Vercel
- [ ] Test purchase completed successfully
- [ ] Credits added to database after test purchase

The system is ready to process real payments once the Stripe configuration is completed!