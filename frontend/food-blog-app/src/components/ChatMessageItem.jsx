import React from 'react';

const ChatMessageItem = ({ message, currentUserId }) => {
    // Ensure message and message.userId exist before trying to access properties
    const userIdString = typeof message.userId === 'string' ? message.userId : message.userId?._id;
    const isCurrentUser = userIdString === currentUserId;

    const senderUsername = message.userId?.name || 'Unknown User';

    // Base class for the message item container
    let itemClassName = 'message-item';
    if (isCurrentUser) {
        itemClassName += ' current-user'; // Used for alignment
    } else {
        itemClassName += ' other-user'; // Used for alignment
    }

    // Bubble class for actual message styling
    let bubbleClassName = 'message-bubble';
    // Inline styles for background color can be kept if preferred, or moved to CSS
    // For simplicity, existing inline dynamic styles for bubble color are kept.
    // CSS classes 'message-bubble-current-user' and 'message-bubble-other-user' could be used instead.

     const userMessageStyle = {
        backgroundColor: '#007bff', // Blue for current user
        color: 'white',
    };

    const otherMessageStyle = {
        backgroundColor: '#e9e9eb', // Light grey for others
        color: 'black',
    };


    return (
        <div className={itemClassName} style={{ marginBottom: '10px' }}>
            {/* Display username for other users */}
            {!isCurrentUser && (
                <strong className="message-sender-username">
                    {senderUsername}
                </strong>
            )}
            {/* Optional: Display username for current user as well */}
            {/* {isCurrentUser && (
                <strong className="message-sender-username" style={{ alignSelf: 'flex-end' }}>
                    {senderUsername} // Or "You"
                </strong>
            )} */}
            <div
                className={bubbleClassName}
                style={isCurrentUser ? userMessageStyle : otherMessageStyle}
            >
                {message.message}
            </div>
            <span className="message-timestamp" style={{ fontSize: '0.7em', color: '#777', marginTop: '2px' }}>
                {new Date(message.timestamp).toLocaleTimeString()}
            </span>
        </div>
    );
};

export default ChatMessageItem;
