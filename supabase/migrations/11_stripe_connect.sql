-- 11_stripe_connect.sql
-- Add Stripe Connect fields to clients table for marketplace functionality

-- Stripe Connect account ID (for receiving payments from their customers)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT DEFAULT NULL;

-- Whether Stripe Connect onboarding is complete
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS stripe_connect_complete BOOLEAN DEFAULT FALSE;

-- Subscription end date (when their pass expires)
-- Already exists from migration 10, but ensure it's there
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP DEFAULT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_stripe_connect ON public.clients(stripe_connect_account_id) WHERE stripe_connect_account_id IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN public.clients.stripe_connect_account_id IS 'Stripe Connect Express account ID (acct_xxx) for receiving customer payments';
COMMENT ON COLUMN public.clients.stripe_connect_complete IS 'Whether user has completed Stripe Connect onboarding';
