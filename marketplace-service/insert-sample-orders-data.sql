-- =============================================
-- SAMPLE ORDERS DATA
-- Run this AFTER running add-orders-analytics-tables.sql
-- This is separated to avoid enum commit issues
-- =============================================

-- Get a sample vendor ID for testing (first FOOD_VENDOR)
DO $$
DECLARE
    sample_vendor_id UUID;
    sample_customer_id UUID := '00000047-0000-0000-0000-000000000047';
    sample_order_id UUID;
    sample_product_id UUID;
BEGIN
    -- Get first FOOD_VENDOR
    SELECT id INTO sample_vendor_id FROM vendors WHERE type = 'FOOD_VENDOR' LIMIT 1;
    
    IF sample_vendor_id IS NOT NULL THEN
        -- Get a product from this vendor
        SELECT id INTO sample_product_id FROM products WHERE vendor_id = sample_vendor_id LIMIT 1;
        
        -- Insert sample orders
        INSERT INTO orders (id, vendor_id, customer_id, customer_name, customer_phone, customer_address, customer_image, status, payment_status, payment_method, subtotal, delivery_fee, total, notes)
        VALUES 
            (uuid_generate_v4(), sample_vendor_id, sample_customer_id, 'Alex Johnson', '+880 1711-000000', 'UIU Campus, Room 402', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop', 'PENDING', 'PAID', 'BKASH', 1160, 40, 1200, 'Please double bag it!')
        RETURNING id INTO sample_order_id;
        
        -- Insert order items
        IF sample_product_id IS NOT NULL THEN
            INSERT INTO order_items (order_id, product_id, product_name, quantity, price, options)
            VALUES 
                (sample_order_id, sample_product_id, 'Chicken Teriyaki Bowl', 2, 550, 'Extra Spicy'),
                (sample_order_id, sample_product_id, 'Cola 500ml', 1, 60, 'Chilled');
        END IF;
        
        -- Insert more sample orders
        INSERT INTO orders (vendor_id, customer_id, customer_name, customer_phone, customer_address, status, payment_status, payment_method, subtotal, delivery_fee, total)
        VALUES 
            (sample_vendor_id, sample_customer_id, 'Sarah Miller', '+880 1900-112233', 'UIU Library, 3rd Floor', 'PREPARING', 'PAID', 'CASH', 450, 0, 450),
            (sample_vendor_id, sample_customer_id, 'Lab Group 4', '+880 1800-444444', 'CSE Lab 2, Ground Floor', 'READY', 'PAID', 'NAGAD', 830, 0, 830),
            (sample_vendor_id, sample_customer_id, 'Michael Brown', '+880 1600-999999', 'East Wing Canteen', 'COMPLETED', 'PAID', 'CASH', 220, 0, 220);
        
        -- Insert sample vendor stats for the past week
        INSERT INTO vendor_stats (vendor_id, date, revenue, orders_count, visitors)
        VALUES 
            (sample_vendor_id, CURRENT_DATE - 6, 3200, 12, 150),
            (sample_vendor_id, CURRENT_DATE - 5, 4500, 18, 180),
            (sample_vendor_id, CURRENT_DATE - 4, 3800, 15, 160),
            (sample_vendor_id, CURRENT_DATE - 3, 5200, 22, 200),
            (sample_vendor_id, CURRENT_DATE - 2, 6800, 28, 250),
            (sample_vendor_id, CURRENT_DATE - 1, 7500, 32, 280),
            (sample_vendor_id, CURRENT_DATE, 5100, 20, 190)
        ON CONFLICT (vendor_id, date) DO UPDATE SET
            revenue = EXCLUDED.revenue,
            orders_count = EXCLUDED.orders_count,
            visitors = EXCLUDED.visitors;
            
        RAISE NOTICE 'Sample data inserted for vendor: %', sample_vendor_id;
    ELSE
        RAISE NOTICE 'No FOOD_VENDOR found to insert sample data';
    END IF;
END $$;

-- Verify the data
SELECT 
    'Orders' as table_name, 
    COUNT(*)::text as count 
FROM orders
UNION ALL
SELECT 
    'Order Items' as table_name, 
    COUNT(*)::text as count 
FROM order_items
UNION ALL
SELECT 
    'Vendor Stats' as table_name, 
    COUNT(*)::text as count 
FROM vendor_stats;
