// src/routes/batchChatRoutes.js
// REST API Routes for Batch Chatrooms
const express = require('express');
const router = express.Router();
const batchChatController = require('../controllers/batchChatController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * All routes require authentication
 */

// Join or create batch chatroom
// POST /batch/join
router.post('/join', authMiddleware, batchChatController.joinBatchChatroom);

// Get user's batch chatrooms
// GET /batch/my-batches
router.get('/my-batches', authMiddleware, batchChatController.getMyBatchChatrooms);

// Get batch chatroom details
// GET /batch/:batchId
router.get('/:batchId', authMiddleware, batchChatController.getBatchChatroom);

// Send message to batch chatroom
// POST /batch/:batchId/messages
router.post('/:batchId/messages', authMiddleware, batchChatController.sendBatchMessage);

// Get batch chatroom messages
// GET /batch/:batchId/messages
router.get('/:batchId/messages', authMiddleware, batchChatController.getBatchMessages);

// Toggle mute for batch chatroom
// PUT /batch/:batchId/mute
router.put('/:batchId/mute', authMiddleware, batchChatController.toggleMute);

// Leave batch chatroom
// DELETE /batch/:batchId/leave
router.delete('/:batchId/leave', authMiddleware, batchChatController.leaveBatchChatroom);

module.exports = router;
