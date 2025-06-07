const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
    },
    userId: { // Sender of the message
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    messageContent: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
