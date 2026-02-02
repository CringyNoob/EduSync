-- =============================================
-- POPULATE AUTH DATABASE WITH USER DATA
-- Run this FIRST before populating marketplace and renthub
-- All users have password: 'password123' (hashed)
-- =============================================

-- Clear existing data (optional - for testing)
-- TRUNCATE TABLE users CASCADE;

-- =============================================
-- INSERT USERS
-- Password: 'password123' hashed with bcrypt
-- Hash: $2b$10$YourHashedPasswordHere (you'll need to generate proper bcrypt hashes)
-- =============================================

-- NOTE: In production, use proper bcrypt hashes. For testing, these are placeholder hashes.
-- To generate real hashes, use: bcrypt.hash('password123', 10)

INSERT INTO users (id, name, email, password, department, batch) VALUES
-- Vendor Owners (for marketplace startups and food vendors)
(1, 'John Smith', 'john.smith@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Computer Science', '2021'),
(2, 'Sarah Johnson', 'sarah.johnson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Business', '2022'),
(3, 'Ahmed Khan', 'ahmed.khan@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Engineering', '2021'),
(4, 'Maria Garcia', 'maria.garcia@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Computer Science', '2023'),
(5, 'David Chen', 'david.chen@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Business', '2022'),
(6, 'Emily Brown', 'emily.brown@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Arts', '2023'),
(7, 'Michael Lee', 'michael.lee@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Science', '2021'),
(8, 'Lisa Wang', 'lisa.wang@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Engineering', '2022'),
(9, 'James Wilson', 'james.wilson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Business', '2023'),

-- Pre-owned Sellers (marketplace)
(10, 'Sarah Rahman', 'sarah.rahman@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Computer Science', '2022'),
(11, 'Rafiq Islam', 'rafiq.islam@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Engineering', '2021'),
(12, 'Nadia Sultana', 'nadia.sultana@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Science', '2023'),
(13, 'Karim Hassan', 'karim.hassan@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Mathematics', '2022'),
(14, 'Farhana Ahmed', 'farhana.ahmed@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Computer Science', '2021'),
(15, 'Imran Chowdhury', 'imran.chowdhury@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Engineering', '2022'),
(16, 'Tasnim Haque', 'tasnim.haque@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Medicine', '2023'),
(17, 'Sabbir Khan', 'sabbir.khan@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Business', '2021'),
(18, 'Lamia Begum', 'lamia.begum@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Science', '2022'),
(19, 'Tanvir Alam', 'tanvir.alam@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Arts', '2023'),
(20, 'Rupa Sharma', 'rupa.sharma@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Engineering', '2022'),
(21, 'Asif Mahmud', 'asif.mahmud@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Business', '2021'),
(22, 'Dr. Rahman', 'dr.rahman@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Science', '2020'),
(23, 'Mehedi Hasan', 'mehedi.hasan@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Chemistry', '2023'),
(24, 'Shakib Ahmed', 'shakib.ahmed@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Sports Science', '2022'),
(25, 'Mithila Roy', 'mithila.roy@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Physical Education', '2021'),
(26, 'Fahim Islam', 'fahim.islam@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Engineering', '2022'),
(27, 'Anika Das', 'anika.das@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Music', '2023'),
(28, 'Rahim Uddin', 'rahim.uddin@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Arts', '2022'),

-- Rental Owners (renthub)
(29, 'Sarah Williams', 'sarah.williams@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Mathematics', '2022'),
(30, 'Mike Chen', 'mike.chen@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Computer Science', '2021'),
(31, 'Emma Johnson', 'emma.johnson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Chemistry', '2023'),
(32, 'Alex Kumar', 'alex.kumar@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Computer Science', '2022'),
(33, 'David Park', 'david.park@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Photography', '2021'),
(34, 'Tom Anderson', 'tom.anderson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Engineering', '2023'),
(35, 'Jason Taylor', 'jason.taylor@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Sports Science', '2022'),
(36, 'Maria Rodriguez', 'maria.rodriguez@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Physical Education', '2021'),
(37, 'Chris Taylor', 'chris.taylor@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Music', '2023'),
(38, 'Nina Patel', 'nina.patel@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Music', '2022'),
(39, 'Mike Roberts', 'mike.roberts@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Business', '2021'),
(40, 'Sophie Brown', 'sophie.brown@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Interior Design', '2023'),
(41, 'John Smith Jr', 'john.smith.jr@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Engineering', '2022'),
(42, 'Professor Oak', 'prof.oak@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Mathematics', '2018'),
(43, 'Dr. Singh', 'dr.singh@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Biology', '2019'),
(44, 'Rachel Green', 'rachel.green@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Communications', '2022'),
(45, 'Kevin Lee', 'kevin.lee@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Fashion Design', '2021'),

-- Rental Renters (renthub transactions)
(46, 'Jane Doe', 'jane.doe@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Business', '2023'),
(47, 'Bob Wilson', 'bob.wilson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Engineering', '2022'),
(48, 'Alice Cooper', 'alice.cooper@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Computer Science', '2021'),
(49, 'Mark Johnson', 'mark.johnson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'Photography', '2023');

-- Reset sequence to continue from 50
SELECT setval('users_id_seq', 49, true);

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Count total users
-- SELECT COUNT(*) FROM users;

-- View all users
-- SELECT id, name, email, department, batch FROM users ORDER BY id;

-- View users by department
-- SELECT department, COUNT(*) FROM users GROUP BY department ORDER BY department;

-- Check specific user
-- SELECT * FROM users WHERE email = 'john.smith@uiu.edu';

-- =============================================
-- NOTES
-- =============================================

-- Password Hash Info:
-- All users have the same password: 'password123'
-- The hash shown is a placeholder. In production:
-- 1. Use proper bcrypt hashing
-- 2. Generate unique salts for each user
-- 3. Never store plain text passwords

-- User ID Mapping:
-- IDs 1-9: Vendor owners (marketplace)
-- IDs 10-28: Pre-owned sellers (marketplace)
-- IDs 29-45: Rental listing owners (renthub)
-- IDs 46-49: Rental renters (renthub transactions)

-- These IDs are now consistent across:
-- - auth_db (this file)
-- - market_db (populate-marketplace-data.sql)
-- - rent_db (populate-renthub-data.sql)

