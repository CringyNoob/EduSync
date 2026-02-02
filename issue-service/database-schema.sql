-- Issue Service Database Schema
-- Database: issue_db
-- Run this script to create the necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== ENUM TYPES ====================

-- Issue Category Enum
CREATE TYPE issue_category AS ENUM (
    'Maintenance',
    'IT/Network',
    'Cleaning',
    'Safety',
    'Other'
);

-- Issue Priority Enum
CREATE TYPE issue_priority AS ENUM (
    'Low',
    'Normal',
    'High',
    'Urgent'
);

-- Issue Status Enum
CREATE TYPE issue_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'RESOLVED'
);

-- Vote Type Enum
CREATE TYPE vote_type AS ENUM (
    'UP',
    'DOWN'
);

-- ==================== TABLES ====================

-- Issues Table
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    category issue_category NOT NULL DEFAULT 'Other',
    priority issue_priority NOT NULL DEFAULT 'Normal',
    description TEXT,
    image_url TEXT,
    status issue_status NOT NULL DEFAULT 'PENDING',
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    admin_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes Table
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    vote_type vote_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one vote per user per issue
    CONSTRAINT unique_user_issue_vote UNIQUE (issue_id, user_id)
);

-- ==================== INDEXES ====================

-- Index for faster lookups by status
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);

-- Index for faster lookups by reporter
CREATE INDEX IF NOT EXISTS idx_issues_reporter ON issues(reporter_id);

-- Index for faster lookups by category
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);

-- Index for faster lookups by priority
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);

-- Index for votes by issue
CREATE INDEX IF NOT EXISTS idx_votes_issue ON votes(issue_id);

-- Index for votes by user
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);

-- ==================== FUNCTIONS ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;
CREATE TRIGGER update_issues_updated_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================== SAMPLE DATA ====================

-- Insert sample issues (optional - comment out in production)
/*
INSERT INTO issues (reporter_id, title, location, category, priority, description, status, upvotes) VALUES
('00000001-0000-0000-0000-000000000001', 'Broken Projector in Room 301', 'Science Building, Room 301', 'Maintenance', 'High', 'The projector has been flickering and shutting off during lectures. Multiple instructors have reported this issue.', 'APPROVED', 15),
('00000002-0000-0000-0000-000000000002', 'WiFi Dead Zone in Library', 'Main Library, 2nd Floor', 'IT/Network', 'Urgent', 'There is absolutely no WiFi coverage in the quiet study area on the 2nd floor. Students cannot access online resources.', 'APPROVED', 42),
('00000003-0000-0000-0000-000000000003', 'Bathroom Needs Cleaning', 'Engineering Building, Ground Floor', 'Cleaning', 'Normal', 'The mens bathroom near the cafeteria entrance needs thorough cleaning. Soap dispensers are also empty.', 'PENDING', 0),
('00000004-0000-0000-0000-000000000004', 'Flickering Lights in Parking Lot', 'West Parking Lot', 'Safety', 'High', 'Several lights in the parking lot are flickering or completely off, making it unsafe to walk at night.', 'APPROVED', 28),
('00000005-0000-0000-0000-000000000005', 'Water Leak in Hallway', 'Dormitory Block B, 3rd Floor', 'Maintenance', 'Urgent', 'Water is leaking from the ceiling near room 312. The carpet is getting damaged and there is a slip hazard.', 'RESOLVED', 8);
*/
