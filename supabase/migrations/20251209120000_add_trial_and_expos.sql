-- Add trial columns to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS trial_status TEXT;  -- 'active', 'expired', 'upgraded'
ALTER TABLE clients ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE;

-- Create expos table with TEXT IDs to match the rest of the schema
CREATE TABLE IF NOT EXISTS expos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT,
  location TEXT,
  status TEXT,  -- 'active', 'archived', 'completed'
  trial_expo BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on expos
ALTER TABLE expos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for expos (similar to other tables)
-- Allow read access to authenticated users belonging to the client
CREATE POLICY "Allow authenticated read access" ON expos
FOR SELECT TO authenticated
USING (
  client_id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()::text
  )
);

-- Allow write access to authenticated users belonging to the client
CREATE POLICY "Allow authenticated write access" ON expos
FOR ALL TO authenticated
USING (
  client_id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()::text
  )
)
WITH CHECK (
  client_id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()::text
  )
);
