import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/authService';
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
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                const userProfile = await authService.getProfile();
                setUser(userProfile);
            }
        } catch (error) {
            console.log('Failed to restore auth session', error);
            await SecureStore.deleteItemAsync('token');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, pass: string) => {
        try {
            const { access_token } = await authService.login(email, pass);
            try {
                await SecureStore.setItemAsync('token', access_token);
            } catch (storeError) {
                console.error('SecureStore setItemAsync failed:', storeError);
                // Fallback or alert logic could go here
            }

            // Fetch profile immediately after login
            const userProfile = await authService.getProfile();
            setUser(userProfile);
        } catch (error) {
            console.error('Login failed:', error);
            throw error; // Re-throw to be handled by the UI
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync('token');
        } catch (error) {
            console.error('SecureStore deleteItemAsync failed:', error);
        }
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
