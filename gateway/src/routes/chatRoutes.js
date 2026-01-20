const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/rooms', chatController.getRooms);
router.get('/history/:roomId', chatController.getMessages);
router.post('/private', chatController.initiatePrivateChat);

module.exports = router;
