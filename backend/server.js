const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const connectDb = require("./config/connectionDb");
const cors = require("cors");

// Import http and socket.io
const http = require('http');
const { Server } = require("socket.io");

// Import models and JWT
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const GroupMembership = require('./models/groupMembership');
const ChatMessage = require('./models/chatMessage');
// Ensure process.env.JWT_SECRET is available, dotenv should have loaded it.

const PORT = process.env.PORT || 3000;
connectDb();

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust for production: e.g., "http://localhost:3001" or your frontend URL
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
app.use(cors()); // Standard CORS for Express routes
app.use(express.static("public"));

// Import group routes
const groupRoutes = require('./routes/groupRoutes');

app.use("/", require("./routes/user"));
app.use("/recipe", require("./routes/recipe"));
// Add group routes
app.use('/api/groups', groupRoutes);

// Socket.IO connection logic
io.on('connection', (socket) => {
    console.log('A user connected with socket ID:', socket.id);
    socket.isAuthenticated = false; // Custom flag to track authentication status

    socket.on('authenticate', (data) => {
        if (!data || !data.token) {
            return socket.emit('authError', { message: 'Authentication token not provided' });
        }
        try {
            const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
            socket.userId = decoded.id; // Assuming JWT payload has 'id'
            socket.isAuthenticated = true;
            console.log(`User ${socket.userId} authenticated for socket ${socket.id}`);
            socket.emit('authenticated', { userId: socket.userId, message: 'Authentication successful' });
        } catch (err) {
            console.error('Socket authentication error:', err.message);
            socket.emit('authError', { message: 'Invalid token' });
            // Consider disconnecting: socket.disconnect(true);
        }
    });

    socket.on('joinRoom', async (data) => {
        if (!socket.isAuthenticated) {
            return socket.emit('unauthorized', { message: 'Please authenticate first.' });
        }
        if (!data || !data.groupId) {
            return socket.emit('roomJoinError', { message: 'groupId is required.' });
        }

        try {
            const { groupId } = data;
            const membership = await GroupMembership.findOne({ groupId, userId: socket.userId });

            if (membership) {
                socket.join(groupId);
                console.log(`User ${socket.userId} joined room ${groupId}`);
                socket.emit('roomJoined', { groupId, success: true });

                // Optional: Notify others in the room
                const user = await User.findById(socket.userId).select('name');
                socket.to(groupId).emit('userJoinedNotification', {
                    userId: socket.userId,
                    userName: user ? user.name : 'A user',
                    groupId
                });
            } else {
                socket.emit('roomJoinError', { groupId, message: 'You are not a member of this group or the group does not exist.' });
            }
        } catch (error) {
            console.error(`Error joining room ${data.groupId} for user ${socket.userId}:`, error);
            socket.emit('roomJoinError', { groupId: data.groupId, message: 'Server error while trying to join room.' });
        }
    });

    socket.on('chatMessage', async (msg) => {
        if (!socket.isAuthenticated) {
            return socket.emit('unauthorized', { message: 'Please authenticate first.' });
        }
        if (!msg || !msg.groupId || !msg.messageContent || msg.messageContent.trim() === '') {
            return socket.emit('messageError', { message: 'Message content and groupId are required.' });
        }

        try {
            const { groupId, messageContent } = msg;

            // Verify membership (important for security)
            const membership = await GroupMembership.findOne({ groupId, userId: socket.userId });
            if (!membership) {
                return socket.emit('messageError', { message: 'You are not a member of this group.' });
            }

            // Verify socket is in the room (additional check)
            if (!socket.rooms.has(groupId)) {
                // Attempt to join them if they are a member but socket isn't in room (e.g. after a quick reconnect)
                // However, this might indicate a flow issue on client, so log it.
                console.warn(`User ${socket.userId} sent message to room ${groupId} but was not in socket room. Verifying membership...`);
                 // Re-check membership and join if valid, otherwise error
                if (membership) { // Already fetched above
                    socket.join(groupId);
                     console.log(`User ${socket.userId} auto-rejoined room ${groupId} on message send.`);
                } else {
                    return socket.emit('messageError', { message: 'Not authorized for this room.' });
                }
            }

            const chatMessageInstance = new ChatMessage({
                groupId,
                userId: socket.userId,
                messageContent: messageContent.trim(),
            });
            await chatMessageInstance.save();

            // Populate sender details for broadcasting
            await chatMessageInstance.populate('userId', 'name email');

            io.to(groupId).emit('newChatMessage', chatMessageInstance);
            console.log(`Message from ${socket.userId} in room ${groupId}: ${messageContent.trim()}`);
        } catch (error) {
            console.error(`Error handling chat message from user ${socket.userId}:`, error);
            socket.emit('messageError', { message: 'Server error while sending message.' });
        }
    });

    socket.on('disconnect', () => {
        console.log(`User ${socket.userId || socket.id} disconnected`);
        // Optional: Iterate through socket.rooms and emit 'userLeftNotification' if needed
        // For example, if you store which rooms the user explicitly joined via 'joinRoom':
        // socket.rooms.forEach(room => {
        //   if(room !== socket.id) { // socket.id is a default room for the socket itself
        //     io.to(room).emit('userLeftNotification', { userId: socket.userId, userName: 'A user', groupId: room });
        //   }
        // });
    });
});

// Start the server using the http server instance
server.listen(PORT, (err) => {
    if (err) {
        console.error("Failed to start server:", err);
        return;
    }
    console.log(`Server with Socket.IO is listening on port ${PORT}`);
});