export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    REFRESH_TOKEN: '/auth/refresh-token',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_OTP: '/auth/resend-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    SWITCH_ROLE: '/auth/switch-role',
    SESSIONS: '/auth/sessions',
    REVOKE_SESSION: '/auth/sessions',
    PROFILE: '/auth/profile',
  },
} as const;

export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  PROFILE: '/profile',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  SESSIONS: '/sessions',
} as const;

export const COLORS = {
  PRIMARY_PURPLE: '#5B3FD9',
  LIGHT_PURPLE: '#A78BFA',
  DARK_PURPLE: '#3B2699',
  CYAN_ACCENT: '#00D4FF',
} as const;
