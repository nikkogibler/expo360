-- Supabase SQL for creating a custom profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- You can add more fields as needed, e.g. role, avatar_url, etc.
