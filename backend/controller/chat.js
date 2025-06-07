const ChatRoom = require('../models/chatRoom');
const ChatMessage = require('../models/chatMessage');
const FoodBlogUser = require("../models/user");
const crypto = require('crypto');

const GENERAL_ROOM_ID = "GENERAL_CHAT_ROOM_001";

// Create a new chat room (Async)
const createChatRoom = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const token = crypto.randomBytes(16).toString('hex');
        const newRoom = new ChatRoom({
            name: req.body.name,
            token: token,
            adminUser: req.user.id
        });
        const savedRoom = await newRoom.save();
        res.status(201).json(savedRoom);
    } catch (error) {
        res.status(500).json({ message: 'Error creating chat room', error: error.message });
    }
};

// enterChatRoom (Simplified Synchronous version for testing)
const enterChatRoom = (req, res) => {
    console.log("enterChatRoom CALLED (synchronous test)");
    const { token } = req.body;
    if (!token) {
        res.status(400).json({ message: 'Token is required (synchronous test)' });
        return;
    }
    res.status(200).json({ message: 'Successfully hit enterChatRoom (synchronous test)', receivedToken: token });
};

// Get chat messages for a room (Async)
const getChatMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        if (!roomId) {
            return res.status(400).json({ message: 'Room ID is required' });
        }
        const messages = await ChatMessage.find({ roomId: roomId })
            .populate('userId', 'name')
            .sort({ timestamp: 'asc' });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};

// Post a new chat message (Async)
const postChatMessage = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { message } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (!roomId || !message) {
            return res.status(400).json({ message: 'Room ID and message are required' });
        }
        const newMessage = new ChatMessage({
            roomId: roomId,
            userId: req.user.id,
            message: message
        });
        const savedMessage = await newMessage.save();
        const populatedMessage = await ChatMessage.findById(savedMessage._id).populate('userId', 'name');
        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: 'Error posting message', error: error.message });
    }
};

module.exports = {
    createChatRoom,
    enterChatRoom,   // Simple sync version
    getChatMessages,
    postChatMessage
};
