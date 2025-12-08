import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateOTP,
  generateResetToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../utils/email.js';
import { AppError } from '../middleware/errorHandler.js';

// Register User
export const register = async (req, res, next) => {
  try {
    const {
      email: rawEmail,
      password,
      firstName,
      lastName,
      studentId,
      department,
      batch,
      semester,
      phone,
    } = req.body;

    // Normalize email
    const email = (rawEmail || '').trim().toLowerCase();

    // Check email domain or prior verification
    const domainPattern = /@[a-z]+\.uiu\.ac\.bd$/i;
    let isVerifiedPreRegistration = false;
    try {
      const ver = await pool.query(
        `SELECT id FROM email_verifications 
         WHERE LOWER(email) = $1 AND is_used = true 
         ORDER BY created_at DESC LIMIT 1`,
        [email]
      );
      isVerifiedPreRegistration = ver.rows.length > 0;
    } catch (e) {
      // ignore check errors, fallback to regex
    }

    console.log('Registration check:', { email, isVerifiedPreRegistration, domainTest: domainPattern.test(email) });

    if (!isVerifiedPreRegistration && !domainPattern.test(email)) {
      throw new AppError('Please use your university email (e.g., student@bscse.uiu.ac.bd)', 400);
    }

    // Validate student ID department code
    const deptCode = studentId.substring(0, 3);
    const validDeptCodes = ['011', '012', '013', '014', '015', '016'];
    if (!validDeptCodes.includes(deptCode)) {
      throw new AppError('Invalid student ID department code', 400);
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR student_id = $2',
      [email, studentId]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('Email or Student ID already registered', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert user with email already marked as verified
      const userResult = await client.query(
        `INSERT INTO users (
          email, password_hash, first_name, last_name, student_id,
          department, batch, semester, phone, is_email_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, email, first_name, last_name, student_id, department, 
                  batch, semester, phone, role, is_email_verified`,
        [email, passwordHash, firstName, lastName, studentId, department, batch, semester, phone, true]
      );

      await client.query('COMMIT');

      const user = userResult.rows[0];

      // Generate tokens
      const accessToken = generateAccessToken(user.id, user.role);
      const refreshToken = generateRefreshToken(user.id);

      // Store session
      const deviceInfo = req.body.deviceInfo || {};
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await pool.query(
        `INSERT INTO sessions (user_id, refresh_token, device_info, ip_address, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, refreshToken, JSON.stringify(deviceInfo), req.ip, expiresAt]
      );

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            studentId: user.student_id,
            department: user.department,
            batch: user.batch,
            semester: user.semester,
            phone: user.phone,
            roles: [user.role],
            activeRole: user.role,
            isEmailVerified: user.is_email_verified,
          },
          accessToken,
        },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// Verify Email
export const verifyEmail = async (req, res, next) => {
  try {
    const { email: rawEmail, otp } = req.body;
    const email = (rawEmail || '').trim().toLowerCase();

    // Find OTP
    const otpResult = await pool.query(
      `SELECT * FROM email_verifications 
       WHERE LOWER(email) = $1 AND otp = $2 AND is_used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );

    if (otpResult.rows.length === 0) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    // Mark OTP as used
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        'UPDATE email_verifications SET is_used = true WHERE id = $1',
        [otpResult.rows[0].id]
      );

      // Check if user exists
      const userResult = await client.query(
        'SELECT id, email FROM users WHERE email = $1',
        [email]
      );

      // If user exists, mark email as verified
      if (userResult.rows.length > 0) {
        await client.query(
          `UPDATE users SET is_email_verified = true, updated_at = NOW()
           WHERE email = $1`,
          [email]
        );
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Email verified successfully',
        verified: true,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// Resend OTP
export const resendOTP = async (req, res, next) => {
  try {
    const { email: rawEmail } = req.body;
    const email = (rawEmail || '').trim().toLowerCase();

    // Validate email format
    const domainPattern = /@[a-z]+\.uiu\.ac\.bd$/i;
    if (!domainPattern.test(email)) {
      throw new AppError('Please use your university email (e.g., student@bscse.uiu.ac.bd)', 400);
    }

    // Check if user exists (for resend case)
    const userResult = await pool.query(
      'SELECT id, email, is_email_verified FROM users WHERE LOWER(email) = $1',
      [email]
    );

    // If user exists, check if already verified
    if (userResult.rows.length > 0 && userResult.rows[0].is_email_verified) {
      throw new AppError('Email already verified', 400);
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Delete old OTP if exists and insert new one (use lowercase for consistency)
    await pool.query(
      'DELETE FROM email_verifications WHERE LOWER(email) = $1',
      [email]
    );

    await pool.query(
      'INSERT INTO email_verifications (email, otp, expires_at) VALUES ($1, $2, $3)',
      [email, otp, otpExpiry]
    );

    await sendOTPEmail(email, otp, 'verification');

    res.json({
      success: true,
      message: 'Verification code sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password, deviceInfo } = req.body;

    // Find user
    const userResult = await pool.query(
            `SELECT id, email, password_hash, first_name, last_name, student_id, 
              department, batch, semester, phone, role, 
              is_email_verified, two_factor_enabled
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    if (userResult.rows.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = userResult.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if email is verified
    if (!user.is_email_verified) {
      throw new AppError('Please verify your email first', 403);
    }

    // If 2FA is enabled, send OTP
    if (user.two_factor_enabled) {
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      await pool.query(
        `INSERT INTO email_verifications (email, otp, expires_at) VALUES ($1, $2, $3)`,
        [email, otp, otpExpiry]
      );

      await sendOTPEmail(email, otp, '2fa');

      return res.json({
        success: true,
        message: 'Please check your email for 2FA code',
        requires2FA: true,
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.active_role);
    const refreshToken = generateRefreshToken(user.id);

    // Store session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO sessions (user_id, refresh_token, device_info, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, refreshToken, JSON.stringify(deviceInfo || {}), req.ip, expiresAt]
    );

    // Update last login
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    delete user.password_hash;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          ...user,
          roles: user.roles || ['student'],
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Refresh Token
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new AppError('Refresh token not found', 401);
    }

    // Verify token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if session exists and is active
    const sessionResult = await pool.query(
      `SELECT s.*, u.active_role FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.refresh_token = $1 AND s.is_active = true AND s.expires_at > NOW()`,
      [refreshToken]
    );

    if (sessionResult.rows.length === 0) {
      throw new AppError('Invalid or expired session', 401);
    }

    const session = sessionResult.rows[0];

    // Update session last active
    await pool.query(
      'UPDATE sessions SET last_active = NOW() WHERE id = $1',
      [session.id]
    );

    // Generate new access token
    const accessToken = generateAccessToken(session.user_id, session.active_role);

    res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      await pool.query(
        'UPDATE sessions SET is_active = false WHERE refresh_token = $1',
        [refreshToken]
      );
    }

    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Logout All Devices
export const logoutAllDevices = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await pool.query(
      'UPDATE sessions SET is_active = false WHERE user_id = $1',
      [userId]
    );

    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out from all devices',
    });
  } catch (error) {
    next(error);
  }
};

// Get Profile
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const userResult = await pool.query(
      `SELECT id, email, first_name, last_name, student_id, department, 
              batch, semester, phone, profile_photo, bio, role,
              is_email_verified, is_phone_verified, two_factor_enabled,
              email_visible, phone_visible,
              created_at, last_login_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = userResult.rows[0];
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        studentId: user.student_id,
        department: user.department,
        batch: user.batch,
        semester: user.semester,
        phone: user.phone,
        profilePhoto: user.profile_photo,
        bio: user.bio,
        roles: [user.role],
        activeRole: user.role,
        isEmailVerified: user.is_email_verified,
        isPhoneVerified: user.is_phone_verified,
        twoFactorEnabled: user.two_factor_enabled,
        emailVisible: user.email_visible,
        phoneVisible: user.phone_visible,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update Profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, phone, bio, profilePhoto, semester, emailVisible, phoneVisible } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (firstName !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      values.push(lastName);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      values.push(bio);
    }
    if (profilePhoto !== undefined) {
      updates.push(`profile_photo = $${paramIndex++}`);
      values.push(profilePhoto);
    }
    if (semester !== undefined) {
      updates.push(`semester = $${paramIndex++}`);
      values.push(semester);
    }
    if (emailVisible !== undefined) {
      updates.push(`email_visible = $${paramIndex++}`);
      values.push(emailVisible);
    }
    if (phoneVisible !== undefined) {
      updates.push(`phone_visible = $${paramIndex++}`);
      values.push(phoneVisible);
    }

    if (updates.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE users SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, first_name, last_name, student_id, department,
                batch, semester, phone, profile_photo, bio, role,
                is_email_verified, email_visible, phone_visible
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = result.rows[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        studentId: user.student_id,
        department: user.department,
        batch: user.batch,
        semester: user.semester,
        phone: user.phone,
        profilePhoto: user.profile_photo,
        bio: user.bio,
        roles: [user.role],
        activeRole: user.role,
        isEmailVerified: user.is_email_verified,
        emailVisible: user.email_visible,
        phoneVisible: user.phone_visible,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Switch Role
export const switchRole = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { role } = req.body;

    // Update active role
    const userResult = await pool.query(
      `UPDATE users SET active_role = $1, updated_at = NOW()
       WHERE id = $2 AND $1 = ANY(roles)
       RETURNING id, email, first_name, last_name, student_id, department,
                 batch, year, program, phone, roles, active_role`,
      [role, userId]
    );

    if (userResult.rows.length === 0) {
      throw new AppError('Invalid role or user not found', 400);
    }

    res.json({
      success: true,
      user: userResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// Forgot Password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const userResult = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link',
      });
    }

    const user = userResult.rows[0];

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, expiresAt]
    );

    const resetLink = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(user.email, resetLink);

    res.json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Find token
    const tokenResult = await pool.query(
      `SELECT * FROM password_reset_tokens 
       WHERE token = $1 AND is_used = false AND expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const resetToken = tokenResult.rows[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password and mark token as used
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [passwordHash, resetToken.user_id]
      );

      await client.query(
        'UPDATE password_reset_tokens SET is_used = true WHERE id = $1',
        [resetToken.id]
      );

      // Invalidate all sessions
      await client.query(
        'UPDATE sessions SET is_active = false WHERE user_id = $1',
        [resetToken.user_id]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// Get Sessions
export const getSessions = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const sessionsResult = await pool.query(
      `SELECT id, device_info, ip_address, is_active, created_at, last_active
       FROM sessions 
       WHERE user_id = $1 AND is_active = true
       ORDER BY last_active DESC`,
      [userId]
    );

    res.json(sessionsResult.rows);
  } catch (error) {
    next(error);
  }
};

// Revoke Session
export const revokeSession = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;

    await pool.query(
      'UPDATE sessions SET is_active = false WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    res.json({
      success: true,
      message: 'Session revoked successfully',
    });
  } catch (error) {
    next(error);
  }
};
