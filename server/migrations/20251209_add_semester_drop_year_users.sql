-- Migration: add semester column and drop year from users
-- Safe to run multiple times

ALTER TABLE users ADD COLUMN IF NOT EXISTS semester VARCHAR(20);
ALTER TABLE users DROP COLUMN IF EXISTS year;