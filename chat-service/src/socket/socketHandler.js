// src/socket/socketHandler.js
// Socket.io Handler for Real-time Chat
const db = require('../config/db');
const { socketAuthMiddleware } = require('../middleware/authMiddleware');

/**
 * Initialize Socket.io with authentication and event handlers
 * @param {Server} io - Socket.io server instance
 */
function initializeSocket(io) {
    // Apply authentication middleware to all socket connections
    io.use(socketAuthMiddleware);

    // Connection handler
    io.on('connection', (socket) => {
        const user = socket.user;
        console.log(`🔌 User connected: ${user.name || user.email} (${user.id})`);

        // Store user's socket id for potential direct messaging
        socket.userId = user.id;

        /**
         * Event: join_room
         * Join a conversation room (for receiving messages)
         * 
         * Input: { conversationId: UUID }
         * 
         * Security: Verify user is a participant before allowing join
         */
        socket.on('join_room', async (data) => {
            try {
                const { conversationId } = data;

                if (!conversationId) {
                    socket.emit('error', { 
                        type: 'INVALID_REQUEST',
                        message: 'conversationId is required' 
                    });
                    return;
                }

                // Verify user is a participant in this conversation
                const result = await db.query(
                    `SELECT id, status, participants, title 
                     FROM conversations 
                     WHERE id = $1 AND $2 = ANY(participants)`,
                    [conversationId, user.id]
                );

                if (result.rows.length === 0) {
                    socket.emit('error', { 
                        type: 'ACCESS_DENIED',
                        message: 'You are not a participant in this conversation' 
                    });
                    return;
                }

                const conversation = result.rows[0];

                // Join the room
                socket.join(conversationId);
                console.log(`📥 ${user.name || user.id} joined room: ${conversationId}`);

                // Notify the user of successful join
                socket.emit('room_joined', {
                    conversationId,
                    status: conversation.status,
                    title: conversation.title,
                    message: conversation.status === 'ARCHIVED' 
                        ? 'This conversation is archived (read-only)' 
                        : 'Joined successfully'
                });

                // Notify other participants that user is online
                socket.to(conversationId).emit('user_online', {
                    userId: user.id,
                    userName: user.name,
                    conversationId
                });

            } catch (error) {
                console.error('Error in join_room:', error);
                socket.emit('error', { 
                    type: 'SERVER_ERROR',
                    message: 'Failed to join room' 
                });
            }
        });

        /**
         * Event: leave_room
         * Leave a conversation room
         * 
         * Input: { conversationId: UUID }
         */
        socket.on('leave_room', (data) => {
            const { conversationId } = data;
            if (conversationId) {
                socket.leave(conversationId);
                console.log(`📤 ${user.name || user.id} left room: ${conversationId}`);
                
                // Notify other participants
                socket.to(conversationId).emit('user_offline', {
                    userId: user.id,
                    userName: user.name,
                    conversationId
                });
            }
        });

        /**
         * Event: send_message
         * Send a message to a conversation
         * 
         * Input: { conversationId: UUID, content: string }
         * 
         * CRITICAL LOGIC:
         * 1. Verify user is participant
         * 2. Check conversation status
         * 3. If ARCHIVED -> emit error, DO NOT save/send
         * 4. If ACTIVE -> save to DB, emit to room
         */
        socket.on('send_message', async (data) => {
            try {
                const { conversationId, content } = data;

                // Validate input
                if (!conversationId || !content || !content.trim()) {
                    socket.emit('error', { 
                        type: 'INVALID_REQUEST',
                        message: 'conversationId and content are required' 
                    });
                    return;
                }

                // Fetch conversation and verify participant
                const conversationResult = await db.query(
                    `SELECT id, status, participants, title 
                     FROM conversations 
                     WHERE id = $1 AND $2 = ANY(participants)`,
                    [conversationId, user.id]
                );

                if (conversationResult.rows.length === 0) {
                    socket.emit('error', { 
                        type: 'ACCESS_DENIED',
                        message: 'You are not a participant in this conversation' 
                    });
                    return;
                }

                const conversation = conversationResult.rows[0];

                // ⚠️ CRITICAL: Check if conversation is archived
                if (conversation.status === 'ARCHIVED') {
                    socket.emit('error', { 
                        type: 'CHAT_ARCHIVED',
                        message: 'This chat is closed. You cannot send messages.',
                        conversationId
                    });
                    return; // DO NOT save or send the message
                }

                // Save message to database
                const insertResult = await db.query(
                    `INSERT INTO messages (conversation_id, sender_id, content, message_type)
                     VALUES ($1, $2, $3, 'TEXT')
                     RETURNING id, sender_id, content, message_type, is_read, created_at`,
                    [conversationId, user.id, content.trim()]
                );

                const message = insertResult.rows[0];

                // Build message object for broadcast
                const broadcastMessage = {
                    id: message.id,
                    conversationId,
                    senderId: message.sender_id,
                    senderName: user.name,
                    senderEmail: user.email,
                    content: message.content,
                    messageType: message.message_type,
                    isRead: message.is_read,
                    createdAt: message.created_at
                };

                // Emit to all participants in the room (including sender)
                io.to(conversationId).emit('receive_message', broadcastMessage);

                console.log(`💬 Message sent in ${conversationId} by ${user.name || user.id}`);

            } catch (error) {
                console.error('Error in send_message:', error);
                socket.emit('error', { 
                    type: 'SERVER_ERROR',
                    message: 'Failed to send message' 
                });
            }
        });

        /**
         * Event: typing
         * Notify others that user is typing
         * 
         * Input: { conversationId: UUID, isTyping: boolean }
         */
        socket.on('typing', (data) => {
            const { conversationId, isTyping } = data;
            if (conversationId) {
                socket.to(conversationId).emit('user_typing', {
                    userId: user.id,
                    userName: user.name,
                    isTyping,
                    conversationId
                });
            }
        });

        /**
         * Event: mark_read
         * Mark messages as read
         * 
         * Input: { conversationId: UUID, messageIds?: UUID[] }
         */
        socket.on('mark_read', async (data) => {
            try {
                const { conversationId, messageIds } = data;

                if (!conversationId) return;

                // Mark messages as read (either specific ones or all from other users)
                if (messageIds && messageIds.length > 0) {
                    await db.query(
                        `UPDATE messages 
                         SET is_read = TRUE 
                         WHERE conversation_id = $1 
                           AND id = ANY($2) 
                           AND sender_id != $3`,
                        [conversationId, messageIds, user.id]
                    );
                } else {
                    await db.query(
                        `UPDATE messages 
                         SET is_read = TRUE 
                         WHERE conversation_id = $1 
                           AND sender_id != $2 
                           AND is_read = FALSE`,
                        [conversationId, user.id]
                    );
                }

                // Notify sender(s) that their messages were read
                socket.to(conversationId).emit('messages_read', {
                    conversationId,
                    readBy: user.id,
                    readByName: user.name
                });

            } catch (error) {
                console.error('Error in mark_read:', error);
            }
        });

        /**
         * Event: disconnect
         * Handle user disconnection
         */
        socket.on('disconnect', (reason) => {
            console.log(`🔌 User disconnected: ${user.name || user.email} (${reason})`);
        });
    });

    console.log('✅ Socket.io handler initialized');
}

module.exports = { initializeSocket };
