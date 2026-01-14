-- =====================================================
-- NEWSBOX SERVICE DATABASE SCHEMA
-- Database: newsbox_db (Aiven PostgreSQL)
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CATEGORIES TABLE
-- Stores dynamic categories for posts
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for category name lookup
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- =====================================================
-- 2. POSTS TABLE
-- Stores all community posts
-- =====================================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
-- Index for sorting by date
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
-- Index for author lookup
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(is_pinned) WHERE is_pinned = TRUE;

-- =====================================================
-- 2. COMMENTS TABLE
-- Stores comments on posts
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fetching comments by post
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
-- Index for sorting comments by date
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at ASC);
-- Index for author lookup
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);

-- =====================================================
-- 3. POST_VOTES TABLE
-- Tracks votes on posts (upvote/downvote)
-- =====================================================
CREATE TABLE IF NOT EXISTS post_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('UP', 'DOWN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one vote per user per post
    CONSTRAINT unique_post_vote UNIQUE (user_id, post_id)
);

-- Index for checking existing votes
CREATE INDEX IF NOT EXISTS idx_post_votes_user_post ON post_votes(user_id, post_id);
-- Index for calculating vote counts
CREATE INDEX IF NOT EXISTS idx_post_votes_post ON post_votes(post_id);

-- =====================================================
-- 4. COMMENT_VOTES TABLE
-- Tracks votes on comments (upvote/downvote)
-- =====================================================
CREATE TABLE IF NOT EXISTS comment_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('UP', 'DOWN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one vote per user per comment
    CONSTRAINT unique_comment_vote UNIQUE (user_id, comment_id)
);

-- Index for checking existing votes
CREATE INDEX IF NOT EXISTS idx_comment_votes_user_comment ON comment_votes(user_id, comment_id);
-- Index for calculating vote counts
CREATE INDEX IF NOT EXISTS idx_comment_votes_comment ON comment_votes(comment_id);

-- =====================================================
-- HELPER VIEWS (Optional but useful)
-- =====================================================

-- View for posts with vote and comment counts
CREATE OR REPLACE VIEW posts_with_stats AS
SELECT 
    p.id,
    p.author_id,
    p.author_name,
    p.title,
    p.description,
    p.images,
    p.category_id,
    c.name AS category_name,
    p.is_official,
    p.is_pinned,
    p.status,
    p.created_at,
    COALESCE(
        (SELECT SUM(CASE WHEN vote_type = 'UP' THEN 1 ELSE -1 END) 
         FROM post_votes WHERE post_id = p.id), 
        0
    )::INTEGER AS vote_count,
    COALESCE(
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id), 
        0
    )::INTEGER AS comment_count
FROM posts p
JOIN categories c ON p.category_id = c.id;

-- View for comments with vote counts
CREATE OR REPLACE VIEW comments_with_stats AS
SELECT 
    c.id,
    c.post_id,
    c.author_id,
    c.author_name,
    c.content,
    c.created_at,
    COALESCE(
        (SELECT SUM(CASE WHEN vote_type = 'UP' THEN 1 ELSE -1 END) 
         FROM comment_votes WHERE comment_id = c.id), 
        0
    )::INTEGER AS vote_count
FROM comments c;

-- =====================================================
-- INSERT DEFAULT CATEGORIES
-- =====================================================
INSERT INTO categories (name) VALUES 
    ('Campus'),
    ('Sports'),
    ('Academics'),
    ('Career'),
    ('Lifestyle'),
    ('Tech'),
    ('Emergency'),
    ('Events')
ON CONFLICT (name) DO NOTHING;
