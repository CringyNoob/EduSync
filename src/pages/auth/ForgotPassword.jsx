import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import Button from '../../components/Button';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleReset = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSent(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-secondary/10 via-bkg to-primary/10 backdrop-blur-sm p-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-accent/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow animation-delay-2000"></div>

            {/* Main Card - Compact */}
            <div className="w-full max-w-[1000px] h-auto max-h-[85vh] aspect-[16/9] bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/60 flex overflow-hidden relative animate-fade-in-up">

                {/* Close Button */}
                <button onClick={() => navigate('/')} className="absolute top-4 right-4 z-50 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:bg-white transition-all cursor-pointer group">
                    <X size={16} className="text-text-main group-hover:text-primary transition-colors" />
                </button>

                {/* LEFT SIDE - FORM */}
                <div className="w-full lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center relative">

                    {/* Logo - Compact */}
                    <div className="absolute top-8 left-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <img src="/logo.png" alt="EduSync Logo" className="h-8 w-auto group-hover:scale-105 transition-transform" />
                            <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">EduSync</span>
                        </Link>
                    </div>

                    <div className="max-w-xs w-full mx-auto mt-6">
                        <div className="mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 transform group-hover:rotate-12 transition-transform">
                                <Mail size={24} />
                            </div>
                            <h1 className="text-2xl font-bold text-text-main mb-1">Forgot Password?</h1>
                            <p className="text-sm text-text-main-light">
                                Don't worry, it happens. Enter your email associated with your account.
                            </p>
                        </div>

                        {!isSent ? (
                            <form onSubmit={handleReset} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-text-main ml-1">University Email</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="student@university.edu"
                                        className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    isLoading={isLoading}
                                    className="w-full h-11 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-md shadow-primary/20 mt-2 border-none hover:scale-[1.02] transition-transform"
                                >
                                    Send Instructions
                                </Button>
                            </form>
                        ) : (
                            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center animate-fade-in-up">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <ShieldCheck size={20} className="text-green-600" />
                                </div>
                                <h3 className="text-green-800 font-bold text-sm mb-1">Check your email</h3>
                                <p className="text-green-700 text-xs mb-3">
                                    We sent a password reset link to your email address.
                                </p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white border-green-200 text-green-700 hover:bg-green-50 w-full h-9 text-xs"
                                    onClick={() => setIsSent(false)}
                                >
                                    Try another email
                                </Button>
                            </div>
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
                        <div className="text-white/80 text-xs mb-4">We prioritize your account security. Follow the steps in your email to regain access.</div>
                        <div className="h-1 w-20 bg-primary rounded-full mx-auto"></div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ForgotPassword;
