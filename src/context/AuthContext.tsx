import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        initializeAuthState();
    }, []);

    const initializeAuthState = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const response = await apiClient.get<User>('/auth/profile');
                setUser(response.data);
            }
        } catch (error) {
            console.log('Failed to restore auth session', error);
            await AsyncStorage.removeItem('token');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, pass: string) => {
        const response = await apiClient.post<{ access_token: string }>('/auth/login', {
            email,
            password: pass,
        });

        const { access_token } = response.data;
        await AsyncStorage.setItem('token', access_token);

        // Fetch profile immediately after login
        const profileResponse = await apiClient.get<User>('/auth/profile');
        setUser(profileResponse.data);
    };

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
