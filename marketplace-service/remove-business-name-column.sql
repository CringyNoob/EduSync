-- =============================================
-- Remove business_name column from vendors table
-- The 'name' column will serve as both shop name and business name
-- =============================================

-- Drop the business_name column
ALTER TABLE vendors DROP COLUMN IF EXISTS business_name;

-- Verify the change
\d vendors;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ business_name column removed successfully!';
    RAISE NOTICE '📋 The name column will now serve as both shop name and business name';
END $$;
