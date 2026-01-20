-- =============================================
-- VENDOR CATEGORIES - Dynamic Category System
-- Allows vendors to create custom categories
-- Run this on market_db
-- =============================================

-- Create vendor_categories table
CREATE TABLE IF NOT EXISTS vendor_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT NULL,
    color VARCHAR(20) DEFAULT '#6366f1',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vendor_id, name)
);

-- Index for faster lookups
CREATE INDEX idx_vendor_categories_vendor_id ON vendor_categories(vendor_id);

COMMENT ON TABLE vendor_categories IS 'Custom categories created by each vendor';
COMMENT ON COLUMN vendor_categories.icon IS 'Lucide icon name (e.g., "Pizza", "Coffee", "Laptop")';
COMMENT ON COLUMN vendor_categories.color IS 'HEX color code for category badge';
COMMENT ON COLUMN vendor_categories.display_order IS 'Order for displaying categories';

-- Update products table to use TEXT for category (more flexible)
-- The category will now reference vendor_categories.name
ALTER TABLE products 
ALTER COLUMN category TYPE TEXT;

-- Add default categories for existing vendors based on their type
-- This is optional - new vendors will start with no categories

-- For FOOD_VENDOR type vendors, add default food categories
INSERT INTO vendor_categories (vendor_id, name, icon, color, display_order)
SELECT v.id, cat.name, cat.icon, cat.color, cat.display_order
FROM vendors v
CROSS JOIN (
    VALUES 
        ('Meals', 'UtensilsCrossed', '#f97316', 1),
        ('Snacks', 'Cookie', '#eab308', 2),
        ('Drinks', 'Coffee', '#06b6d4', 3),
        ('Desserts', 'IceCream', '#ec4899', 4)
) AS cat(name, icon, color, display_order)
WHERE v.type = 'FOOD_VENDOR'
ON CONFLICT (vendor_id, name) DO NOTHING;

-- For STARTUP type vendors, add default startup categories
INSERT INTO vendor_categories (vendor_id, name, icon, color, display_order)
SELECT v.id, cat.name, cat.icon, cat.color, cat.display_order
FROM vendors v
CROSS JOIN (
    VALUES 
        ('Electronics', 'Laptop', '#3b82f6', 1),
        ('Accessories', 'Watch', '#8b5cf6', 2),
        ('Services', 'Wrench', '#10b981', 3),
        ('Other', 'Package', '#6b7280', 4)
) AS cat(name, icon, color, display_order)
WHERE v.type = 'STARTUP'
ON CONFLICT (vendor_id, name) DO NOTHING;

SELECT '✅ vendor_categories table created and default categories added' as status;
