import api from './api';

export const ReplayService = {
    getRounds: async (tournamentId) => {
        const response = await api.get(`/api/tournaments/${tournamentId}/rounds`);
        return response.data;
    },
    getPairings: async (tournamentId, roundId) => {
        const response = await api.get(`/api/tournaments/${tournamentId}/pairings/${roundId}`);
        return response.data;
    },
    getTournamentGames: async (tournamentId) => {
        const response = await api.get(`/api/tournaments/${tournamentId}/games`);
        return response.data;
    },
    getGame: async (gameId) => {
        const response = await api.get(`/api/games/${gameId}`);
        return response.data;
    },
    getGameMoves: async (gameId) => {
        const response = await api.get(`/api/games/${gameId}/moves`);
        return response.data;
    },
    getGameAnalysis: async (gameId) => {
        const response = await api.get(`/api/games/${gameId}/analysis`);
        return response.data;
    }
};
