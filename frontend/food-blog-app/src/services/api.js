import axios from 'axios';

// It's good practice to set up a base URL for your API client
// For example:
// const apiClient = axios.create({
//   baseURL: 'http://localhost:4000', // Your backend URL
//   // You can also configure other default settings like headers here
// });
// Then use apiClient.get, apiClient.post, etc.

// For this subtask, we'll use axios directly with relative paths,
// assuming the frontend is served in a way that /api requests are proxied
// or the backend is on the same origin.

export const getGroupsForRecipe = async (recipeId) => {
    try {
        const response = await axios.get(`/api/groups/recipe/${recipeId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching groups for recipe ${recipeId}:`, error.response || error.message);
        throw error; // Re-throw to be caught by the calling component
    }
};

export const joinGroup = async (groupId, token) => {
    try {
        const response = await axios.post(`/api/groups/${groupId}/join`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error joining group ${groupId}:`, error.response || error.message);
        throw error; // Re-throw to be caught by the calling component
    }
};

export const getGroupDetails = async (groupId, token) => {
    try {
        const response = await axios.get(`/api/groups/${groupId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching group details for group ${groupId}:`, error.response || error.message);
        throw error;
    }
};

export const getMessagesForGroup = async (groupId, token, page = 1, limit = 20) => {
    try {
        const response = await axios.get(`/api/groups/${groupId}/messages?page=${page}&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching messages for group ${groupId}:`, error.response || error.message);
        throw error;
    }
};

// Changed messageContent to be an object { messageContent: "text" } as per backend expectation for req.body
export const postMessage = async (groupId, messageData, token) => {
    try {
        const response = await axios.post(`/api/groups/${groupId}/messages`, messageData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error posting message to group ${groupId}:`, error.response || error.message);
        throw error;
    }
};

// Example of how you might set up a more robust API client:
/*
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export const getGroupsForRecipe = async (recipeId) => {
    const response = await apiClient.get(`/groups/recipe/${recipeId}`);
    return response.data;
};

export const joinGroup = async (groupId) => {
    // Token is now handled by interceptor
    const response = await apiClient.post(`/groups/${groupId}/join`);
    return response.data;
};
*/
