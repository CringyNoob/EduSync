// src/controllers/authController.js
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendOTPEmail } = require('../utils/emailService');

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate HMAC hash for stateless OTP verification
 * @param {string} email 
 * @param {string} otp 
 * @param {number} expiry - Unix timestamp
 * @returns {string} - Hash string containing expiry and HMAC
 */
function generateOTPHash(email, otp, expiry) {
    const data = `${email.toLowerCase().trim()}.${otp}.${expiry}`;
    const hmac = crypto.createHmac('sha256', process.env.OTP_SECRET);
    hmac.update(data);
    return `${expiry}.${hmac.digest('hex')}`;
}

/**
 * Verify OTP using stateless hash method
 * @param {string} email 
 * @param {string} otp 
 * @param {string} hash - Format: "expiry.hmacDigest"
 * @returns {boolean}
 */
function verifyOTPHash(email, otp, hash) {
    try {
        const [expiry, originalHmac] = hash.split('.');
        
        // Check if OTP has expired
        if (Date.now() > parseInt(expiry)) {
            return false;
        }
        
        // Recalculate hash and compare
        const data = `${email.toLowerCase().trim()}.${otp}.${expiry}`;
        const hmac = crypto.createHmac('sha256', process.env.OTP_SECRET);
        hmac.update(data);
        const calculatedHmac = hmac.digest('hex');
        
        // Use timing-safe comparison to prevent timing attacks
        return crypto.timingSafeEqual(
            Buffer.from(originalHmac),
            Buffer.from(calculatedHmac)
        );
    } catch (error) {
        console.error('OTP verification error:', error);
        return false;
    }
}

/**
 * Generate JWT Access Token
 * @param {string} userId 
 * @param {string} email 
 * @param {string} role 
 * @returns {string}
 */
function generateAccessToken(userId, email, role) {
    return jwt.sign(
        { userId, email, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
}

// ============================================
// CONTROLLER FUNCTIONS
// ============================================

/**
 * Send OTP for email verification (pre-registration or password reset)
 * POST /api/auth/send-otp
 * Body: { email, type: 'registration' | 'password-reset' }
 */
async function sendOtp(req, res) {
    try {
        const { email, type = 'registration' } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Validate UIU email domain
        const domainPattern = /@[a-z]+\.uiu\.ac\.bd$/i;
        if (!domainPattern.test(normalizedEmail) && !normalizedEmail.endsWith('@uiu.ac.bd')) {
            return res.status(400).json({
                success: false,
                error: 'Only UIU email addresses (e.g., student@bscse.uiu.ac.bd) are allowed'
            });
        }

        // Check user existence based on type
        const existingUser = await db.query(
            'SELECT id, is_verified FROM users WHERE LOWER(email) = $1',
            [normalizedEmail]
        );

        if (type === 'registration' && existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        if (type === 'password-reset' && existingUser.rows.length === 0) {
            // Don't reveal if email exists for security
            return res.status(200).json({
                success: true,
                message: 'If your email is registered, you will receive an OTP'
            });
        }

        // Generate OTP and hash (10 minutes expiry)
        const otp = generateOTP();
        const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        const hash = generateOTPHash(normalizedEmail, otp, expiry);

        // Send OTP via email
        await sendOTPEmail(normalizedEmail, otp, type === 'registration' ? 'verification' : 'password-reset');

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully to your email',
            hash: hash,
            email: normalizedEmail
        });

    } catch (error) {
        console.error('Error in sendOtp:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to send OTP. Please try again.'
        });
    }
}

/**
 * Register new user with OTP verification
 * POST /api/auth/register
 * Body: { email, password, otp, hash, name, studentId, department, batch }
 */
async function register(req, res) {
    const client = await db.getClient(); // Get client for transaction
    
    try {
        const { 
            email, 
            password, 
            otp, 
            hash, 
            name,           // Can be full name
            firstName,      // Or firstName + lastName
            lastName,
            studentId, 
            department, 
            batch 
        } = req.body;

        // Combine name if firstName/lastName provided
        const fullName = name || `${firstName || ''} ${lastName || ''}`.trim();

        // Validation
        if (!email || !password || !otp || !hash || !fullName || !studentId || !department || !batch) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required (email, password, otp, hash, name, studentId, department, batch)'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Validate UIU email domain
        const domainPattern = /@[a-z]+\.uiu\.ac\.bd$/i;
        if (!domainPattern.test(normalizedEmail) && !normalizedEmail.endsWith('@uiu.ac.bd')) {
            return res.status(400).json({
                success: false,
                error: 'Only UIU email addresses (e.g., student@bscse.uiu.ac.bd) are allowed'
            });
        }

        // Validate student ID format (9 or 10 digits)
        const studentIdStr = String(studentId).trim();
        if (!/^\d{9,10}$/.test(studentIdStr)) {
            return res.status(400).json({
                success: false,
                error: 'Student ID must be 9 or 10 digits'
            });
        }

        // Validate batch is a valid year
        const batchYear = parseInt(batch);
        const currentYear = new Date().getFullYear();
        if (isNaN(batchYear) || batchYear < 2000 || batchYear > currentYear + 5) {
            return res.status(400).json({
                success: false,
                error: 'Batch must be a valid year'
            });
        }

        // Verify OTP using stateless hash method
        if (!verifyOTPHash(normalizedEmail, otp, hash)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired OTP. Please request a new one.'
            });
        }

        // Check if user already exists
        const existingUser = await client.query(
            'SELECT id FROM users WHERE LOWER(email) = $1',
            [normalizedEmail]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Check if student ID already exists
        const existingStudentId = await client.query(
            'SELECT user_id FROM profiles WHERE student_id = $1',
            [studentId]
        );

        if (existingStudentId.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Student ID already registered'
            });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Begin transaction
        await client.query('BEGIN');

        // 1. Insert into users table
        const userResult = await client.query(
            `INSERT INTO users (email, password_hash, role, is_verified)
             VALUES ($1, $2, $3, $4)
             RETURNING id, email, role, is_verified, created_at`,
            [normalizedEmail, passwordHash, 'student', true]
        );

        const newUser = userResult.rows[0];

        // 2. Insert into profiles table
        await client.query(
            `INSERT INTO profiles (user_id, full_name, student_id, department, batch, email_visible, phone_visible)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [newUser.id, fullName, studentId, department, batch, true, false]
        );

        // Commit transaction
        await client.query('COMMIT');

        // Generate JWT token
        const token = generateAccessToken(newUser.id, newUser.email, newUser.role);

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            token: token,
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
                isVerified: newUser.is_verified,
                name: fullName,
                studentId: studentId,
                department: department,
                batch: batch
            }
        });

    } catch (error) {
        // Rollback on error
        await client.query('ROLLBACK');
        console.error('Error in register:', error);
        return res.status(500).json({
            success: false,
            error: 'Registration failed. Please try again.'
        });
    } finally {
        client.release();
    }
}

/**
 * Login user
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Fetch user with profile data using JOIN
        const result = await db.query(
            `SELECT 
                u.id,
                u.email,
                u.password_hash,
                u.role,
                u.is_verified,
                u.created_at,
                p.full_name,
                p.student_id,
                p.department,
                p.batch,
                p.phone,
                p.bio,
                p.avatar_url,
                p.email_visible,
                p.phone_visible
             FROM users u
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE LOWER(u.email) = $1`,
            [normalizedEmail]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const user = result.rows[0];

        // Check if user is verified
        if (!user.is_verified) {
            return res.status(403).json({
                success: false,
                error: 'Please verify your email first'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateAccessToken(user.id, user.email, user.role);

        // Build user response object (exclude password_hash)
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isVerified: user.is_verified,
                name: user.full_name,
                studentId: user.student_id,
                department: user.department,
                batch: user.batch,
                phone: user.phone,
                bio: user.bio,
                avatarUrl: user.avatar_url,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Error in login:', error);
        return res.status(500).json({
            success: false,
            error: 'Login failed. Please try again.'
        });
    }
}

/**
 * Forgot Password - Send OTP for password reset
 * POST /api/auth/forgot-password
 * Body: { email }
 */
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if user exists
        const userResult = await db.query(
            'SELECT id, email FROM users WHERE LOWER(email) = $1',
            [normalizedEmail]
        );

        // Don't reveal if email exists (security best practice)
        if (userResult.rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'If your email is registered, you will receive a password reset OTP'
            });
        }

        // Generate OTP and hash (10 minutes expiry)
        const otp = generateOTP();
        const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        const hash = generateOTPHash(normalizedEmail, otp, expiry);

        // Send OTP via email
        await sendOTPEmail(normalizedEmail, otp, 'password-reset');

        return res.status(200).json({
            success: true,
            message: 'OTP sent to your email',
            hash: hash,
            email: normalizedEmail
        });

    } catch (error) {
        console.error('Error in forgotPassword:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to process request. Please try again.'
        });
    }
}

/**
 * Reset Password with OTP verification
 * POST /api/auth/reset-password
 * Body: { email, otp, hash, newPassword }
 */
async function resetPassword(req, res) {
    try {
        const { email, otp, hash, newPassword } = req.body;

        // Validation
        if (!email || !otp || !hash || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required (email, otp, hash, newPassword)'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Validate password strength
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters long'
            });
        }

        // Verify OTP using stateless hash method
        if (!verifyOTPHash(normalizedEmail, otp, hash)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired OTP. Please request a new one.'
            });
        }

        // Check if user exists
        const userResult = await db.query(
            'SELECT id FROM users WHERE LOWER(email) = $1',
            [normalizedEmail]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password in users table
        await db.query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE LOWER(email) = $2',
            [passwordHash, normalizedEmail]
        );

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Error in resetPassword:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to reset password. Please try again.'
        });
    }
}

/**
 * Get User Profile
 * GET /api/auth/profile
 * Headers: Authorization: Bearer <token>
 * Optional Query: ?userId=<id> (for viewing other profiles)
 */
async function getProfile(req, res) {
    try {
        const requestingUserId = req.user.userId; // From JWT middleware
        const targetUserId = req.query.userId || requestingUserId;
        const isOwnProfile = requestingUserId === targetUserId;

        // Fetch user with profile data using JOIN
        const result = await db.query(
            `SELECT 
                u.id,
                u.email,
                u.role,
                u.is_verified,
                u.created_at,
                p.full_name,
                p.student_id,
                p.department,
                p.batch,
                p.phone,
                p.bio,
                p.avatar_url,
                p.email_visible,
                p.phone_visible
             FROM users u
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE u.id = $1`,
            [targetUserId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const user = result.rows[0];

        // Build response with privacy controls
        const profileData = {
            id: user.id,
            role: user.role,
            isVerified: user.is_verified,
            name: user.full_name,
            studentId: user.student_id,
            department: user.department,
            batch: user.batch,
            bio: user.bio,
            avatarUrl: user.avatar_url,
            createdAt: user.created_at
        };

        // Apply privacy settings for viewing other profiles
        if (isOwnProfile) {
            // Own profile - show everything
            profileData.email = user.email;
            profileData.phone = user.phone;
            profileData.emailVisible = user.email_visible;
            profileData.phoneVisible = user.phone_visible;
        } else {
            // Other's profile - respect privacy settings
            if (user.email_visible) {
                profileData.email = user.email;
            }
            if (user.phone_visible) {
                profileData.phone = user.phone;
            }
        }

        return res.status(200).json({
            success: true,
            data: profileData
        });

    } catch (error) {
        console.error('Error in getProfile:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch profile. Please try again.'
        });
    }
}

/**
 * Update User Profile
 * PUT /api/auth/profile
 * Headers: Authorization: Bearer <token>
 * Body: { fullName, phone, bio, avatarUrl, emailVisible, phoneVisible }
 */
async function updateProfile(req, res) {
    try {
        const userId = req.user.userId; // From JWT middleware
        const { 
            fullName, 
            phone, 
            bio, 
            avatarUrl, 
            emailVisible, 
            phoneVisible 
        } = req.body;

        // Build dynamic update query for profiles table
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (fullName !== undefined) {
            updates.push(`full_name = $${paramIndex++}`);
            values.push(fullName);
        }
        if (phone !== undefined) {
            updates.push(`phone = $${paramIndex++}`);
            values.push(phone);
        }
        if (bio !== undefined) {
            updates.push(`bio = $${paramIndex++}`);
            values.push(bio);
        }
        if (avatarUrl !== undefined) {
            updates.push(`avatar_url = $${paramIndex++}`);
            values.push(avatarUrl);
        }
        if (emailVisible !== undefined) {
            updates.push(`email_visible = $${paramIndex++}`);
            values.push(emailVisible);
        }
        if (phoneVisible !== undefined) {
            updates.push(`phone_visible = $${paramIndex++}`);
            values.push(phoneVisible);
        }

        // Check if there's anything to update
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields provided for update'
            });
        }

        // Add updated_at timestamp
        updates.push(`updated_at = NOW()`);

        // Add user_id to values
        values.push(userId);

        // Execute update query
        const updateQuery = `
            UPDATE profiles 
            SET ${updates.join(', ')}
            WHERE user_id = $${paramIndex}
            RETURNING 
                user_id,
                full_name,
                student_id,
                department,
                batch,
                phone,
                bio,
                avatar_url,
                email_visible,
                phone_visible,
                updated_at
        `;

        const result = await db.query(updateQuery, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }

        const updatedProfile = result.rows[0];

        // Fetch email from users table for complete response
        const userResult = await db.query(
            'SELECT email, role FROM users WHERE id = $1',
            [userId]
        );

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: updatedProfile.user_id,
                email: userResult.rows[0]?.email,
                role: userResult.rows[0]?.role,
                name: updatedProfile.full_name,
                studentId: updatedProfile.student_id,
                department: updatedProfile.department,
                batch: updatedProfile.batch,
                phone: updatedProfile.phone,
                bio: updatedProfile.bio,
                avatarUrl: updatedProfile.avatar_url,
                emailVisible: updatedProfile.email_visible,
                phoneVisible: updatedProfile.phone_visible,
                updatedAt: updatedProfile.updated_at
            }
        });

    } catch (error) {
        console.error('Error in updateProfile:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update profile. Please try again.'
        });
    }
}

/**
 * Change Password (for logged-in users)
 * PUT /api/auth/change-password
 * Headers: Authorization: Bearer <token>
 * Body: { currentPassword, newPassword }
 */
async function changePassword(req, res) {
    try {
        const userId = req.user.userId; // From JWT middleware
        const { currentPassword, newPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'New password must be at least 8 characters long'
            });
        }

        // Fetch current password hash
        const userResult = await db.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(
            currentPassword, 
            userResult.rows[0].password_hash
        );

        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await db.query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [newPasswordHash, userId]
        );

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Error in changePassword:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to change password. Please try again.'
        });
    }
}

/**
 * Verify Token (for frontend to check if token is still valid)
 * GET /api/auth/verify-token
 * Headers: Authorization: Bearer <token>
 */
async function verifyToken(req, res) {
    try {
        const userId = req.user.userId; // From JWT middleware

        // Fetch basic user info
        const result = await db.query(
            `SELECT 
                u.id,
                u.email,
                u.role,
                u.is_verified,
                p.full_name,
                p.avatar_url
             FROM users u
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE u.id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const user = result.rows[0];

        return res.status(200).json({
            success: true,
            valid: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isVerified: user.is_verified,
                name: user.full_name,
                avatarUrl: user.avatar_url
            }
        });

    } catch (error) {
        console.error('Error in verifyToken:', error);
        return res.status(500).json({
            success: false,
            error: 'Token verification failed'
        });
    }
}

module.exports = {
    sendOtp,
    register,
    login,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    changePassword,
    verifyToken
};
