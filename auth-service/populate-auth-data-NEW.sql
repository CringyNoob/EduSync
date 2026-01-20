-- =============================================
-- POPULATE AUTH DATABASE WITH MOCK USERS
-- =============================================
-- This script populates auth_db with 50 users using the new schema:
-- - users table (authentication data with UUID)
-- - profiles table (personal information)
-- 
-- IMPORTANT: Run this FIRST before populating market_db or rent_db
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- VENDOR USERS (UUID 001-009)
-- For marketplace startups and food vendors
-- =============================================

-- Vendor 1: TechVenture Startup
<<<<<<< HEAD
INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000001-0000-0000-0000-000000000001', 'john.smith@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT', 'VENDOR'], 'VENDOR', true);
=======
INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000001-0000-0000-0000-000000000001', 'john.smith@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'VENDOR', true);
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio, email_visible, phone_visible) VALUES
('00000001-0000-0000-0000-000000000001', 'John Smith', 'CSE2021001', 'Computer Science', '2021', '01712345001', 'TechVenture founder - Mobile app development', true, true);

-- Vendor 2: CodeCraft Solutions
<<<<<<< HEAD
INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000002-0000-0000-0000-000000000002', 'sarah.johnson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT', 'VENDOR'], 'VENDOR', true);
=======
INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000002-0000-0000-0000-000000000002', 'sarah.johnson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'VENDOR', true);
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio, email_visible, phone_visible) VALUES
('00000002-0000-0000-0000-000000000002', 'Sarah Johnson', 'BUS2022001', 'Business', '2022', '01712345002', 'CodeCraft - Web development services', true, true);

-- Vendor 3: DataMind Analytics
<<<<<<< HEAD
INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000003-0000-0000-0000-000000000003', 'ahmed.khan@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT', 'VENDOR'], 'VENDOR', true);
=======
INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000003-0000-0000-0000-000000000003', 'ahmed.khan@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'VENDOR', true);
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio, email_visible, phone_visible) VALUES
('00000003-0000-0000-0000-000000000003', 'Ahmed Khan', 'ENG2021002', 'Engineering', '2021', '01712345003', 'DataMind - Data science solutions', true, true);

-- Vendor 4: GreenTech Innovations
<<<<<<< HEAD
INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000004-0000-0000-0000-000000000004', 'maria.garcia@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT', 'VENDOR'], 'VENDOR', true);
=======
INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000004-0000-0000-0000-000000000004', 'maria.garcia@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'VENDOR', true);
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio, email_visible, phone_visible) VALUES
('00000004-0000-0000-0000-000000000004', 'Maria Garcia', 'CSE2023001', 'Computer Science', '2023', '01712345004', 'GreenTech - Sustainable technology', true, true);

-- Vendor 5: Campus Cafe
<<<<<<< HEAD
INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000005-0000-0000-0000-000000000005', 'david.chen@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT', 'VENDOR'], 'VENDOR', true);
=======
INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000005-0000-0000-0000-000000000005', 'david.chen@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'VENDOR', true);
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio, email_visible, phone_visible) VALUES
('00000005-0000-0000-0000-000000000005', 'David Chen', 'BUS2022002', 'Business', '2022', '01712345005', 'Campus Cafe owner - Coffee and snacks', true, true);

-- Vendor 6: Deshi Bites
<<<<<<< HEAD
INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000006-0000-0000-0000-000000000006', 'emily.brown@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT', 'VENDOR'], 'VENDOR', true);
=======
INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000006-0000-0000-0000-000000000006', 'emily.brown@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'VENDOR', true);
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio, email_visible, phone_visible) VALUES
('00000006-0000-0000-0000-000000000006', 'Emily Brown', 'ART2023001', 'Arts', '2023', '01712345006', 'Deshi Bites - Bangladeshi cuisine', true, true);

-- Vendor 7: Quick Bites
<<<<<<< HEAD
INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000007-0000-0000-0000-000000000007', 'michael.lee@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT', 'VENDOR'], 'VENDOR', true);
=======
INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000007-0000-0000-0000-000000000007', 'michael.lee@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'VENDOR', true);
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio, email_visible, phone_visible) VALUES
('00000007-0000-0000-0000-000000000007', 'Michael Lee', 'SCI2021001', 'Science', '2021', '01712345007', 'Quick Bites - Fast food', true, true);

-- Vendor 8: Healthy Bowl
<<<<<<< HEAD
INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000008-0000-0000-0000-000000000008', 'lisa.wang@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT', 'VENDOR'], 'VENDOR', true);
=======
INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000008-0000-0000-0000-000000000008', 'lisa.wang@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'VENDOR', true);
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio, email_visible, phone_visible) VALUES
('00000008-0000-0000-0000-000000000008', 'Lisa Wang', 'ENG2022001', 'Engineering', '2022', '01712345008', 'Healthy Bowl - Nutritious meals', true, true);

-- Vendor 9: Tea Time
<<<<<<< HEAD
INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000009-0000-0000-0000-000000000009', 'james.wilson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT', 'VENDOR'], 'VENDOR', true);
=======
INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000009-0000-0000-0000-000000000009', 'james.wilson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'VENDOR', true);
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio, email_visible, phone_visible) VALUES
('00000009-0000-0000-0000-000000000009', 'James Wilson', 'BUS2023001', 'Business', '2023', '01712345009', 'Tea Time - Premium beverages', true, true);

-- =============================================
-- PREOWNED SELLERS (UUID 010-028)
-- For marketplace preowned listings
-- =============================================

<<<<<<< HEAD
INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000010-0000-0000-0000-000000000010', 'sarah.rahman@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000010-0000-0000-0000-000000000010', 'Sarah Rahman', 'CSE2022001', 'Computer Science', '2022', '01712345010', 'Selling my used tech items');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000011-0000-0000-0000-000000000011', 'rafiq.islam@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000011-0000-0000-0000-000000000011', 'Rafiq Islam', 'ENG2021003', 'Engineering', '2021', '01712345011', 'Engineering student selling equipment');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000012-0000-0000-0000-000000000012', 'nadia.sultana@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000012-0000-0000-0000-000000000012', 'Nadia Sultana', 'SCI2023001', 'Science', '2023', '01712345012', 'Science major with items to sell');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000013-0000-0000-0000-000000000013', 'karim.hassan@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000013-0000-0000-0000-000000000013', 'Karim Hassan', 'MATH2022001', 'Mathematics', '2022', '01712345013', 'Math student selling books');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000014-0000-0000-0000-000000000014', 'farhana.ahmed@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000014-0000-0000-0000-000000000014', 'Farhana Ahmed', 'CSE2021004', 'Computer Science', '2021', '01712345014', 'CS grad selling study materials');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000015-0000-0000-0000-000000000015', 'imran.chowdhury@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000015-0000-0000-0000-000000000015', 'Imran Chowdhury', 'ENG2022002', 'Engineering', '2022', '01712345015', 'Engineering items for sale');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000016-0000-0000-0000-000000000016', 'tasnim.haque@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000016-0000-0000-0000-000000000016', 'Tasnim Haque', 'MED2023001', 'Medicine', '2023', '01712345016', 'Medical student with items to sell');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000017-0000-0000-0000-000000000017', 'sabbir.khan@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000017-0000-0000-0000-000000000017', 'Sabbir Khan', 'BUS2021002', 'Business', '2021', '01712345017', 'Business student');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000018-0000-0000-0000-000000000018', 'lamia.begum@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000018-0000-0000-0000-000000000018', 'Lamia Begum', 'SCI2022002', 'Science', '2022', '01712345018', 'Science student');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000019-0000-0000-0000-000000000019', 'tanvir.alam@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000019-0000-0000-0000-000000000019', 'Tanvir Alam', 'ART2023002', 'Arts', '2023', '01712345019', 'Arts student');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000020-0000-0000-0000-000000000020', 'rupa.sharma@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000020-0000-0000-0000-000000000020', 'Rupa Sharma', 'ENG2022003', 'Engineering', '2022', '01712345020', 'Engineering major');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000021-0000-0000-0000-000000000021', 'asif.mahmud@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000021-0000-0000-0000-000000000021', 'Asif Mahmud', 'BUS2021003', 'Business', '2021', '01712345021', 'Business major');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000022-0000-0000-0000-000000000022', 'dr.rahman@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000022-0000-0000-0000-000000000022', 'Dr. Rahman', 'SCI2020001', 'Science', '2020', '01712345022', 'Science faculty');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000023-0000-0000-0000-000000000023', 'mehedi.hasan@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000023-0000-0000-0000-000000000023', 'Mehedi Hasan', 'CHEM2023001', 'Chemistry', '2023', '01712345023', 'Chemistry student');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000024-0000-0000-0000-000000000024', 'shakib.ahmed@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000024-0000-0000-0000-000000000024', 'Shakib Ahmed', 'SPT2022001', 'Sports Science', '2022', '01712345024', 'Sports science major');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000025-0000-0000-0000-000000000025', 'mithila.roy@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000025-0000-0000-0000-000000000025', 'Mithila Roy', 'PE2021001', 'Physical Education', '2021', '01712345025', 'PE student');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000026-0000-0000-0000-000000000026', 'fahim.islam@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000026-0000-0000-0000-000000000026', 'Fahim Islam', 'ENG2022004', 'Engineering', '2022', '01712345026', 'Engineering student');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000027-0000-0000-0000-000000000027', 'anika.das@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000027-0000-0000-0000-000000000027', 'Anika Das', 'MUS2023001', 'Music', '2023', '01712345027', 'Music student');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000028-0000-0000-0000-000000000028', 'rahim.uddin@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
=======
INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000010-0000-0000-0000-000000000010', 'sarah.rahman@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000010-0000-0000-0000-000000000010', 'Sarah Rahman', 'CSE2022001', 'Computer Science', '2022', '01712345010', 'Selling my used tech items');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000011-0000-0000-0000-000000000011', 'rafiq.islam@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000011-0000-0000-0000-000000000011', 'Rafiq Islam', 'ENG2021003', 'Engineering', '2021', '01712345011', 'Engineering student selling equipment');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000012-0000-0000-0000-000000000012', 'nadia.sultana@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000012-0000-0000-0000-000000000012', 'Nadia Sultana', 'SCI2023001', 'Science', '2023', '01712345012', 'Science major with items to sell');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000013-0000-0000-0000-000000000013', 'karim.hassan@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000013-0000-0000-0000-000000000013', 'Karim Hassan', 'MATH2022001', 'Mathematics', '2022', '01712345013', 'Math student selling books');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000014-0000-0000-0000-000000000014', 'farhana.ahmed@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000014-0000-0000-0000-000000000014', 'Farhana Ahmed', 'CSE2021004', 'Computer Science', '2021', '01712345014', 'CS grad selling study materials');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000015-0000-0000-0000-000000000015', 'imran.chowdhury@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000015-0000-0000-0000-000000000015', 'Imran Chowdhury', 'ENG2022002', 'Engineering', '2022', '01712345015', 'Engineering items for sale');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000016-0000-0000-0000-000000000016', 'tasnim.haque@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000016-0000-0000-0000-000000000016', 'Tasnim Haque', 'MED2023001', 'Medicine', '2023', '01712345016', 'Medical student with items to sell');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000017-0000-0000-0000-000000000017', 'sabbir.khan@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000017-0000-0000-0000-000000000017', 'Sabbir Khan', 'BUS2021002', 'Business', '2021', '01712345017', 'Business student');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000018-0000-0000-0000-000000000018', 'lamia.begum@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000018-0000-0000-0000-000000000018', 'Lamia Begum', 'SCI2022002', 'Science', '2022', '01712345018', 'Science student');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000019-0000-0000-0000-000000000019', 'tanvir.alam@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000019-0000-0000-0000-000000000019', 'Tanvir Alam', 'ART2023002', 'Arts', '2023', '01712345019', 'Arts student');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000020-0000-0000-0000-000000000020', 'rupa.sharma@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000020-0000-0000-0000-000000000020', 'Rupa Sharma', 'ENG2022003', 'Engineering', '2022', '01712345020', 'Engineering major');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000021-0000-0000-0000-000000000021', 'asif.mahmud@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000021-0000-0000-0000-000000000021', 'Asif Mahmud', 'BUS2021003', 'Business', '2021', '01712345021', 'Business major');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000022-0000-0000-0000-000000000022', 'dr.rahman@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000022-0000-0000-0000-000000000022', 'Dr. Rahman', 'SCI2020001', 'Science', '2020', '01712345022', 'Science faculty');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000023-0000-0000-0000-000000000023', 'mehedi.hasan@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000023-0000-0000-0000-000000000023', 'Mehedi Hasan', 'CHEM2023001', 'Chemistry', '2023', '01712345023', 'Chemistry student');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000024-0000-0000-0000-000000000024', 'shakib.ahmed@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000024-0000-0000-0000-000000000024', 'Shakib Ahmed', 'SPT2022001', 'Sports Science', '2022', '01712345024', 'Sports science major');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000025-0000-0000-0000-000000000025', 'mithila.roy@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000025-0000-0000-0000-000000000025', 'Mithila Roy', 'PE2021001', 'Physical Education', '2021', '01712345025', 'PE student');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000026-0000-0000-0000-000000000026', 'fahim.islam@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000026-0000-0000-0000-000000000026', 'Fahim Islam', 'ENG2022004', 'Engineering', '2022', '01712345026', 'Engineering student');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000027-0000-0000-0000-000000000027', 'anika.das@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000027-0000-0000-0000-000000000027', 'Anika Das', 'MUS2023001', 'Music', '2023', '01712345027', 'Music student');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000028-0000-0000-0000-000000000028', 'rahim.uddin@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000028-0000-0000-0000-000000000028', 'Rahim Uddin', 'ART2022001', 'Arts', '2022', '01712345028', 'Arts student');

-- =============================================
-- RENTAL OWNERS (UUID 029-046)
-- For renthub rental listings
-- =============================================

<<<<<<< HEAD
INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000029-0000-0000-0000-000000000029', 'sarah.williams@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000029-0000-0000-0000-000000000029', 'Sarah Williams', 'MATH2022002', 'Mathematics', '2022', '01712345029', 'Renting textbooks');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000030-0000-0000-0000-000000000030', 'mike.chen@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000030-0000-0000-0000-000000000030', 'Mike Chen', 'CSE2021005', 'Computer Science', '2021', '01712345030', 'Renting electronics');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000031-0000-0000-0000-000000000031', 'emma.johnson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000031-0000-0000-0000-000000000031', 'Emma Johnson', 'CHEM2023002', 'Chemistry', '2023', '01712345031', 'Renting chemistry books');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000032-0000-0000-0000-000000000032', 'alex.kumar@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000032-0000-0000-0000-000000000032', 'Alex Kumar', 'CSE2022002', 'Computer Science', '2022', '01712345032', 'Renting laptops');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000033-0000-0000-0000-000000000033', 'david.park@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000033-0000-0000-0000-000000000033', 'David Park', 'PHOTO2021001', 'Photography', '2021', '01712345033', 'Renting cameras');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000034-0000-0000-0000-000000000034', 'lisa.wang2@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000034-0000-0000-0000-000000000034', 'Lisa Wang', 'CSE2023002', 'Computer Science', '2023', '01712345034', 'Renting tablets');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000035-0000-0000-0000-000000000035', 'tom.anderson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000035-0000-0000-0000-000000000035', 'Tom Anderson', 'ENG2023001', 'Engineering', '2023', '01712345035', 'Renting projectors');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000036-0000-0000-0000-000000000036', 'jason.taylor@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000036-0000-0000-0000-000000000036', 'Jason Taylor', 'SPT2022002', 'Sports Science', '2022', '01712345036', 'Renting sports equipment');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000037-0000-0000-0000-000000000037', 'maria.rodriguez@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000037-0000-0000-0000-000000000037', 'Maria Rodriguez', 'PE2021002', 'Physical Education', '2021', '01712345037', 'Renting gym equipment');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000038-0000-0000-0000-000000000038', 'chris.taylor@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000038-0000-0000-0000-000000000038', 'Chris Taylor', 'MUS2022001', 'Music', '2022', '01712345038', 'Renting guitars');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000039-0000-0000-0000-000000000039', 'nina.patel@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000039-0000-0000-0000-000000000039', 'Nina Patel', 'MUS2023002', 'Music', '2023', '01712345039', 'Renting violins');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000040-0000-0000-0000-000000000040', 'mike.roberts@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000040-0000-0000-0000-000000000040', 'Mike Roberts', 'BUS2022003', 'Business', '2022', '01712345040', 'Renting furniture');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000041-0000-0000-0000-000000000041', 'sophie.brown@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000041-0000-0000-0000-000000000041', 'Sophie Brown', 'ART2023003', 'Arts', '2023', '01712345041', 'Renting desks');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000042-0000-0000-0000-000000000042', 'john.smith.jr@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000042-0000-0000-0000-000000000042', 'John Smith Jr', 'ENG2022005', 'Engineering', '2022', '01712345042', 'Renting tools');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000043-0000-0000-0000-000000000043', 'prof.oak@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000043-0000-0000-0000-000000000043', 'Professor Oak', 'SCI2020002', 'Science', '2020', '01712345043', 'Renting lab equipment');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000044-0000-0000-0000-000000000044', 'dr.singh@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000044-0000-0000-0000-000000000044', 'Dr. Singh', 'SCI2021002', 'Science', '2021', '01712345044', 'Renting microscopes');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000045-0000-0000-0000-000000000045', 'rachel.green@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000045-0000-0000-0000-000000000045', 'Rachel Green', 'MED2022001', 'Medicine', '2022', '01712345045', 'Renting medical equipment');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000046-0000-0000-0000-000000000046', 'kevin.lee@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
=======
INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000029-0000-0000-0000-000000000029', 'sarah.williams@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000029-0000-0000-0000-000000000029', 'Sarah Williams', 'MATH2022002', 'Mathematics', '2022', '01712345029', 'Renting textbooks');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000030-0000-0000-0000-000000000030', 'mike.chen@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000030-0000-0000-0000-000000000030', 'Mike Chen', 'CSE2021005', 'Computer Science', '2021', '01712345030', 'Renting electronics');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000031-0000-0000-0000-000000000031', 'emma.johnson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000031-0000-0000-0000-000000000031', 'Emma Johnson', 'CHEM2023002', 'Chemistry', '2023', '01712345031', 'Renting chemistry books');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000032-0000-0000-0000-000000000032', 'alex.kumar@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000032-0000-0000-0000-000000000032', 'Alex Kumar', 'CSE2022002', 'Computer Science', '2022', '01712345032', 'Renting laptops');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000033-0000-0000-0000-000000000033', 'david.park@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000033-0000-0000-0000-000000000033', 'David Park', 'PHOTO2021001', 'Photography', '2021', '01712345033', 'Renting cameras');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000034-0000-0000-0000-000000000034', 'lisa.wang2@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000034-0000-0000-0000-000000000034', 'Lisa Wang', 'CSE2023002', 'Computer Science', '2023', '01712345034', 'Renting tablets');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000035-0000-0000-0000-000000000035', 'tom.anderson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000035-0000-0000-0000-000000000035', 'Tom Anderson', 'ENG2023001', 'Engineering', '2023', '01712345035', 'Renting projectors');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000036-0000-0000-0000-000000000036', 'jason.taylor@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000036-0000-0000-0000-000000000036', 'Jason Taylor', 'SPT2022002', 'Sports Science', '2022', '01712345036', 'Renting sports equipment');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000037-0000-0000-0000-000000000037', 'maria.rodriguez@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000037-0000-0000-0000-000000000037', 'Maria Rodriguez', 'PE2021002', 'Physical Education', '2021', '01712345037', 'Renting gym equipment');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000038-0000-0000-0000-000000000038', 'chris.taylor@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000038-0000-0000-0000-000000000038', 'Chris Taylor', 'MUS2022001', 'Music', '2022', '01712345038', 'Renting guitars');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000039-0000-0000-0000-000000000039', 'nina.patel@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000039-0000-0000-0000-000000000039', 'Nina Patel', 'MUS2023002', 'Music', '2023', '01712345039', 'Renting violins');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000040-0000-0000-0000-000000000040', 'mike.roberts@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000040-0000-0000-0000-000000000040', 'Mike Roberts', 'BUS2022003', 'Business', '2022', '01712345040', 'Renting furniture');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000041-0000-0000-0000-000000000041', 'sophie.brown@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000041-0000-0000-0000-000000000041', 'Sophie Brown', 'ART2023003', 'Arts', '2023', '01712345041', 'Renting desks');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000042-0000-0000-0000-000000000042', 'john.smith.jr@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000042-0000-0000-0000-000000000042', 'John Smith Jr', 'ENG2022005', 'Engineering', '2022', '01712345042', 'Renting tools');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000043-0000-0000-0000-000000000043', 'prof.oak@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000043-0000-0000-0000-000000000043', 'Professor Oak', 'SCI2020002', 'Science', '2020', '01712345043', 'Renting lab equipment');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000044-0000-0000-0000-000000000044', 'dr.singh@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000044-0000-0000-0000-000000000044', 'Dr. Singh', 'SCI2021002', 'Science', '2021', '01712345044', 'Renting microscopes');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000045-0000-0000-0000-000000000045', 'rachel.green@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000045-0000-0000-0000-000000000045', 'Rachel Green', 'MED2022001', 'Medicine', '2022', '01712345045', 'Renting medical equipment');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000046-0000-0000-0000-000000000046', 'kevin.lee@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000046-0000-0000-0000-000000000046', 'Kevin Lee', 'FAS2023001', 'Fashion', '2023', '01712345046', 'Looking for graduation attire');

-- =============================================
-- RENTAL TRANSACTION RENTERS (UUID 047-050)
-- For renthub transactions
-- =============================================

<<<<<<< HEAD
INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000047-0000-0000-0000-000000000047', 'jane.doe@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000047-0000-0000-0000-000000000047', 'Jane Doe', 'CSE2023003', 'Computer Science', '2023', '01712345047', 'Renting equipment for projects');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000048-0000-0000-0000-000000000048', 'bob.wilson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000048-0000-0000-0000-000000000048', 'Bob Wilson', 'MATH2023001', 'Mathematics', '2023', '01712345048', 'Need textbooks for semester');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000049-0000-0000-0000-000000000049', 'alice.cooper@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000049-0000-0000-0000-000000000049', 'Alice Cooper', 'CSE2022003', 'Computer Science', '2022', '01712345049', 'Looking for tech equipment');

INSERT INTO users (id, email, password_hash, roles, active_role, is_verified) VALUES
('00000050-0000-0000-0000-000000000050', 'mark.johnson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', ARRAY['STUDENT'], 'STUDENT', true);
=======
INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000047-0000-0000-0000-000000000047', 'jane.doe@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000047-0000-0000-0000-000000000047', 'Jane Doe', 'CSE2023003', 'Computer Science', '2023', '01712345047', 'Renting equipment for projects');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000048-0000-0000-0000-000000000048', 'bob.wilson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000048-0000-0000-0000-000000000048', 'Bob Wilson', 'MATH2023001', 'Mathematics', '2023', '01712345048', 'Need textbooks for semester');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000049-0000-0000-0000-000000000049', 'alice.cooper@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000049-0000-0000-0000-000000000049', 'Alice Cooper', 'CSE2022003', 'Computer Science', '2022', '01712345049', 'Looking for tech equipment');

INSERT INTO users (id, email, password_hash, role, is_verified) VALUES
('00000050-0000-0000-0000-000000000050', 'mark.johnson@uiu.edu', '$2b$10$KIXxLQH0qZ9sZJ3gFGj0KeQF.FJxQ5xZxQXzJZnZ7k0QZxZ7k0QZ', 'STUDENT', true);
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone, bio) VALUES
('00000050-0000-0000-0000-000000000050', 'Mark Johnson', 'PHOTO2022001', 'Photography', '2022', '01712345050', 'Need camera for assignments');

-- =============================================
-- VERIFICATION
-- =============================================

-- Check counts
SELECT 'Users' as table_name, COUNT(*) as count FROM users;
SELECT 'Profiles' as table_name, COUNT(*) as count FROM profiles;

-- Show sample data
SELECT u.id, u.email, u.role, p.full_name, p.department 
FROM users u 
JOIN profiles p ON u.id = p.user_id 
LIMIT 10;
<<<<<<< HEAD



=======
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
