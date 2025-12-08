-- Migration: rename user_sessions to sessions and add ip_address column
-- Safe to run multiple times

-- Rename table if it exists and sessions doesn't already exist
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_sessions') 
     AND NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'sessions') THEN
    ALTER TABLE user_sessions RENAME TO sessions;
  END IF;
END $$;

-- If sessions table exists, ensure it has ip_address column
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);

-- Rename last_used_at to last_active if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sessions' AND column_name = 'last_used_at'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sessions' AND column_name = 'last_active'
  ) THEN
    ALTER TABLE sessions RENAME COLUMN last_used_at TO last_active;
  END IF;
END $$;

-- Add last_active if it doesn't exist at all
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
