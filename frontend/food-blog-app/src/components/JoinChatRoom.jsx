import React, { useState } from 'react';
import axios from 'axios';

const JoinChatRoom = ({ onJoinSuccess, setError, setIsLoading }) => {
    const [tokenInput, setTokenInput] = useState('');

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!tokenInput.trim()) {
            setError("Please enter a room token.");
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const authToken = localStorage.getItem("token");
            const response = await axios.post(
                'https://foodapp-7hu3.onrender.com/api/chat/join',
                { token: tokenInput },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            if (response.data && response.data.room) {
                onJoinSuccess({
                    id: response.data.room._id,
                    name: response.data.room.name || "Chat Room", // Use room name from backend
                    token: response.data.room.token, // The token used to join
                });
            } else {
                setError("Failed to join room. Invalid response from server.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to join room. Check the token or your connection.");
            console.error("Join room error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '400px', margin: '20px auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Join Chat Room</h2>
            <form onSubmit={handleJoin}>
                <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Enter Room Token"
                    style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#5cb85c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Join Room
                </button>
            </form>
        </div>
    );
};

export default JoinChatRoom;
