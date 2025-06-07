const ChatRoom = require('../models/chatRoom');
const ChatMessage = require('../models/chatMessage');
const User = require('../models/user'); // Assuming User model is in user.js
const crypto = require('crypto');

// Create a new chat room
const createChatRoom = async (req, res) => {
    try {
        // Assuming req.user is populated by authentication middleware
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const token = crypto.randomBytes(16).toString('hex');
        const newRoom = new ChatRoom({
            name: req.body.name, // Optional name from request body
            token: token,
            adminUser: req.user.id
        });

        const savedRoom = await newRoom.save();
        res.status(201).json(savedRoom);
    } catch (error) {
        res.status(500).json({ message: 'Error creating chat room', error: error.message });
    }
};

// Join a chat room
const enterChatRoom = async (req, res) => { // Renamed
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        const room = await ChatRoom.findOne({ token: token });
        if (!room) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        res.status(200).json({ message: 'Successfully joined chat room', room });
    } catch (error) {
        res.status(500).json({ message: 'Error joining chat room', error: error.message });
    }
};

// Get chat messages for a room
const getChatMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        if (!roomId) {
            return res.status(400).json({ message: 'Room ID is required' });
        }

        const messages = await ChatMessage.find({ roomId: roomId })
            .populate('userId', 'name') // Populate user's name, adjust fields as needed
            .sort({ timestamp: 'asc' }); // Sort by timestamp

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};

// Post a new chat message
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
        // Populate user details for the response, similar to getChatMessages
        const populatedMessage = await ChatMessage.findById(savedMessage._id).populate('userId', 'name');

        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: 'Error posting message', error: error.message });
    }
};

module.exports = {
    createChatRoom,
    enterChatRoom, // Renamed
    getChatMessages,
    postChatMessage
};
