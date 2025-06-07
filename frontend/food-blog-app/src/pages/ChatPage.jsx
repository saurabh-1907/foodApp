import React, { useState, useEffect } from 'react';
import JoinChatRoom from '../components/JoinChatRoom';
import ChatInterface from '../components/ChatInterface';
import Navbar from '../components/Navbar'; // Assuming Navbar is used on this page
import Footer from '../components/Footer'; // Assuming Footer is used on this page
import axios from 'axios';

const ChatPage = () => {
    const [currentRoom, setCurrentRoom] = useState(null); // Stores { id: roomId, name: roomName, token: roomToken }
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Fetch user details or verify authentication
        const token = localStorage.getItem("token");
        if (token) {
            // You might want to decode the token to get user ID or fetch user details
            // For now, we'll just assume the user is authenticated if token exists
            // A more robust solution would be to verify token with backend /user/me endpoint
            setUser({ token }); // Simplified user object
        } else {
            setError("You need to be logged in to use the chat.");
            // Optionally redirect to login page
            // navigate("/login");
        }
    }, []);

    const handleJoinSuccess = (roomDetails) => {
        setCurrentRoom(roomDetails); // roomDetails should include { id, name, token }
        setError('');
    };

    const handleLeaveRoom = () => {
        setCurrentRoom(null);
        // Potentially notify backend or perform other cleanup
    };

    // Function to create a new chat room (optional, could be a separate component/button)
    const createNewRoom = async (roomName = "General Chat") => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                'https://foodapp-7hu3.onrender.com/api/chat/room',
                { name: roomName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data) {
                // Automatically join the created room
                handleJoinSuccess({
                    id: response.data._id,
                    name: response.data.name,
                    token: response.data.token
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create room. Ensure you are logged in.");
            console.error("Create room error:", err);
        } finally {
            setIsLoading(false);
        }
    };


    if (!user) {
        // If user is not authenticated, show error or redirect
        // For now, just showing an error message.
        // You might want a loading indicator while checking auth status.
        return (
            <>
                <Navbar />
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <p>{error || "Authenticating..."}</p>
                    {/* Optionally show a login button */}
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="chat-page-container" style={{ padding: '20px', marginTop: '60px', marginBottom: '40px' }}>
                {isLoading && <p>Loading...</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}

                {!currentRoom ? (
                    <>
                        <JoinChatRoom onJoinSuccess={handleJoinSuccess} setError={setError} setIsLoading={setIsLoading} />
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <p>Or</p>
                            <button onClick={() => createNewRoom()} disabled={isLoading} style={{padding: '10px 20px', cursor: 'pointer'}}>
                                {isLoading ? 'Creating Room...' : 'Create a New Chat Room'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div>
                        <ChatInterface roomId={currentRoom.id} roomName={currentRoom.name} userToken={user.token} />
                        <button onClick={handleLeaveRoom} style={{ marginTop: '10px', padding: '10px', cursor: 'pointer' }}>
                            Leave Room
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default ChatPage;
