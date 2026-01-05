import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Apple, Chrome, X, User, CheckCircle, Shield, Mail, Lock, Hash } from 'lucide-react';
import Button from '../../components/Button';
import authService from '../../services/authService';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Details
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [otpHash, setOtpHash] = useState(''); // Store OTP hash from server
    
    // Form data
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        fullName: '',
        studentId: '',
        semester: 'Fall',
        year: '',
        department: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const departments = [
        'Computer Science & Engineering',
        'Electrical & Electronic Engineering',
        'English',
        'Media & Journalism',
        'Development Studies',
        'Civil Engineering',
        'Pharmacy',
        'Biotechnology'
    ];

    const semesters = ['Fall', 'Spring', 'Summer'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        
        if (!formData.email) {
            setError('Please enter your email');
            return;
        }
        
        if (!formData.email.endsWith('.uiu.ac.bd')) {
            setError('Please use your UIU email address (.uiu.ac.bd)');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            // Call the actual API to send OTP
            const response = await authService.sendOtp(formData.email);
            
            // Store the OTP hash from server response
            setOtpHash(response.hash);
            setOtpSent(true);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        
        if (!formData.otp || formData.otp.length !== 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            // For now, just move to next step
            // The actual OTP verification will happen during registration
            setStep(3);
        } catch (err) {
            setError(err.message || 'Failed to verify OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.fullName) {
            setError('Please enter your full name');
            return;
        }
        
        if (!formData.studentId || (formData.studentId.length !== 9 && formData.studentId.length !== 10)) {
            setError('Student ID must be 9 or 10 digits');
            return;
        }
        
        if (!formData.year || formData.year.length !== 4) {
            setError('Please enter a valid year');
            return;
        }
        
        if (!formData.department) {
            setError('Please select a department');
            return;
        }
        
        if (!formData.phone) {
            setError('Please enter your phone number');
            return;
        }
        
        if (!formData.password || formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            // Create batch string
            const batch = `${formData.semester} - ${formData.year}`;
            
            // Split full name into first and last name
            const nameParts = formData.fullName.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || nameParts[0];
            
            // Prepare registration data
            const registrationData = {
                email: formData.email,
                otp: formData.otp,
                otpHash: otpHash,
                password: formData.password,
                firstName: firstName,
                lastName: lastName,
                studentId: formData.studentId,
                department: formData.department,
                batch: batch,
                phone: formData.phone
            };
            
            // Call the register API
            const response = await authService.register(registrationData);
            
            // Registration successful - navigate to dashboard
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-secondary/10 via-bkg to-accent/10 backdrop-blur-sm p-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[900px] h-[900px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[900px] h-[900px] bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow animation-delay-2000"></div>

            {/* Main Card - Compact */}
            <div className="w-full max-w-[1000px] h-auto max-h-[90vh] aspect-[16/9] bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/60 flex overflow-hidden relative animate-fade-in-up">

                {/* Close Button */}
                <button onClick={() => navigate('/')} className="absolute top-4 right-4 z-50 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:bg-white transition-all cursor-pointer group">
                    <X size={16} className="text-text-main group-hover:text-secondary transition-colors" />
                </button>

                {/* LEFT SIDE - FORM - Compact Padding */}
                <div className="w-full lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center relative bg-gradient-to-tr from-white to-gray-50 overflow-hidden">

                    {/* Logo - Compact */}
                    <div className="absolute top-8 left-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <img src="/logo.png" alt="EduSync Logo" className="h-8 w-auto group-hover:scale-105 transition-transform" />
                            <span className="text-lg font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">EduSync</span>
                        </Link>
                    </div>

                    <div className="max-w-xs w-full mx-auto mt-6">
                        <h1 className="text-2xl font-bold text-text-main mb-1">Create Account</h1>
                        <p className="text-xs text-text-main-light mb-5">
                            {step === 1 && 'Enter your UIU email to get started'}
                            {step === 2 && 'Verify your email with OTP'}
                            {step === 3 && 'Complete your profile'}
                        </p>

                        {error && (
                            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-xs text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Step 1: Email */}
                        {step === 1 && !otpSent && (
                            <form onSubmit={handleSendOTP} className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-text-main ml-1">University Email</label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="student@example.uiu.ac.bd"
                                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-gray-200 text-xs text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    isLoading={isLoading}
                                    className="w-full h-11 rounded-full bg-secondary hover:bg-secondary-light text-white font-bold text-sm shadow-md shadow-secondary/20 mt-3 border-none hover:scale-[1.02] transition-transform"
                                >
                                    Send OTP
                                </Button>
                            </form>
                        )}

                        {/* Step 2: OTP Verification */}
                        {step === 1 && otpSent && (
                            <form onSubmit={handleVerifyOTP} className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-text-main ml-1">University Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full h-10 px-4 rounded-xl bg-gray-100 border border-gray-200 text-xs text-text-main outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-text-main ml-1">Enter OTP</label>
                                    <div className="relative">
                                        <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="otp"
                                            value={formData.otp}
                                            onChange={handleInputChange}
                                            placeholder="123456"
                                            maxLength={6}
                                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-gray-200 text-xs text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 ml-1 mt-1">Check your email for the 6-digit code</p>
                                </div>

                                <Button
                                    type="submit"
                                    isLoading={isLoading}
                                    className="w-full h-11 rounded-full bg-secondary hover:bg-secondary-light text-white font-bold text-sm shadow-md shadow-secondary/20 mt-3 border-none hover:scale-[1.02] transition-transform"
                                >
                                    Verify OTP
                                </Button>
                            </form>
                        )}

                        {/* Step 3: Complete Details */}
                        {step === 3 && (
                            <form onSubmit={handleRegister} className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-text-main ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                        className="w-full h-10 px-4 rounded-xl bg-white border border-gray-200 text-xs text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-text-main ml-1">Student ID (9-10 digits)</label>
                                    <input
                                        type="text"
                                        name="studentId"
                                        value={formData.studentId}
                                        onChange={handleInputChange}
                                        placeholder="011221123"
                                        maxLength={10}
                                        className="w-full h-10 px-4 rounded-xl bg-white border border-gray-200 text-xs text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-text-main ml-1">Batch</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            name="semester"
                                            value={formData.semester}
                                            onChange={handleInputChange}
                                            className="w-full h-10 px-3 rounded-xl bg-white border border-gray-200 text-xs text-text-main focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                        >
                                            {semesters.map(sem => (
                                                <option key={sem} value={sem}>{sem}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            name="year"
                                            value={formData.year}
                                            onChange={handleInputChange}
                                            placeholder="2023"
                                            maxLength={4}
                                            className="w-full h-10 px-4 rounded-xl bg-white border border-gray-200 text-xs text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 ml-1 mt-1">Will be saved as: {formData.semester} - {formData.year || 'YYYY'}</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-text-main ml-1">Department</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="w-full h-10 px-3 rounded-xl bg-white border border-gray-200 text-xs text-text-main focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-text-main ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+880 1234567890"
                                        className="w-full h-10 px-4 rounded-xl bg-white border border-gray-200 text-xs text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-text-main ml-1">Password</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="••••••••"
                                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-gray-200 text-xs text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-text-main ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="••••••••"
                                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-gray-200 text-xs text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    isLoading={isLoading}
                                    className="w-full h-11 rounded-full bg-secondary hover:bg-secondary-light text-white font-bold text-sm shadow-md shadow-secondary/20 mt-3 border-none hover:scale-[1.02] transition-transform"
                                >
                                    Register Now
                                </Button>
                            </form>
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
                        <div className="text-2xl font-bold mb-2">Join 12,000+ Peers</div>
                        <div className="text-white/80 text-sm mb-6">Connect, collaborate, and succeed in your academic journey.</div>
                        <div className="flex justify-center -space-x-3">
                            <img src="https://i.pravatar.cc/100?img=12" className="w-10 h-10 rounded-full border-2 border-primary" />
                            <img src="https://i.pravatar.cc/100?img=24" className="w-10 h-10 rounded-full border-2 border-primary" />
                            <img src="https://i.pravatar.cc/100?img=33" className="w-10 h-10 rounded-full border-2 border-primary" />
                            <img src="https://i.pravatar.cc/100?img=41" className="w-10 h-10 rounded-full border-2 border-primary" />
                        </div>
                    </div>

                    {/* Bottom Stats Rail */}
                    <div className="absolute bottom-[10%] left-[10%] right-[10%] bg-secondary p-6 rounded-2xl shadow-xl flex justify-between items-center text-white border border-white/10">
                        <div className="text-center">
                            <div className="text-2xl font-bold">150+</div>
                            <div className="text-xs opacity-70">Universities</div>
                        </div>
                        <div className="h-8 w-px bg-white/20"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">Free</div>
                            <div className="text-xs opacity-70">For Students</div>
                        </div>
                        <div className="h-8 w-px bg-white/20"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">24/7</div>
                            <div className="text-xs opacity-70">Support</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Register;
