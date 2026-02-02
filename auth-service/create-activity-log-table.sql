-- Create activity_logs table for tracking admin and system activities
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    action_type VARCHAR(50) NOT NULL, -- 'USER_REGISTERED', 'USER_BLOCKED', 'VENDOR_APPROVED', 'ISSUE_RESOLVED', etc.
    entity_type VARCHAR(50), -- 'USER', 'VENDOR', 'ISSUE', 'POST', etc.
    entity_id VARCHAR(255),
    description TEXT NOT NULL,
    metadata JSONB, -- Additional data (before/after values, etc.)
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);

-- Sample data for testing (using NULL for system activities)
INSERT INTO activity_logs (user_id, user_name, user_email, action_type, entity_type, description, created_at) VALUES
(NULL, 'System', 'system@uiu.ac.bd', 'USER_REGISTERED', 'USER', 'New user registered: john.doe@uiu.ac.bd', NOW() - INTERVAL '2 hours'),
(NULL, 'Admin User', 'admin@uiu.ac.bd', 'VENDOR_APPROVED', 'VENDOR', 'Vendor "Tech Hub" approved', NOW() - INTERVAL '5 hours'),
(NULL, 'Admin User', 'admin@uiu.ac.bd', 'ISSUE_RESOLVED', 'ISSUE', 'Issue #123 resolved: Cafeteria timing', NOW() - INTERVAL '1 day'),
(NULL, 'System', 'system@uiu.ac.bd', 'USER_REGISTERED', 'USER', 'New user registered: sarah.ahmed@uiu.ac.bd', NOW() - INTERVAL '3 hours'),
(NULL, 'Admin User', 'admin@uiu.ac.bd', 'POST_PUBLISHED', 'POST', 'New announcement published: Exam Schedule', NOW() - INTERVAL '6 hours');
