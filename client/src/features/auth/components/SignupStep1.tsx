import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, CheckCircle, Loader } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { validatePassword } from '../utils/validators';
import { authService } from '../services/authService';
import { sessionManager } from '../utils/tokenManager';

interface SignupStep1Props {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  onEmailVerified?: (verified: boolean) => void;
}

const SignupStep1: React.FC<SignupStep1Props> = ({ register, errors, watch, setValue, onEmailVerified }) => {
  const email = watch('email') || '';
  const password = watch('password') || '';
  const otp = watch('otp') || '';

  // Initialize state from sessionStorage to persist across step navigation
  const [emailVerified, setEmailVerified] = useState(() => {
    const saved = sessionManager.getFormData('emailVerified');
    return saved?.verified || false;
  });
  const [verifiedEmail, setVerifiedEmail] = useState(() => {
    const saved = sessionManager.getFormData('emailVerified');
    return saved?.email || '';
  });
  const [passwordStrength, setPasswordStrength] = useState<any>(null);
  const [showOTPField, setShowOTPField] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Check if current email matches the verified email
  const isCurrentEmailVerified = emailVerified && email.trim().toLowerCase() === verifiedEmail.toLowerCase();

  // Sync parent state on mount if we have a verified email
  useEffect(() => {
    if (isCurrentEmailVerified && onEmailVerified) {
      onEmailVerified(true);
    }
  }, []);

  // Reset verification if email changes to a different email
  useEffect(() => {
    if (emailVerified && email && email.trim().toLowerCase() !== verifiedEmail.toLowerCase()) {
      // Email changed, reset verification
      setEmailVerified(false);
      setShowOTPField(false);
      setOtpSent(false);
      setOtpError('');
      setValue('otp', '');
      if (onEmailVerified) {
        onEmailVerified(false);
      }
      // Update sessionStorage
      sessionManager.saveFormData('emailVerified', { verified: false, email: '' });
    }
  }, [email, emailVerified, verifiedEmail, onEmailVerified, setValue]);

  useEffect(() => {
    if (password) {
      const strength = validatePassword(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  // Send OTP when email is filled
  const handleSendOTP = async () => {
    if (!email) {
      setOtpError('Please enter your email first');
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    try {
      await authService.resendOTP(email);
      setShowOTPField(true);
      setOtpSent(true);
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpVerifyLoading(true);
    setOtpError('');
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await authService.verifyEmail({ email: normalizedEmail, otp });
      setEmailVerified(true);
      setVerifiedEmail(normalizedEmail);
      setOtpError('');
      // Store verified email in sessionStorage
      sessionManager.saveFormData('emailVerified', { verified: true, email: normalizedEmail });
      // Notify parent that email is verified
      if (onEmailVerified) {
        onEmailVerified(true);
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Try again.');
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Email Verification
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Verify your university email to continue
        </p>
      </div>

      {/* Email Input */}
      <Input
        {...register('email')}
        label="University Email"
        type="email"
        placeholder="your.email@bscse.uiu.ac.bd"
        error={errors.email?.message}
        helperText="Use your official university email (format: name@dept.uiu.ac.bd)"
        disabled={isCurrentEmailVerified}
        required
      />

      {/* Send OTP Button */}
      {!isCurrentEmailVerified && !showOTPField && (
        <Button
          type="button"
          variant="primary"
          onClick={handleSendOTP}
          loading={otpLoading}
          fullWidth
        >
          {otpLoading ? 'Sending OTP...' : 'Send OTP to Email'}
        </Button>
      )}

      {/* OTP Input Section */}
      {showOTPField && !isCurrentEmailVerified && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <p className="text-sm text-blue-800 dark:text-blue-300">
            We've sent a 6-digit code to your email. Enter it below:
          </p>
          <Input
            {...register('otp')}
            label="OTP Code"
            type="text"
            placeholder="000000"
            maxLength={6}
            error={otpError}
            helperText="Check your email for the verification code"
            required
          />
          <Button
            type="button"
            variant="primary"
            onClick={handleVerifyOTP}
            loading={otpVerifyLoading}
            fullWidth
          >
            {otpVerifyLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </motion.div>
      )}

      {/* Email Verified Badge */}
      {isCurrentEmailVerified && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-800 dark:text-green-300">
            Email verified successfully!
          </span>
        </motion.div>
      )}

      {/* Password Fields (Only show after email verification) */}
      {isCurrentEmailVerified && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-700"
        >
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              Create Password
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Set a strong password for your account
            </p>
          </div>

          {/* Password */}
          <div>
            <Input
              {...register('password')}
              label="Password"
              type="password"
              placeholder="Create a strong password"
              error={errors.password?.message}
              required
            />

            {/* Password Strength Indicator */}
            {passwordStrength && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password Strength
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.level.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${(passwordStrength.score / 6) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {passwordStrength.feedback.map((feedback: string, index: number) => (
                      <li key={index} className="text-xs text-slate-600 dark:text-slate-400">
                        • {feedback}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <Input
            {...register('passwordConfirm')}
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            error={errors.passwordConfirm?.message}
            required
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default SignupStep1;
