-- =============================================
-- DATABASE MIGRATION: Orders & Analytics Tables
-- Run this in market_db
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PART 1: CREATE/EXTEND ENUM TYPES
-- Note: Enum value additions require a commit before usage
-- =============================================

-- Create order_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Extend payment_status enum (already exists from vendor registration)
-- Add missing values if they don't exist
DO $$ 
BEGIN
    -- Add 'PAID' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PAID' AND enumtypid = 'payment_status'::regtype) THEN
        ALTER TYPE payment_status ADD VALUE 'PAID';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add PAID to payment_status: %', SQLERRM;
END $$;

DO $$ 
BEGIN
    -- Add 'REFUNDED' if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'REFUNDED' AND enumtypid = 'payment_status'::regtype) THEN
        ALTER TYPE payment_status ADD VALUE 'REFUNDED';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add REFUNDED to payment_status: %', SQLERRM;
END $$;

-- Create payment_method enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('CASH', 'BKASH', 'NAGAD', 'CARD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- IMPORTANT: COMMIT THE TRANSACTION HERE
-- In PgAdmin4, the above enum changes need to be committed
-- before the tables below can use them.
-- =============================================

-- =============================================
-- PART 2: CREATE TABLES (Run after enum values are committed)
-- =============================================

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_address TEXT,
    customer_image VARCHAR(500),
    status order_status DEFAULT 'PENDING',
    payment_status payment_status DEFAULT 'PENDING',
    payment_method payment_method DEFAULT 'CASH',
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

COMMENT ON TABLE orders IS 'Orders placed with vendors';

-- =============================================
-- 2. ORDER_ITEMS TABLE (Items in each order)
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    options TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

COMMENT ON TABLE order_items IS 'Individual items in an order';

-- =============================================
-- 3. VENDOR EXTENDED FIELDS
-- Add more fields to vendors table for shop profile
-- =============================================
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS operating_hours VARCHAR(100) DEFAULT '9:00 AM - 9:00 PM';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS rating DECIMAL(2, 1) DEFAULT 0.0;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

COMMENT ON COLUMN vendors.cover_url IS 'Cover/banner image URL for shop';
COMMENT ON COLUMN vendors.operating_hours IS 'Operating hours string';
COMMENT ON COLUMN vendors.rating IS 'Average rating (0.0 - 5.0)';
COMMENT ON COLUMN vendors.total_reviews IS 'Total number of reviews';

-- =============================================
-- 4. PRODUCTS EXTENDED FIELDS
-- Add category and stock fields
-- =============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'FOOD';
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 50;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0;

COMMENT ON COLUMN products.category IS 'Product category: FOOD, DRINKS, DESSERT, MERCH, OTHER';
COMMENT ON COLUMN products.stock_count IS 'Current stock quantity';
COMMENT ON COLUMN products.sold_count IS 'Total units sold';

-- =============================================
-- 5. VENDOR_STATS TABLE (Daily Analytics)
-- =============================================
CREATE TABLE IF NOT EXISTS vendor_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    revenue DECIMAL(12, 2) DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    visitors INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vendor_id, date)
);

CREATE INDEX idx_vendor_stats_vendor_id ON vendor_stats(vendor_id);
CREATE INDEX idx_vendor_stats_date ON vendor_stats(date DESC);

COMMENT ON TABLE vendor_stats IS 'Daily statistics per vendor';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- Next step: Run insert-sample-orders-data.sql to add test data
-- This separation avoids PostgreSQL enum commit requirements
-- =============================================

SELECT 
    'Migration completed successfully!' as status,
    'Run insert-sample-orders-data.sql next for sample data' as next_step;

