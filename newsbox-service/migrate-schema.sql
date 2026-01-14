-- =====================================================
-- NEWSBOX SERVICE - SCHEMA MIGRATION SCRIPT
-- Run this to update the existing database schema
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE CATEGORIES TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Index for category name lookup
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- =====================================================
-- 2. INSERT DEFAULT CATEGORIES
-- =====================================================
INSERT INTO categories (name) VALUES 
    ('Campus'),
    ('Sports'),
    ('Academics'),
    ('Career'),
    ('Lifestyle'),
    ('Tech'),
    ('Emergency'),
    ('Events'),
    ('Accommodation'),
    ('Job Posting'),
    ('Lost and Found'),
    ('Query'),
    ('General')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 3. ADD NEW COLUMNS TO POSTS TABLE
-- =====================================================

-- Add category_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE posts ADD COLUMN category_id UUID;
    END IF;
END $$;

-- Add is_official column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'is_official'
    ) THEN
        ALTER TABLE posts ADD COLUMN is_official BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add is_pinned column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'is_pinned'
    ) THEN
        ALTER TABLE posts ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'status'
    ) THEN
        ALTER TABLE posts ADD COLUMN status VARCHAR(20) DEFAULT 'APPROVED';
    END IF;
END $$;

-- Add updated_at column to posts if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE posts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 4. MIGRATE DATA FROM TAG TO CATEGORY_ID
-- =====================================================

-- First, create category mappings for existing tags
-- Map old tag values to category names
DO $$
DECLARE
    cat_id UUID;
    tag_name TEXT;
BEGIN
    -- For each unique tag in posts, ensure we have a corresponding category
    FOR tag_name IN 
        SELECT DISTINCT tag FROM posts WHERE tag IS NOT NULL
    LOOP
        -- Try to find or create the category
        SELECT id INTO cat_id FROM categories WHERE UPPER(name) = UPPER(REPLACE(tag_name, '_', ' '));
        
        IF cat_id IS NULL THEN
            -- Create a new category with the tag name (formatted)
            INSERT INTO categories (name) 
            VALUES (INITCAP(REPLACE(tag_name, '_', ' ')))
            ON CONFLICT (name) DO NOTHING
            RETURNING id INTO cat_id;
            
            -- If still null (conflict), get the existing one
            IF cat_id IS NULL THEN
                SELECT id INTO cat_id FROM categories WHERE UPPER(name) = UPPER(REPLACE(tag_name, '_', ' '));
            END IF;
        END IF;
        
        -- Update posts with this tag to use the category_id
        IF cat_id IS NOT NULL THEN
            UPDATE posts SET category_id = cat_id WHERE tag = tag_name AND category_id IS NULL;
        END IF;
    END LOOP;
END $$;

-- Set a default category for any posts without category_id
DO $$
DECLARE
    default_cat_id UUID;
BEGIN
    SELECT id INTO default_cat_id FROM categories WHERE name = 'General' LIMIT 1;
    
    IF default_cat_id IS NOT NULL THEN
        UPDATE posts SET category_id = default_cat_id WHERE category_id IS NULL;
    END IF;
END $$;

-- =====================================================
-- 5. CREATE INDEXES FOR NEW COLUMNS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(is_pinned) WHERE is_pinned = TRUE;

-- =====================================================
-- 6. VERIFICATION
-- =====================================================
-- Run these queries to verify the migration:
-- SELECT COUNT(*) FROM categories;
-- SELECT COUNT(*) FROM posts WHERE category_id IS NOT NULL;
-- SELECT DISTINCT status FROM posts;

SELECT 'Migration completed successfully!' AS message;
