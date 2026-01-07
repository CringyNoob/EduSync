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
 * Body: { name, email, password, department, batch, otp, hash }
 */
async function register(req, res) {
    try {
        const { name, email, password, department, batch, otp, hash } = req.body;

        // Validation: Check all required fields
        if (!name || !email || !password || !department || !batch || !otp || !hash) {
            return res.status(400).json({ 
                success: false,
                error: 'All fields are required (name, email, password, department, batch, otp, hash)' 
            });
        }

        // Validation: Email must end with uiu.ac.bd
        if (!email.endsWith('uiu.ac.bd')) {
            return res.status(400).json({ 
                success: false,
                error: 'Only UIU email addresses (uiu.ac.bd) are allowed' 
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

        // Hash password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user into database
        const result = await db.query(
            `INSERT INTO users (name, email, password, department, batch) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, name, email, department, batch, created_at`,
            [name, email, hashedPassword, department, batch]
        );

        const newUser = result.rows[0];

        // Return success response
        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                department: newUser.department,
                batch: newUser.batch,
                created_at: newUser.created_at
            }
        });

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
        console.error('Error in login:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Login failed. Please try again.' 
        });
    }
}

module.exports = {
    sendOtp,
    register,
    login
};
