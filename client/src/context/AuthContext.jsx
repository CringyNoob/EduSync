import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const verifySession = async () => {
            const token = localStorage.getItem('edusync_token');
            if (token) {
                try {
                    const response = await authService.verifyToken();
                    if (response.valid && response.user) {
                        setUser(response.user);
                        setIsAuthenticated(true);
                    } else {
                        // Token invalid, clear storage
                        localStorage.removeItem('edusync_token');
                        localStorage.removeItem('edusync_user');
                    }
                } catch (error) {
                    console.error('Session verification failed:', error);
                    localStorage.removeItem('edusync_token');
                    localStorage.removeItem('edusync_user');
                }
            }
            setLoading(false);
        };
        verifySession();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            if (response.success && response.user) {
                setUser(response.user);
                setIsAuthenticated(true);
                localStorage.setItem('edusync_user', JSON.stringify(response.user));
                return response;
            }
            throw new Error(response.error || 'Login failed');
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('edusync_user');
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            if (response.success && response.user) {
                setUser(response.user);
                setIsAuthenticated(true);
                localStorage.setItem('edusync_user', JSON.stringify(response.user));
                return response;
            }
            throw new Error(response.error || 'Registration failed');
        } catch (error) {
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, register }}>
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
