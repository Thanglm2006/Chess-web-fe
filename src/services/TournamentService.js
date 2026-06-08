import api from './api';

export const TournamentService = {
    getAllTournaments: async () => {
        const response = await api.get('/api/tournaments');
        return response.data;
    },
    getTournamentById: async (tournamentId) => {
        const response = await api.get(`/api/tournaments/${tournamentId}`);
        return response.data;
    },
    joinTournament: async (tournamentId) => {
        const response = await api.post(`/api/tournaments/${tournamentId}/join`);
        return response.data;
    },
    leaveTournament: async (tournamentId) => {
        const response = await api.post(`/api/tournaments/${tournamentId}/leave`);
        return response.data;
    },
    getStandings: async (tournamentId) => {
        const response = await api.get(`/api/tournaments/${tournamentId}/standings`);
        return response.data;
    }
};
