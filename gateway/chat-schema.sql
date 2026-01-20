-- Chat System Schema

-- 1. Chat Rooms (Groups or Private pairings)
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255), -- Nullable for private chats
    type VARCHAR(50) NOT NULL DEFAULT 'private', -- 'private', 'group', 'public'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Participants (Who is in which room)
CREATE TABLE IF NOT EXISTS chat_participants (
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID, -- References users.id (but we might not enforce FK if in diff DB, but here same DB so we can)
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, user_id)
);

-- 3. Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID, -- References users.id
    sender_name VARCHAR(255), -- Cached name to avoid joins across services
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data: General Lounge
INSERT INTO chat_rooms (id, name, type) 
VALUES ('00000000-0000-0000-0000-000000000001', 'General Lounge', 'public')
ON CONFLICT (id) DO NOTHING;
