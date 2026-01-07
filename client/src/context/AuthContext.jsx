import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserFromToken } from '../utils/jwtDecode';

const AuthContext = createContext(null);

// Helper to get user from token or localStorage
const getStoredUser = () => {
    try {
        // First, try to get user from JWT token
        const userFromToken = getUserFromToken();
        if (userFromToken && userFromToken.id && userFromToken.name) {
            console.log('User loaded from token:', userFromToken.name);
            return userFromToken;
        }

        // Fallback: check localStorage for manually stored user
        const storedUser = localStorage.getItem('edusync_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.id && parsedUser.name) {
                console.log('User loaded from localStorage:', parsedUser.name);
                return parsedUser;
            }
        }
    } catch (error) {
        console.error('Error reading stored user:', error);
    }
    
    // Fallback to mock data if no real user found
    console.warn('No authenticated user found, using mock data');
    return {
        id: '00000001-0000-0000-0000-000000000001',
        name: 'John Doe',
        email: 'john.doe@university.edu',
        role: 'Student'
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser());

    // Refresh user data whenever component mounts or token changes
    useEffect(() => {
        const refreshUser = () => {
            const userData = getStoredUser();
            setUser(userData);
            console.log('AuthContext refreshed, user:', userData);
        };

        // Initial load
        refreshUser();

        // Listen for storage changes (e.g., login/logout in another tab)
        window.addEventListener('storage', refreshUser);
        
        // Custom event for same-tab token updates
        window.addEventListener('tokenUpdated', refreshUser);

        return () => {
            window.removeEventListener('storage', refreshUser);
            window.removeEventListener('tokenUpdated', refreshUser);
        };
    }, []);

    const login = async (email, password) => {
        // This will be called by auth pages after successful login
        // Just refresh the user data from token
        const userData = getStoredUser();
        setUser(userData);
        
        // Trigger custom event to notify other components
        window.dispatchEvent(new Event('tokenUpdated'));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('edusync_user');
        localStorage.removeItem('edusync_token');
        
        // Trigger custom event
        window.dispatchEvent(new Event('tokenUpdated'));
    };

    const switchRole = (newRole) => {
        const updatedUser = {
            ...user,
            role: newRole
        };
        setUser(updatedUser);
        localStorage.setItem('edusync_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, switchRole }}>
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
