-- =====================================================
-- RentHub Service Database Schema
-- Database: rent_db
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Enum Types
-- =====================================================

CREATE TYPE rental_status AS ENUM ('AVAILABLE', 'RENTED', 'UNAVAILABLE');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE rental_category AS ENUM (
  'Electronics',
  'Books',
  'Furniture',
  'Sports Equipment',
  'Musical Instruments',
  'Tools',
  'Clothing',
  'Other'
);

-- =====================================================
-- Rental Listings Table
-- =====================================================

CREATE TABLE rental_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  owner_email VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  daily_price DECIMAL(10, 2) NOT NULL CHECK (daily_price > 0),
  category rental_category DEFAULT 'Other',
  images TEXT[] DEFAULT '{}',
  availability_start DATE NOT NULL,
  availability_end DATE NOT NULL,
  status rental_status DEFAULT 'AVAILABLE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_availability_dates CHECK (availability_end >= availability_start)
);

-- =====================================================
-- Rental Transactions Table
-- =====================================================

CREATE TABLE rental_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES rental_listings(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL,
  renter_name VARCHAR(255) NOT NULL,
  renter_email VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  daily_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status transaction_status DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  CONSTRAINT valid_rental_dates CHECK (end_date >= start_date)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX idx_rental_listings_owner ON rental_listings(owner_id);
CREATE INDEX idx_rental_listings_status ON rental_listings(status);
CREATE INDEX idx_rental_listings_category ON rental_listings(category);
CREATE INDEX idx_rental_listings_created ON rental_listings(created_at DESC);
CREATE INDEX idx_rental_listings_availability ON rental_listings(availability_start, availability_end);

CREATE INDEX idx_rental_transactions_listing ON rental_transactions(listing_id);
CREATE INDEX idx_rental_transactions_renter ON rental_transactions(renter_id);
CREATE INDEX idx_rental_transactions_status ON rental_transactions(status);
CREATE INDEX idx_rental_transactions_dates ON rental_transactions(start_date, end_date);
CREATE INDEX idx_rental_transactions_created ON rental_transactions(created_at DESC);

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE rental_listings IS 'Stores rental item listings posted by users';
COMMENT ON TABLE rental_transactions IS 'Tracks rental transactions between owners and renters';

COMMENT ON COLUMN rental_listings.daily_price IS 'Price per day for renting this item';
COMMENT ON COLUMN rental_listings.availability_start IS 'First date the item is available for rent';
COMMENT ON COLUMN rental_listings.availability_end IS 'Last date the item is available for rent';

COMMENT ON COLUMN rental_transactions.duration_days IS 'Number of days the item is rented';
COMMENT ON COLUMN rental_transactions.total_price IS 'Total price = duration_days * daily_price';
