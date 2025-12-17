// src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

/**
 * Login Rate Limiter
 * Prevents brute force attacks on login endpoint
 * 5 attempts per 15 minutes
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    error: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * OTP Rate Limiter
 * Prevents OTP spam and abuse
 * 3 OTP requests per 5 minutes
 */
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 requests per window
  message: {
    success: false,
    error: 'Too many OTP requests. Please try again in 5 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Registration Rate Limiter
 * Prevents mass account creation
 * 3 registrations per 30 minutes per IP
 */
const registrationLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3,
  message: {
    success: false,
    error: 'Too many registration attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Password Reset Rate Limiter
 * Prevents password reset abuse
 * 3 attempts per hour
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    error: 'Too many password reset attempts. Please try again in 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API Rate Limiter
 * Apply to all routes to prevent abuse
 * 100 requests per minute
 */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  otpLimiter,
  registrationLimiter,
  passwordResetLimiter,
  apiLimiter
};
