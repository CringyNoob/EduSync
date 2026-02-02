import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserFromToken } from '../utils/jwtDecode';
import authService from '../services/authService';

const AuthContext = createContext(null);

// Helper to get user from token or localStorage
const getStoredUser = () => {
    try {
        // First, check if there's a temporary role override in sessionStorage
        const sessionRole = sessionStorage.getItem('edusync_temp_role');

        // Get user from JWT token (contains original login data)
        const userFromToken = getUserFromToken();
        
        // Get user from localStorage (may have updated roles after registration)
        const storedUserJson = localStorage.getItem('edusync_user');
        const storedUser = storedUserJson ? JSON.parse(storedUserJson) : null;
        
        // PRIORITY: Use localStorage if it has MORE roles than token (updated after vendor registration)
        // This ensures role updates persist without re-login
        if (storedUser && storedUser.id && storedUser.name) {
            const storedRoles = storedUser.roles || [];
            const tokenRoles = userFromToken?.roles || [];
            
            // If localStorage has more roles or different roles, prefer it
            if (storedRoles.length >= tokenRoles.length || 
                storedRoles.some(r => !tokenRoles.includes(r))) {
                console.log('User loaded from localStorage (has updated roles):', storedUser.name, storedUser.roles);
                if (sessionRole) {
                    return { ...storedUser, role: sessionRole };
                }
                return storedUser;
            }
        }
        
        // Otherwise use token data
        if (userFromToken && userFromToken.id && userFromToken.name) {
            console.log('User loaded from token:', userFromToken.name);
            // Apply session role override if exists
            if (sessionRole) {
                return { ...userFromToken, role: sessionRole };
            }
            return userFromToken;
        }

        // Fallback: check localStorage for manually stored user
        if (storedUser && storedUser.id && storedUser.name) {
            console.log('User loaded from localStorage:', storedUser.name);
            // Apply session role override if exists
            if (sessionRole) {
                return { ...storedUser, role: sessionRole };
            }
            return storedUser;
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
        role: 'Student',
        roles: ['STUDENT'],
        activeRole: 'STUDENT'
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
        sessionStorage.removeItem('edusync_temp_role');

        // Trigger custom event
        window.dispatchEvent(new Event('tokenUpdated'));
    };

    const switchRole = async (newRole, otp = null, hash = null) => {
        console.log('🔄 Switching role to:', newRole);
        
        // Validate user has this role
        if (!user?.roles?.includes(newRole)) {
            console.error('❌ User does not have role:', newRole, 'Available roles:', user?.roles);
            return { success: false, error: 'User does not have this role' };
        }
        
        try {
            // Call backend to update active_role in database
            console.log('📡 Calling backend to switch role...');
            const response = await authService.switchRole(newRole, otp, hash);
            console.log('📨 Backend response:', response);
            
            // Check if OTP is required (for ADMIN role)
            if (response.requiresOtp) {
                console.log('🔐 OTP required for ADMIN role');
                return { success: false, requiresOtp: true };
            }
            
            if (response.success) {
                console.log('✅ Role switched in database');
                
                // Update local state
                const updatedUser = {
                    ...user,
                    role: newRole,
                    activeRole: newRole,
                    roles: response.roles || user.roles
                };
                setUser(updatedUser);
                localStorage.setItem('edusync_user', JSON.stringify(updatedUser));
                sessionStorage.setItem('edusync_temp_role', newRole);
                
                return { success: true };
            } else {
                console.error('❌ Backend failed to switch role:', response.error);
                return { success: false, error: response.error || 'Failed to switch role' };
                const updatedUser = { ...user, role: newRole, activeRole: newRole };
                setUser(updatedUser);
                sessionStorage.setItem('edusync_temp_role', newRole);
                return false;
            }
        } catch (error) {
            console.error('❌ Error calling switchRole API:', error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                
                // Check if OTP is required
                if (error.response.data?.requiresOtp) {
                    return { success: false, requiresOtp: true };
                }
                
                return { success: false, error: error.response.data?.error || 'Failed to switch role' };
            }
            return { success: false, error: error.message || 'Failed to switch role' };
        }
    };

    // Update user profile data (used after profile update or vendor registration)
    const updateUser = (updatedData) => {
        console.log('🔄 updateUser called with:', updatedData);
        
        const updatedUser = {
            ...user,
            ...updatedData
        };
        
        console.log('📝 Updated user object:', updatedUser);
        console.log('📝 Updated roles:', updatedUser.roles);
        
        // Save to localStorage FIRST (before setUser) to ensure persistence
        localStorage.setItem('edusync_user', JSON.stringify(updatedUser));
        
        // Update React state
        setUser(updatedUser);
        
        // Trigger custom event to notify other components (like Sidebar)
        console.log('📢 Dispatching tokenUpdated event');
        window.dispatchEvent(new Event('tokenUpdated'));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, switchRole, updateUser }}>
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
