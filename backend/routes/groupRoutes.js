const express = require('express');
const router = express.Router();
const groupController = require('../controller/groupController');
const verifyToken = require('../middleware/auth'); // Assuming this middleware handles JWT auth and adds req.user

// Create a new group (user must be authenticated)
// req.body should contain recipeId, optionally description
router.post('/', verifyToken, groupController.createGroup);

// Join a group (user must be authenticated)
router.post('/:groupId/join', verifyToken, groupController.joinGroup);

// Leave a group (user must be authenticated)
router.post('/:groupId/leave', verifyToken, groupController.leaveGroup);

// Get all groups for a specific recipe (publicly accessible or add verifyToken if needed)
router.get('/recipe/:recipeId', groupController.getGroupsForRecipe);

// Get details of a specific group, including members (publicly accessible or add verifyToken if needed)
router.get('/:groupId', groupController.getGroupDetails);

// Import chat message routes
const chatMessageRouter = require('./chatMessageRoutes');
// Use chat message routes for paths like /api/groups/:groupId/messages
router.use('/:groupId/messages', chatMessageRouter);

module.exports = router;
