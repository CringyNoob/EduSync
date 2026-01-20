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
                `INSERT INTO users (email, password_hash, roles, active_role, is_verified) 
                 VALUES ($1, $2, ARRAY['STUDENT'], 'STUDENT', true) 
                 RETURNING id, email, roles, active_role, created_at`,
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
                    batch: newProfile.batch,
                    roles: newUser.roles,
                    activeRole: newUser.active_role
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
                    role: newUser.role, // Deprecated
                    roles: newUser.roles,
                    activeRole: newUser.active_role,
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
                u.roles,
                u.active_role,
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
                batch: user.batch,
                roles: user.roles || ['STUDENT'],
                activeRole: user.active_role || 'STUDENT'
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
                role: user.role, // Deprecated
                roles: user.roles || ['STUDENT'],
                activeRole: user.active_role || 'STUDENT',
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
                u.roles,
                u.active_role,
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
                role: user.role, // Deprecated
                roles: user.roles || ['STUDENT'],
                activeRole: user.active_role || 'STUDENT',
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

        // Get email and roles from users table for complete response
        const userResult = await db.query(
            'SELECT email, roles, active_role FROM users WHERE id = $1',
            [userId]
        );

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile: {
                id: userId,
                email: userResult.rows[0].email,
                roles: userResult.rows[0].roles || ['STUDENT'],
                activeRole: userResult.rows[0].active_role || 'STUDENT',
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

/**
 * Get user by ID (public profile info only)
 * GET /api/auth/user/:id
 */
async function getUserById(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        // Query user with profile information (JOIN users and profiles tables)
        const result = await db.query(
            `SELECT u.id, u.email, u.created_at, u.roles, u.active_role,
                    p.full_name, p.avatar_url, p.bio, p.department, p.batch
             FROM users u
             LEFT JOIN profiles p ON u.id = p.user_id
             WHERE u.id = $1`,
            [id]
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
            data: {
                id: user.id,
                name: user.full_name || 'Unknown User',
                email: user.email,
                avatarUrl: user.avatar_url,
                bio: user.bio,
                department: user.department,
                batch: user.batch,
                roles: user.roles || ['STUDENT'],
                activeRole: user.active_role || 'STUDENT',
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Error in getUserById:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch user. Please try again.'
        });
    }
}

/**
 * Add VENDOR role to user
 * POST /api/auth/add-vendor-role
 * Requires: Bearer token
 * Used by marketplace-service after successful vendor registration
 */
async function addVendorRole(req, res) {
    try {
        const userId = req.user.userId;

        console.log('📝 addVendorRole called for userId:', userId);

        // Get current roles
        const userResult = await db.query(
            'SELECT roles, active_role FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            console.error('❌ User not found:', userId);
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const currentRoles = userResult.rows[0].roles || ['STUDENT'];
        console.log('Current roles:', currentRoles);

        // Check if user already has VENDOR role
        if (currentRoles.includes('VENDOR')) {
            console.log('✅ User already has VENDOR role');
            return res.status(200).json({
                success: true,
                message: 'User already has VENDOR role',
                roles: currentRoles
            });
        }

        // Add VENDOR role to the array
        const updatedRoles = [...currentRoles, 'VENDOR'];
        console.log('Updated roles:', updatedRoles);

        // Update user roles and set active_role to VENDOR
        // Use PostgreSQL array literal syntax
        const updateResult = await db.query(
            'UPDATE users SET roles = $1::text[], active_role = $2 WHERE id = $3 RETURNING roles, active_role',
            [updatedRoles, 'VENDOR', userId]
        );

        console.log('✅ Database updated:', updateResult.rows[0]);

        return res.status(200).json({
            success: true,
            message: 'VENDOR role added successfully',
            roles: updateResult.rows[0].roles,
            activeRole: updateResult.rows[0].active_role
        });

    } catch (error) {
        console.error('❌ Error in addVendorRole:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to add VENDOR role',
            details: error.message
        });
    }
}

/**
 * Switch active role for user
 * POST /switch-role
 * Requires: Bearer token
 * Body: { role }
 * Used when user switches between STUDENT/VENDOR/ADMIN profiles
 */
async function switchActiveRole(req, res) {
    try {
        const userId = req.user.userId;
        const { role } = req.body;

        console.log('📝 switchActiveRole called for userId:', userId, 'to role:', role);

        if (!role) {
            return res.status(400).json({
                success: false,
                error: 'Role is required'
            });
        }

        // Get current roles to validate
        const userResult = await db.query(
            'SELECT roles, active_role FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const currentRoles = userResult.rows[0].roles || ['STUDENT'];
        console.log('Current roles:', currentRoles);

        // Validate that user has the role they're trying to switch to
        if (!currentRoles.includes(role)) {
            return res.status(403).json({
                success: false,
                error: `User does not have ${role} role`
            });
        }

        // Update active_role in database
        const updateResult = await db.query(
            'UPDATE users SET active_role = $1 WHERE id = $2 RETURNING roles, active_role',
            [role, userId]
        );

        console.log('✅ Active role switched to:', updateResult.rows[0].active_role);

        return res.status(200).json({
            success: true,
            message: `Active role switched to ${role}`,
            roles: updateResult.rows[0].roles,
            activeRole: updateResult.rows[0].active_role
        });

    } catch (error) {
        console.error('❌ Error in switchActiveRole:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to switch active role'
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
    getUserById,
    addVendorRole,
    switchActiveRole
};
