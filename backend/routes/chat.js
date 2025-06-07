const express = require('express');
const router = express.Router();
const chatController = require('../controller/chat');
const { protect } = require('../middleware/auth'); // Assuming auth middleware is here

// POST /api/chat/room - Create a new chat room
// For now, only authenticated users can create rooms.
// Add admin check here if implemented: protect, adminCheck, chatController.createChatRoom
router.post('/room', protect, chatController.createChatRoom);

// POST /api/chat/join - Join a chat room
router.post('/join', protect, chatController.enterChatRoom);

// GET /api/chat/messages/:roomId - Get messages for a chat room
router.get('/messages/:roomId', protect, chatController.getChatMessages);

// POST /api/chat/messages/:roomId - Post a message to a chat room
router.post('/messages/:roomId', protect, chatController.postChatMessage);

module.exports = router;
