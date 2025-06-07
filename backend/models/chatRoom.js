const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    adminUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodBlogUser',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;
