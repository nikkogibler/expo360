-- supabase/migrations/20251105000000_multitenant_setup.sql

-- Step 1: Create a table to manage your customers/tenants
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Step 2: Add a customer_id to the profiles table
-- This links every user to a specific customer.
ALTER TABLE public.profiles
ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE;

-- Step 3: Add customer_id to your data tables
-- This is an example for the 'products' table. You must do this
-- for every table that contains customer-specific data.
-- Note: You will need to create the 'products' table first if it doesn't exist.
-- We assume it exists based on your app's code.

-- First, check if the column already exists to make the script re-runnable
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='customer_id') THEN
    ALTER TABLE public.products
    ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 4: Set up Row-Level Security for the products table
-- This ensures users can only see products belonging to their customer.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, to prevent conflicts
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.products;
DROP POLICY IF EXISTS "Allow admin write access" ON public.products;

-- Create a new policy for SELECT (read)
CREATE POLICY "Allow authenticated read access"
ON public.products
FOR SELECT
TO authenticated
USING (
  customer_id = (SELECT customer_id FROM public.profiles WHERE id = auth.uid())
);

-- Create a new policy for INSERT, UPDATE, DELETE (write)
-- This policy allows users with an 'admin' role to manage products for their own customer.
CREATE POLICY "Allow admin write access"
ON public.products
FOR ALL
TO authenticated
USING (
  customer_id = (SELECT customer_id FROM public.profiles WHERE id = auth.uid()) AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  customer_id = (SELECT customer_id FROM public.profiles WHERE id = auth.uid()) AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Grant usage on the new table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.customers TO authenticated;
GRANT ALL ON TABLE public.customers TO service_role;

-- Grant usage on the products table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;
