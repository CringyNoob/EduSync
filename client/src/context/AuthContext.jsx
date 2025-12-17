import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in on mount
    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem('edusync_token');
            
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await authService.verifyToken();
                if (response.user) {
                    setUser(response.user);
                }
            } catch (err) {
                console.error('Token verification failed:', err);
                localStorage.removeItem('edusync_token');
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, []);

    /**
     * Login user
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise}
     */
    const login = async (email, password) => {
        try {
            setError(null);
            const response = await authService.login(email, password);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.message || 'Login failed');
            throw err;
        }
    };

    /**
     * Register new user
     * @param {Object} userData 
     * @returns {Promise}
     */
    const register = async (userData) => {
        try {
            setError(null);
            const response = await authService.register(userData);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.message || 'Registration failed');
            throw err;
        }
    };

    /**
     * Logout user
     */
    const logout = () => {
        authService.logout();
        setUser(null);
    };

    /**
     * Update user profile
     * @param {Object} profileData 
     * @returns {Promise}
     */
    const updateProfile = async (profileData) => {
        try {
            setError(null);
            const response = await authService.updateProfile(profileData);
            if (response.profile) {
                // Update user object with new profile data
                setUser(prev => ({
                    ...prev,
                    ...response.profile
                }));
            }
            return response;
        } catch (err) {
            setError(err.message || 'Profile update failed');
            throw err;
        }
    };

    /**
     * Refresh user data
     */
    const refreshUser = async () => {
        try {
            const response = await authService.getProfile();
            if (response.profile) {
                setUser(response.profile);
            }
        } catch (err) {
            console.error('Failed to refresh user:', err);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
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
