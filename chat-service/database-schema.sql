-- =============================================
-- CHAT SERVICE DATABASE SCHEMA
-- Database: chat_db
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CONVERSATION STATUS ENUM
-- =============================================
DO $$ BEGIN
    CREATE TYPE conversation_status AS ENUM ('ACTIVE', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- 2. CONTEXT TYPE ENUM
-- =============================================
DO $$ BEGIN
    CREATE TYPE context_type AS ENUM ('PRODUCT', 'ORDER', 'RENTAL', 'PREOWNED', 'GENERAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- 3. CONVERSATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Participants (array of user UUIDs)
    participants UUID[] NOT NULL,
    
    -- Context linking (what this chat is about)
    context_type context_type NOT NULL DEFAULT 'GENERAL',
    context_id UUID,  -- Can be product_id, order_id, rental_id, etc.
    
    -- Status for archival system
    status conversation_status NOT NULL DEFAULT 'ACTIVE',
    
    -- Metadata
    title VARCHAR(255),  -- Optional title (e.g., product name)
    last_message_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast participant lookup
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participants);

-- Index for context lookup
CREATE INDEX IF NOT EXISTS idx_conversations_context ON conversations(context_type, context_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);

-- =============================================
-- 4. MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign key to conversation
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    
    -- Sender info
    sender_id UUID NOT NULL,
    
    -- Message content
    content TEXT NOT NULL,
    
    -- Message metadata
    message_type VARCHAR(20) DEFAULT 'TEXT',  -- TEXT, IMAGE, SYSTEM
    is_read BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fetching messages by conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Index for ordering messages by time
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(conversation_id, created_at DESC);

-- Index for unread messages
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, is_read) WHERE is_read = FALSE;

-- =============================================
-- 5. UPDATE TRIGGER FOR updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. FUNCTION TO UPDATE last_message_at
-- =============================================
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_last_message_trigger ON messages;
CREATE TRIGGER update_last_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE conversations IS 'Chat conversations between users, linked to specific contexts';
COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON COLUMN conversations.participants IS 'Array of user UUIDs who are part of this conversation';
COMMENT ON COLUMN conversations.context_type IS 'Type of entity this chat is about (PRODUCT, ORDER, etc.)';
COMMENT ON COLUMN conversations.context_id IS 'ID of the related entity (product_id, order_id, etc.)';
COMMENT ON COLUMN conversations.status IS 'ACTIVE = can send messages, ARCHIVED = read-only';

-- =============================================
-- VERIFICATION
-- =============================================
SELECT 
    'Chat DB Schema Created Successfully!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('conversations', 'messages')) as tables_created;
