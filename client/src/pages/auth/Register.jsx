import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Mail, User, Lock, Hash, Building2, Calendar, Phone, FileText, CheckCircle2 } from 'lucide-react';
import Input from '../../components/Form/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const Register = () => {
    const navigate = useNavigate();
    const { register: registerUser } = useAuth();

    // Multi-step form state
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    // Form data state
    const [formData, setFormData] = useState({
        // Step 1: Email & OTP
        email: '',
        otp: '',
        otpHash: '',
        password: '',
        confirmPassword: '',
        
        // Step 2: Personal Info
        firstName: '',
        lastName: '',
        phone: '',
        bio: '',
        
        // Step 3: Academic Info
        studentId: '',
        department: '',
        batch: '',
    });

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(''); // Clear error on input change
    };

    // Send OTP to email
    const handleSendOtp = async () => {
        if (!formData.email) {
            setError('Please enter your email address');
            return;
        }

        // Validate university email
        if (!formData.email.endsWith('.edu')) {
            setError('Please use your university email address');
            return;
        }

        setOtpLoading(true);
        setError('');

        try {
            const response = await authService.sendOtp(formData.email);
            
            // Save OTP hash and expiry from response
            setFormData(prev => ({
                ...prev,
                otpHash: response.hash,
            }));
            
            setOtpSent(true);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    // Validate step 1
    const validateStep1 = () => {
        if (!formData.email) {
            setError('Email is required');
            return false;
        }
        if (!formData.email.endsWith('.edu')) {
            setError('Please use your university email address');
            return false;
        }
        if (!formData.otp || formData.otp.length !== 6) {
            setError('Please enter the 6-digit OTP');
            return false;
        }
        if (!formData.password || formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    // Validate step 2
    const validateStep2 = () => {
        if (!formData.firstName || !formData.lastName) {
            setError('First name and last name are required');
            return false;
        }
        return true;
    };

    // Validate step 3
    const validateStep3 = () => {
        if (!formData.studentId || !formData.department || !formData.batch) {
            setError('Student ID, department, and batch are required');
            return false;
        }
        return true;
    };

    // Handle next step
    const handleNext = () => {
        setError('');
        
        if (currentStep === 1 && !validateStep1()) return;
        if (currentStep === 2 && !validateStep2()) return;
        
        setCurrentStep(prev => prev + 1);
    };

    // Handle previous step
    const handleBack = () => {
        setError('');
        setCurrentStep(prev => prev - 1);
    };

    // Handle final registration
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateStep3()) return;

        setLoading(true);
        setError('');

        try {
            // Prepare registration data
            const registrationData = {
                email: formData.email,
                otp: formData.otp,
                otpHash: formData.otpHash,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                studentId: formData.studentId,
                department: formData.department,
                batch: formData.batch,
                phone: formData.phone || undefined,
                bio: formData.bio || undefined,
            };

            // Register user through context
            await registerUser(registrationData);
            
            // Navigate to dashboard on success
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Render progress bar
    const renderProgressBar = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center flex-1">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            currentStep >= step 
                                ? 'bg-brand-orange text-white' 
                                : 'bg-gray-200 text-gray-500'
                        }`}>
                            {currentStep > step ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : (
                                <span className="text-sm font-semibold">{step}</span>
                            )}
                        </div>
                        {step < 3 && (
                            <div className={`flex-1 h-1 mx-2 ${
                                currentStep > step ? 'bg-brand-orange' : 'bg-gray-200'
                            }`} />
                        )}
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Account</span>
                <span>Personal</span>
                <span>Academic</span>
            </div>
        </div>
    );

    // Render step 1: Email & OTP
    const renderStep1 = () => (
        <div className="space-y-5">
            <div>
                <Input
                    label="University Email"
                    type="email"
                    name="email"
                    placeholder="student@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={otpSent}
                    icon={<Mail className="w-5 h-5" />}
                />
                {!otpSent && (
                    <Button
                        variant="outline"
                        className="mt-2 w-full border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white"
                        onClick={handleSendOtp}
                        disabled={otpLoading || !formData.email}
                    >
                        {otpLoading ? 'Sending...' : 'Send OTP'}
                    </Button>
                )}
            </div>

            {otpSent && (
                <>
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
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        icon={<Lock className="w-5 h-5" />}
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        icon={<Lock className="w-5 h-5" />}
                    />
                </>
            )}
        </div>
    );

    // Render step 2: Personal Info
    const renderStep2 = () => (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="First Name"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    icon={<User className="w-5 h-5" />}
                />
                <Input
                    label="Last Name"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    icon={<User className="w-5 h-5" />}
                />
            </div>

            <Input
                label="Phone Number (Optional)"
                type="tel"
                name="phone"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={handleChange}
                icon={<Phone className="w-5 h-5" />}
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio (Optional)
                </label>
                <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                        name="bio"
                        placeholder="Tell us about yourself..."
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent resize-none"
                    />
                </div>
            </div>
        </div>
    );

    // Render step 3: Academic Info
    const renderStep3 = () => (
        <div className="space-y-5">
            <Input
                label="Student ID"
                name="studentId"
                placeholder="2021-1-60-001"
                value={formData.studentId}
                onChange={handleChange}
                icon={<Hash className="w-5 h-5" />}
            />

            <Input
                label="Department"
                name="department"
                placeholder="Computer Science & Engineering"
                value={formData.department}
                onChange={handleChange}
                icon={<Building2 className="w-5 h-5" />}
            />

            <Input
                label="Batch"
                name="batch"
                placeholder="2021"
                value={formData.batch}
                onChange={handleChange}
                icon={<Calendar className="w-5 h-5" />}
            />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side - Form */}
            <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="mb-8">
                        <Link to="/" className="flex items-center text-sm font-medium text-gray-500 hover:text-brand-orange transition-colors mb-6">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-brand-orange p-2 rounded-lg">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">EduSync</span>
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create Account</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Step {currentStep} of {totalSteps}: {
                                currentStep === 1 ? 'Account Setup' :
                                currentStep === 2 ? 'Personal Information' :
                                'Academic Details'
                            }
                        </p>
                    </div>

                    {/* Progress Bar */}
                    {renderProgressBar()}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Form Steps */}
                    <form onSubmit={handleSubmit}>
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}

                        {/* Navigation Buttons */}
                        <div className="mt-6 flex gap-4">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
                                    onClick={handleBack}
                                    disabled={loading}
                                >
                                    Back
                                </Button>
                            )}

                            {currentStep < totalSteps ? (
                                <Button
                                    type="button"
                                    className="flex-1 h-11 bg-brand-orange hover:bg-brand-orange-light text-white shadow-lg shadow-brand-orange/20"
                                    onClick={handleNext}
                                    disabled={!otpSent && currentStep === 1}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    className="flex-1 h-11 bg-brand-orange hover:bg-brand-orange-light text-white shadow-lg shadow-brand-orange/20"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </Button>
                            )}
                        </div>
                    </form>

                    {/* Login Link */}
                    <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">Already have an account?</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button
                            variant="outline"
                            className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={() => navigate('/login')}
                        >
                            Sign in instead
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right Side - Image/Brand */}
            <div className="relative hidden w-0 flex-1 lg:block">
                <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-brand-orange to-yellow-500">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80')] mix-blend-overlay opacity-20 bg-cover bg-center"></div>
                    <div className="flex h-full flex-col justify-center px-20 text-white">
                        <h2 className="text-4xl font-bold mb-6">Join Your Academic Community</h2>
                        <p className="text-lg text-orange-100 max-w-md">
                            Connect with peers, access resources, and enhance your university experience with EduSync.
                        </p>
                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6" />
                                <span>Verified university email required</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6" />
                                <span>Secure authentication</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6" />
                                <span>Complete in 3 easy steps</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
