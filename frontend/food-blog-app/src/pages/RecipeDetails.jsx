import React, { useState, useEffect } from 'react';
import profileImg from '../assets/profile.png';
import food from '../assets/foodRecipe.png'; // Fallback for recipe image
import { useLoaderData, useNavigate } from 'react-router-dom'; // Import useNavigate
import { getGroupsForRecipe, joinGroup } from '../services/api'; // Import API functions

export default function RecipeDetails() {
    const recipe = useLoaderData();
    const navigate = useNavigate(); // Initialize navigate

    const [groups, setGroups] = useState([]);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [groupError, setGroupError] = useState(null);
    const [groupMembershipStatus, setGroupMembershipStatus] = useState({}); // { [groupId]: 'member' | 'not_member' | 'pending' }

    useEffect(() => {
        // console.log(recipe); // Keep for debugging if needed
        if (recipe && recipe._id) {
            const fetchGroups = async () => {
                setIsLoadingGroups(true);
                setGroupError(null);
                try {
                    const fetchedGroups = await getGroupsForRecipe(recipe._id);
                    setGroups(fetchedGroups || []);
                    // Initialize membership status - this would typically involve checking against user's current groups
                    // For now, default to 'not_member' or fetch this info if API provides it
                    const initialStatus = {};
                    (fetchedGroups || []).forEach(group => {
                        // Placeholder: In a real app, you'd check if user is already a member
                        // For example, by comparing with a list of user's group memberships
                        initialStatus[group._id] = 'not_member';
                    });
                    setGroupMembershipStatus(initialStatus);
                } catch (err) {
                    console.error("Error fetching groups:", err);
                    setGroupError(err.response?.data?.message || 'Failed to load groups.');
                    setGroups([]);
                } finally {
                    setIsLoadingGroups(false);
                }
            };
            fetchGroups();
        }
    }, [recipe]);

    const handleJoinGroup = async (groupId, groupName) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to join a group.');
            // Potentially trigger a login modal or redirect to login page
            return;
        }
        setGroupMembershipStatus(prev => ({ ...prev, [groupId]: 'pending' }));
        try {
            await joinGroup(groupId, token);
            alert(`Successfully joined group: ${groupName}!`);
            setGroupMembershipStatus(prev => ({ ...prev, [groupId]: 'member' }));
            // Optionally, you might want to re-fetch group details or navigate
            // For now, just updating the button state
        } catch (err) {
            console.error("Error joining group:", err);
            let errorMessage = 'Failed to join group.';
            if (err.response) {
                if (err.response.status === 409 || err.response.data?.message?.toLowerCase().includes('already a member')) {
                    errorMessage = 'You are already a member of this group.';
                    setGroupMembershipStatus(prev => ({ ...prev, [groupId]: 'member' })); // Assume member if 409
                } else {
                    errorMessage = err.response.data?.message || errorMessage;
                    setGroupMembershipStatus(prev => ({ ...prev, [groupId]: 'not_member' }));
                }
            } else {
                 setGroupMembershipStatus(prev => ({ ...prev, [groupId]: 'not_member' }));
            }
            alert(errorMessage);
        }
    };

    return (
        <>
            <div className='outer-container'>
                <div className='profile'>
                    <img src={profileImg} width="50px" height="50px" alt="Author profile"></img>
                    {/* Assuming recipe.createdBy.email or similar if populated, else recipe.email (if flat) */}
                    <h5>{recipe?.createdBy?.email || recipe?.email || 'Unknown Author'}</h5>
                </div>
                <h3 className='title'>{recipe.title}</h3>
                {recipe.coverImage ?
                    <img src={recipe.coverImage} width="220px" height="200px" alt={recipe.title} /> :
                    <img src={food} width="220px" height="200px" alt="Default recipe image" />
                }
                <div className='recipe-details'>
                    <div className='ingredients'><h4>Ingredients</h4><ul>{recipe.ingredients.map((item, index) => (<li key={index}>{item}</li>))}</ul></div>
                    <div className='instructions'><h4>Instructions</h4><p>{recipe.instructions}</p></div>
                </div>

                {/* Groups Section */}
                <div className="groups-section" style={{ marginTop: '2rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
                    <h4>Recipe Discussion Groups</h4>
                    {isLoadingGroups && <p>Loading groups...</p>}
                    {groupError && <p style={{ color: 'red' }}>{groupError}</p>}
                    {!isLoadingGroups && !groupError && groups.length === 0 && (
                        <p>No discussion groups yet for this recipe. Why not create one?</p>
                        // Placeholder for a "Create Group" button if desired
                        // <button onClick={() => alert('Create group functionality to be added!')}>Create New Group</button>
                    )}
                    {groups.map(group => (
                        <div key={group._id} className="group-item" style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
                            <h5>{group.name}</h5>
                            {group.description && <p style={{ fontSize: '0.9em', color: '#555' }}>{group.description}</p>}

                            {/* Logic to show 'View Chat' or 'Join Group' */}
                            {groupMembershipStatus[group._id] === 'member' ? (
                                <button
                                    onClick={() => navigate(`/groups/${group._id}/chat`)}
                                    style={{ padding: '8px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    View Chat for {group.name}
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleJoinGroup(group._id, group.name)}
                                    disabled={groupMembershipStatus[group._id] === 'pending'}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: groupMembershipStatus[group._id] === 'pending' ? '#ccc' : '#007bff',
                                        color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
                                    }}
                                >
                                    {groupMembershipStatus[group._id] === 'pending' ? 'Joining...' : `Join ${group.name}`}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
