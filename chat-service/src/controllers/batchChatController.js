// src/controllers/batchChatController.js
// Controller for batch-based group chatrooms
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Get or create batch chatroom
 * POST /batch/join
 * 
 * Automatically joins user to their batch's chatroom.
 * Creates the chatroom if it doesn't exist.
 * 
 * Body: { batch: "Fall-2022" }
 */
async function joinBatchChatroom(req, res) {
    try {
        const userId = req.user?.id;
        const userName = req.user?.name || 'User';
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const { batch } = req.body;

        if (!batch || typeof batch !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Batch name is required'
            });
        }

        // Normalize batch name (e.g., "fall 2022" -> "Fall-2022")
        const normalizedBatch = normalizeBatchName(batch);

        // Check if batch chatroom exists
        let batchRoom = await db.query(
            `SELECT bc.*, c.id as conversation_id, c.last_message_at
             FROM batch_chatrooms bc
             JOIN conversations c ON bc.conversation_id = c.id
             WHERE bc.batch_name = $1`,
            [normalizedBatch]
        );

        let conversation;
        let isNewRoom = false;

        if (batchRoom.rows.length === 0) {
            // Create new batch chatroom
            isNewRoom = true;
            
            // First, create the conversation
            const convResult = await db.query(
                `INSERT INTO conversations (participants, context_type, title, status)
                 VALUES (ARRAY[$1]::uuid[], 'BATCH', $2, 'ACTIVE')
                 RETURNING id, participants, context_type, title, status, created_at`,
                [userId, normalizedBatch]
            );
            conversation = convResult.rows[0];

            // Then create the batch chatroom entry
            const roomResult = await db.query(
                `INSERT INTO batch_chatrooms (batch_name, conversation_id, description)
                 VALUES ($1, $2, $3)
                 RETURNING *`,
                [normalizedBatch, conversation.id, `${normalizedBatch} batch group chat`]
            );
            batchRoom = { rows: [{ ...roomResult.rows[0], conversation_id: conversation.id }] };

            // Add system message
            await db.query(
                `INSERT INTO messages (conversation_id, sender_id, content, message_type)
                 VALUES ($1, $2, $3, 'SYSTEM')`,
                [conversation.id, userId, `${normalizedBatch} batch chatroom created`]
            );
        } else {
            conversation = { 
                id: batchRoom.rows[0].conversation_id,
                last_message_at: batchRoom.rows[0].last_message_at
            };
        }

        // Check if user is already a member
        const memberCheck = await db.query(
            `SELECT id FROM batch_members 
             WHERE batch_chatroom_id = $1 AND user_id = $2`,
            [batchRoom.rows[0].id, userId]
        );

        let isNewMember = false;
        if (memberCheck.rows.length === 0) {
            // Add user as member
            await db.query(
                `INSERT INTO batch_members (batch_chatroom_id, user_id)
                 VALUES ($1, $2)`,
                [batchRoom.rows[0].id, userId]
            );

            // Add user to conversation participants
            await db.query(
                `UPDATE conversations 
                 SET participants = array_append(participants, $1::uuid)
                 WHERE id = $2 AND NOT ($1::uuid = ANY(participants))`,
                [userId, conversation.id]
            );

            // Add join message
            await db.query(
                `INSERT INTO messages (conversation_id, sender_id, content, message_type)
                 VALUES ($1, $2, $3, 'SYSTEM')`,
                [conversation.id, userId, `${userName} joined the batch`]
            );

            isNewMember = true;
        }

        // Get updated room info
        const updatedRoom = await db.query(
            `SELECT bc.*, c.participants, c.last_message_at, c.status
             FROM batch_chatrooms bc
             JOIN conversations c ON bc.conversation_id = c.id
             WHERE bc.id = $1`,
            [batchRoom.rows[0].id]
        );

        return res.status(isNewRoom ? 201 : 200).json({
            success: true,
            message: isNewMember ? 'Joined batch chatroom' : 'Already a member',
            batchChatroom: {
                id: updatedRoom.rows[0].id,
                batch_name: updatedRoom.rows[0].batch_name,
                conversation_id: updatedRoom.rows[0].conversation_id,
                member_count: updatedRoom.rows[0].member_count,
                description: updatedRoom.rows[0].description,
                last_message_at: updatedRoom.rows[0].last_message_at,
                created_at: updatedRoom.rows[0].created_at
            },
            isNewRoom,
            isNewMember
        });

    } catch (error) {
        console.error('Error joining batch chatroom:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to join batch chatroom'
        });
    }
}

/**
 * Get user's batch chatrooms
 * GET /batch/my-batches
 */
async function getMyBatchChatrooms(req, res) {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const result = await db.query(
            `SELECT 
                bc.id,
                bc.batch_name,
                bc.conversation_id,
                bc.member_count,
                bc.description,
                bc.created_at,
                c.last_message_at,
                c.status,
                bm.is_muted,
                bm.last_read_at,
                (SELECT COUNT(*) FROM messages m 
                 WHERE m.conversation_id = c.id 
                 AND m.created_at > COALESCE(bm.last_read_at, bm.joined_at)
                 AND m.sender_id != $1) as unread_count
             FROM batch_members bm
             JOIN batch_chatrooms bc ON bm.batch_chatroom_id = bc.id
             JOIN conversations c ON bc.conversation_id = c.id
             WHERE bm.user_id = $1
             ORDER BY c.last_message_at DESC NULLS LAST`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            batchChatrooms: result.rows
        });

    } catch (error) {
        console.error('Error fetching batch chatrooms:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch batch chatrooms'
        });
    }
}

/**
 * Get batch chatroom details with members
 * GET /batch/:batchId
 */
async function getBatchChatroom(req, res) {
    try {
        const userId = req.user?.id;
        const { batchId } = req.params;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Verify user is a member
        const memberCheck = await db.query(
            `SELECT bm.*, bc.batch_name, bc.conversation_id
             FROM batch_members bm
             JOIN batch_chatrooms bc ON bm.batch_chatroom_id = bc.id
             WHERE bc.id = $1 AND bm.user_id = $2`,
            [batchId, userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'You are not a member of this batch chatroom'
            });
        }

        // Get batch chatroom details
        const roomResult = await db.query(
            `SELECT bc.*, c.last_message_at, c.status, c.participants
             FROM batch_chatrooms bc
             JOIN conversations c ON bc.conversation_id = c.id
             WHERE bc.id = $1`,
            [batchId]
        );

        if (roomResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Batch chatroom not found'
            });
        }

        // Get members (limited to 50 for performance)
        const membersResult = await db.query(
            `SELECT bm.user_id, bm.joined_at, bm.is_muted
             FROM batch_members bm
             WHERE bm.batch_chatroom_id = $1
             ORDER BY bm.joined_at ASC
             LIMIT 50`,
            [batchId]
        );

        return res.status(200).json({
            success: true,
            batchChatroom: {
                ...roomResult.rows[0],
                members: membersResult.rows
            }
        });

    } catch (error) {
        console.error('Error fetching batch chatroom:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch batch chatroom'
        });
    }
}

/**
 * Send message to batch chatroom
 * POST /batch/:batchId/messages
 * 
 * Body: { content: "message text" }
 */
async function sendBatchMessage(req, res) {
    try {
        const userId = req.user?.id;
        const { batchId } = req.params;
        const { content } = req.body;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message content is required'
            });
        }

        // Verify user is a member and get conversation_id
        const memberCheck = await db.query(
            `SELECT bm.*, bc.conversation_id
             FROM batch_members bm
             JOIN batch_chatrooms bc ON bm.batch_chatroom_id = bc.id
             WHERE bc.id = $1 AND bm.user_id = $2`,
            [batchId, userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'You are not a member of this batch chatroom'
            });
        }

        const conversationId = memberCheck.rows[0].conversation_id;

        // Insert message
        const messageResult = await db.query(
            `INSERT INTO messages (conversation_id, sender_id, content, message_type)
             VALUES ($1, $2, $3, 'TEXT')
             RETURNING id, conversation_id, sender_id, content, message_type, created_at`,
            [conversationId, userId, content.trim()]
        );

        // Include sender name in response
        const message = {
            ...messageResult.rows[0],
            sender_name: req.user?.name || 'User'
        };

        return res.status(201).json({
            success: true,
            message
        });

    } catch (error) {
        console.error('Error sending batch message:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to send message'
        });
    }
}

/**
 * Get batch chatroom messages
 * GET /batch/:batchId/messages
 * 
 * Query params: limit, before (cursor-based pagination)
 */
async function getBatchMessages(req, res) {
    try {
        const userId = req.user?.id;
        const { batchId } = req.params;
        const { limit = 50, before } = req.query;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Verify user is a member
        const memberCheck = await db.query(
            `SELECT bm.*, bc.conversation_id
             FROM batch_members bm
             JOIN batch_chatrooms bc ON bm.batch_chatroom_id = bc.id
             WHERE bc.id = $1 AND bm.user_id = $2`,
            [batchId, userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'You are not a member of this batch chatroom'
            });
        }

        const conversationId = memberCheck.rows[0].conversation_id;
        const messageLimit = Math.min(parseInt(limit) || 50, 100);

        let messagesQuery;
        let queryParams;

        if (before) {
            messagesQuery = `
                SELECT id, conversation_id, sender_id, content, message_type, is_read, created_at
                FROM messages
                WHERE conversation_id = $1 AND created_at < $2
                ORDER BY created_at DESC
                LIMIT $3
            `;
            queryParams = [conversationId, before, messageLimit];
        } else {
            messagesQuery = `
                SELECT id, conversation_id, sender_id, content, message_type, is_read, created_at
                FROM messages
                WHERE conversation_id = $1
                ORDER BY created_at DESC
                LIMIT $2
            `;
            queryParams = [conversationId, messageLimit];
        }

        const messagesResult = await db.query(messagesQuery, queryParams);

        // Update last_read_at for this member
        await db.query(
            `UPDATE batch_members SET last_read_at = NOW()
             WHERE batch_chatroom_id = $1 AND user_id = $2`,
            [batchId, userId]
        );

        return res.status(200).json({
            success: true,
            count: messagesResult.rows.length,
            messages: messagesResult.rows.reverse() // Return in chronological order
        });

    } catch (error) {
        console.error('Error fetching batch messages:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch messages'
        });
    }
}

/**
 * Toggle mute for batch chatroom
 * PUT /batch/:batchId/mute
 */
async function toggleMute(req, res) {
    try {
        const userId = req.user?.id;
        const { batchId } = req.params;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const result = await db.query(
            `UPDATE batch_members 
             SET is_muted = NOT is_muted
             WHERE batch_chatroom_id = $1 AND user_id = $2
             RETURNING is_muted`,
            [batchId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Membership not found'
            });
        }

        return res.status(200).json({
            success: true,
            is_muted: result.rows[0].is_muted
        });

    } catch (error) {
        console.error('Error toggling mute:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to toggle mute'
        });
    }
}

/**
 * Leave batch chatroom
 * DELETE /batch/:batchId/leave
 */
async function leaveBatchChatroom(req, res) {
    try {
        const userId = req.user?.id;
        const userName = req.user?.name || 'User';
        const { batchId } = req.params;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Get conversation_id first
        const memberCheck = await db.query(
            `SELECT bm.*, bc.conversation_id
             FROM batch_members bm
             JOIN batch_chatrooms bc ON bm.batch_chatroom_id = bc.id
             WHERE bc.id = $1 AND bm.user_id = $2`,
            [batchId, userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'You are not a member of this batch chatroom'
            });
        }

        const conversationId = memberCheck.rows[0].conversation_id;

        // Remove member
        await db.query(
            `DELETE FROM batch_members WHERE batch_chatroom_id = $1 AND user_id = $2`,
            [batchId, userId]
        );

        // Remove from conversation participants
        await db.query(
            `UPDATE conversations 
             SET participants = array_remove(participants, $1::uuid)
             WHERE id = $2`,
            [userId, conversationId]
        );

        // Add leave message
        await db.query(
            `INSERT INTO messages (conversation_id, sender_id, content, message_type)
             VALUES ($1, $2, $3, 'SYSTEM')`,
            [conversationId, userId, `${userName} left the batch`]
        );

        return res.status(200).json({
            success: true,
            message: 'Left batch chatroom successfully'
        });

    } catch (error) {
        console.error('Error leaving batch chatroom:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to leave batch chatroom'
        });
    }
}

/**
 * Helper: Normalize batch name
 * Converts various formats to "Season-Year" format
 * Examples:
 * - "fall 2022" -> "Fall-2022"
 * - "SPRING-2023" -> "Spring-2023"
 * - "Fall-2022" -> "Fall-2022"
 */
function normalizeBatchName(batch) {
    // Remove extra spaces and trim
    let normalized = batch.trim().replace(/\s+/g, ' ');
    
    // Split by space or hyphen
    const parts = normalized.split(/[\s-]+/);
    
    if (parts.length >= 2) {
        // Capitalize first letter of season
        const season = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
        const year = parts[1];
        return `${season}-${year}`;
    }
    
    // If we can't parse it, just return capitalized version
    return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

module.exports = {
    joinBatchChatroom,
    getMyBatchChatrooms,
    getBatchChatroom,
    sendBatchMessage,
    getBatchMessages,
    toggleMute,
    leaveBatchChatroom
};
