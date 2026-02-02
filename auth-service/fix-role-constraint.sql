-- ============================================
-- Fix role CHECK constraint issue
-- Run this in your PostgreSQL database
-- ============================================

-- Step 1: Check what role values currently exist in the database
SELECT role, COUNT(*) 
FROM users 
GROUP BY role;

-- Step 2: Drop the existing check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 3: Update any NULL or invalid role values to 'student'
UPDATE users 
SET role = 'student' 
WHERE role IS NULL OR role NOT IN ('student', 'admin', 'moderator', 'faculty');

-- Step 4: Add a new check constraint with the correct role values
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('student', 'admin', 'moderator', 'faculty'));

-- Step 5: Verify the constraint was added successfully
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'users_role_check';
