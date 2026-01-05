import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('edusync_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Mock login - in production, this would call the API
        const userData = {
            name: 'John Doe',
            email: email,
            role: 'student'
        };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('edusync_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('edusync_user');
        localStorage.removeItem('edusync_token');
    };

    const register = async (userData) => {
        // Mock register - in production, this would call the API
        const newUser = {
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            role: 'student'
        };
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('edusync_user', JSON.stringify(newUser));
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
