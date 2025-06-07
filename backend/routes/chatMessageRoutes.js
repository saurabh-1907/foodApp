const express = require('express');
// Important: Set mergeParams to true to access :groupId from parent router
const router = express.Router({ mergeParams: true });
const chatMessageController = require('../controller/chatMessageController');
const verifyToken = require('../middleware/auth');

// Post a new message to a group (user must be authenticated and a member)
router.post('/', verifyToken, chatMessageController.postMessage);

// Get all messages for a specific group (user must be authenticated and a member)
router.get('/', verifyToken, chatMessageController.getMessagesForGroup);

module.exports = router;
