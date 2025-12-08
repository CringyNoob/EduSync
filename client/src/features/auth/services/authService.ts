import axios from '@/lib/axios';
import { API_ROUTES } from '@/lib/constants';
import {
  LoginCredentials,
  SignupData,
  User,
  Session,
  OTPVerification,
  PasswordResetRequest,
  PasswordResetConfirm,
  AuthResponse,
} from '../types/auth.types';
import { deviceManager } from '../utils/tokenManager';

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const deviceInfo = deviceManager.getDeviceInfo();
    const response = await axios.post(API_ROUTES.AUTH.LOGIN, {
      ...credentials,
      deviceInfo,
    });
    return response.data;
  },

  // Register (Signup) — send JSON (server expects JSON, not multipart)
  register: async (data: SignupData): Promise<AuthResponse> => {
    const payload = {
      ...data,
      email: (data.email || '').trim().toLowerCase(),
    } as any;

    // Exclude profilePhoto here; separate upload endpoint can handle files later
    delete payload.profilePhoto;

    const response = await axios.post(API_ROUTES.AUTH.REGISTER, payload);
    return response.data;
  },

  // Verify Email with OTP
  verifyEmail: async (verification: OTPVerification): Promise<AuthResponse> => {
    const response = await axios.post(API_ROUTES.AUTH.VERIFY_EMAIL, verification);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post(API_ROUTES.AUTH.RESEND_OTP, { email });
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await axios.post(API_ROUTES.AUTH.LOGOUT);
  },

  // Logout from all devices
  logoutAllDevices: async (): Promise<void> => {
    await axios.post(API_ROUTES.AUTH.LOGOUT_ALL);
  },

  // Refresh Token
  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await axios.post(API_ROUTES.AUTH.REFRESH_TOKEN);
    return response.data;
  },

  // Switch Role
  switchRole: async (role: string): Promise<{ user: User }> => {
    const response = await axios.post(API_ROUTES.AUTH.SWITCH_ROLE, { role });
    return response.data;
  },

  // Get Active Sessions
  getSessions: async (): Promise<Session[]> => {
    const response = await axios.get(API_ROUTES.AUTH.SESSIONS);
    return response.data;
  },

  // Revoke Session
  revokeSession: async (sessionId: string): Promise<void> => {
    await axios.delete(`${API_ROUTES.AUTH.REVOKE_SESSION}/${sessionId}`);
  },

  // Get Current User Profile
  getProfile: async (): Promise<User> => {
    const response = await axios.get(API_ROUTES.AUTH.PROFILE);
    return response.data;
  },

  // Update Profile
  updateProfile: async (data: Partial<User>): Promise<{ success: boolean; data: User }> => {
    const response = await axios.put(API_ROUTES.AUTH.PROFILE, data);
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (data: PasswordResetRequest): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post(API_ROUTES.AUTH.FORGOT_PASSWORD, data);
    return response.data;
  },

  // Reset Password
  resetPassword: async (data: PasswordResetConfirm): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post(API_ROUTES.AUTH.RESET_PASSWORD, data);
    return response.data;
  },

  // Send Magic Link
  sendMagicLink: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.post('/auth/magic-link', { email });
    return response.data;
  },

  // Verify Magic Link Token
  verifyMagicLink: async (token: string): Promise<AuthResponse> => {
    const deviceInfo = deviceManager.getDeviceInfo();
    const response = await axios.post('/auth/verify-magic-link', { token, deviceInfo });
    return response.data;
  },
};
