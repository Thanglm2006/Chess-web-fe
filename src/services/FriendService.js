import api from './api';

export const FriendService = {
    getList: async (userId) => {
        const response = await api.get(`/api/friends/list?userId=${userId}`);
        return response.data;
    },
    
    getPending: async (userId) => {
        const response = await api.get(`/api/friends/pending?userId=${userId}`);
        return response.data;
    },
    
    sendRequest: async (senderId, receiverId) => {
        const response = await api.post(`/api/friends/request?senderId=${senderId}&receiverId=${receiverId}`);
        return response.data;
    },

    acceptRequest: async (user1, user2) => {
        const response = await api.post(`/api/friends/accept?user1=${user1}&user2=${user2}`);
        return response.data;
    },
    removeFriend: async (user1, user2) => {
        const response = await api.post(`/api/friends/remove?user1=${user1}&user2=${user2}`);
        return response.data;
    },
};
