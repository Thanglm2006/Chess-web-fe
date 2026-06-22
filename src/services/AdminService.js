import api from './api';

export const AdminService = {
    getStats: async () => {
        const response = await api.get('/api/admin/stats');
        return response.data;
    },
    getUsers: async (query = '') => {
        const response = await api.get(`/api/admin/users?query=${encodeURIComponent(query)}`);
        return response.data;
    },
    getUserProfile: async (userId) => {
        const response = await api.get(`/api/admin/users/${userId}`);
        return response.data;
    },
    banUser: async (userId) => {
        const response = await api.post(`/api/admin/users/${userId}/ban`);
        return response.data;
    },
    unbanUser: async (userId) => {
        const response = await api.post(`/api/admin/users/${userId}/unban`);
        return response.data;
    },
    createTournament: async (tournamentData) => {
        const response = await api.post('/api/admin/tournaments', tournamentData);
        return response.data;
    },
    updateTournament: async (tournamentId, tournamentData) => {
        const response = await api.put(`/api/admin/tournaments/${tournamentId}`, tournamentData);
        return response.data;
    },
    cancelTournament: async (tournamentId) => {
        const response = await api.delete(`/api/admin/tournaments/${tournamentId}`);
        return response.data;
    },
    startTournament: async (tournamentId) => {
        const response = await api.post(`/api/admin/tournaments/${tournamentId}/start`);
        return response.data;
    },
    finishTournament: async (tournamentId) => {
        const response = await api.post(`/api/admin/tournaments/${tournamentId}/finish`);
        return response.data;
    },
    submitPairingResult: async (pairingId, result) => {
        const response = await api.post(`/api/admin/pairings/${pairingId}/result`, { result });
        return response.data;
    }
};
