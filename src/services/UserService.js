import api from './api';

export const UserService = {
    getMe: async () => {
        const response = await api.get('/api/auth/me');
        return response.data;
    },
    
    getStats: async (userId) => {
        const response = await api.get(`/api/user/${userId}/stats`);
        return response.data;
    },
    getLeaderboard: async () => {
        const response = await api.get('/api/user/leaderboard');
        return response.data;
    }
};
