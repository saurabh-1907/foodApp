import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ChatMessageItem from './ChatMessageItem'; // Assuming ChatMessageItem is created

const ChatInterface = ({ roomId, roomName, userToken }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [errorMessages, setErrorMessages] = useState('');
    const [currentUser, setCurrentUser] = useState(null); // To store decoded user info
    const messagesEndRef = useRef(null); // For auto-scrolling

    // Function to decode JWT token (basic implementation)
    const decodeToken = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            console.error('Failed to decode token:', e);
            return null;
        }
    };

    useEffect(() => {
        if (userToken) {
            const decodedUser = decodeToken(userToken);
            setCurrentUser(decodedUser);
        }
    }, [userToken]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);


    const fetchMessages = async () => {
        setIsLoadingMessages(true);
        setErrorMessages('');
        try {
            const response = await axios.get(
                `https://foodapp-7hu3.onrender.com/api/chat/messages/${roomId}`,
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            setMessages(response.data || []);
        } catch (err) {
            setErrorMessages(err.response?.data?.message || "Failed to fetch messages.");
            console.error("Fetch messages error:", err);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    useEffect(() => {
        if (roomId) {
            fetchMessages(); // Initial fetch

            // Optional: Set up polling for new messages
            const intervalId = setInterval(fetchMessages, 5000); // Poll every 5 seconds

            return () => clearInterval(intervalId); // Cleanup on component unmount
        }
    }, [roomId, userToken]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await axios.post(
                `https://foodapp-7hu3.onrender.com/api/chat/messages/${roomId}`,
                { message: newMessage },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );
            // Add the new message to the state immediately for better UX
            // Or rely on the next poll to fetch it
            setMessages(prevMessages => [...prevMessages, response.data]);
            setNewMessage('');
        } catch (err) {
            setErrorMessages(err.response?.data?.message || "Failed to send message.");
            console.error("Send message error:", err);
        }
    };

    return (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', height: '70vh', marginTop:'10px' }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                Chat Room: {roomName || 'General'}
            </h3>
            {isLoadingMessages && <p>Loading messages...</p>}
            {errorMessages && <p style={{ color: 'red' }}>{errorMessages}</p>}
            <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '10px', paddingRight:'10px' }}>
                {messages.length > 0 ? (
                    messages.map((msg) => (
                        <ChatMessageItem key={msg._id} message={msg} currentUserId={currentUser?.id} />
                    ))
                ) : (
                    <p>No messages yet. Start the conversation!</p>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} style={{ display: 'flex' }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    style={{ flexGrow: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <button type="submit" style={{ padding: '10px 15px', marginLeft: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;
