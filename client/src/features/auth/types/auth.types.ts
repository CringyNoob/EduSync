// User Roles
export type UserRole = 'student' | 'vendor' | 'moderator' | 'admin';

// User Interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId: string;
  department: string;
  batch: string;
  year: number;
  semester?: string;
  program?: string;
  profilePhoto?: string;
  bio?: string;
  phone?: string;
  roles: UserRole[];
  activeRole: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

// Auth State
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: UserRole | null;
}

// Login Credentials
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  otp?: string; // For 2FA
}

// Signup Data (Multi-step)
export interface SignupData {
  // Step 1: Email & Password
  email: string;
  password: string;
  passwordConfirm: string;
  
  // Step 2: Personal Information
  firstName: string;
  lastName: string;
  studentId: string;
  phone?: string;
  profilePhoto?: File;
  
  // Step 3: Academic Information
  department: string;
  batch: string;
  year: number;
  semester: string;
}

// Session Management
export interface Session {
  id: string;
  userId: string;
  deviceInfo: {
    device: string;
    browser: string;
    os: string;
    ip: string;
  };
  location?: string;
  lastActive: string;
  createdAt: string;
  isActive: boolean;
  isCurrent: boolean;
}

// OTP Verification
export interface OTPVerification {
  email: string;
  otp: string;
  type: 'email_verification' | 'login_2fa' | 'password_reset';
}

// Password Reset
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// API Response Types
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Role Card for Role Selector
export interface RoleCard {
  role: UserRole;
  title: string;
  description: string;
  icon: string;
}

// Password Strength
export interface PasswordStrength {
  score: number; // 0-4
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  feedback: string[];
  color: string;
}

// Form Step (for multi-step signup)
export interface FormStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

// Device Info (for session tracking)
export interface DeviceInfo {
  userAgent: string;
  device: string;
  browser: string;
  os: string;
  ip?: string;
}

// Auth Context Type
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: UserRole | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  verifyEmail: (otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (data: PasswordResetConfirm) => Promise<void>;
  getSessions: () => Promise<Session[]>;
  revokeSession: (sessionId: string) => Promise<void>;
}

// Departments
export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electrical & Electronic Engineering',
  'Business Administration',
  'English',
  'Economics',
  'Civil Engineering',
  'Pharmacy',
  'Law',
] as const;

export type Department = typeof DEPARTMENTS[number];

// Programs
export const PROGRAMS = ['BSc', 'MSc', 'MBA', 'PhD', 'BA', 'MA'] as const;

export type Program = typeof PROGRAMS[number];

// Years
export const YEARS = [1, 2, 3, 4, 5] as const;

export type Year = typeof YEARS[number];
