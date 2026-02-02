-- =============================================
-- POPULATE MARKETPLACE DATABASE WITH MOCK DATA
-- Run this after database-schema.sql
-- =============================================

-- Clear existing data (optional - for testing)
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE vendors CASCADE;
TRUNCATE TABLE preowned_listings CASCADE;

-- =============================================
-- 1. INSERT STARTUP VENDORS
-- =============================================
-- Note: owner_id corresponds to user IDs from auth_db (IDs 1-4)

INSERT INTO vendors (id, owner_id, name, type, description, logo_url, is_active) VALUES
('a1b2c3d4-1111-1111-1111-111111111111', '1', 'UIU Tech Hub', 'STARTUP', 'Student-led technology innovation center offering cutting-edge tech products', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200', true),
('a1b2c3d4-2222-2222-2222-222222222222', '2', 'Campus Coders', 'STARTUP', 'Programming tools, courses, and coding accessories by students for students', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200', true),
('a1b2c3d4-3333-3333-3333-333333333333', '3', 'EcoSmart Solutions', 'STARTUP', 'Sustainable campus products and eco-friendly innovation', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200', true),
('a1b2c3d4-4444-4444-4444-444444444444', '4', 'Study Buddy AI', 'STARTUP', 'AI-powered study tools and educational resources', 'https://images.unsplash.com/photo-1527430253228-e93688616381?w=200', true);

-- =============================================
-- 2. INSERT FOOD VENDORS
-- =============================================
-- Note: owner_id corresponds to user IDs from auth_db (IDs 5-9)

INSERT INTO vendors (id, owner_id, name, type, description, logo_url, is_active) VALUES
('b1b2c3d4-1111-1111-1111-111111111111', '5', 'Campus Cafe', 'FOOD_VENDOR', 'Fresh breakfast, lunch, and coffee. Open 7 AM - 6 PM', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200', true),
('b1b2c3d4-2222-2222-2222-222222222222', '6', 'Code Kitchen', 'FOOD_VENDOR', 'Quick bites and energy drinks for late-night coding sessions', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200', true),
('b1b2c3d4-3333-3333-3333-333333333333', '7', 'Healthy Bites', 'FOOD_VENDOR', 'Nutritious meals, smoothies, and salads', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200', true),
('b1b2c3d4-4444-4444-4444-444444444444', '8', 'Desi Dhaba', 'FOOD_VENDOR', 'Authentic Bangladeshi and Indian cuisine', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200', false),
('b1b2c3d4-5555-5555-5555-555555555555', '9', 'Sweet Tooth', 'FOOD_VENDOR', 'Desserts, pastries, and sweet treats', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200', true);

-- =============================================
-- 3. INSERT STARTUP PRODUCTS
-- =============================================

INSERT INTO products (vendor_id, name, description, price, image_url, is_available) VALUES
-- UIU Tech Hub Products
('a1b2c3d4-1111-1111-1111-111111111111', 'Arduino Starter Kit', 'Complete electronics kit with Arduino Uno, sensors, and components', 1500.00, 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400', true),
('a1b2c3d4-1111-1111-1111-111111111111', 'Raspberry Pi 4 Bundle', '4GB RAM with case, power supply, and SD card', 2500.00, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400', true),
('a1b2c3d4-1111-1111-1111-111111111111', 'USB-C Hub Adapter', '7-in-1 hub with HDMI, USB 3.0, SD card reader', 800.00, 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400', true),
('a1b2c3d4-1111-1111-1111-111111111111', 'Wireless Mouse', 'Ergonomic 2.4GHz wireless mouse with 6 buttons', 450.00, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400', false),

-- Campus Coders Products
('a1b2c3d4-2222-2222-2222-222222222222', 'Programming Course Bundle', 'Access to Python, JavaScript, and React courses', 3000.00, 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400', true),
('a1b2c3d4-2222-2222-2222-222222222222', 'Code Editor Theme Pack', 'Premium VS Code themes collection', 200.00, 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400', true),
('a1b2c3d4-2222-2222-2222-222222222222', 'Mechanical Keyboard', 'RGB backlit gaming keyboard for programmers', 3500.00, 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400', true),

-- EcoSmart Solutions Products
('a1b2c3d4-3333-3333-3333-333333333333', 'Reusable Water Bottle', 'Stainless steel 750ml with temperature control', 600.00, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', true),
('a1b2c3d4-3333-3333-3333-333333333333', 'Bamboo Laptop Stand', 'Eco-friendly adjustable laptop stand', 1200.00, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', true),
('a1b2c3d4-3333-3333-3333-333333333333', 'Solar Power Bank', '20000mAh solar-powered portable charger', 1800.00, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', true),

-- Study Buddy AI Products
('a1b2c3d4-4444-4444-4444-444444444444', 'AI Note-Taking App (1 Year)', 'Smart notes with auto-summarization', 1500.00, 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400', true),
('a1b2c3d4-4444-4444-4444-444444444444', 'Flashcard Pro Subscription', '6 months premium with spaced repetition', 800.00, 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400', true);

-- =============================================
-- 4. INSERT FOOD VENDOR PRODUCTS
-- =============================================

INSERT INTO products (vendor_id, name, description, price, image_url, is_available) VALUES
-- Campus Cafe
('b1b2c3d4-1111-1111-1111-111111111111', 'Chicken Burger Combo', 'Grilled chicken burger with fries and drink', 250.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', true),
('b1b2c3d4-1111-1111-1111-111111111111', 'Club Sandwich', 'Triple decker with chicken, bacon, lettuce, tomato', 200.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', true),
('b1b2c3d4-1111-1111-1111-111111111111', 'Cappuccino', 'Fresh brewed with latte art', 100.00, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', true),
('b1b2c3d4-1111-1111-1111-111111111111', 'Margherita Pizza', 'Fresh mozzarella and basil', 350.00, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', false),

-- Code Kitchen
('b1b2c3d4-2222-2222-2222-222222222222', 'Energy Drink', 'Monster or Red Bull', 120.00, 'https://images.unsplash.com/photo-1622543925917-763c34f6530a?w=400', true),
('b1b2c3d4-2222-2222-2222-222222222222', 'Instant Noodles Bowl', 'Hot ramen with toppings', 150.00, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', true),
('b1b2c3d4-2222-2222-2222-222222222222', 'Chips & Salsa', 'Tortilla chips with guacamole', 100.00, 'https://images.unsplash.com/photo-1613564834361-9436948817d1?w=400', true),

-- Healthy Bites
('b1b2c3d4-3333-3333-3333-333333333333', 'Green Smoothie', 'Spinach, banana, mango blend', 180.00, 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400', true),
('b1b2c3d4-3333-3333-3333-333333333333', 'Grilled Chicken Salad', 'Mixed greens with grilled chicken breast', 280.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', true),
('b1b2c3d4-3333-3333-3333-333333333333', 'Protein Bowl', 'Quinoa, chickpeas, veggies, tahini', 300.00, 'https://images.unsplash.com/photo-1546069901-eacef0df6022?w=400', true),

-- Desi Dhaba (Shop Closed - all unavailable)
('b1b2c3d4-4444-4444-4444-444444444444', 'Chicken Biryani', 'Aromatic basmati rice with spiced chicken', 200.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', false),
('b1b2c3d4-4444-4444-4444-444444444444', 'Butter Chicken', 'Creamy tomato-based curry with naan', 220.00, 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400', false),

-- Sweet Tooth
('b1b2c3d4-5555-5555-5555-555555555555', 'Chocolate Lava Cake', 'Warm molten chocolate center', 180.00, 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400', true),
('b1b2c3d4-5555-5555-5555-555555555555', 'Cheesecake Slice', 'New York style cheesecake', 200.00, 'https://images.unsplash.com/photo-1533134242820-e179d2e8e63c?w=400', true),
('b1b2c3d4-5555-5555-5555-555555555555', 'Brownie Sundae', 'Warm brownie with vanilla ice cream', 220.00, 'https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=400', true);

-- =============================================
-- 5. INSERT PRE-OWNED LISTINGS
-- Note: seller_id corresponds to user IDs from auth_db (IDs 10-28)

INSERT INTO preowned_listings (seller_id, seller_name, title, description, price, category, images, status) VALUES
-- Electronics
('10', 'Ahmed Khan', 'iPhone 12 Pro 128GB - Pacific Blue', 'Excellent condition, battery health 89%, comes with original box and charger', 42000.00, 'Electronics', ARRAY['https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400'], 'AVAILABLE'),
('11', 'Sarah Rahman', 'HP Pavilion Laptop - i5 8th Gen', '8GB RAM, 256GB SSD, NVIDIA MX150 graphics, perfect for students', 35000.00, 'Electronics', ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'], 'AVAILABLE'),
('12', 'Rafiq Islam', 'Sony WH-1000XM4 Headphones', 'Noise cancelling, barely used, includes case and cables', 18000.00, 'Electronics', ARRAY['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400'], 'AVAILABLE'),
('13', 'Nadia Sultana', 'iPad Air 2020 64GB', 'Space grey, includes Apple Pencil 2nd gen', 38000.00, 'Electronics', ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400'], 'SOLD'),

-- Textbooks
('14', 'Karim Hassan', 'Calculus: Early Transcendentals 8th Ed', 'James Stewart, good condition with minimal highlighting', 1200.00, 'Textbooks', ARRAY['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'], 'AVAILABLE'),
('15', 'Farhana Ahmed', 'Data Structures and Algorithms in Java', 'Robert Lafore, like new condition', 1500.00, 'Textbooks', ARRAY['https://images.unsplash.com/photo-1589998059171-988d887df646?w=400'], 'AVAILABLE'),
('16', 'Imran Chowdhury', 'Engineering Mechanics Bundle (3 books)', 'Statics, Dynamics, and Mechanics of Materials', 2500.00, 'Textbooks', ARRAY['https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400'], 'AVAILABLE'),
('17', 'Tasnim Haque', 'Medical Physiology Textbook', 'Guyton and Hall, 14th edition, excellent condition', 2000.00, 'Textbooks', ARRAY['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'], 'AVAILABLE'),

-- Furniture
('18', 'Sabbir Khan', 'Study Desk with Chair', 'Wooden desk 4ft x 2ft with matching chair, great for dorm', 3500.00, 'Furniture', ARRAY['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400'], 'AVAILABLE'),
('19', 'Lamia Begum', 'Mini Fridge - 1.7 Cu Ft', 'Perfect for dorm room, energy efficient', 4500.00, 'Furniture', ARRAY['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400'], 'AVAILABLE'),
('20', 'Tanvir Alam', 'Bookshelf - 5 Tier', 'Sturdy wooden bookshelf, holds lots of books', 2000.00, 'Furniture', ARRAY['https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400'], 'AVAILABLE'),

-- Clothing
('21', 'Rupa Sharma', 'North Face Winter Jacket - Size M', 'Black, waterproof, barely worn', 3000.00, 'Clothing', ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'], 'AVAILABLE'),
('22', 'Asif Mahmud', 'Nike Air Max Sneakers - Size 10', 'White/Blue, good condition, worn 3 times', 4000.00, 'Clothing', ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'], 'AVAILABLE'),

-- Lab Equipment
('23', 'Dr. Rahman', 'Lab Coat Bundle (3 coats)', 'White lab coats, size M, L, XL', 1500.00, 'Lab Equipment', ARRAY['https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400'], 'AVAILABLE'),
('24', 'Mehedi Hasan', 'Safety Goggles and Gloves Set', 'Chemistry lab essentials, never used', 500.00, 'Lab Equipment', ARRAY['https://images.unsplash.com/photo-1583912086296-be5b665036de?w=400'], 'AVAILABLE'),

-- Sports Equipment
('25', 'Shakib Ahmed', 'Cricket Bat - SS TON', 'English willow, lightly used, great condition', 5000.00, 'Sports Equipment', ARRAY['https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400'], 'AVAILABLE'),
('26', 'Mithila Roy', 'Badminton Racket Pair', 'Yonex Nanoray series with shuttlecocks', 2500.00, 'Sports Equipment', ARRAY['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400'], 'AVAILABLE'),
('27', 'Fahim Islam', 'Gym Dumbbell Set', '5kg, 10kg, 15kg pairs with stand', 6000.00, 'Sports Equipment', ARRAY['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400'], 'SOLD'),

-- Musical Instruments
('28', 'Anika Das', 'Yamaha Acoustic Guitar', 'F310 model, includes bag and tuner', 8000.00, 'Musical Instruments', ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400'], 'AVAILABLE'),
('29', 'Anika Das', 'Yamaha Acoustic Guitar', 'F310 model, includes bag and tuner', 8000.00, 'Musical Instruments', ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400'], 'AVAILABLE'),
('user020', 'Rahim Uddin', 'Casio Keyboard - 61 Keys', 'CTK-3500 with stand and adapter', 12000.00, 'Musical Instruments', ARRAY['https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400'], 'AVAILABLE');

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Count vendors by type
-- SELECT type, COUNT(*) FROM vendors GROUP BY type;

-- Count products per vendor
-- SELECT v.name, COUNT(p.id) as product_count FROM vendors v LEFT JOIN products p ON v.id = p.vendor_id GROUP BY v.name;

-- Count preowned by category
-- SELECT category, COUNT(*) FROM preowned_listings GROUP BY category;

-- Show all data
-- SELECT * FROM vendors ORDER BY type, name;
-- SELECT * FROM products ORDER BY vendor_id;
-- SELECT * FROM preowned_listings ORDER BY created_at DESC;

