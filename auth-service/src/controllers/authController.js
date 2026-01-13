// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const otpService = require('../utils/otpService');
const emailService = require('../utils/emailService');

/**
 * Send OTP to user's email
 * POST /api/auth/send-otp
 * Body: { email }
 */
async function sendOtp(req, res) {
    try {
        const { email } = req.body;

        // Validation: Check if email is provided
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        // Validation: Email must end with uiu.ac.bd
        if (!email.endsWith('uiu.ac.bd')) {
            return res.status(400).json({
                success: false,
                error: 'Only UIU email addresses (uiu.ac.bd) are allowed'
            });
        }

        // Check if user already exists
        const existingUser = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Generate OTP and hash
        const { otp, hash } = otpService.generateOtp(email);

        // Send OTP via email
        await emailService.sendOtpEmail(email, otp);

        // Return hash to client (DO NOT send OTP in response)
        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully to your email',
            hash: hash // Client must store this to verify OTP later
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
 * Body: { fullName, email, password, studentId, phone, department, trimester, year, otp, hash }
 */
async function register(req, res) {
    try {
        const { fullName, email, password, studentId, phone, department, trimester, year, otp, hash } = req.body;

        // Validation: Check all required fields
        if (!fullName || !email || !password || !studentId || !department || !trimester || !year || !otp || !hash) {
            return res.status(400).json({ 
                success: false,
                error: 'All fields are required (fullName, email, password, studentId, department, trimester, year, otp, hash)' 
            });
        }

        // Validation: Email must end with uiu.ac.bd
        if (!email.endsWith('uiu.ac.bd')) {
            return res.status(400).json({
                success: false,
                error: 'Only UIU email addresses (uiu.ac.bd) are allowed'
            });
        }

        // Validation: Student ID must be 9 or 10 digits
        if (!/^\d{9,10}$/.test(studentId)) {
            return res.status(400).json({ 
                success: false,
                error: 'Student ID must be 9 or 10 digits' 
            });
        }

        // Validation: Valid trimesters
        const validTrimesters = ['Spring', 'Summer', 'Fall'];
        if (!validTrimesters.includes(trimester)) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid trimester. Must be Spring, Summer, or Fall' 
            });
        }

        // Validation: Valid year (2015 to current year + 1)
        const currentYear = new Date().getFullYear();
        const yearNum = parseInt(year, 10);
        if (isNaN(yearNum) || yearNum < 2015 || yearNum > currentYear + 1) {
            return res.status(400).json({ 
                success: false,
                error: `Invalid year. Must be between 2015 and ${currentYear + 1}` 
            });
        }

        // Verify OTP using cryptographic hash
        const isValidOtp = otpService.verifyOtp(email, otp, hash);

        if (!isValidOtp) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired OTP. Please request a new one.'
            });
        }

        // Check if user already exists (double-check)
        const existingUser = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Check if student ID already exists
        const existingStudentId = await db.query(
            'SELECT * FROM profiles WHERE student_id = $1',
            [studentId]
        );

        if (existingStudentId.rows.length > 0) {
            return res.status(400).json({ 
                success: false,
                error: 'This Student ID is already registered' 
            });
        }

        // Hash password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Combine trimester and year for batch field
        const batch = `${trimester} ${year}`;

        // Start a transaction to insert both user and profile
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Insert into users table (authentication data)
            const userResult = await client.query(
                `INSERT INTO users (email, password_hash, role, is_verified) 
                 VALUES ($1, $2, 'student', true) 
                 RETURNING id, email, role, created_at`,
                [email, hashedPassword]
            );

            const newUser = userResult.rows[0];

            // Insert into profiles table (user profile data)
            const profileResult = await client.query(
                `INSERT INTO profiles (user_id, full_name, student_id, department, batch, phone) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING id, full_name, student_id, department, batch, phone`,
                [newUser.id, fullName, studentId, department, batch, phone || null]
            );

            const newProfile = profileResult.rows[0];

            await client.query('COMMIT');

            // Generate JWT token for auto-login after registration
            const token = jwt.sign(
                { 
                    id: newUser.id,
                    name: newProfile.full_name,
                    email: newUser.email,
                    department: newProfile.department,
                    batch: newProfile.batch
                }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1d' }
            );

            // Return success response with token
            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                token: token,
                user: {
                    id: newUser.id,
                    name: newProfile.full_name,
                    email: newUser.email,
                    role: newUser.role,
                    studentId: newProfile.student_id,
                    department: newProfile.department,
                    batch: newProfile.batch,
                    phone: newProfile.phone,
                    created_at: newUser.created_at
                }
            });

        } catch (txError) {
            await client.query('ROLLBACK');
            throw txError;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error in register:', error);
        return res.status(500).json({
            success: false,
            error: 'Registration failed. Please try again.'
        });
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

        // Find user by email with profile data (JOIN)
        const result = await db.query(
            `SELECT 
                u.id, 
                u.email, 
                u.password_hash, 
                u.role,
                p.full_name as name,
                p.student_id,
                p.department,
                p.batch,
                p.phone,
                p.avatar_url
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const user = result.rows[0];

        // Compare password BEFORE generating token
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Generate token AFTER successful password validation
        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                department: user.department,
                batch: user.batch
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Return user data (exclude password_hash)
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                batch: user.batch,
                student_id: user.student_id
            }
        });

    } catch (error) {
        console.error('CRITICAL: Error in login function:', error);
        return res.status(500).json({
            success: false,
            error: 'Login failed. Please try again.',
            debug_info: error.message
        });
    }
}

/**
 * Send OTP for password reset
 * POST /api/auth/forgot-password
 * Body: { email }
 */
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        // Validation: Check if email is provided
        if (!email) {
            return res.status(400).json({ 
                success: false,
                error: 'Email is required' 
            });
        }

        // Check if user exists
        const existingUser = await db.query(
            'SELECT id, email FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'No account found with this email address' 
            });
        }

        // Generate OTP and hash
        const { otp, hash } = otpService.generateOtp(email);

        // Send OTP via email
        await emailService.sendPasswordResetOtp(email, otp);

        // Return hash to client (DO NOT send OTP in response)
        return res.status(200).json({
            success: true,
            message: 'Password reset OTP sent to your email',
            hash: hash
        });

    } catch (error) {
        console.error('Error in forgotPassword:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Failed to send password reset OTP. Please try again.' 
        });
    }
}

/**
 * Get user profile
 * GET /api/auth/profile
 * Requires: Bearer token
 */
async function getProfile(req, res) {
    try {
        const userId = req.user.userId;

        // Get user with profile data
        const result = await db.query(
            `SELECT 
                u.id, 
                u.email, 
                u.role,
                u.created_at,
                p.full_name,
                p.student_id,
                p.department,
                p.batch,
                p.phone,
                p.bio,
                p.avatar_url,
                p.phone_visible
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
            profile: {
                id: user.id,
                email: user.email,
                role: user.role,
                fullName: user.full_name,
                studentId: user.student_id,
                department: user.department,
                batch: user.batch,
                phone: user.phone,
                bio: user.bio,
                avatarUrl: user.avatar_url,
                phoneVisible: user.phone_visible !== false, // default to true
                createdAt: user.created_at
            }
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
 * Update user profile
 * PUT /api/auth/profile
 * Requires: Bearer token
 * Body: { phone, bio, avatarUrl, phoneVisible }
 */
async function updateProfile(req, res) {
    try {
        const userId = req.user.userId;
        const { phone, bio, avatarUrl, phoneVisible } = req.body;

        // Check if profile exists
        const existingProfile = await db.query(
            'SELECT id FROM profiles WHERE user_id = $1',
            [userId]
        );

        if (existingProfile.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Profile not found' 
            });
        }

        // Update profile with only editable fields
        const result = await db.query(
            `UPDATE profiles 
             SET phone = COALESCE($1, phone),
                 bio = COALESCE($2, bio),
                 avatar_url = COALESCE($3, avatar_url),
                 phone_visible = COALESCE($4, phone_visible),
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $5
             RETURNING id, full_name, student_id, department, batch, phone, bio, avatar_url, phone_visible`,
            [phone, bio, avatarUrl, phoneVisible, userId]
        );

        const updatedProfile = result.rows[0];

        // Get email from users table for complete response
        const userResult = await db.query(
            'SELECT email, role FROM users WHERE id = $1',
            [userId]
        );

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile: {
                id: userId,
                email: userResult.rows[0].email,
                role: userResult.rows[0].role,
                fullName: updatedProfile.full_name,
                studentId: updatedProfile.student_id,
                department: updatedProfile.department,
                batch: updatedProfile.batch,
                phone: updatedProfile.phone,
                bio: updatedProfile.bio,
                avatarUrl: updatedProfile.avatar_url,
                phoneVisible: updatedProfile.phone_visible !== false
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
 * Reset password with OTP verification
 * POST /api/auth/reset-password
 * Body: { email, otp, hash, newPassword }
 */
async function resetPassword(req, res) {
    try {
        const { email, otp, hash, newPassword } = req.body;

        // Validation: Check all required fields
        if (!email || !otp || !hash || !newPassword) {
            return res.status(400).json({ 
                success: false,
                error: 'All fields are required (email, otp, hash, newPassword)' 
            });
        }

        // Validation: Password minimum length
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false,
                error: 'Password must be at least 6 characters long' 
            });
        }

        // Verify OTP using cryptographic hash
        const isValidOtp = otpService.verifyOtp(email, otp, hash);

        if (!isValidOtp) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid or expired OTP. Please request a new one.' 
            });
        }

        // Check if user exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'No account found with this email address' 
            });
        }

        // Hash new password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password in database
        await db.query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
            [hashedPassword, email]
        );

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully. Please login with your new password.'
        });

    } catch (error) {
        console.error('Error in resetPassword:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Password reset failed. Please try again.' 
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
    updateProfile
};
