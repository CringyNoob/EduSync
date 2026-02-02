-- =============================================
-- FIX: Change logo_url and cover_url from VARCHAR(500) to TEXT in vendors table
-- Reason: Base64 images are much larger than 500 chars
-- Run this on market_db
-- =============================================

-- Fix vendors table
ALTER TABLE vendors 
ALTER COLUMN logo_url TYPE TEXT;

ALTER TABLE vendors 
ALTER COLUMN cover_url TYPE TEXT;

-- Verify the changes
\d vendors

-- Test: Check current data lengths
SELECT 
    id, 
    name,
    LENGTH(logo_url) as logo_length,
    LENGTH(cover_url) as cover_length
FROM vendors 
WHERE logo_url IS NOT NULL OR cover_url IS NOT NULL;

SELECT '✅ Migration complete: logo_url and cover_url changed to TEXT type' as status;
