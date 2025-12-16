import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Apple, Chrome, X, User, CheckCircle, Shield } from 'lucide-react';
import Button from '../../components/Button';

const Register = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigate('/verify-email');
        }, 1500);
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
                        <p className="text-xs text-text-main-light mb-5">Join the academic community.</p>

                        <form onSubmit={handleRegister} className="space-y-3">

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-text-main ml-1">First Name</label>
                                    <input
                                        type="text"
                                        placeholder="John"
                                        className="w-full h-10 px-4 rounded-xl bg-white border border-gray-200 text-xs text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-text-main ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        placeholder="Doe"
                                        className="w-full h-10 px-4 rounded-xl bg-white border border-gray-200 text-xs text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-text-main ml-1">University Email</label>
                                <input
                                    type="email"
                                    placeholder="student@university.edu"
                                    className="w-full h-10 px-4 rounded-xl bg-white border border-gray-200 text-xs text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-text-main ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full h-10 px-4 rounded-xl bg-white border border-gray-200 text-xs text-text-main placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all outline-none"
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
