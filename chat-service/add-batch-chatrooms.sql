-- =============================================
-- BATCH CHATROOMS MIGRATION
-- Database: chat_db
-- This adds support for batch-based group chatrooms
-- =============================================

-- 1. Add BATCH to context_type enum if not exists
DO $$ 
BEGIN
    -- Check if BATCH already exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'BATCH' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'context_type')
    ) THEN
        ALTER TYPE context_type ADD VALUE 'BATCH';
    END IF;
END $$;

-- 2. Create batch_chatrooms table
-- This stores batch-specific metadata for chatrooms
CREATE TABLE IF NOT EXISTS batch_chatrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Batch identifier (e.g., "Fall-2022", "Spring-2023")
    batch_name VARCHAR(50) UNIQUE NOT NULL,
    
    -- Reference to the conversation
    conversation_id UUID UNIQUE REFERENCES conversations(id) ON DELETE CASCADE,
    
    -- Metadata
    description TEXT DEFAULT 'Batch group chat',
    member_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast batch lookup
CREATE INDEX IF NOT EXISTS idx_batch_chatrooms_batch_name ON batch_chatrooms(batch_name);

-- 3. Create batch_members table to track members
CREATE TABLE IF NOT EXISTS batch_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign keys
    batch_chatroom_id UUID NOT NULL REFERENCES batch_chatrooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    
    -- Member metadata
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP WITH TIME ZONE,
    is_muted BOOLEAN DEFAULT FALSE,
    
    -- Unique constraint to prevent duplicate members
    UNIQUE(batch_chatroom_id, user_id)
);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_batch_members_user_id ON batch_members(user_id);
CREATE INDEX IF NOT EXISTS idx_batch_members_batch_chatroom ON batch_members(batch_chatroom_id);

-- 4. Update trigger for batch_chatrooms
DROP TRIGGER IF EXISTS update_batch_chatrooms_updated_at ON batch_chatrooms;
CREATE TRIGGER update_batch_chatrooms_updated_at
    BEFORE UPDATE ON batch_chatrooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Function to update member count
CREATE OR REPLACE FUNCTION update_batch_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE batch_chatrooms 
        SET member_count = member_count + 1
        WHERE id = NEW.batch_chatroom_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE batch_chatrooms 
        SET member_count = member_count - 1
        WHERE id = OLD.batch_chatroom_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_member_count_trigger ON batch_members;
CREATE TRIGGER update_member_count_trigger
    AFTER INSERT OR DELETE ON batch_members
    FOR EACH ROW
    EXECUTE FUNCTION update_batch_member_count();

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE batch_chatrooms IS 'Stores batch-specific group chatroom metadata';
COMMENT ON TABLE batch_members IS 'Tracks members of batch chatrooms';
COMMENT ON COLUMN batch_chatrooms.batch_name IS 'Format: Season-Year (e.g., Fall-2022, Spring-2023)';
COMMENT ON COLUMN batch_members.last_read_at IS 'Timestamp of last message read by user';

-- =============================================
-- VERIFICATION
-- =============================================
SELECT 
    'Batch Chatrooms Schema Added!' as status,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_name IN ('batch_chatrooms', 'batch_members')) as tables_created;
