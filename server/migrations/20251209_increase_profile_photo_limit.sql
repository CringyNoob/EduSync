-- Migration: increase profile_photo column size
-- Base64 encoded images can be large, increase to TEXT type

ALTER TABLE users ALTER COLUMN profile_photo TYPE TEXT;
ALTER TABLE users ALTER COLUMN cover_photo TYPE TEXT;
