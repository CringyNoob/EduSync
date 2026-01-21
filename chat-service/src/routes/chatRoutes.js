// src/routes/chatRoutes.js
// REST API Routes for Chat Service
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * All routes require authentication
 */

// Initiate or get existing conversation
// POST /api/chat/init
router.post('/init', authMiddleware, chatController.initiateChat);

// Get user's conversations list
// GET /api/chat/my-conversations
router.get('/my-conversations', authMiddleware, chatController.getMyConversations);

// Get single conversation details
// GET /api/chat/:conversationId
router.get('/:conversationId', authMiddleware, chatController.getConversation);

// Get conversation message history
// GET /api/chat/:conversationId/messages
router.get('/:conversationId/messages', authMiddleware, chatController.getHistory);

// Archive a conversation (make read-only)
// PUT /api/chat/:conversationId/archive
router.put('/:conversationId/archive', authMiddleware, chatController.archiveChat);

module.exports = router;
