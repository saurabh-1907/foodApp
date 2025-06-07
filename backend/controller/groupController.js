const Group = require('../models/group');
const GroupMembership = require('../models/groupMembership');
const Recipes = require('../models/recipe'); // Changed from Recipe to Recipes
const User = require('../models/user');

// Create a new group for a recipe
exports.createGroup = async (req, res) => {
    try {
        const { recipeId, description } = req.body;
        const userId = req.user.id; // From verifyToken middleware

        const recipe = await Recipes.findById(recipeId); // Changed from Recipe to Recipes
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const groupName = `${recipe.title} Eaters`;

        // Optional: Check if a group with this name for this recipe already exists
        const existingGroup = await Group.findOne({ name: groupName, recipeId: recipeId });
        if (existingGroup) {
            return res.status(409).json({ message: 'Group already exists for this recipe under that name', group: existingGroup });
        }

        const group = new Group({
            recipeId,
            name: groupName,
            description,
            createdBy: userId,
        });
        await group.save();

        // Automatically add the creator as a member
        const membership = new GroupMembership({
            groupId: group._id,
            userId: userId,
        });
        await membership.save();

        res.status(201).json({ group, membership });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: 'Error creating group', error: error.message });
    }
};

// Join a group
exports.joinGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if already a member (though unique index handles DB level)
        const existingMembership = await GroupMembership.findOne({ groupId, userId });
        if (existingMembership) {
            return res.status(409).json({ message: 'User is already a member of this group' });
        }

        const membership = new GroupMembership({ groupId, userId });
        await membership.save();
        res.status(201).json({ message: 'Successfully joined group', membership });
    } catch (error) {
        console.error("Error joining group:", error);
        // Handle unique index violation gracefully (error.code === 11000)
        if (error.code === 11000) {
            return res.status(409).json({ message: 'User is already a member of this group (database constraint).' });
        }
        res.status(500).json({ message: 'Error joining group', error: error.message });
    }
};

// Leave a group
exports.leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const result = await GroupMembership.findOneAndDelete({ groupId, userId });
        if (!result) {
            return res.status(404).json({ message: 'Membership not found or user not in group' });
        }
        res.status(200).json({ message: 'Successfully left group' });
    } catch (error) {
        console.error("Error leaving group:", error);
        res.status(500).json({ message: 'Error leaving group', error: error.message });
    }
};

// Get all groups for a specific recipe
exports.getGroupsForRecipe = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const groups = await Group.find({ recipeId });
        // It's not an error if no groups are found, just an empty array.
        // So, removing the 404 check for !groups.
        res.status(200).json(groups);
    } catch (error) {
        console.error("Error fetching groups for recipe:", error);
        res.status(500).json({ message: 'Error fetching groups for recipe', error: error.message });
    }
};

// Get details of a specific group, including members
exports.getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const members = await GroupMembership.find({ groupId }).populate('userId', 'name email'); // Populate user details
        res.status(200).json({ group, members });
    } catch (error) {
        console.error("Error fetching group details:", error);
        res.status(500).json({ message: 'Error fetching group details', error: error.message });
    }
};
