-- Supabase SQL for creating a custom profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  role text DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now()
);

-- You can add more fields as needed, e.g. avatar_url, etc.
