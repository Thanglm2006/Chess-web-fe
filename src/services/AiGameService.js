import api from './api';

export const AiGameService = {
    /**
     * Get available AI checkpoints/models from the backend.
     */
    getModels: async () => {
        const response = await api.get('/api/ai/models');
        return response.data;
    },

    /**
     * Start a new game against Chess AI.
     * @param {string} aiModel - The identifier of the chosen model key (e.g. 'best_model').
     * @param {number} difficulty - Difficulty from 1 to 4.
     * @param {string} playerColor - 'WHITE' or 'BLACK'.
     */
    startGame: async (aiModel, difficulty, playerColor) => {
        const response = await api.post('/api/ai/start', {
            aiModel,
            difficulty,
            playerColor
        });
        return response.data;
    },

    /**
     * Submit player move and receive AI response.
     * @param {string} gameId - Unique ID of the game.
     * @param {string} move - Move string in SAN (e.g. 'e4') or UCI (e.g. 'e2e4') notation.
     */
    makeMove: async (gameId, move) => {
        const response = await api.post('/api/ai/move', {
            gameId,
            move
        });
        return response.data;
    },

    /**
     * Resign the active game.
     * @param {string} gameId - Unique ID of the game.
     */
    resignGame: async (gameId) => {
        const response = await api.post('/api/ai/resign', {
            gameId
        });
        return response.data;
    },

    /**
     * Check if there is an active AI game for the logged-in user.
     * Useful for reconnects and page refreshes.
     */
    getActiveGame: async () => {
        const response = await api.get('/api/ai/active');
        return response.status === 200 ? response.data : null;
    },

    /**
     * Fetch complete details of a specific AI game.
     * @param {string} gameId - Unique ID of the game.
     */
    getGameDetails: async (gameId) => {
        const response = await api.get(`/api/ai/game/${gameId}`);
        return response.data;
    }
};
