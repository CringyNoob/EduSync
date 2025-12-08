import express from 'express';
import {
  register,
  verifyEmail,
  resendOTP,
  login,
  refreshToken,
  logout,
  logoutAllDevices,
  getProfile,
  updateProfile,
  switchRole,
  forgotPassword,
  resetPassword,
  getSessions,
  revokeSession,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { loginLimiter, otpLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', otpLimiter, resendOTP);
router.post('/login', loginLimiter, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAllDevices);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/switch-role', authenticate, switchRole);
router.get('/sessions', authenticate, getSessions);
router.delete('/sessions/:sessionId', authenticate, revokeSession);

export default router;
