-- Migration: Add block columns to users table
-- Run this in your Aiven PostgreSQL console for auth_db

-- Add block-related columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS block_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_by UUID;

-- Add index for faster blocked user queries
CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON users(is_blocked);

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('is_blocked', 'block_reason', 'blocked_at', 'blocked_by');
