// src/utils/emailService.js
const nodemailer = require('nodemailer');

/**
 * Configure email transporter using environment variables
 * For Gmail: Enable "App Password" in Google Account settings
 * For other providers: Use their SMTP settings
 */
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail', // e.g., 'gmail', 'outlook', 'yahoo'
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASSWORD // Your email password or app password
    }
});

/**
 * Send OTP email to user
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<object>} - Nodemailer response
 */
async function sendOtpEmail(to, otp) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'EduSync - Your OTP Code',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">EduSync Email Verification</h2>
                <p style="font-size: 16px; color: #555;">
                    Your One-Time Password (OTP) for registration is:
                </p>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #4CAF50; letter-spacing: 5px; margin: 0;">${otp}</h1>
                </div>
                <p style="font-size: 14px; color: #777;">
                    This OTP is valid for <strong>5 minutes</strong>.
                </p>
                <p style="font-size: 14px; color: #777;">
                    If you didn't request this code, please ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">
                    EduSync - University Information System
                </p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send OTP email');
    }
}

/**
 * Generic email sending function for future use
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML email content
 */
async function sendEmail(to, subject, htmlContent) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
}

module.exports = {
    sendOtpEmail,
    sendEmail
};
