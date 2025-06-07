const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    recipeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipes', // Assuming your recipe model is named 'Recipes'
        required: true,
    },
    name: { // e.g., "Spaghetti Carbonara Eaters"
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    createdBy: { // User who initiated group creation (optional, could be system)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

// groupSchema.index({ recipeId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Group', groupSchema);
