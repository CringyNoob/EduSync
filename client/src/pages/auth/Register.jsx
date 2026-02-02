import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Mail, Shield, CheckCircle, User, Phone, BookOpen, Calendar, Lock, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import Button from '../../components/Button';
import authService from '../../services/authService';

// Department options
const DEPARTMENTS = [
    { value: 'CSE', label: 'Computer Science & Engineering' },
    { value: 'EEE', label: 'Electrical & Electronic Engineering' },
    { value: 'DS', label: 'Data Science' },
    { value: 'ENG', label: 'English' },
    { value: 'MMJ', label: 'Mass Media & Journalism' },
    { value: 'PHR', label: 'Pharmacy' },
    { value: 'BIO', label: 'Biotechnology' },
    { value: 'BBA', label: 'Business Administration' },
    { value: 'ECO', label: 'Economics' },
    { value: 'CEN', label: 'Civil Engineering' },
];

// Trimester options
const TRIMESTERS = [
    { value: 'Spring', label: 'Spring' },
    { value: 'Summer', label: 'Summer' },
    { value: 'Fall', label: 'Fall' },
];

// Generate year options (2015 to current year + 1)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 2015 + 2 }, (_, i) => {
    const year = 2015 + i;
    return { value: year.toString(), label: year.toString() };
}).reverse();

const Register = () => {
    const navigate = useNavigate();
    
    // Step management (1: Email, 2: OTP, 3: Details)
    const [step, setStep] = useState(1);
    
    // Form data
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        hash: '',
        fullName: '',
        studentId: '',
        phone: '',
        password: '',
        confirmPassword: '',
        department: '',
        trimester: '',
        year: '',
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

    const passwordStrength = getPasswordStrength(formData.password);

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

        // Validate email
        if (!formData.email) {
            setError('Email is required');
            return;
        }

        if (!formData.email.endsWith('uiu.ac.bd')) {
            setError('Only UIU email addresses (@uiu.ac.bd) are allowed');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.sendOtp(formData.email);
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

        // OTP verification happens on final registration
        // For now, just move to step 3
        setStep(3);
    };

    // Step 3: Complete Registration
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // Validate all fields
        if (!formData.fullName.trim()) {
            setError('Full name is required');
            return;
        }

        if (!/^\d{9,10}$/.test(formData.studentId)) {
            setError('Student ID must be 9 or 10 digits');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!formData.department) {
            setError('Please select a department');
            return;
        }

        if (!formData.trimester || !formData.year) {
            setError('Please select both trimester and year');
            return;
        }

        setIsLoading(true);
        try {
            const registrationData = {
                email: formData.email,
                otp: formData.otp,
                hash: formData.hash,
                fullName: formData.fullName,
                studentId: formData.studentId,
                phone: formData.phone,
                password: formData.password,
                department: formData.department,
                trimester: formData.trimester,
                year: formData.year,
            };

            const response = await authService.register(registrationData);
            
            if (response.success) {
                setSuccess('Registration successful! Redirecting...');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                setError(response.error || 'Registration failed');
            }
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        setError('');
        setIsLoading(true);
        try {
            const response = await authService.sendOtp(formData.email);
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
        setStep(prev => Math.max(1, prev - 1));
    };

    // Step indicator component
    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step >= s 
                            ? 'bg-secondary text-white' 
                            : 'bg-gray-200 text-gray-500'
                    }`}>
                        {step > s ? <CheckCircle size={16} /> : s}
                    </div>
                    {s < 3 && (
                        <div className={`w-8 h-0.5 ${step > s ? 'bg-secondary' : 'bg-gray-200'}`} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-secondary/10 via-bkg to-accent/10 backdrop-blur-sm p-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[900px] h-[900px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[900px] h-[900px] bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow animation-delay-2000"></div>

            {/* Main Card */}
            <div className="w-full max-w-[1100px] min-h-[600px] bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/60 flex overflow-hidden relative animate-fade-in-up">

                {/* Close Button */}
                <button onClick={() => navigate('/')} className="absolute top-4 right-4 z-50 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:bg-white transition-all cursor-pointer group">
                    <X size={16} className="text-text-main group-hover:text-secondary transition-colors" />
                </button>

                {/* LEFT SIDE - FORM */}
                <div className="w-full lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center relative bg-gradient-to-tr from-white to-gray-50 overflow-y-auto max-h-[90vh]">

                    {/* Logo */}
                    <div className="absolute top-8 left-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <img src="/logo.png" alt="EduSync Logo" className="h-8 w-auto group-hover:scale-105 transition-transform" />
                            <span className="text-lg font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">EduSync</span>
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
                                <h1 className="text-2xl font-bold text-text-main mb-1">Create Account</h1>
                                <p className="text-xs text-text-main-light mb-5">Enter your UIU email to get started</p>

                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-text-main ml-1 flex items-center gap-1">
                                            <Mail size={12} /> University Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="yourname@uiu.ac.bd"
                                            className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 ml-1">Must be a valid UIU email address</p>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 rounded-full bg-secondary hover:bg-secondary-light text-white font-bold text-sm shadow-md shadow-secondary/20 border-none hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                                        {isLoading ? 'Sending OTP...' : 'Send OTP'}
                                    </Button>
                                </form>
                            </>
                        )}

                        {/* STEP 2: OTP Verification */}
                        {step === 2 && (
                            <>
                                <button onClick={goBack} className="flex items-center gap-1 text-xs text-gray-500 hover:text-secondary mb-4 transition-colors">
                                    <ArrowLeft size={14} /> Back
                                </button>

                                <h1 className="text-2xl font-bold text-text-main mb-1">Verify Email</h1>
                                <p className="text-xs text-text-main-light mb-5">Enter the 6-digit code sent to {formData.email}</p>

                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-text-main ml-1 flex items-center gap-1">
                                            <Shield size={12} /> Verification Code
                                        </label>
                                        <input
                                            type="text"
                                            name="otp"
                                            value={formData.otp}
                                            onChange={handleChange}
                                            placeholder="Enter 6-digit OTP"
                                            maxLength={6}
                                            className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none tracking-widest text-center font-mono text-lg"
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 rounded-full bg-secondary hover:bg-secondary-light text-white font-bold text-sm shadow-md shadow-secondary/20 border-none hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                        Verify & Continue
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={isLoading}
                                        className="w-full text-xs text-gray-500 hover:text-secondary transition-colors"
                                    >
                                        Didn't receive the code? <span className="font-semibold">Resend</span>
                                    </button>
                                </form>
                            </>
                        )}

                        {/* STEP 3: Complete Profile */}
                        {step === 3 && (
                            <>
                                <button onClick={goBack} className="flex items-center gap-1 text-xs text-gray-500 hover:text-secondary mb-4 transition-colors">
                                    <ArrowLeft size={14} /> Back
                                </button>

                                <h1 className="text-2xl font-bold text-text-main mb-1">Complete Profile</h1>
                                <p className="text-xs text-text-main-light mb-5">Fill in your details to complete registration</p>

                                <form onSubmit={handleRegister} className="space-y-3">
                                    {/* Full Name */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-text-main ml-1 flex items-center gap-1">
                                            <User size={12} /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            className="w-full h-10 px-4 rounded-xl bg-white border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                            required
                                        />
                                    </div>

                                    {/* Student ID & Phone */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-text-main ml-1">Student ID</label>
                                            <input
                                                type="text"
                                                name="studentId"
                                                value={formData.studentId}
                                                onChange={handleChange}
                                                placeholder="e.g., 011221234"
                                                maxLength={10}
                                                className="w-full h-10 px-4 rounded-xl bg-white border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-text-main ml-1 flex items-center gap-1">
                                                <Phone size={12} /> Phone
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="01XXXXXXXXX"
                                                className="w-full h-10 px-4 rounded-xl bg-white border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Department */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-text-main ml-1 flex items-center gap-1">
                                            <BookOpen size={12} /> Department
                                        </label>
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="w-full h-10 px-4 rounded-xl bg-white border border-gray-200 text-sm text-text-main focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            {DEPARTMENTS.map(dept => (
                                                <option key={dept.value} value={dept.value}>{dept.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Batch: Trimester & Year */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-text-main ml-1 flex items-center gap-1">
                                            <Calendar size={12} /> Batch
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <select
                                                name="trimester"
                                                value={formData.trimester}
                                                onChange={handleChange}
                                                className="w-full h-10 px-4 rounded-xl bg-white border border-gray-200 text-sm text-text-main focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                                required
                                            >
                                                <option value="">Trimester</option>
                                                {TRIMESTERS.map(t => (
                                                    <option key={t.value} value={t.value}>{t.label}</option>
                                                ))}
                                            </select>
                                            <select
                                                name="year"
                                                value={formData.year}
                                                onChange={handleChange}
                                                className="w-full h-10 px-4 rounded-xl bg-white border border-gray-200 text-sm text-text-main focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                                required
                                            >
                                                <option value="">Year</option>
                                                {YEARS.map(y => (
                                                    <option key={y.value} value={y.value}>{y.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-text-main ml-1 flex items-center gap-1">
                                                <Lock size={12} /> Password
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full h-10 px-4 rounded-xl bg-white border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-text-main ml-1">Confirm</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="w-full h-10 px-4 rounded-xl bg-white border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password Strength Indicator */}
                                    {formData.password && (
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
                                            <p className="text-xs text-gray-400 mt-1">
                                                Use 8+ chars with uppercase, lowercase, numbers & symbols
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 rounded-full bg-secondary hover:bg-secondary-light text-white font-bold text-sm shadow-md shadow-secondary/20 mt-4 border-none hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                        {isLoading ? 'Creating Account...' : 'Complete Registration'}
                                    </Button>
                                </form>
                            </>
                        )}

                        <div className="mt-6 flex items-center justify-between text-xs text-text-main-light">
                            <p>Already a member? <Link to="/login" className="text-secondary font-bold hover:underline">Log In</Link></p>
                            <Link to="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - IMAGE & OVERLAYS */}
                <div className="hidden lg:block w-1/2 relative bg-primary overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1742&q=80"
                        alt="University Library"
                        className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent pointer-events-none"></div>

                    {/* Floating Verification Badge */}
                    <div className="absolute top-[8%] right-[8%] bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg flex items-center gap-3 w-auto animate-float">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Shield size={20} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Account Type</div>
                            <div className="text-sm font-bold text-gray-800">Verified Student</div>
                        </div>
                    </div>

                    {/* Central Text Card */}
                    <div className="absolute top-[35%] left-[50%] -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/30 p-8 rounded-3xl text-white text-center w-72 shadow-2xl">
                        <div className="text-2xl font-bold mb-2">Join UIU Students</div>
                        <div className="text-white/80 text-sm mb-6">Connect, collaborate, and succeed in your academic journey.</div>
                        <div className="flex justify-center -space-x-3">
                            <img src="https://i.pravatar.cc/100?img=12" className="w-10 h-10 rounded-full border-2 border-primary" alt="Student" />
                            <img src="https://i.pravatar.cc/100?img=24" className="w-10 h-10 rounded-full border-2 border-primary" alt="Student" />
                            <img src="https://i.pravatar.cc/100?img=33" className="w-10 h-10 rounded-full border-2 border-primary" alt="Student" />
                            <img src="https://i.pravatar.cc/100?img=41" className="w-10 h-10 rounded-full border-2 border-primary" alt="Student" />
                        </div>
                    </div>

                    {/* Bottom Stats Rail */}
                    <div className="absolute bottom-[10%] left-[10%] right-[10%] bg-secondary p-6 rounded-2xl shadow-xl flex justify-between items-center text-white border border-white/10">
                        <div className="text-center">
                            <div className="text-2xl font-bold">UIU</div>
                            <div className="text-xs opacity-70">Exclusive</div>
                        </div>
                        <div className="h-8 w-px bg-white/20"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">Free</div>
                            <div className="text-xs opacity-70">For Students</div>
                        </div>
                        <div className="h-8 w-px bg-white/20"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">Secure</div>
                            <div className="text-xs opacity-70">OTP Verified</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Register;
