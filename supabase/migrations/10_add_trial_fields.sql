-- 10_add_trial_fields.sql
-- Add trial tracking to clients table for 30-day trial model

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS trial_status TEXT DEFAULT 'none';
-- Values: 'none' (never trialed), 'active' (trialing now), 'expired' (trial ended), 'upgraded' (paid subscription)

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP DEFAULT NULL;
-- Date when trial expires (or upgrades expire if converted to paid)

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none';
-- Values: 'none' (no subscription), 'active' (paid subscription active), 'canceled' (subscription canceled)

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP DEFAULT NULL;
-- Date when paid subscription expires

-- Optional: Track trial usage
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP DEFAULT NULL;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS upgraded_at TIMESTAMP DEFAULT NULL;

-- Create indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_clients_trial_status ON public.clients(trial_status);
CREATE INDEX IF NOT EXISTS idx_clients_trial_end_date ON public.clients(trial_end_date);
CREATE INDEX IF NOT EXISTS idx_clients_subscription_status ON public.clients(subscription_status);

-- Add comment for reference
COMMENT ON COLUMN public.clients.trial_status IS 'Trial state: none, active, expired, upgraded';
COMMENT ON COLUMN public.clients.trial_end_date IS 'Date when trial ends (NOW + 30 days on signup)';
COMMENT ON COLUMN public.clients.subscription_status IS 'Paid subscription state: none, active, canceled';
COMMENT ON COLUMN public.clients.subscription_end_date IS 'Date when paid subscription expires';
