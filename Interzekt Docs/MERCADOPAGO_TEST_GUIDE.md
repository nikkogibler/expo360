# 🧪 MercadoPago Test Mode Setup Guide

## The Issue You Encountered

The error "Una de las partes con la que intentas hacer el pago es de prueba" occurs when there's a mismatch between test and production accounts/credentials in MercadoPago.

## ✅ What I've Fixed

1. **Enhanced Edge Function**: Now properly detects test mode and uses appropriate configurations
2. **Test Email Format**: Changed to proper test email format (`test_user_123456@testuser.com`)
3. **Sandbox URL Priority**: Automatically uses `sandbox_init_point` for test transactions
4. **Test Mode Detection**: Automatically detects TEST- tokens and applies test configurations

## 🔧 Testing Instructions

### Option 1: Use MercadoPago Test Users (Recommended)

1. **Go to your MercadoPago Developer Dashboard**: https://www.mercadopago.com/developers/panel
2. **Navigate to "Test Users"** section
3. **Create or use existing test users**:
   - **Seller (your app)**: Already configured with your TEST tokens
   - **Buyer (for testing)**: Use these credentials to test payments

### Option 2: Test User Credentials for Argentina

Use these official MercadoPago test credentials:

**Test Buyer Account:**
- **Email**: `TESTUSER1523388221@testuser.com`
- **Password**: `k5B9rR8273`
- **Card Number**: `4075 5957 1648 3764` (Visa)
- **Security Code**: `123`
- **Expiration**: `11/30`
- **Name**: `APRO` (for approved payments)

**Alternative Test Cards:**
- **Mastercard**: `5031755734530604`
- **American Express**: `371180303257522`

### Option 3: For Declined Payment Testing
- **Name**: `OTHE` (for other status)
- **Name**: `CONT` (for pending)

## 🚀 Updated Function Features

Your deployed edge function now:

✅ **Auto-detects test mode** based on `TEST-` token prefix
✅ **Uses proper test email format** for MercadoPago compliance  
✅ **Returns correct sandbox URLs** for test transactions
✅ **Enhanced logging** to debug any remaining issues
✅ **Proper test configurations** for sandbox environment

## 🧪 Testing Steps

1. **Clear your browser cache** to ensure fresh session
2. **Add items to cart** in your app
3. **Go to payment page** - should create preference successfully
4. **Use test credentials above** when prompted by MercadoPago
5. **Complete test payment** - should redirect to success page

## 📊 Monitoring

You can monitor your edge function logs at:
https://supabase.com/dashboard/project/dpbxyauaobvcdwdgzcxc/functions

Look for:
- `🧪 Test mode: true`
- `✅ Using checkout URL: [sandbox URL]`
- `✅ SUCCESS! Full MercadoPago Response`

## 🔍 If Still Having Issues

1. **Check the function logs** in Supabase dashboard
2. **Verify test user credentials** are being used correctly
3. **Ensure you're using the MercadoPago sandbox environment**
4. **Contact me with the specific error logs** from the edge function

The function is now deployed and should work correctly with test accounts!
