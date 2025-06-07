const mongoose = require('mongoose');

const groupMembershipSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

groupMembershipSchema.index({ groupId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('GroupMembership', groupMembershipSchema);
