import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Replace with your actual API URL. For Android Emulator, use 10.0.2.2 instead of localhost
// export const API_URL = 'http://10.0.2.2:3000/';
export const API_URL = 'http://localhost:3000'; // Updated to localhost for iOS simulator

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
