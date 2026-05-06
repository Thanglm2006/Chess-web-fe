import api from './api';

export const GameService = {
    getHistory: async (userId, page = 0, size = 10) => {
        const response = await api.get(`/api/game/history?userId=${userId}&page=${page}&size=${size}`);
        return response.data;
    },

    getActiveGame: async (userId) => {
        const response = await api.get(`/api/game/active?userId=${userId}`);
        return response.status === 200 ? response.data : null;
    }
};
