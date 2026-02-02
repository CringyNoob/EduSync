-- =============================================
-- PAYMENT TRANSACTIONS TABLE MIGRATION
-- Run this in your Aiven PostgreSQL console for market_db
-- =============================================

-- Create payment transaction status enum
CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'INIT_FAILED',
    'VALIDATED',
    'VALIDATION_FAILED',
    'FAILED',
    'CANCELLED'
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL,
    tran_id VARCHAR(100) UNIQUE NOT NULL,
    val_id VARCHAR(100),
    session_key VARCHAR(100),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    status payment_status DEFAULT 'PENDING',
    payment_method VARCHAR(50) DEFAULT 'SSLCOMMERZ',
    card_type VARCHAR(50),
    bank_tran_id VARCHAR(100),
    store_amount DECIMAL(10, 2),
    gateway_response JSONB,
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_payment_transactions_vendor_id ON payment_transactions(vendor_id);
CREATE INDEX idx_payment_transactions_tran_id ON payment_transactions(tran_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE payment_transactions IS 'Stores payment transactions for vendor registration';
COMMENT ON COLUMN payment_transactions.tran_id IS 'Unique transaction ID generated for SSLCommerz';
COMMENT ON COLUMN payment_transactions.val_id IS 'Validation ID returned by SSLCommerz after successful payment';
COMMENT ON COLUMN payment_transactions.session_key IS 'Session key from SSLCommerz for tracking';
COMMENT ON COLUMN payment_transactions.status IS 'Current status of the payment transaction';
COMMENT ON COLUMN payment_transactions.gateway_response IS 'Full JSON response from SSLCommerz gateway';

-- Add new columns to vendors table for merchant verification
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS is_verified_merchant BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS business_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);

-- Add comments for new vendor columns
COMMENT ON COLUMN vendors.is_verified_merchant IS 'Set to true after successful payment validation';
COMMENT ON COLUMN vendors.business_name IS 'Official business name for payment records';
COMMENT ON COLUMN vendors.business_address IS 'Business address for payment records';

-- Create a view for easy payment status checking
CREATE OR REPLACE VIEW vendor_payment_status AS
SELECT 
    v.id as vendor_id,
    v.name as vendor_name,
    v.type as vendor_type,
    v.status as vendor_status,
    v.is_verified_merchant,
    pt.id as transaction_id,
    pt.tran_id,
    pt.amount,
    pt.status as payment_status,
    pt.validated_at,
    pt.created_at as payment_created_at
FROM vendors v
LEFT JOIN payment_transactions pt ON v.id = pt.vendor_id
ORDER BY pt.created_at DESC;

COMMENT ON VIEW vendor_payment_status IS 'Combined view of vendor and their payment transactions';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for payment_transactions
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Payment transactions table and related objects created successfully!';
    RAISE NOTICE '📋 Table: payment_transactions';
    RAISE NOTICE '📋 Enum: payment_status';
    RAISE NOTICE '📋 View: vendor_payment_status';
    RAISE NOTICE '📋 Trigger: update_payment_transactions_updated_at';
END $$;
