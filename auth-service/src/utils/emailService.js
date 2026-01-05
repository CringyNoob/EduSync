// src/utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send OTP Email
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} type - 'verification' | 'password-reset'
 */
const sendOTPEmail = async (email, otp, type = 'verification') => {
  const isPasswordReset = type === 'password-reset';
  
  const subject = isPasswordReset 
    ? 'Reset Your EduSync Password'
    : 'Verify Your EduSync Account';
  
  const heading = isPasswordReset
    ? '🔒 Password Reset'
    : '🎓 Email Verification';
  
  const message = isPasswordReset
    ? 'You requested to reset your password. Use the code below:'
    : 'Welcome to EduSync! Use the code below to verify your email:';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #5B3FD9 0%, #A78BFA 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #5B3FD9; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #5B3FD9; letter-spacing: 5px; margin: 20px 0; border-radius: 8px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin-top: 15px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${heading}</h1>
          <p>University Management Platform</p>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>${message}</p>
          <div class="otp-box">${otp}</div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <div class="warning">
            ⚠️ Never share this code with anyone. EduSync staff will never ask for your OTP.
          </div>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2025 EduSync. All rights reserved.</p>
          <p>United International University</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"EduSync" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};

/**
 * Send Password Reset Link Email (alternative method)
 * @param {string} email - Recipient email address
 * @param {string} resetLink - Password reset URL
 */
const sendPasswordResetEmail = async (email, resetLink) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #5B3FD9 0%, #A78BFA 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #5B3FD9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Reset</h1>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>Hello,</p>
          <p>We received a request to reset your EduSync password. Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          <p>This link will expire in <strong>1 hour</strong>.</p>
          <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
          <p>© 2025 EduSync. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"EduSync" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your EduSync Password',
    html,
  });
};

// Legacy function name for backwards compatibility
const sendOtpEmail = sendOTPEmail;

module.exports = {
  transporter,
  sendOTPEmail,
  sendOtpEmail,
  sendPasswordResetEmail
};
