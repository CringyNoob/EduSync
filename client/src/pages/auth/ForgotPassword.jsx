import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ArrowLeft, Mail, Shield, Lock, CheckCircle, Loader2 } from 'lucide-react';
import Button from '../../components/Button';
import authService from '../../services/authService';

const ForgotPassword = () => {
    const navigate = useNavigate();
    
    // Step management (1: Email, 2: OTP, 3: New Password)
    const [step, setStep] = useState(1);
    
    // Form data
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        hash: '',
        newPassword: '',
        confirmPassword: '',
    });
    
    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Password strength calculation
    const getPasswordStrength = (password) => {
        if (!password) return { score: 0, label: '', color: '' };
        
        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
        
        score = Object.values(checks).filter(Boolean).length;
        
        if (password.length >= 12) score += 1;
        
        if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
        if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
        if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
        if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-lime-500' };
        return { score: 5, label: 'Very Strong', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(formData.newPassword);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    // Step 1: Send OTP to email
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.email) {
            setError('Email is required');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.forgotPassword(formData.email);
            if (response.success) {
                setFormData(prev => ({ ...prev, hash: response.hash }));
                setSuccess('OTP sent to your email!');
                setStep(2);
            } else {
                setError(response.error || 'Failed to send OTP');
            }
        } catch (err) {
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.otp || formData.otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        // Move to password reset step
        setStep(3);
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.resetPassword(
                formData.email,
                formData.otp,
                formData.hash,
                formData.newPassword
            );
            
            if (response.success) {
                setSuccess('Password reset successful! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(response.error || 'Password reset failed');
            }
        } catch (err) {
            setError(err.message || 'Password reset failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        setError('');
        setIsLoading(true);
        try {
            const response = await authService.forgotPassword(formData.email);
            if (response.success) {
                setFormData(prev => ({ ...prev, hash: response.hash, otp: '' }));
                setSuccess('OTP resent to your email!');
            } else {
                setError(response.error || 'Failed to resend OTP');
            }
        } catch (err) {
            setError(err.message || 'Failed to resend OTP');
        } finally {
            setIsLoading(false);
        }
    };

    // Go back to previous step
    const goBack = () => {
        setError('');
        setSuccess('');
        setStep(prev => Math.max(1, prev - 1));
    };

    // Step indicator component
    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step >= s 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-200 text-gray-500'
                    }`}>
                        {step > s ? <CheckCircle size={16} /> : s}
                    </div>
                    {s < 3 && (
                        <div className={`w-8 h-0.5 ${step > s ? 'bg-primary' : 'bg-gray-200'}`} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-secondary/10 via-bkg to-primary/10 backdrop-blur-sm p-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-accent/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow animation-delay-2000"></div>

            {/* Main Card */}
            <div className="w-full max-w-[1000px] min-h-[500px] bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/60 flex overflow-hidden relative animate-fade-in-up">

                {/* Close Button */}
                <button onClick={() => navigate('/')} className="absolute top-4 right-4 z-50 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:bg-white transition-all cursor-pointer group">
                    <X size={16} className="text-text-main group-hover:text-primary transition-colors" />
                </button>

                {/* LEFT SIDE - FORM */}
                <div className="w-full lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center relative">

                    {/* Logo */}
                    <div className="absolute top-8 left-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <img src="/logo.png" alt="EduSync Logo" className="h-8 w-auto group-hover:scale-105 transition-transform" />
                            <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">EduSync</span>
                        </Link>
                    </div>

                    <div className="max-w-sm w-full mx-auto mt-12">
                        <StepIndicator />

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-xs">
                                {success}
                            </div>
                        )}

                        {/* STEP 1: Email Input */}
                        {step === 1 && (
                            <>
                                <div className="mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                                        <Mail size={24} />
                                    </div>
                                    <h1 className="text-2xl font-bold text-text-main mb-1">Forgot Password?</h1>
                                    <p className="text-sm text-text-main-light">
                                        Enter your email and we'll send you an OTP to reset your password.
                                    </p>
                                </div>

                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-text-main ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="yourname@uiu.ac.bd"
                                            className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-primary/20 border-none hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
                                        {isLoading ? 'Sending OTP...' : 'Send OTP'}
                                    </Button>
                                </form>
                            </>
                        )}

                        {/* STEP 2: OTP Verification */}
                        {step === 2 && (
                            <>
                                <button onClick={goBack} className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary mb-4 transition-colors">
                                    <ArrowLeft size={14} /> Back
                                </button>

                                <div className="mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                                        <Shield size={24} />
                                    </div>
                                    <h1 className="text-2xl font-bold text-text-main mb-1">Verify OTP</h1>
                                    <p className="text-sm text-text-main-light">
                                        Enter the 6-digit code sent to {formData.email}
                                    </p>
                                </div>

                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-text-main ml-1">Verification Code</label>
                                        <input
                                            type="text"
                                            name="otp"
                                            value={formData.otp}
                                            onChange={handleChange}
                                            placeholder="Enter 6-digit OTP"
                                            maxLength={6}
                                            className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none tracking-widest text-center font-mono text-lg"
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-primary/20 border-none hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                        Verify & Continue
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={isLoading}
                                        className="w-full text-xs text-gray-500 hover:text-primary transition-colors"
                                    >
                                        Didn't receive the code? <span className="font-semibold">Resend</span>
                                    </button>
                                </form>
                            </>
                        )}

                        {/* STEP 3: New Password */}
                        {step === 3 && (
                            <>
                                <button onClick={goBack} className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary mb-4 transition-colors">
                                    <ArrowLeft size={14} /> Back
                                </button>

                                <div className="mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                                        <Lock size={24} />
                                    </div>
                                    <h1 className="text-2xl font-bold text-text-main mb-1">Create New Password</h1>
                                    <p className="text-sm text-text-main-light">
                                        Enter your new password below.
                                    </p>
                                </div>

                                <form onSubmit={handleResetPassword} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-text-main ml-1 flex items-center gap-1">
                                            <Lock size={12} /> New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                            required
                                        />
                                    </div>

                                    {/* Password Strength Indicator */}
                                    {formData.newPassword && (
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Password Strength</span>
                                                <span className={`text-xs font-semibold ${
                                                    passwordStrength.score <= 1 ? 'text-red-500' :
                                                    passwordStrength.score <= 2 ? 'text-orange-500' :
                                                    passwordStrength.score <= 3 ? 'text-yellow-600' :
                                                    passwordStrength.score <= 4 ? 'text-lime-600' : 'text-green-600'
                                                }`}>
                                                    {passwordStrength.label}
                                                </span>
                                            </div>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((level) => (
                                                    <div
                                                        key={level}
                                                        className={`h-1.5 flex-1 rounded-full transition-all ${
                                                            level <= passwordStrength.score 
                                                                ? passwordStrength.color 
                                                                : 'bg-gray-200'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                Use 8+ chars with uppercase, lowercase, numbers & symbols
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-text-main ml-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                            required
                                        />
                                    </div>

                                    {/* Password match indicator */}
                                    {formData.confirmPassword && (
                                        <div className={`text-xs flex items-center gap-1 ${
                                            formData.newPassword === formData.confirmPassword 
                                                ? 'text-green-600' 
                                                : 'text-red-500'
                                        }`}>
                                            {formData.newPassword === formData.confirmPassword ? (
                                                <>
                                                    <CheckCircle size={12} /> Passwords match
                                                </>
                                            ) : (
                                                <>
                                                    <X size={12} /> Passwords do not match
                                                </>
                                            )}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md shadow-primary/20 border-none hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                        {isLoading ? 'Resetting Password...' : 'Reset Password'}
                                    </Button>
                                </form>
                            </>
                        )}

                        <div className="mt-8 text-center">
                            <Link to="/login" className="inline-flex items-center text-xs font-semibold text-text-main-light hover:text-primary transition-colors group">
                                <ArrowLeft size={14} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                                Back to Sign in
                            </Link>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - IMAGE & OVERLAYS */}
                <div className="hidden lg:block w-1/2 relative bg-secondary overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
                        alt="Study Focus"
                        className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-transparent pointer-events-none"></div>

                    {/* Floating Info Card */}
                    <div className="absolute top-[35%] left-[50%] -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/30 p-6 rounded-3xl text-white text-center w-64 shadow-2xl animate-float">
                        <div className="text-xl font-bold mb-2">Secure Reset</div>
                        <div className="text-white/80 text-xs mb-4">We prioritize your account security. Verify your identity with OTP to reset your password.</div>
                        <div className="h-1 w-20 bg-primary rounded-full mx-auto"></div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ForgotPassword;
