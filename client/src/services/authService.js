import api from '../utils/api';

/**
 * Auth Service - All authentication related API calls
 */
const authService = {
  /**
   * Send OTP to email for registration
   * @param {string} email - User's email address
   * @returns {Promise} Response with OTP hash and expiry
   */
  sendOtp: async (email) => {
    const response = await api.post('/auth/send-otp', { email });
    // Return full response data including hash and expiry
    return response.data;
  },

  /**
   * Register a new user
   * @param {Object} userData - Registration data
   * @param {string} userData.email - User's email
   * @param {string} userData.otp - OTP code from email
   * @param {string} userData.hash - Hash received from send-otp
   * @param {string} userData.password - User's password
   * @param {string} userData.fullName - User's full name
   * @param {string} userData.studentId - Student ID (9-10 digits)
   * @param {string} userData.department - Department code
   * @param {string} userData.trimester - Trimester (Spring/Summer/Fall)
   * @param {string} userData.year - Batch year
   * @param {string} [userData.phone] - Phone number (optional)
   * @returns {Promise} Response with user data and token
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    
    // Save token if registration successful
    if (response.data.token) {
      localStorage.setItem('edusync_token', response.data.token);
    }
    
    return response.data;
  },

  /**
   * Login user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} Response with user data and token
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    // Save token if login successful
    if (response.data.token) {
      localStorage.setItem('edusync_token', response.data.token);
    }
    
    return response.data;
  },

  /**
   * Logout user (clear local token)
   */
  logout: () => {
    localStorage.removeItem('edusync_token');
  },

  /**
   * Request password reset OTP
   * @param {string} email - User's email
   * @returns {Promise} Response with OTP hash and expiry
   */
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with OTP
   * @param {string} email - User's email
   * @param {string} otp - OTP code from email
   * @param {string} hash - Hash received from forgot-password
   * @param {string} newPassword - New password
   * @returns {Promise} Response with success message
   */
  resetPassword: async (email, otp, hash, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      email,
      otp,
      hash,
      newPassword,
    });
    return response.data;
  },

  /**
   * Get current user profile
   * @returns {Promise} Response with user profile data
   */
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Response with updated profile
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} Response with success message
   */
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  /**
   * Verify current token is valid
   * @returns {Promise} Response with user data if token is valid
   */
  verifyToken: async () => {
    const response = await api.get('/auth/verify-token');
    return response.data;
  },

  /**
   * Get public user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise} Response with user profile data
   */
  getUserById: async (userId) => {
    const response = await api.get(`/auth/user/${userId}`);
    return response.data;
  },
};

export default authService;
