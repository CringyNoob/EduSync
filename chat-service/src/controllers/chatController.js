// src/controllers/chatController.js
// REST API Controller for Chat Service
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Initiate or get existing chat
 * POST /init
 * 
 * Creates a new conversation or returns existing one for the same participants + context
 * 
 * Body: {
 *   targetUserId: UUID,      // The user to chat with
 *   contextType: 'PRODUCT' | 'ORDER' | 'RENTAL' | 'PREOWNED' | 'GENERAL',
 *   contextId: UUID,         // Optional - ID of related entity
 *   title: string            // Optional - Chat title (e.g., product name)
 * }
 */
async function initiateChat(req, res) {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { targetUserId, contextType = 'GENERAL', contextId = null, title = null } = req.body;

        if (!targetUserId) {
            return res.status(400).json({
                success: false,
                error: 'targetUserId is required'
            });
        }

        // Prevent chatting with yourself
        if (targetUserId === userId) {
            return res.status(400).json({
                success: false,
                error: 'Cannot start a chat with yourself'
            });
        }

        // Sort participants for consistent lookup (smaller UUID first)
        const participants = [userId, targetUserId].sort();

        // Check if an ACTIVE conversation already exists for these participants + context
        const existingQuery = `
            SELECT id, participants, context_type, context_id, status, title, 
                   last_message_at, created_at
            FROM conversations
            WHERE participants @> $1::uuid[]
              AND participants <@ $1::uuid[]
              AND context_type = $2
              AND ($3::uuid IS NULL OR context_id = $3)
              AND status = 'ACTIVE'
            LIMIT 1
        `;
        
        const existingResult = await db.query(existingQuery, [
            participants,
            contextType,
            contextId
        ]);

        if (existingResult.rows.length > 0) {
            // Return existing conversation
            return res.status(200).json({
                success: true,
                message: 'Existing conversation found',
                conversation: existingResult.rows[0],
                isNew: false
            });
        }

        // Create new conversation
        const createQuery = `
            INSERT INTO conversations (participants, context_type, context_id, title, status)
            VALUES ($1, $2, $3, $4, 'ACTIVE')
            RETURNING id, participants, context_type, context_id, status, title, created_at
        `;

        const createResult = await db.query(createQuery, [
            participants,
            contextType,
            contextId,
            title
        ]);

        const newConversation = createResult.rows[0];

        // Create a system message to indicate chat started
        const systemMessageQuery = `
            INSERT INTO messages (conversation_id, sender_id, content, message_type)
            VALUES ($1, $2, $3, 'SYSTEM')
        `;
        await db.query(systemMessageQuery, [
            newConversation.id,
            userId,
            'Conversation started'
        ]);

        return res.status(201).json({
            success: true,
            message: 'New conversation created',
            conversation: newConversation,
            isNew: true
        });

    } catch (error) {
        console.error('Error in initiateChat:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to initiate chat'
        });
    }
}

/**
 * Get conversation history
 * GET /:conversationId/messages
 * 
 * Query params:
 *   - limit: number (default 50)
 *   - before: timestamp (for pagination)
 */
async function getHistory(req, res) {
    try {
        const userId = req.user?.id;
        const { conversationId } = req.params;
        const { limit = 50, before } = req.query;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Verify user is a participant
        const participantCheck = await db.query(
            `SELECT id, status, participants, title, context_type, context_id 
             FROM conversations 
             WHERE id = $1 AND $2 = ANY(participants)`,
            [conversationId, userId]
        );

        if (participantCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'You are not a participant in this conversation'
            });
        }

        const conversation = participantCheck.rows[0];

        // Build messages query with pagination
        let messagesQuery = `
            SELECT id, sender_id, content, message_type, is_read, created_at
            FROM messages
            WHERE conversation_id = $1
        `;
        const params = [conversationId];

        if (before) {
            messagesQuery += ` AND created_at < $2`;
            params.push(before);
        }

        messagesQuery += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
        params.push(parseInt(limit));

        const messagesResult = await db.query(messagesQuery, params);

        // Mark messages as read for this user
        await db.query(
            `UPDATE messages 
             SET is_read = TRUE 
             WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE`,
            [conversationId, userId]
        );

        return res.status(200).json({
            success: true,
            conversation: {
                id: conversation.id,
                status: conversation.status,
                title: conversation.title,
                contextType: conversation.context_type,
                contextId: conversation.context_id
            },
            messages: messagesResult.rows.reverse(), // Oldest first
            count: messagesResult.rows.length,
            hasMore: messagesResult.rows.length === parseInt(limit)
        });

    } catch (error) {
        console.error('Error in getHistory:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch chat history'
        });
    }
}

/**
 * Archive a conversation (make it read-only)
 * PUT /:conversationId/archive
 * 
 * Called when a deal is completed (order delivered, etc.)
 */
async function archiveChat(req, res) {
    try {
        const userId = req.user?.id;
        const { conversationId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Verify conversation exists and user is a participant
        const conversationCheck = await db.query(
            `SELECT id, status, participants 
             FROM conversations 
             WHERE id = $1 AND $2 = ANY(participants)`,
            [conversationId, userId]
        );

        if (conversationCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Conversation not found or access denied'
            });
        }

        if (conversationCheck.rows[0].status === 'ARCHIVED') {
            return res.status(400).json({
                success: false,
                error: 'Conversation is already archived'
            });
        }

        // Archive the conversation
        const archiveResult = await db.query(
            `UPDATE conversations 
             SET status = 'ARCHIVED', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING id, status, updated_at`,
            [conversationId]
        );

        // Add system message about archival
        await db.query(
            `INSERT INTO messages (conversation_id, sender_id, content, message_type)
             VALUES ($1, $2, 'This conversation has been archived and is now read-only.', 'SYSTEM')`,
            [conversationId, userId]
        );

        return res.status(200).json({
            success: true,
            message: 'Conversation archived successfully',
            conversation: archiveResult.rows[0]
        });

    } catch (error) {
        console.error('Error in archiveChat:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to archive conversation'
        });
    }
}

/**
 * Get all conversations for the current user
 * GET /my-conversations
 */
async function getMyConversations(req, res) {
    try {
        const userId = req.user?.id;
        const { status = 'ACTIVE' } = req.query;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const query = `
            SELECT 
                c.id, 
                c.participants, 
                c.context_type, 
                c.context_id, 
                c.status, 
                c.title,
                c.last_message_at,
                c.created_at,
                (
                    SELECT json_build_object(
                        'content', m.content,
                        'sender_id', m.sender_id,
                        'created_at', m.created_at,
                        'message_type', m.message_type
                    )
                    FROM messages m 
                    WHERE m.conversation_id = c.id 
                    ORDER BY m.created_at DESC 
                    LIMIT 1
                ) as last_message,
                (
                    SELECT COUNT(*) 
                    FROM messages m 
                    WHERE m.conversation_id = c.id 
                      AND m.sender_id != $1 
                      AND m.is_read = FALSE
                ) as unread_count
            FROM conversations c
            WHERE $1 = ANY(c.participants)
              AND ($2 = 'ALL' OR c.status = $2::conversation_status)
            ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
        `;

        const result = await db.query(query, [userId, status]);

        return res.status(200).json({
            success: true,
            conversations: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Error in getMyConversations:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch conversations'
        });
    }
}

/**
 * Get single conversation details
 * GET /:conversationId
 */
async function getConversation(req, res) {
    try {
        const userId = req.user?.id;
        const { conversationId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const query = `
            SELECT 
                c.id, 
                c.participants, 
                c.context_type, 
                c.context_id, 
                c.status, 
                c.title,
                c.last_message_at,
                c.created_at,
                c.updated_at
            FROM conversations c
            WHERE c.id = $1 AND $2 = ANY(c.participants)
        `;

        const result = await db.query(query, [conversationId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Conversation not found or access denied'
            });
        }

        return res.status(200).json({
            success: true,
            conversation: result.rows[0]
        });

    } catch (error) {
        console.error('Error in getConversation:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch conversation'
        });
    }
}

module.exports = {
    initiateChat,
    getHistory,
    archiveChat,
    getMyConversations,
    getConversation
};
