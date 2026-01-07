import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({
        name: 'John Doe',
        email: 'john.doe@university.edu',
        role: 'Student'
    });

    const login = (email, password) => {
        // Mock login
        setUser({
            name: 'John Doe',
            email: email,
            role: 'Student'
        });
    };

    const logout = () => {
        setUser(null);
    };

    const switchRole = (newRole) => {
        setUser(prev => ({
            ...prev,
            role: newRole
        }));
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
