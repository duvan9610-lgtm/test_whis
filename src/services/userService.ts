import apiClient from '../api/client';
import { User, UserRole } from '../types';

export interface CreateUserPayload {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    companyId?: number; // Optional: for assigning user to specific company
}

export interface UpdateUserPayload {
    name?: string;
    role?: UserRole;
    password?: string;
}

export const userService = {
    // List all users
    listUsers: async (): Promise<User[]> => {
        const response = await apiClient.get<User[]>('/users');
        return response.data;
    },

    // Create a new user
    createUser: async (payload: CreateUserPayload): Promise<User> => {
        const response = await apiClient.post<User>('/users', payload);
        return response.data;
    },

    // Update an existing user
    updateUser: async (id: number, payload: UpdateUserPayload): Promise<User> => {
        const response = await apiClient.put<User>(`/users/${id}`, payload);
        return response.data;
    },

    // Delete a user (optional)
    deleteUser: async (id: number): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    }
};
