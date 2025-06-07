const express = require('express');
const router = express.Router();
const chatController = require('../controller/chat'); // Single import
const { protect } = require('../middleware/auth');

// Route order: /join then /room
// enterChatRoom is the simple sync version, no protect
router.post('/join', chatController.enterChatRoom);

// createChatRoom, no protect
router.post('/room', chatController.createChatRoom);

// getChatMessages, with protect (This is line 14 or around it)
router.get('/messages/:roomId', protect, chatController.getChatMessages);

// postChatMessage, with protect
router.post('/messages/:roomId', protect, chatController.postChatMessage);

module.exports = router;
