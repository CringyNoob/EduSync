-- Migration: add privacy settings for email and phone visibility
-- Allow users to control who can see their contact information

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_visible BOOLEAN DEFAULT TRUE;
