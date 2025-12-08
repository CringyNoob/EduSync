// Token storage keys
const ACCESS_TOKEN_KEY = 'edusync_access_token';
const REFRESH_TOKEN_KEY = 'edusync_refresh_token';
const TOKEN_EXPIRY_KEY = 'edusync_token_expiry';

// Token Manager
export const tokenManager = {
  // Get access token
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  // Set access token
  setAccessToken: (token: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    
    // Calculate expiry (15 minutes from now)
    const expiry = Date.now() + 15 * 60 * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
  },

  // Get refresh token
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Set refresh token
  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  // Remove all tokens
  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  },

  // Check if token is expired
  isTokenExpired: (): boolean => {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    
    return Date.now() >= parseInt(expiry);
  },

  // Get time until token expires (in milliseconds)
  getTimeUntilExpiry: (): number => {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return 0;
    
    const timeLeft = parseInt(expiry) - Date.now();
    return Math.max(0, timeLeft);
  },

  // Check if token needs refresh (5 minutes before expiry)
  needsRefresh: (): boolean => {
    const timeLeft = tokenManager.getTimeUntilExpiry();
    return timeLeft > 0 && timeLeft < 5 * 60 * 1000; // Less than 5 minutes
  },

  // Decode JWT token (without verification - for client-side only)
  decodeToken: (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  },

  // Get user ID from token
  getUserIdFromToken: (): string | null => {
    const token = tokenManager.getAccessToken();
    if (!token) return null;
    
    const decoded = tokenManager.decodeToken(token);
    return decoded?.userId || decoded?.sub || null;
  },

  // Get user role from token
  getUserRoleFromToken: (): string | null => {
    const token = tokenManager.getAccessToken();
    if (!token) return null;
    
    const decoded = tokenManager.decodeToken(token);
    return decoded?.role || null;
  },
};

// Session Storage Manager (for temporary data)
export const sessionManager = {
  // Save form data (for auto-save during signup)
  saveFormData: (step: string, data: any): void => {
    sessionStorage.setItem(`signup_${step}`, JSON.stringify(data));
  },

  // Get form data
  getFormData: (step: string): any => {
    const data = sessionStorage.getItem(`signup_${step}`);
    return data ? JSON.parse(data) : null;
  },

  // Clear form data
  clearFormData: (): void => {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('signup_')) {
        sessionStorage.removeItem(key);
      }
    });
  },

  // Save last selected role
  saveLastRole: (role: string): void => {
    localStorage.setItem('last_selected_role', role);
  },

  // Get last selected role
  getLastRole: (): string | null => {
    return localStorage.getItem('last_selected_role');
  },

  // Save remember me preference
  saveRememberMe: (remember: boolean): void => {
    localStorage.setItem('remember_me', remember.toString());
  },

  // Get remember me preference
  getRememberMe: (): boolean => {
    return localStorage.getItem('remember_me') === 'true';
  },
};

// Device Info Manager
export const deviceManager = {
  // Get device information
  getDeviceInfo: () => {
    const userAgent = navigator.userAgent;
    
    // Detect browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    // Detect OS
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';
    
    // Detect device type
    let device = 'Desktop';
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      device = 'Mobile';
    } else if (/Tablet|iPad/.test(userAgent)) {
      device = 'Tablet';
    }

    return {
      userAgent,
      browser,
      os,
      device,
    };
  },
};
