const ChatMessage = require('../models/chatMessage');
const GroupMembership = require('../models/groupMembership');
const Group = require('../models/group'); // For checking group existence

// Post a new message to a group
exports.postMessage = async (req, res) => {
    try {
        const { groupId } = req.params; // Assuming this is available from a nested route
        const userId = req.user.id; // From verifyToken middleware
        const { messageContent } = req.body;

        if (!messageContent || messageContent.trim() === '') {
            return res.status(400).json({ message: 'Message content cannot be empty' });
        }

        // Check if the group exists
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Verify that the user is a member of the group
        const membership = await GroupMembership.findOne({ groupId, userId });
        if (!membership) {
            return res.status(403).json({ message: 'User is not a member of this group and cannot post messages' });
        }

        const chatMessage = new ChatMessage({
            groupId,
            userId,
            messageContent,
        });
        await chatMessage.save();

        // Populate user details for the sent message response
        await chatMessage.populate('userId', 'name email');

        res.status(201).json(chatMessage);
    } catch (error) {
        console.error('Error posting message:', error);
        res.status(500).json({ message: 'Error posting message', error: error.message });
    }
};

// Get all messages for a specific group (with pagination)
exports.getMessagesForGroup = async (req, res) => {
    try {
        const { groupId } = req.params; // Assuming this is available from a nested route
        const userId = req.user.id; // For authorization check

        // Optional: Check if group exists (though if no messages, it implies it might not or is empty)
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Optional: Verify that the user is a member of the group to view messages
        // Depending on privacy model, this might not be needed if chats are public to non-members
        const membership = await GroupMembership.findOne({ groupId, userId });
        if (!membership) {
             return res.status(403).json({ message: 'User is not a member of this group and cannot view messages' });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20; // Default to 20 messages per page
        const skip = (page - 1) * limit;

        const messages = await ChatMessage.find({ groupId })
            .populate('userId', 'name email') // Populate sender's name and email
            .sort({ createdAt: -1 }) // Get newest messages first
            .skip(skip)
            .limit(limit);

        const totalMessages = await ChatMessage.countDocuments({ groupId });
        const totalPages = Math.ceil(totalMessages / limit);

        res.status(200).json({
            messages: messages.reverse(), // Reverse to show oldest first in the current batch for typical chat UI
            currentPage: page,
            totalPages,
            totalMessages,
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};
