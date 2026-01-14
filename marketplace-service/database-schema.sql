-- =============================================
-- DATABASE SCHEMA FOR market_db (Aiven PostgreSQL)
-- Run this in your Aiven console
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. VENDORS TABLE (Startups & Food Vendors)
-- =============================================
CREATE TYPE vendor_type AS ENUM ('STARTUP', 'FOOD_VENDOR');
CREATE TYPE vendor_status AS ENUM ('PENDING_PAYMENT', 'ACTIVE', 'SUSPENDED', 'REJECTED');

CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type vendor_type NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    status vendor_status DEFAULT 'PENDING_PAYMENT',
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster type-based queries
CREATE INDEX idx_vendors_type ON vendors(type);
CREATE INDEX idx_vendors_is_active ON vendors(is_active);

COMMENT ON TABLE vendors IS 'Stores Startup and Food Vendor shops';
COMMENT ON COLUMN vendors.is_active IS 'For FOOD_VENDOR: true = Shop Open, false = Shop Closed';

-- =============================================
-- 2. PRODUCTS TABLE (Items for Vendors)
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Index for faster vendor lookups
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_is_available ON products(is_available);

COMMENT ON TABLE products IS 'Products/items sold by vendors';
COMMENT ON COLUMN products.is_available IS 'For FOOD_VENDOR: false = Out of Stock';

-- =============================================
-- 3. PREOWNED_LISTINGS TABLE (Pre-owned Items)
-- =============================================
CREATE TABLE IF NOT EXISTS preowned_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL,
    seller_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100) NOT NULL,
    images TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for filtering and sorting
CREATE INDEX idx_preowned_status ON preowned_listings(status);
CREATE INDEX idx_preowned_category ON preowned_listings(category);
CREATE INDEX idx_preowned_created_at ON preowned_listings(created_at DESC);

COMMENT ON TABLE preowned_listings IS 'Pre-owned items listed by students';
COMMENT ON COLUMN preowned_listings.status IS 'AVAILABLE or SOLD';
COMMENT ON COLUMN preowned_listings.images IS 'Array of image URLs';

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

/*
-- Sample Vendors
INSERT INTO vendors (owner_id, name, type, description, logo_url, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'UIU Tech Hub', 'STARTUP', 'Student-led tech innovation center', 'https://example.com/logo1.png', true),
('22222222-2222-2222-2222-222222222222', 'Campus Cafe', 'FOOD_VENDOR', 'Fresh food and beverages', 'https://example.com/logo2.png', true),
('33333333-3333-3333-3333-333333333333', 'Code Kitchen', 'FOOD_VENDOR', 'Snacks for developers', 'https://example.com/logo3.png', false);

-- Sample Products
INSERT INTO products (vendor_id, name, description, price, image_url, is_available) VALUES
((SELECT id FROM vendors WHERE name = 'Campus Cafe'), 'Chicken Burger', 'Grilled chicken with fries', 250.00, 'https://example.com/burger.jpg', true),
((SELECT id FROM vendors WHERE name = 'Campus Cafe'), 'Pizza Slice', 'Cheese pizza slice', 150.00, 'https://example.com/pizza.jpg', false),
((SELECT id FROM vendors WHERE name = 'UIU Tech Hub'), 'Arduino Kit', 'Starter kit for electronics', 1500.00, 'https://example.com/arduino.jpg', true);

-- Sample Pre-owned Listings
INSERT INTO preowned_listings (seller_id, seller_name, title, description, price, category, images, status) VALUES
('44444444-4444-4444-4444-444444444444', 'John Doe', 'Used MacBook Pro 2020', 'Good condition, minor scratches', 85000.00, 'ELECTRONICS', ARRAY['https://example.com/mac1.jpg', 'https://example.com/mac2.jpg'], 'AVAILABLE'),
('55555555-5555-5555-5555-555555555555', 'Jane Smith', 'CSE Textbooks Bundle', '5 textbooks for CSE courses', 2000.00, 'BOOKS', ARRAY['https://example.com/books.jpg'], 'AVAILABLE'),
('66666666-6666-6666-6666-666666666666', 'Ali Rahman', 'Gaming Mouse', 'RGB gaming mouse, used 6 months', 800.00, 'ELECTRONICS', ARRAY['https://example.com/mouse.jpg'], 'SOLD');
*/
