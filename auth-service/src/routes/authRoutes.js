// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * POST /api/auth/send-otp
 * Send OTP to user's email for registration
 * Body: { email }
 */
router.post('/send-otp', authController.sendOtp);

/**
 * POST /api/auth/register
 * Register a new user with OTP verification
 * Body: { fullName, email, password, studentId, phone, department, trimester, year, otp, hash }
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Login existing user
 * Body: { email, password }
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/forgot-password
 * Send OTP for password reset
 * Body: { email }
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * POST /api/auth/reset-password
 * Reset password with OTP verification
 * Body: { email, otp, hash, newPassword }
 */
router.post('/reset-password', authController.resetPassword);

/**
 * GET /api/auth/profile
 * Get current user's profile (requires authentication)
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * PUT /api/auth/profile
 * Update current user's profile (requires authentication)
 * Body: { phone, bio, avatarUrl, phoneVisible }
 */
router.put('/profile', authMiddleware, authController.updateProfile);

/**
 * GET /api/auth/user/:id
 * Get public user profile by ID (no authentication required)
 */
router.get('/user/:id', authController.getUserById);

/**
 * POST /api/auth/add-vendor-role
 * Add VENDOR role to authenticated user (used by marketplace-service)
 */
router.post('/add-vendor-role', authMiddleware, authController.addVendorRole);

/**
 * POST /api/auth/switch-role
 * Switch active role for authenticated user
 * Body: { role }
 */
router.post('/switch-role', authMiddleware, authController.switchActiveRole);

module.exports = router;
