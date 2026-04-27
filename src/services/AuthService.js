import axios from 'axios';

const BASE_URL = '/api/auth';

export const AuthService = {
    login: async (email, password) => {
        const response = await axios.post(`${BASE_URL}/login`, { email, password });
        return response.data;
    },
    
    register: async (username, email, password, confirmPassword, countryCode) => {
        const response = await axios.post(`${BASE_URL}/register`, {
            username, email, password, confirmPassword, countryCode
        });
        return response.data;
    },

    verifyOTP: async (email, otp) => {
        const response = await axios.post(`${BASE_URL}/verify-otp`, { email, otp });
        return response.data;
    },

    googleLogin: async (idToken) => {
        const response = await axios.post(`${BASE_URL}/google`, { idToken });
        return response.data;
    },

    parseToken: (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }
    
    // Note: The original java code opened standard OAuth URLs. 
    // In React this is better managed with @react-oauth/google if needed.
    // getGoogleClientId: () => import.meta.env.VITE_GOOGLE_CLIENT_ID
};
