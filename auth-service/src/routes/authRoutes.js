// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * POST /api/auth/send-otp
 * Send OTP to user's email for registration
 * Body: { email }
 */
router.post('/send-otp', authController.sendOtp);

/**
 * POST /api/auth/register
 * Register a new user with OTP verification
 * Body: { name, email, password, department, batch, otp, hash }
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Login existing user
 * Body: { email, password }
 */
router.post('/login', authController.login);

module.exports = router;
