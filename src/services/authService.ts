import apiClient from '../api/client';
import { User } from '../types';

interface LoginResponse {
    access_token: string;
}

export const authService = {
    login: async (email: string, pass: string): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/login', {
            email,
            password: pass,
        });
        return response.data;
    },

    getProfile: async (): Promise<User> => {
        const response = await apiClient.get<User>('/auth/profile');
        return response.data;
    }
};
