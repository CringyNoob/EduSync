-- ============================================
-- Database Schema for auth_db (Vertical Partitioning)
-- Run this in your Aiven PostgreSQL console
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table 1: users (Authentication Only)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));

-- Add comment to table
COMMENT ON TABLE users IS 'Stores user authentication data only (vertical partitioning)';

-- ============================================
-- Table 2: profiles (User Profile Data)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    batch VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    bio TEXT,
    avatar_url TEXT,
    email_visible BOOLEAN DEFAULT TRUE,
    phone_visible BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department);

-- Add comment to table
COMMENT ON TABLE profiles IS 'Stores user profile data (vertical partitioning)';

-- ============================================
-- Trigger to update updated_at automatically
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Migration Script (if upgrading from old schema)
-- ============================================
-- Run this only if you have existing data to migrate:
/*
-- Step 1: Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Step 2: Copy password to password_hash
UPDATE users SET password_hash = password WHERE password_hash IS NULL;

-- Step 3: Create profiles from existing user data
INSERT INTO profiles (user_id, full_name, student_id, department, batch)
SELECT id, name, CONCAT('0', id), department, batch
FROM users
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = users.id);

-- Step 4: Drop old columns (CAREFUL - backup first!)
-- ALTER TABLE users DROP COLUMN IF EXISTS name;
-- ALTER TABLE users DROP COLUMN IF EXISTS password;
-- ALTER TABLE users DROP COLUMN IF EXISTS department;
-- ALTER TABLE users DROP COLUMN IF EXISTS batch;
*/
