const express = require('express');
const router = express.Router();
// const chatController = require('../controller/chat'); // Commented out
const { protect } = require('../middleware/auth'); // Assuming auth middleware is here

// POST /api/chat/room - Create a new chat room
// For now, only authenticated users can create rooms.
// Add admin check here if implemented: protect, adminCheck, chatController.createChatRoom

// POST /api/chat/join - Join a chat room (MOVED TO THE TOP OF ROUTE DEFINITIONS)
router.post('/join', require('../controller/chat').enterChatRoom);

// POST /api/chat/room - Create a new chat room
router.post('/room', require('../controller/chat').createChatRoom);

// GET /api/chat/messages/:roomId - Get messages for a chat room
router.get('/messages/:roomId', protect, require('../controller/chat').getChatMessages);

// POST /api/chat/messages/:roomId - Post a message to a chat room
router.post('/messages/:roomId', protect, require('../controller/chat').postChatMessage);

module.exports = router;
