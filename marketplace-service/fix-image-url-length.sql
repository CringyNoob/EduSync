-- =============================================
-- FIX: Change image_url from VARCHAR(500) to TEXT
-- Reason: Base64 images are much larger than 500 chars
-- Run this on market_db
-- =============================================

-- Fix products table
ALTER TABLE products 
ALTER COLUMN image_url TYPE TEXT;

-- Fix vendors table (logo_url also needs this for base64 logos)
ALTER TABLE vendors 
ALTER COLUMN logo_url TYPE TEXT;

-- Verify the changes
\d products
\d vendors

-- Test: Check current data lengths
SELECT 
    'products' as table_name,
    id, 
    name,
    LENGTH(image_url) as image_url_length 
FROM products 
WHERE image_url IS NOT NULL
UNION ALL
SELECT 
    'vendors' as table_name,
    id, 
    name,
    LENGTH(logo_url) as image_url_length 
FROM vendors 
WHERE logo_url IS NOT NULL;

SELECT '✅ Migration complete: image_url and logo_url changed to TEXT type' as status;
