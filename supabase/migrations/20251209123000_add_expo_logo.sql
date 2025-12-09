-- Add logo_path to expos table
ALTER TABLE expos ADD COLUMN IF NOT EXISTS logo_path TEXT;
