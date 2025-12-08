-- EDUSYNC DATABASE SCHEMA - OPTIMIZED
-- PostgreSQL 14+
-- Chat handled by Firebase (excluded from schema)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy search

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TYPE user_role AS ENUM ('student', 'vendor', 'moderator', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'banned');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile Info
    student_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    
    -- Academic Info
    department VARCHAR(100) NOT NULL,
    batch VARCHAR(20) NOT NULL, -- e.g., "2023"
    year INTEGER NOT NULL, -- 1, 2, 3, 4
    semester VARCHAR(20), -- Spring, Summer, Fall
    program VARCHAR(50), -- BSc, MSc, etc.
    
    -- Profile
    profile_photo VARCHAR(500),
    cover_photo VARCHAR(500),
    bio TEXT,
    location VARCHAR(100), -- Campus building/area
    
    -- Verification
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_expires_at TIMESTAMP,
    
    -- Status & Role
    role user_role DEFAULT 'student',
    status user_status DEFAULT 'pending',
    
    -- Reputation System
    trust_score DECIMAL(3,2) DEFAULT 5.00, -- Out of 5
    total_ratings INTEGER DEFAULT 0,
    successful_transactions INTEGER DEFAULT 0,
    
    -- Security
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP,
    
    -- Tracking
    last_login_at TIMESTAMP,
    last_active_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Soft Delete
    deleted_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_trust_score CHECK (trust_score >= 0 AND trust_score <= 5),
    CONSTRAINT chk_year CHECK (year >= 1 AND year <= 7)
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) UNIQUE NOT NULL,
    device_info JSONB, -- {device, browser, os, ip}
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_token VARCHAR(500) UNIQUE NOT NULL, -- FCM token
    device_type VARCHAR(20), -- ios, android, web
    device_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light', -- light, dark, auto
    language VARCHAR(10) DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    newsletter_subscribed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MARKETPLACE
-- ============================================

CREATE TYPE product_category AS ENUM (
    'startup_business',
    'food_vendor',
    'books',
    'electronics',
    'furniture',
    'clothing',
    'sports',
    'stationery',
    'other'
);

CREATE TYPE product_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');
CREATE TYPE product_status AS ENUM ('draft', 'active', 'sold', 'archived', 'removed');

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic Info
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category product_category NOT NULL,
    subcategory VARCHAR(100),
    
    -- Pricing
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2), -- For showing discount
    is_negotiable BOOLEAN DEFAULT FALSE,
    
    -- Product Details
    condition product_condition,
    brand VARCHAR(100),
    tags TEXT[], -- Array of tags
    
    -- Food-Specific Fields
    is_food_item BOOLEAN DEFAULT FALSE,
    preparation_time INTEGER, -- in minutes
    dietary_info TEXT[], -- ['vegetarian', 'vegan', 'halal']
    ingredients TEXT[],
    
    -- Media
    images TEXT[] NOT NULL, -- Array of image URLs
    video_url VARCHAR(500),
    
    -- Location
    pickup_location VARCHAR(200) NOT NULL,
    delivery_available BOOLEAN DEFAULT FALSE,
    delivery_fee DECIMAL(10,2),
    
    -- Status
    status product_status DEFAULT 'active',
    
    -- Engagement
    views INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    
    -- Auto-expiry
    expires_at TIMESTAMP,
    
    -- Tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sold_at TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_price CHECK (price >= 0),
    CONSTRAINT chk_images CHECK (array_length(images, 1) >= 1 AND array_length(images, 1) <= 5)
);

CREATE TABLE product_saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

CREATE TABLE product_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100) -- For anonymous tracking
);

-- ============================================
-- RENTALS (RENTHUB)
-- ============================================

CREATE TYPE rental_category AS ENUM (
    'electronics',
    'formal_wear',
    'sports_equipment',
    'academic_tools',
    'event_supplies',
    'musical_instruments',
    'photography',
    'camping',
    'other'
);

CREATE TYPE rental_status AS ENUM ('available', 'unavailable', 'archived');

CREATE TABLE rentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Item Info
    item_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category rental_category NOT NULL,
    
    -- Rental Terms
    daily_rate DECIMAL(10,2) NOT NULL,
    hourly_rate DECIMAL(10,2), -- Optional
    weekly_rate DECIMAL(10,2), -- Optional discount
    security_deposit DECIMAL(10,2) NOT NULL,
    
    -- Rules & Conditions
    min_rental_days INTEGER DEFAULT 1,
    max_rental_days INTEGER DEFAULT 30,
    condition product_condition NOT NULL,
    terms_and_conditions TEXT NOT NULL,
    cancellation_policy TEXT,
    
    -- Media
    images TEXT[] NOT NULL,
    video_url VARCHAR(500),
    
    -- Location
    pickup_location VARCHAR(200) NOT NULL,
    
    -- Status
    status rental_status DEFAULT 'available',
    is_available BOOLEAN DEFAULT TRUE,
    
    -- Stats
    total_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    
    -- Tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT chk_rates CHECK (daily_rate > 0 AND security_deposit >= 0),
    CONSTRAINT chk_rental_days CHECK (min_rental_days >= 1 AND max_rental_days >= min_rental_days)
);

CREATE TYPE booking_status AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'active',
    'completed',
    'cancelled',
    'disputed'
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    renter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Booking Details
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rental_days INTEGER NOT NULL,
    
    -- Pricing
    daily_rate DECIMAL(10,2) NOT NULL, -- Locked at booking time
    subtotal DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2) NOT NULL,
    late_fee DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) NOT NULL,
    
    -- Deposit Management
    deposit_paid BOOLEAN DEFAULT FALSE,
    deposit_paid_at TIMESTAMP,
    deposit_released BOOLEAN DEFAULT FALSE,
    deposit_released_at TIMESTAMP,
    deposit_deducted DECIMAL(10,2) DEFAULT 0,
    deduction_reason TEXT,
    
    -- Status
    status booking_status DEFAULT 'pending',
    
    -- Pickup & Return
    pickup_scheduled_at TIMESTAMP,
    picked_up_at TIMESTAMP,
    pickup_verified BOOLEAN DEFAULT FALSE,
    
    return_scheduled_at TIMESTAMP,
    returned_at TIMESTAMP,
    return_verified BOOLEAN DEFAULT FALSE,
    
    -- QR Codes for verification
    pickup_qr_code VARCHAR(100) UNIQUE,
    return_qr_code VARCHAR(100) UNIQUE,
    
    -- Notes
    renter_notes TEXT,
    owner_notes TEXT,
    cancellation_reason TEXT,
    
    -- Tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    CONSTRAINT chk_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_costs CHECK (subtotal >= 0 AND total_cost >= 0)
);

CREATE TABLE rental_unavailability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(100), -- 'booked', 'maintenance', 'personal'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_unavail_dates CHECK (end_date >= start_date)
);

-- ============================================
-- FORUMS (NEWSBOX)
-- ============================================

CREATE TYPE forum_category AS ENUM (
    'accommodation',
    'tutoring',
    'jobs',
    'lost_and_found',
    'general'
);

CREATE TYPE post_status AS ENUM ('active', 'resolved', 'archived', 'removed');

CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Post Content
    category forum_category NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    tags TEXT[],
    
    -- Specific Fields
    location VARCHAR(200), -- For accommodation
    budget_min DECIMAL(10,2), -- For accommodation/jobs
    budget_max DECIMAL(10,2),
    contact_preference VARCHAR(50), -- 'chat', 'email', 'phone'
    
    -- Privacy
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- Status
    status post_status DEFAULT 'active',
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    
    -- Engagement
    views INTEGER DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    -- Tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE forum_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE, -- For nested replies
    
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE forum_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL, -- 'upvote', 'downvote'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_vote_target CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    ),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id)
);

-- ============================================
-- NOTICES (NOTICEBOARD)
-- ============================================

CREATE TYPE notice_category AS ENUM (
    'exam',
    'scholarship',
    'event',
    'administrative',
    'academic',
    'emergency',
    'general'
);

CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Source
    source_url VARCHAR(500) UNIQUE NOT NULL,
    source_hash VARCHAR(64) UNIQUE, -- MD5 hash to detect duplicates
    
    -- Content
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category notice_category NOT NULL,
    urgency urgency_level DEFAULT 'medium',
    
    -- Targeting
    departments TEXT[], -- Empty means all departments
    batches TEXT[], -- Empty means all batches
    programs TEXT[], -- BSc, MSc, etc.
    
    -- Dates
    published_date DATE,
    expires_at TIMESTAMP,
    
    -- Engagement
    views INTEGER DEFAULT 0,
    bookmarks INTEGER DEFAULT 0,
    
    -- Scraper Info
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_pushed BOOLEAN DEFAULT FALSE, -- Push notification sent
    pushed_at TIMESTAMP,
    
    -- Tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notice_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notice_id)
);

CREATE TABLE notice_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notice_id)
);

-- ============================================
-- ISSUES (CAMPUS INFRASTRUCTURE REPORTING)
-- Purpose: Report physical campus problems
-- Examples: Broken lights, WiFi down, dirty areas
-- Goes to: Campus authorities/maintenance
-- ============================================

CREATE TYPE issue_category AS ENUM (
    'infrastructure',
    'utilities',
    'security',
    'sanitation',
    'other'
);

CREATE TYPE issue_severity AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE issue_status AS ENUM (
    'reported',
    'under_review',
    'assigned',
    'in_progress',
    'resolved',
    'closed',
    'rejected'
);

CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Issue Details
    category issue_category NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity issue_severity DEFAULT 'medium',
    
    -- Location
    building VARCHAR(100),
    floor VARCHAR(50),
    room_number VARCHAR(50),
    specific_location VARCHAR(200),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Media
    photos TEXT[],
    
    -- Privacy
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- Status & Assignment
    status issue_status DEFAULT 'reported',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP,
    department VARCHAR(100), -- Maintenance, Security, IT, etc.
    
    -- Engagement (Public visibility)
    upvotes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    
    -- Resolution
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP,
    
    -- Tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP
);

CREATE TABLE issue_upvotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(issue_id, user_id)
);

CREATE TABLE issue_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    content TEXT NOT NULL,
    is_official BOOLEAN DEFAULT FALSE, -- From admin/assigned person
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE issue_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    old_status issue_status,
    new_status issue_status NOT NULL,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REPORTS (CONTENT & USER MODERATION)
-- Purpose: Report inappropriate content/users
-- Examples: Fake listings, spam, harassment, fraud
-- Goes to: Moderators/Admins
-- ============================================

CREATE TYPE report_type AS ENUM (
    'product',
    'user',
    'post',
    'comment',
    'rental',
    'issue'
);

CREATE TYPE report_reason AS ENUM (
    'spam',
    'fraud',
    'inappropriate',
    'harassment',
    'fake',
    'duplicate',
    'offensive',
    'scam',
    'other'
);

CREATE TYPE report_status AS ENUM ('pending', 'reviewing', 'resolved', 'dismissed');

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- What's reported (Private - only mods see this)
    type report_type NOT NULL,
    target_id UUID NOT NULL, -- ID of the reported entity
    target_owner_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Owner of reported content
    
    -- Report Details
    reason report_reason NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[], -- Screenshots, links
    
    -- Status
    status report_status DEFAULT 'pending',
    priority INTEGER DEFAULT 0, -- Higher = more urgent
    
    -- Resolution
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    resolution_notes TEXT,
    action_taken VARCHAR(100), -- 'warning_sent', 'content_removed', 'user_suspended', 'dismissed'
    
    -- Tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_id),
    CONSTRAINT chk_not_self_block CHECK (blocker_id != blocked_id)
);

-- ============================================
-- RATINGS & REVIEWS
-- ============================================

CREATE TYPE rating_type AS ENUM ('seller', 'renter', 'rental');

CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- What's being rated
    type rating_type NOT NULL,
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- For seller/renter
    target_rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE, -- For rental items
    
    -- Who's rating
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Related Transaction
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    
    -- Rating
    rating INTEGER NOT NULL, -- 1-5
    review TEXT,
    
    -- Response
    response TEXT, -- Owner's response
    response_at TIMESTAMP,
    
    -- Tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT chk_rating_target CHECK (
        (target_user_id IS NOT NULL AND target_rental_id IS NULL) OR
        (target_user_id IS NULL AND target_rental_id IS NOT NULL)
    )
);

-- ============================================
-- NOTIFICATIONS
-- Includes notice reminders via JSONB data field
-- ============================================

CREATE TYPE notification_type AS ENUM (
    'product_inquiry',
    'product_sold',
    'booking_request',
    'booking_accepted',
    'booking_rejected',
    'rental_reminder',
    'rental_overdue',
    'post_comment',
    'post_resolved',
    'notice_urgent',
    'notice_reminder', -- Notice reminders stored here
    'issue_update',
    'rating_received',
    'report_update',
    'system'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Link
    action_url VARCHAR(500),
    related_id UUID, -- ID of related entity (product, booking, notice, etc.)
    
    -- Metadata (includes reminder_at for notice_reminder type)
    -- Example: {"remind_at": "2025-12-15T10:00:00Z", "methods": ["push", "email"]}
    data JSONB,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_pushed BOOLEAN DEFAULT FALSE, -- Push notification sent
    pushed_at TIMESTAMP,
    
    -- Tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- ============================================
-- ANALYTICS & LOGS
-- ============================================

CREATE TABLE user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    action VARCHAR(100) NOT NULL, -- 'product_view', 'booking_created', etc.
    entity_type VARCHAR(50), -- 'product', 'rental', 'post', etc.
    entity_id UUID,
    
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    search_query TEXT NOT NULL,
    search_type VARCHAR(50), -- 'product', 'rental', 'post', 'notice'
    filters JSONB,
    results_count INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_batch ON users(batch);
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role);

-- Products
CREATE INDEX idx_products_seller ON products(seller_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category ON products(category) WHERE status = 'active';
CREATE INDEX idx_products_status ON products(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_created ON products(created_at DESC);
CREATE INDEX idx_products_price ON products(price) WHERE status = 'active';
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_products_tags ON products USING gin(tags);

-- Rentals
CREATE INDEX idx_rentals_owner ON rentals(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_rentals_category ON rentals(category) WHERE status = 'available';
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_available ON rentals(is_available) WHERE deleted_at IS NULL;

-- Bookings
CREATE INDEX idx_bookings_rental ON bookings(rental_id);
CREATE INDEX idx_bookings_renter ON bookings(renter_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_return ON bookings(return_scheduled_at) WHERE status = 'active';

-- Forums
CREATE INDEX idx_forum_posts_category ON forum_posts(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX idx_forum_posts_created ON forum_posts(created_at DESC);
CREATE INDEX idx_forum_posts_resolved ON forum_posts(is_resolved);
CREATE INDEX idx_forum_posts_search ON forum_posts USING gin(to_tsvector('english', title || ' ' || body));
CREATE INDEX idx_forum_comments_post ON forum_comments(post_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_forum_comments_parent ON forum_comments(parent_comment_id);

-- Notices
CREATE INDEX idx_notices_category ON notices(category);
CREATE INDEX idx_notices_urgency ON notices(urgency);
CREATE INDEX idx_notices_scraped ON notices(scraped_at DESC);
CREATE INDEX idx_notices_departments ON notices USING gin(departments);
CREATE INDEX idx_notices_batches ON notices USING gin(batches);
CREATE INDEX idx_notices_expires ON notices(expires_at) WHERE expires_at IS NOT NULL;

-- Issues
CREATE INDEX idx_issues_category ON issues(category);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_severity ON issues(severity);
CREATE INDEX idx_issues_reporter ON issues(reporter_id);
CREATE INDEX idx_issues_assigned ON issues(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_issues_created ON issues(created_at DESC);
CREATE INDEX idx_issues_department ON issues(department);

-- Reports
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_target ON reports(target_id, type);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_reviewed ON reports(reviewed_by);
CREATE INDEX idx_reports_priority ON reports(priority DESC) WHERE status = 'pending';

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_reminder ON notifications((data->>'remind_at')) 
    WHERE type = 'notice_reminder' AND is_pushed = FALSE;

-- Ratings
CREATE INDEX idx_ratings_target_user ON ratings(target_user_id);
CREATE INDEX idx_ratings_target_rental ON ratings(target_rental_id);
CREATE INDEX idx_ratings_reviewer ON ratings(reviewer_id);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON rentals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_comments_updated_at BEFORE UPDATE ON forum_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER update_issue_comments_updated_at BEFORE UPDATE ON issue_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MISSING TRIGGERS (Completing the schema)
-- ============================================

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
