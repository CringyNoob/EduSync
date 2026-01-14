-- =============================================
-- MIGRATION: Add vendor status and update defaults
-- Run this on existing market_db database
-- =============================================

-- Step 1: Create vendor_status enum type if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_status') THEN
        CREATE TYPE vendor_status AS ENUM ('PENDING_PAYMENT', 'ACTIVE', 'SUSPENDED', 'REJECTED');
    END IF;
END $$;

-- Step 2: Add status column to vendors table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendors' AND column_name = 'status'
    ) THEN
        ALTER TABLE vendors ADD COLUMN status vendor_status DEFAULT 'PENDING_PAYMENT';
    END IF;
END $$;

-- Step 3: Update existing vendors to ACTIVE status (backward compatibility)
UPDATE vendors 
SET status = 'ACTIVE' 
WHERE status IS NULL OR status = 'PENDING_PAYMENT';

-- Step 4: Change is_active default to false for new vendors
ALTER TABLE vendors ALTER COLUMN is_active SET DEFAULT false;

-- Step 5: Add comments for clarity
COMMENT ON COLUMN vendors.status IS 'Payment and approval status: PENDING_PAYMENT, ACTIVE, SUSPENDED, REJECTED';
COMMENT ON COLUMN vendors.is_active IS 'For new registrations: false until payment verified. For FOOD_VENDOR: true = Shop Open, false = Shop Closed';

-- Verification queries
SELECT 'Migration completed successfully!' AS message;

-- Check vendor_status enum values
SELECT enumlabel AS available_statuses 
FROM pg_enum 
WHERE enumtypid = 'vendor_status'::regtype
ORDER BY enumsortorder;

-- Check vendors table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'vendors'
ORDER BY ordinal_position;

-- Show current vendors with new status column
SELECT id, owner_id, name, type, status, is_active, created_at
FROM vendors
ORDER BY created_at DESC;
