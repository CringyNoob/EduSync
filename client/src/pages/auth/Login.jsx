import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Apple, Chrome, X, GraduationCap, Users, BookOpen } from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-secondary/10 via-bkg to-primary/10 backdrop-blur-sm p-4 relative overflow-hidden">
            {/* Background Blobs for specific EduSync Vibe */}
            <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-accent/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow animation-delay-2000"></div>

            {/* Main Card - Compact Height */}
            <div className="w-full max-w-[1000px] h-auto max-h-[85vh] aspect-[16/9] bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/60 flex overflow-hidden relative animate-fade-in-up">

                {/* Close Button */}
                <button onClick={() => navigate('/')} className="absolute top-4 right-4 z-50 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:bg-white transition-all cursor-pointer group">
                    <X size={16} className="text-text-main group-hover:text-primary transition-colors" />
                </button>

                {/* LEFT SIDE - FORM - Compact Padding */}
                <div className="w-full lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center relative">

                    {/* Logo - Compact Position */}
                    <div className="absolute top-8 left-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <img src="/logo.png" alt="EduSync Logo" className="h-8 w-auto group-hover:scale-105 transition-transform" />
                            <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">EduSync</span>
                        </Link>
                    </div>

                    <div className="max-w-xs w-full mx-auto mt-6">
                        <h1 className="text-2xl font-bold text-text-main mb-1">Welcome Back!</h1>
                        <p className="text-sm text-text-main-light mb-6">Log in to access your study groups.</p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-xs text-red-600">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-main ml-1">University Email</label>
                                <input
                                    type="email"
                                    placeholder="student@university.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-main ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        placeholder="•••••••••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full h-11 rounded-full bg-primary hover:bg-primary-hover text-white font-bold text-base shadow-md shadow-primary/20 mt-2 border-none hover:scale-[1.02] transition-transform"
                            >
                                Sign In
                            </Button>
                        </form>

                        <div className="mt-8 flex items-center justify-between text-xs text-text-main-light">
                            <p>New here? <Link to="/register" className="text-primary font-bold hover:underline">Create Account</Link></p>
                            <Link to="/forgot-password" className="hover:text-primary transition-colors">Forgot Password?</Link>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - IMAGE & OVERLAYS */}
                <div className="hidden lg:block w-1/2 relative bg-secondary overflow-hidden">
                    {/* EduSync Themed Image: Students collaborating using tech */}
                    <img
                        src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3"
                        alt="Students Collaborating"
                        className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-transparent pointer-events-none"></div>

                    {/* Floating Glass Card 1: Study Session */}
                    <div className="absolute top-[15%] left-[10%] bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl w-64 animate-float">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2 rounded-lg bg-accent/20 text-accent">
                                <BookOpen size={20} />
                            </div>
                            <span className="text-xs font-bold text-white/80 bg-white/10 px-2 py-1 rounded-full">Now</span>
                        </div>
                        <h3 className="font-bold text-white text-lg leading-tight mb-1">Finals Prep: Calc II</h3>
                        <p className="text-white/60 text-xs mb-3">Library Room 302 • 5 Members</p>
                        <div className="flex -space-x-2">
                            <img src="https://i.pravatar.cc/100?img=5" className="w-8 h-8 rounded-full border-2 border-secondary" />
                            <img src="https://i.pravatar.cc/100?img=9" className="w-8 h-8 rounded-full border-2 border-secondary" />
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold border-2 border-secondary">+3</div>
                        </div>
                    </div>

                    {/* Floating Glass Card 2: Upcoming Event */}
                    <div className="absolute bottom-[20%] right-[10%] bg-white p-5 rounded-2xl shadow-2xl w-72 animate-float animation-delay-2000">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-gray-900">Hackathon Cleanup</span>
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full mb-4 overflow-hidden">
                            <div className="w-[75%] h-full bg-gradient-to-r from-primary to-accent rounded-full"></div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500">Progress</span>
                                <span className="font-bold text-primary">75% Complete</span>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <GraduationCap size={20} />
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Login;
