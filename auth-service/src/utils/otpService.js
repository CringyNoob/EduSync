// src/utils/otpService.js
const crypto = require('crypto');

// OTP Secret - use environment variable or fallback to default
const OTP_SECRET = process.env.OTP_SECRET || 'default-otp-secret-change-this-in-production';

/**
 * Generate a 6-digit OTP and create a cryptographic hash
 * @param {string} email - User's email address
 * @returns {object} - { otp: string, hash: string }
 */
function generateOtp(email) {
    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 5 minutes from now (in milliseconds)
    const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    // Create data string to hash
    const data = `${email}.${otp}.${expiryTime}`;
    
    // Create HMAC SHA256 hash
    const hash = crypto
        .createHmac('sha256', OTP_SECRET)
        .update(data)
        .digest('hex');
    
    // Return OTP and hash with expiry embedded
    return {
        otp,
        hash: `${hash}.${expiryTime}`
    };
}

/**
 * Verify OTP against the provided hash
 * @param {string} email - User's email address
 * @param {string} otp - OTP entered by user
 * @param {string} fullHash - Hash returned during OTP generation (format: hash.expiry)
 * @returns {boolean} - true if valid, false if invalid or expired
 */
function verifyOtp(email, otp, fullHash) {
    try {
        // Split the fullHash into hash and expiry
        const [hashValue, expires] = fullHash.split('.');
        
        // Check if hash format is valid
        if (!hashValue || !expires) {
            return false;
        }
        
        // Check if OTP has expired
        const expiryTime = parseInt(expires, 10);
        if (Date.now() > expiryTime) {
            console.log('OTP has expired');
            return false;
        }
        
        // Re-calculate the hash with the same data
        const data = `${email}.${otp}.${expires}`;
        const calculatedHash = crypto
            .createHmac('sha256', OTP_SECRET)
            .update(data)
            .digest('hex');
        
        // Compare the calculated hash with the provided hash
        return calculatedHash === hashValue;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return false;
    }
}

module.exports = {
    generateOtp,
    verifyOtp
};
