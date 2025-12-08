import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  User,
  UserRole,
  LoginCredentials,
  SignupData,
  Session,
  AuthContextType,
  OTPVerification,
  PasswordResetConfirm,
} from '../types/auth.types';
import { authService } from '../services/authService';
import { tokenManager, sessionManager } from '../utils/tokenManager';
import { useAuthStore } from '../store/authStore';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    user,
    activeRole,
    isAuthenticated,
    setUser,
    setToken,
    setRole,
    clearAuth,
  } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenManager.getAccessToken();
      
      if (token && !tokenManager.isTokenExpired()) {
        try {
          // Fetch current user profile
          const response = await authService.getProfile();
          const userProfile = response.data || response;
          setUser(userProfile);
          setToken(token);
          
          // Set active role (use last selected or first available)
          const lastRole = sessionManager.getLastRole();
          const roleToSet = lastRole || userProfile.activeRole || userProfile.roles?.[0] || 'student';
          setRole(roleToSet as UserRole);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          clearAuth();
          tokenManager.clearTokens();
        }
      } else {
        clearAuth();
        tokenManager.clearTokens();
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Auto refresh token before expiry
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      if (tokenManager.needsRefresh()) {
        try {
          const { accessToken } = await authService.refreshToken();
          tokenManager.setAccessToken(accessToken);
          setToken(accessToken);
        } catch (error) {
          console.error('Token refresh failed:', error);
          await logout();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Login
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed');
      }

      const { user: userData, accessToken, refreshToken } = response.data;
      
      // Store tokens
      tokenManager.setAccessToken(accessToken);
      if (refreshToken) {
        tokenManager.setRefreshToken(refreshToken);
      }
      
      // Save remember me preference
      if (credentials.rememberMe) {
        sessionManager.saveRememberMe(true);
      }
      
      // Set user data
      setUser(userData);
      setToken(accessToken);
      
      // Set active role (use last selected or first available)
      const lastRole = sessionManager.getLastRole();
      const roleToSet = lastRole && userData.roles.includes(lastRole as UserRole)
        ? lastRole
        : userData.activeRole || userData.roles[0];
      
      setRole(roleToSet as UserRole);
      sessionManager.saveLastRole(roleToSet);
      
      toast.success(`Welcome back, ${userData.firstName}!`);
      
      // Navigate to profile
      navigate('/profile');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setUser, setToken, setRole]);

  // Signup
  const signup = useCallback(async (data: SignupData) => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Registration failed');
      }
      
      const { user: userData, accessToken } = response.data;
      
      // Store access token securely
      tokenManager.setAccessToken(accessToken);
      
      // Set user data in store
      setUser(userData);
      setToken(accessToken);
      
      // Set active role
      const roleToSet = userData.activeRole || userData.roles?.[0] || 'student';
      setRole(roleToSet as UserRole);
      sessionManager.saveLastRole(roleToSet);
      
      // Clear saved form data
      sessionManager.clearFormData();
      
      toast.success(`Welcome to EduSync, ${userData.firstName}!`);
      
      // Navigate to profile
      navigate('/profile');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setUser, setToken, setRole]);

  // Verify Email
  const verifyEmail = useCallback(async (otp: string, emailOverride?: string) => {
    try {
      setIsLoading(true);
      // Prefer override, then user email, then saved form step1
      let email = emailOverride || user?.email || '';
      if (!email) {
        const savedStep1 = sessionManager.getFormData('step1');
        if (savedStep1?.email) email = savedStep1.email;
      }
      
      const verification: OTPVerification = {
        email,
        otp,
        type: 'email_verification',
      };
      
      const response = await authService.verifyEmail(verification);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Verification failed');
      }
      
      const { user: userData, accessToken } = response.data;
      
      tokenManager.setAccessToken(accessToken);
      setUser(userData);
      setToken(accessToken);
      
      toast.success('Email verified successfully!');
      navigate('/profile');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Verification failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate, setUser, setToken]);

  // Resend OTP
  const resendOTP = useCallback(async (email: string) => {
    try {
      const response = await authService.resendOTP(email);
      toast.success(response.message || 'OTP sent successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      tokenManager.clearTokens();
      sessionManager.clearFormData();
      toast.success('Logged out successfully');
      navigate('/auth/login');
    }
  }, [navigate, clearAuth]);

  // Logout from all devices
  const logoutAllDevices = useCallback(async () => {
    try {
      await authService.logoutAllDevices();
      clearAuth();
      tokenManager.clearTokens();
      toast.success('Logged out from all devices');
      navigate('/auth/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to logout from all devices';
      toast.error(message);
      throw error;
    }
  }, [navigate, clearAuth]);

  // Switch Role
  const switchRole = useCallback(async (role: UserRole) => {
    try {
      setIsLoading(true);
      const response = await authService.switchRole(role);
      
      setUser(response.user);
      setRole(role);
      sessionManager.saveLastRole(role);
      
      toast.success(`Switched to ${role} mode`);
      navigate('/profile');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to switch role';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setUser, setRole]);

  // Refresh Token
  const refreshToken = useCallback(async () => {
    try {
      const { accessToken } = await authService.refreshToken();
      tokenManager.setAccessToken(accessToken);
      setToken(accessToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      throw error;
    }
  }, [logout, setToken]);

  // Update Profile
  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      const response = await authService.updateProfile(data);
      if (response.success && response.data) {
        setUser(response.data);
      }
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  // Get Sessions
  const getSessions = useCallback(async (): Promise<Session[]> => {
    try {
      return await authService.getSessions();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch sessions';
      toast.error(message);
      throw error;
    }
  }, []);

  // Revoke Session
  const revokeSession = useCallback(async (sessionId: string) => {
    try {
      await authService.revokeSession(sessionId);
      toast.success('Session revoked successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to revoke session';
      toast.error(message);
      throw error;
    }
  }, []);

  // Request Password Reset
  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      const response = await authService.forgotPassword({ email });
      toast.success(response.message || 'Password reset link sent to your email');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send reset link';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset Password
  const resetPassword = useCallback(async (data: PasswordResetConfirm) => {
    try {
      setIsLoading(true);
      const response = await authService.resetPassword(data);
      toast.success(response.message || 'Password reset successfully');
      navigate('/auth/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    activeRole,
    login,
    signup,
    logout,
    logoutAllDevices,
    switchRole,
    refreshToken,
    updateProfile,
    verifyEmail,
    resendOTP,
    requestPasswordReset,
    resetPassword,
    getSessions,
    revokeSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
