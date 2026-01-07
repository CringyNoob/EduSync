-- =============================================
-- POPULATE RENTHUB DATABASE WITH MOCK DATA
-- Run this after database-schema.sql
-- =============================================

-- Clear existing data (optional - for testing)
TRUNCATE TABLE rental_transactions CASCADE;
TRUNCATE TABLE rental_listings CASCADE;

-- =============================================
-- 1. INSERT RENTAL LISTINGS
-- =============================================
-- Note: owner_id corresponds to user IDs from auth_db (IDs 29-45)

INSERT INTO rental_listings (
  id, owner_id, owner_name, owner_email, title, description, daily_price, 
  category, images, availability_start, availability_end, status
) VALUES

-- Textbooks/Books
(
  'r1111111-1111-1111-1111-111111111111',
  '29',
  'Sarah Williams',
  'sarah.williams@uiu.edu',
  'Calculus: Early Transcendentals (8th Edition)',
  'Complete textbook in excellent condition. Perfect for Math 101 and 102. Includes solutions manual.',
  5.00,
  'Books',
  ARRAY['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '90 days',
  'AVAILABLE'
),
(
  'r2222222-2222-2222-2222-222222222222',
  '30',
  'Mike Chen',
  'mike.chen@uiu.edu',
  'Introduction to Algorithms (CLRS)',
  'The classic algorithms textbook. Great for CSE students. Minimal highlighting.',
  6.00,
  'Books',
  ARRAY['https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '120 days',
  'AVAILABLE'
),
(
  'r3333333-3333-3333-3333-333333333333',
  '31',
  'Emma Johnson',
  'emma.johnson@uiu.edu',
  'Organic Chemistry Textbook with Model Kit',
  'Complete with molecular model kit. Perfect for chemistry majors.',
  8.00,
  'Books',
  ARRAY['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '60 days',
  'AVAILABLE'
),

-- Electronics
(
  'r4444444-4444-4444-4444-444444444444',
  '32',
  'Alex Kumar',
  'alex.kumar@uiu.edu',
  'MacBook Pro M2 - Space Gray (16GB RAM)',
  'Perfect for video editing and programming. Includes USB-C hub and laptop bag.',
  40.00,
  'Electronics',
  ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '180 days',
  'AVAILABLE'
),
(
  'r5555555-5555-5555-5555-555555555555',
  '33',
  'David Park',
  'david.park@uiu.edu',
  'Sony Alpha a7 III Camera with Lenses',
  'Full-frame mirrorless camera with 50mm and 24-70mm lenses. Perfect for photography projects.',
  25.00,
  'Electronics',
  ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '90 days',
  'AVAILABLE'
),
(
  'r6666666-6666-6666-6666-666666666666',
  '34',
  'Lisa Wang',
  'lisa.wang@uiu.edu',
  'iPad Pro 12.9" with Apple Pencil',
  '256GB, Space Gray. Includes Apple Pencil 2 and Keyboard Case. Great for note-taking.',
  20.00,
  'Electronics',
  ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '60 days',
  'RENTED'
),
(
  'r7777777-7777-7777-7777-777777777777',
  '35',
  'Tom Anderson',
  'tom.anderson@uiu.edu',
  'Gaming Laptop - ASUS ROG Zephyrus',
  'RTX 3070, i7, 16GB RAM. Perfect for 3D modeling and gaming.',
  35.00,
  'Electronics',
  ARRAY['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '120 days',
  'AVAILABLE'
),

-- Sports Equipment
(
  'r8888888-8888-8888-8888-888888888888',
  '36',
  'Jason Taylor',
  'jason.taylor@uiu.edu',
  'Tennis Racket - Wilson Pro Staff',
  'Professional grade tennis racket with case and extra strings.',
  8.00,
  'Sports Equipment',
  ARRAY['https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '90 days',
  'AVAILABLE'
),
(
  'r9999999-9999-9999-9999-999999999999',
  '37',
  'Maria Rodriguez',
  'maria.rodriguez@uiu.edu',
  'Mountain Bike - Trek Marlin 7',
  'Perfect for campus commute and weekend trails. Includes helmet and lock.',
  15.00,
  'Sports Equipment',
  ARRAY['https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '150 days',
  'AVAILABLE'
),

-- Musical Instruments
(
  'raaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '38',
  'Chris Taylor',
  'chris.taylor@uiu.edu',
  'Yamaha Acoustic Guitar F310',
  'Perfect for beginners. Includes tuner, extra strings, and gig bag.',
  10.00,
  'Musical Instruments',
  ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '180 days',
  'AVAILABLE'
),
(
  'rbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '39',
  'Nina Patel',
  'nina.patel@uiu.edu',
  'Casio Digital Piano - 88 Keys',
  'Weighted keys, perfect for practice. Includes sustain pedal and stand.',
  12.00,
  'Musical Instruments',
  ARRAY['https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '120 days',
  'AVAILABLE'
),

-- Furniture
(
  'rcccccc-cccc-cccc-cccc-cccccccccccc',
  '40',
  'Mike Roberts',
  'mike.roberts@uiu.edu',
  'Ergonomic Office Chair - Black Mesh',
  'Adjustable height and lumbar support. Perfect for long study sessions.',
  10.00,
  'Furniture',
  ARRAY['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '90 days',
  'AVAILABLE'
),
(
  'rdddddd-dddd-dddd-dddd-dddddddddddd',
  '41',
  'Sophie Brown',
  'sophie.brown@uiu.edu',
  'Study Desk - Modern White',
  'Large desk with cable management. 48" x 24", perfect for dual monitors.',
  12.00,
  'Furniture',
  ARRAY['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '180 days',
  'AVAILABLE'
),

-- Tools
(
  'reeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  '42',
  'John Smith Jr',
  'john.smith.jr@uiu.edu',
  'Power Drill Set - Cordless',
  'Complete set with bits, screwdrivers, and carrying case. Great for DIY projects.',
  8.00,
  'Tools',
  ARRAY['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '60 days',
  'AVAILABLE'
),

-- Other/Lab Equipment
(
  'rfffffff-ffff-ffff-ffff-ffffffffffff',
  '43',
  'Professor Oak',
  'prof.oak@uiu.edu',
  'TI-84 Plus CE Graphing Calculator',
  'Perfect for engineering and math courses. Includes charging cable.',
  5.00,
  'Other',
  ARRAY['https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '120 days',
  'AVAILABLE'
),
(
  'rgggggg-gggg-gggg-gggg-gggggggggggg',
  '44',
  'Dr. Singh',
  'dr.singh@uiu.edu',
  'Digital Microscope - 1000x Magnification',
  'USB microscope for biology and research projects. Includes software.',
  15.00,
  'Other',
  ARRAY['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '90 days',
  'AVAILABLE'
),
(
  'rhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
  '45',
  'Rachel Green',
  'rachel.green@uiu.edu',
  'Projector - Full HD 1080p',
  'Perfect for presentations and movie nights. Includes HDMI cable.',
  18.00,
  'Electronics',
  ARRAY['https://images.unsplash.com/photo-1557838923-2985c318be48?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '90 days',
  'AVAILABLE'
),

-- Clothing
(
  'riiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
  '46',
  'Kevin Lee',
  'kevin.lee@uiu.edu',
  'Winter Jacket - North Face',
  'Size L, waterproof, perfect for cold weather. Cleaned and sanitized.',
  8.00,
  'Clothing',
  ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'],
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '60 days',
  'AVAILABLE'
);

-- =============================================
-- 2. INSERT RENTAL TRANSACTIONS (Some Sample History)
-- =============================================
-- Note: renter_id corresponds to user IDs from auth_db (IDs 47-50)

INSERT INTO rental_transactions (
  id, listing_id, renter_id, renter_name, renter_email, 
  start_date, end_date, duration_days, daily_price, total_price, status
) VALUES

-- Active rental (iPad Pro)
(
  't1111111-1111-1111-1111-111111111111',
  'r6666666-6666-6666-6666-666666666666',
  '47',
  'Jane Doe',
  'jane.doe@uiu.edu',
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '10 days',
  15,
  20.00,
  300.00,
  'ACTIVE'
),

-- Completed rentals
(
  't2222222-2222-2222-2222-222222222222',
  '48',
  'Bob Wilson',
  'bob.wilsonilson',
  'bob.w@uiu.edu',
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE - INTERVAL '15 days',
  15,
  5.00,
  75.00,
  'COMPLETED'
),
(
  't3333333-3333-3333-3333-333333333333',
  '49',
  'Alice Cooper',
  'alice.cooperooper',
  'alice.c@uiu.edu',
  CURRENT_DATE - INTERVAL '20 days',
  CURRENT_DATE - INTERVAL '10 days',
  10,
  40.00,
  400.00,
  'COMPLETED'
),

-- Pending transaction
(
  't4444444-4444-4444-4444-444444444444',
  '50',
  'Mark Johnson',
  'mark.johnsonohnson',
  'mark.j@uiu.edu',
  CURRENT_DATE + INTERVAL '2 days',
  CURRENT_DATE + INTERVAL '7 days',
  5,
  25.00,
  125.00,
  'PENDING'
);

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Count listings by category
-- SELECT category, COUNT(*) FROM rental_listings GROUP BY category ORDER BY category;

-- Count listings by status
-- SELECT status, COUNT(*) FROM rental_listings GROUP BY status;

-- Show all listings with owner info
-- SELECT title, owner_name, daily_price, category, status FROM rental_listings ORDER BY created_at DESC;

-- Show all transactions
-- SELECT 
--   rt.id,
--   rl.title as item,
--   rt.renter_name,
--   rt.start_date,
--   rt.end_date,
--   rt.duration_days,
--   rt.total_price,
--   rt.status
-- FROM rental_transactions rt
-- JOIN rental_listings rl ON rt.listing_id = rl.id
-- ORDER BY rt.created_at DESC;

-- Show active rentals
-- SELECT 
--   rl.title,
--   rl.owner_name,
--   rt.renter_name,
--   rt.start_date,
--   rt.end_date,
--   rt.total_price
-- FROM rental_transactions rt
-- JOIN rental_listings rl ON rt.listing_id = rl.id
-- WHERE rt.status = 'ACTIVE';

