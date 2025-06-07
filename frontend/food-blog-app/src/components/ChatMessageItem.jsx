import React from 'react';

const ChatMessageItem = ({ message, currentUserId }) => {
    const isCurrentUser = message.userId?._id === currentUserId || message.userId === currentUserId;
    // message.userId could be an object (populated) or a string (if not populated or from optimistic update)
    // The backend populates userId with { _id, name }. So we check message.userId._id

    const messageStyle = {
        padding: '8px 12px',
        borderRadius: '18px',
        marginBottom: '8px',
        maxWidth: '70%',
        wordWrap: 'break-word',
        fontSize: '0.9em',
    };

    const senderStyle = {
        fontSize: '0.8em',
        color: '#555',
        marginBottom: '2px',
    };

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
        marginBottom: '10px',
    };

    const userMessageStyle = {
        ...messageStyle,
        backgroundColor: '#007bff', // Blue for current user
        color: 'white',
        alignSelf: 'flex-end',
    };

    const otherMessageStyle = {
        ...messageStyle,
        backgroundColor: '#e9e9eb', // Light grey for others
        color: 'black',
        alignSelf: 'flex-start',
    };

    const getDisplayName = () => {
        if (message.userId && message.userId.name) {
            return message.userId.name;
        }
        return "User"; // Fallback if name is not available
    };

    return (
        <div style={containerStyle}>
            {!isCurrentUser && (
                <div style={senderStyle}>
                    {getDisplayName()}
                </div>
            )}
            <div style={isCurrentUser ? userMessageStyle : otherMessageStyle}>
                {message.message}
            </div>
             {/* Optional: Timestamp
             <div style={{ fontSize: '0.7em', color: '#777', alignSelf: isCurrentUser ? 'flex-end' : 'flex-start', marginTop: '2px' }}>
                {new Date(message.timestamp).toLocaleTimeString()}
            </div>
            */}
        </div>
    );
};

export default ChatMessageItem;
