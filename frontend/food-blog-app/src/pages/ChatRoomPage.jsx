import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroupDetails, getMessagesForGroup, postMessage } from '../services/api';
// import './ChatRoomPage.css'; // Optional: for component-specific styles

const ChatRoomPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [groupDetails, setGroupDetails] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null); // For auto-scrolling

    // Attempt to get current user from localStorage. Ensure this matches how user info is stored.
    let currentUser = null;
    try {
        const userString = localStorage.getItem('user');
        if (userString) {
            currentUser = JSON.parse(userString); // Should have { _id, name, email }
        }
    } catch (e) {
        console.error("Error parsing user from localStorage", e);
        // Handle error or set currentUser to null
    }


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Fetch group details and initial messages
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) { // Removed currentUser check here, token is primary for API auth
                setError("You must be logged in to view chat.");
                setIsLoading(false);
                return;
            }
            if (!currentUser || !currentUser._id) { // Check for currentUser._id after token check
                setError("User information not found. Please log in again.");
                setIsLoading(false);
                return;
            }

            try {
                const groupData = await getGroupDetails(groupId, token);
                setGroupDetails(groupData.group);

                // Backend API for getMessagesForGroup already checks membership.
                // If the user is not a member, that API call will fail with 403.
                // So, an explicit frontend membership check before fetching messages might be redundant
                // if the getMessagesForGroup API call itself is protected.
                // However, keeping a simple check here for UI purposes or early exit:
                const isMember = groupData.members.some(member => member.userId._id === currentUser._id);
                if (!isMember && groupData.group.createdBy !== currentUser._id) {
                    setError("You are not a member of this group.");
                    setIsLoading(false);
                    return;
                }

                const messagesData = await getMessagesForGroup(groupId, token, 1, 50);
                setMessages(messagesData.messages || []);
            } catch (err) {
                console.error("Error fetching chat room data:", err);
                setError(err.response?.data?.message || "Failed to load chat room. You might not be a member or the group doesn't exist.");
            } finally {
                setIsLoading(false);
            }
        };

        if (groupId) { // Ensure groupId is present before fetching
            fetchData();
        }
    }, [groupId, currentUser?._id]);

    useEffect(scrollToBottom, [messages]);


    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in to send messages.");
            return;
        }
        setSending(true);
        try {
            // API expects an object like { messageContent: "actual message" }
            const sentMessage = await postMessage(groupId, { messageContent: newMessage }, token);
            // This is an optimistic update. In a Socket.IO setup, we'd receive this from the server.
            setMessages(prevMessages => [...prevMessages, sentMessage]);
            setNewMessage('');
        } catch (err) {
            console.error("Error sending message:", err);
            alert(err.response?.data?.message || "Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    if (isLoading) return <p>Loading chat room...</p>;
    // Ensure navigate is available before using it in error display
    if (error) return <p style={{ color: 'red' }}>Error: {error} {navigate && <button onClick={() => navigate(-1)}>Go Back</button>}</p>;
    if (!groupDetails) return <p>Group not found. {navigate && <button onClick={() => navigate(-1)}>Go Back</button>}</p>;

    return (
        <div className="chat-room-container" style={styles.container}>
            <h3 style={styles.header}>Chat: {groupDetails.name}</h3>
            {navigate && <button onClick={() => navigate(-1)} style={styles.backButton}>Back to Recipe</button>}
            <div className="messages-list" style={styles.messagesList}>
                {messages.map(msg => (
                    <div
                        key={msg._id}
                        className={`message-item ${msg.userId?._id === currentUser?._id ? 'my-message' : 'other-message'}`}
                        style={msg.userId?._id === currentUser?._id ? styles.myMessage : styles.otherMessage}
                    >
                        <strong style={styles.senderName}>
                            {/* Ensure msg.userId is populated, otherwise it might be just an ID */}
                            {msg.userId?.name || 'Unknown User'} ({new Date(msg.createdAt).toLocaleTimeString()}):
                        </strong>
                        <p style={styles.messageContent}>{msg.messageContent}</p>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="message-input-form" style={styles.inputForm}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={sending}
                    style={styles.inputField}
                />
                <button type="submit" disabled={sending} style={styles.sendButton}>
                    {sending ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

// Basic inline styles for demonstration
const styles = {
    container: { padding: '20px', maxWidth: '800px', margin: '0 auto', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif' },
    header: { textAlign: 'center', marginBottom: '20px', color: '#333' },
    backButton: { marginBottom: '10px', padding: '8px 15px', backgroundColor: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' },
    messagesList: { height: '400px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', marginBottom: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' },
    messageItem: { marginBottom: '10px', padding: '8px 12px', borderRadius: '7px', wordWrap: 'break-word', clear: 'both', display: 'flex', flexDirection: 'column' },
    myMessage: { backgroundColor: '#dcf8c6', alignSelf: 'flex-end', marginLeft: 'auto', textAlign: 'right', border: '1px solid #c5e7b0' },
    otherMessage: { backgroundColor: '#ffffff', alignSelf: 'flex-start', marginRight: 'auto', textAlign: 'left', border: '1px solid #eee' },
    senderName: { fontSize: '0.8em', color: '#555', marginBottom: '3px', fontWeight: 'bold' },
    messageContent: { margin: 0, fontSize: '0.95em' },
    inputForm: { display: 'flex', marginTop: '10px' },
    inputField: { flexGrow: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px 0 0 5px', outline: 'none' },
    sendButton: { padding: '10px 15px', border: '1px solid #4cae4c', borderLeft: 'none', backgroundColor: '#5cb85c', color: 'white', borderRadius: '0 5px 5px 0', cursor: 'pointer' }
};

export default ChatRoomPage;
