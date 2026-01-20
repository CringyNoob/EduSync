const db = require('../config/db');

const chatController = {
    // Get all rooms for a user (or public rooms)
    getRooms: async (req, res) => {
        try {
            // For now, return the General Lounge + any private rooms
            // Ideally, fetch based on 'chat_participants'
            // Using a simple query for demo
            const query = `
                SELECT * FROM chat_rooms 
                WHERE type = 'public' 
                OR id IN (SELECT room_id FROM chat_participants WHERE user_id = $1)
            `;
            // Using a dummy UUID for 'guest' if we don't have auth middleware on gateway (we assume user connects with ID)
            // But Gateway is just a proxy usually. We need to handle this.
            // For MVP: Return all public rooms + hardcoded list
            const result = await db.query("SELECT * FROM chat_rooms WHERE type = 'public'");
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    },

    // Get messages for a specific room
    getMessages: async (req, res) => {
        const { roomId } = req.params;
        try {
            const result = await db.query(
                "SELECT * FROM chat_messages WHERE room_id = $1 ORDER BY created_at ASC LIMIT 100",
                [roomId]
            );
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    },

    // Save a message
    saveMessage: async (roomId, senderId, senderName, content) => {
        try {
            const result = await db.query(
                "INSERT INTO chat_messages (room_id, sender_id, sender_name, content) VALUES ($1, $2, $3, $4) RETURNING *",
                [roomId, senderId, senderName, content]
            );
            return result.rows[0];
        } catch (err) {
            console.error("Error saving message:", err);
            return null;
        }
    },

    // Initiate Private Chat (Create or Get existing)
    initiatePrivateChat: async (req, res) => {
        const { targetUserId, targetUserName } = req.body;
        // In a real app, we'd get currentUserId from req.user (middleware)
        // For this demo, we'll accept it in body or header, or just use a mock if not present
        const currentUserId = req.headers['x-user-id'] || '00000000-0000-0000-0000-000000000000'; // Fallback

        try {
            // 1. Check if a private room already exists between these two
            const checkQuery = `
                SELECT r.* FROM chat_rooms r
                JOIN chat_participants p1 ON r.id = p1.room_id
                JOIN chat_participants p2 ON r.id = p2.room_id
                WHERE r.type = 'private' 
                AND p1.user_id = $1 
                AND p2.user_id = $2
            `;
            const existingRoom = await db.query(checkQuery, [currentUserId, targetUserId]);

            if (existingRoom.rows.length > 0) {
                return res.json(existingRoom.rows[0]);
            }

            // 2. If not, create new room
            // We use the target user's name as the room name for the current user's perspective (simplified)
            const roomResult = await db.query(
                "INSERT INTO chat_rooms (name, type) VALUES ($1, 'private') RETURNING *",
                [targetUserName || 'Private Chat']
            );
            const roomId = roomResult.rows[0].id;

            // 3. Add participants
            await db.query(
                "INSERT INTO chat_participants (room_id, user_id) VALUES ($1, $2), ($1, $3)",
                [roomId, currentUserId, targetUserId]
            );

            res.json(roomResult.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to initiate chat' });
        }
    }
};

module.exports = chatController;
