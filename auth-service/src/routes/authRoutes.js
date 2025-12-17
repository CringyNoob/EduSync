// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { 
    loginLimiter, 
    otpLimiter, 
    registrationLimiter, 
    passwordResetLimiter 
} = require('../middleware/rateLimiter');

// ============================================
// INFO ROUTE
// ============================================

/**
 * GET /api/auth
 * Returns API information and available endpoints
 */
router.get('/', (req, res) => {
    res.json({
        service: 'EduSync Auth Service',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            public: {
                'POST /api/auth/send-otp': 'Send OTP for registration/password reset',
                'POST /api/auth/register': 'Register new user',
                'POST /api/auth/login': 'Login user',
                'POST /api/auth/forgot-password': 'Request password reset OTP',
                'POST /api/auth/reset-password': 'Reset password with OTP'
            },
            protected: {
                'GET /api/auth/verify-token': 'Verify JWT token validity',
                'GET /api/auth/profile': 'Get user profile',
                'PUT /api/auth/profile': 'Update user profile',
                'PUT /api/auth/change-password': 'Change password'
            }
        },
        documentation: '/api/auth (this page)',
        health: '/health'
    });
});

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * POST /api/auth/send-otp
 * Send OTP to user's email for registration or password reset
 * Body: { email, type: 'registration' | 'password-reset' }
 * Rate Limited: 3 requests per 5 minutes
 */
router.post('/send-otp', otpLimiter, authController.sendOtp);

/**
 * POST /api/auth/register
 * Register a new user with OTP verification
 * Body: { email, password, otp, hash, name, studentId, department, batch }
 * Rate Limited: 3 registrations per 30 minutes
 */
router.post('/register', registrationLimiter, authController.register);

/**
 * POST /api/auth/login
 * Login existing user
 * Body: { email, password }
 * Rate Limited: 5 attempts per 15 minutes
 */
router.post('/login', loginLimiter, authController.login);

/**
 * POST /api/auth/forgot-password
 * Request OTP for password reset
 * Body: { email }
 * Rate Limited: 3 attempts per hour
 */
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);

/**
 * POST /api/auth/reset-password
 * Reset password with OTP verification
 * Body: { email, otp, hash, newPassword }
 * Rate Limited: 3 attempts per hour
 */
router.post('/reset-password', passwordResetLimiter, authController.resetPassword);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * GET /api/auth/verify-token
 * Verify if JWT token is still valid
 * Headers: Authorization: Bearer <token>
 */
router.get('/verify-token', authMiddleware, authController.verifyToken);

/**
 * GET /api/auth/profile
 * Get user profile (own or other user's)
 * Headers: Authorization: Bearer <token>
 * Query: ?userId=<uuid> (optional, for viewing other profiles)
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * PUT /api/auth/profile
 * Update own profile
 * Headers: Authorization: Bearer <token>
 * Body: { fullName, phone, bio, avatarUrl, emailVisible, phoneVisible }
 */
router.put('/profile', authMiddleware, authController.updateProfile);

/**
 * PUT /api/auth/change-password
 * Change password for logged-in user
 * Headers: Authorization: Bearer <token>
 * Body: { currentPassword, newPassword }
 */
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
