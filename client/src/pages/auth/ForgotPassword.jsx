import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Mail, Lock, Hash } from 'lucide-react';
import Input from '../../components/Form/Input';
import Button from '../../components/Button';
import authService from '../../services/authService';

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        otpHash: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    // Send OTP for password reset
    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (!formData.email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await authService.forgotPassword(formData.email);
            
            // Save OTP hash from response
            setFormData(prev => ({
                ...prev,
                otpHash: response.hash,
            }));
            
            setStep(2);
            setSuccess('OTP has been sent to your email');
        } catch (err) {
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Reset password with OTP
    const handleResetPassword = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.otp || formData.otp.length !== 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }

        if (!formData.newPassword || formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await authService.resetPassword(
                formData.email,
                formData.otp,
                formData.otpHash,
                formData.newPassword
            );

            setSuccess('Password reset successful! Redirecting to login...');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Password reset failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side - Form */}
            <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="mb-10">
                        <Link to="/login" className="flex items-center text-sm font-medium text-gray-500 hover:text-brand-purple transition-colors mb-6">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Login
                        </Link>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-brand-purple-dark p-2 rounded-lg">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">EduSync</span>
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            {step === 1 ? 'Forgot Password' : 'Reset Password'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {step === 1 
                                ? "Enter your email and we'll send you an OTP to reset your password." 
                                : 'Enter the OTP sent to your email and your new password.'}
                        </p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-600">{success}</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp}>
                            <div className="space-y-6">
                                <Input
                                    label="University Email"
                                    type="email"
                                    name="email"
                                    placeholder="student@university.edu"
                                    value={formData.email}
                                    onChange={handleChange}
                                    icon={<Mail className="w-5 h-5" />}
                                />

                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-brand-purple-dark hover:bg-brand-purple text-white shadow-lg shadow-brand-purple/20"
                                    disabled={loading}
                                >
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </Button>

                                <div className="relative mt-6">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-gray-200" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-white px-2 text-gray-500">Remember your password?</span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
                                    onClick={() => navigate('/login')}
                                >
                                    Back to Login
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <div className="space-y-6">
                                <div>
                                    <Input
                                        label="Enter OTP"
                                        type="text"
                                        name="otp"
                                        placeholder="123456"
                                        value={formData.otp}
                                        onChange={handleChange}
                                        maxLength={6}
                                        icon={<Hash className="w-5 h-5" />}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Check your email for the 6-digit code
                                    </p>
                                </div>

                                <Input
                                    label="New Password"
                                    type="password"
                                    name="newPassword"
                                    placeholder="••••••••"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    icon={<Lock className="w-5 h-5" />}
                                />

                                <Input
                                    label="Confirm New Password"
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    icon={<Lock className="w-5 h-5" />}
                                />

                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
                                        onClick={() => setStep(1)}
                                        disabled={loading}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-11 bg-brand-purple-dark hover:bg-brand-purple text-white shadow-lg shadow-brand-purple/20"
                                        disabled={loading}
                                    >
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Right Side - Image/Brand */}
            <div className="relative hidden w-0 flex-1 lg:block">
                <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-brand-purple-dark to-brand-purple">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80')] mix-blend-overlay opacity-20 bg-cover bg-center"></div>
                    <div className="flex h-full flex-col justify-center px-20 text-white">
                        <h2 className="text-4xl font-bold mb-6">Secure Password Reset</h2>
                        <p className="text-lg text-blue-100 max-w-md">
                            We'll help you regain access to your account quickly and securely with our OTP verification system.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
