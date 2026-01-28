import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import newsboxService from '../../services/newsboxService';
import {
    ShoppingBag, MessageSquare, Bell, AlertCircle, TrendingUp, Clock, ArrowRight,
    Zap, Star, Shield, Search, User, Heart, Bookmark, Calendar, Users,
    Package, MessageCircle, Activity, Filter, ChevronRight, Plus, Settings,
    BookOpen, Award, Target, Sparkles, Home as HomeIcon, LayoutDashboard, Newspaper, Repeat, ExternalLink, Loader2, X,
    FileText, Download, File, FileSpreadsheet, Archive, Image as ImageIcon
} from 'lucide-react';

// Reusing the styled Button from LandingPage for consistency
const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseStyles = "relative overflow-hidden inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 focus:ring-primary border border-transparent",
        secondary: "bg-secondary text-white hover:bg-secondary-light hover:shadow-lg hover:shadow-secondary/30 focus:ring-secondary border border-transparent",
        outline: "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-text-main dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary hover:bg-white dark:hover:bg-gray-800 focus:ring-gray-200",
        ghost: "bg-transparent text-text-main-light dark:text-gray-400 hover:bg-primary/10 hover:text-primary dark:hover:text-primary",
        white: "bg-white dark:bg-gray-800 text-primary dark:text-primary-light hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md border border-transparent",
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        icon: "p-2",
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon: Icon, colorClass, onClick }) => (
    <div
        className={`relative overflow-hidden rounded-2xl p-6 ${colorClass} text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group`}
        onClick={onClick}
    >
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform shadow-inner">
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Plus className="h-4 w-4 text-white" />
                </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-xs text-white/80 font-medium">{description}</p>
        </div>
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
    </div>
);

const Home = () => {
    const navigate = useNavigate();
    const { unreadCount: unreadNotifications } = useNotifications();
    
    // UIU Notices state
    const [uiuNotices, setUiuNotices] = useState([]);
    const [noticesLoading, setNoticesLoading] = useState(true);
    const [selectedNotice, setSelectedNotice] = useState(null);
    
    // Featured Posts from Newsbox
    const [featuredPosts, setFeaturedPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [currentSliderIndex, setCurrentSliderIndex] = useState(0);

    // Fetch latest UIU notices and featured posts
    useEffect(() => {
        const fetchLatestNotices = async () => {
            try {
                setNoticesLoading(true);
                const response = await api.get('/notices/latest?count=5');
                if (response.data.success) {
                    setUiuNotices(response.data.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch UIU notices:', error);
                setUiuNotices([]);
            } finally {
                setNoticesLoading(false);
            }
        };
        
        const fetchFeaturedPosts = async () => {
            try {
                setPostsLoading(true);
                const response = await newsboxService.getPosts({ 
                    sort: 'popular', 
                    status: 'APPROVED' 
                });
                if (response.success) {
                    setFeaturedPosts(response.data.slice(0, 10) || []);
                }
            } catch (error) {
                console.error('Failed to fetch featured posts:', error);
                setFeaturedPosts([]);
            } finally {
                setPostsLoading(false);
            }
        };
        
        fetchLatestNotices();
        fetchFeaturedPosts();
    }, []);

    // Auto-advance featured posts slider
    useEffect(() => {
        if (featuredPosts.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSliderIndex((prev) => (prev + 1) % featuredPosts.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [featuredPosts.length]);

    // Get current time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Get user from AuthContext
    const { user } = useAuth();
    const userName = user?.name || "Student";

    const quickActions = [
        { title: "Sell Item", description: "List on marketplace", icon: ShoppingBag, colorClass: "bg-gradient-to-br from-orange-400 to-pink-500", onClick: () => navigate('/marketplace/pre-owned') },
        { title: "My Orders", description: "Track your orders", icon: LayoutDashboard, colorClass: "bg-gradient-to-br from-blue-400 to-cyan-500", onClick: () => navigate('/my-orders') },
        { title: "My Rentals", description: "Manage your gear", icon: LayoutDashboard, colorClass: "bg-gradient-to-br from-emerald-400 to-teal-500", onClick: () => navigate('/renthub/my-rentals') },
        { title: "Report Issue", description: "Submit campus issue", icon: AlertCircle, colorClass: "bg-gradient-to-br from-red-400 to-rose-500", onClick: () => navigate('/issues/new') },
    ];

    return (
        <div className="relative min-h-screen p-4 md:p-6 space-y-6 font-sans text-gray-900 dark:text-gray-100 transition-all duration-300">
            {/* --- Soothing Background Elements --- */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                {/* Linked Gradient from Sidebar (Left) */}
                <div className="absolute top-0 left-[-100px] w-[600px] h-[800px] bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent rounded-full mix-blend-multiply blur-[80px]"></div>

                {/* Dynamic Floating Blobs */}
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-bl from-accent/20 to-primary/10 rounded-full mix-blend-multiply blur-[80px] animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-gradient-to-tr from-secondary/10 to-accent/20 rounded-full mix-blend-multiply blur-[80px] animate-blob animation-delay-2000"></div>

                {/* Noise Texture for Finish */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
            </div>

            {/* Smart Header */}
            <div className="rounded-[2.5rem] bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl border border-white/80 dark:border-gray-700/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2.5rem]"></div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                    {/* Personalized Greeting */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white/80 dark:ring-gray-700">
                                {userName.charAt(0)}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary to-gray-700 dark:from-white dark:via-primary-light dark:to-gray-300 leading-tight">
                                {getGreeting()}, {userName}!
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Ready to sync your academic day?</p>
                        </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex gap-3">
                        <div className="relative">
                            <Button size="icon" variant="outline" className="rounded-2xl h-14 w-14 border-gray-200 hover:border-primary hover:bg-white hover:shadow-md bg-white" onClick={() => navigate('/notifications')}>
                                <Bell className="h-6 w-6" />
                            </Button>
                            {unreadNotifications > 0 && (
                                <div className="absolute top-1 right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white shadow-sm pointer-events-none animate-in zoom-in">
                                    {unreadNotifications}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid - Moved to Top */}
            <div>
                <div className="flex items-center justify-between mb-5 px-1">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Quick Actions
                    </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {quickActions.map((action, i) => (
                        <QuickActionCard key={i} {...action} />
                    ))}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* UIU Notices - Attention Section */}
                <div className="lg:col-span-1 rounded-[2.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col h-full hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <div className="p-2 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-lg"><Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" /></div>
                            UIU Notices
                        </h2>
                        <Button variant="ghost" size="sm" className="text-xs font-bold h-8 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg px-3" onClick={() => navigate('/notices')}>
                            View All
                        </Button>
                    </div>
                    <div className="space-y-3 flex-1">
                        {noticesLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : uiuNotices.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                                <Bell className="h-8 w-8 mb-2 opacity-50" />
                                <p className="text-sm">No notices available</p>
                            </div>
                        ) : (
                            uiuNotices.map((notice) => (
                                <div
                                    key={notice.id}
                                    onClick={() => setSelectedNotice(notice)}
                                    className="block p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all duration-300 cursor-pointer group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform flex-shrink-0">
                                            <Bell className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300 line-clamp-2 group-hover:text-primary transition-colors">{notice.title}</h4>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-blue-600/70 dark:text-blue-400/70 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {notice.date}
                                                </span>
                                                <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded">
                                                    View
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Featured Posts from Newsbox */}
                <div className="lg:col-span-2 rounded-[2.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col h-full hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-shadow">
                    <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <div className="p-2 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-lg"><Newspaper className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
                            Featured Posts
                        </h2>
                        <Button variant="ghost" size="sm" className="text-xs font-bold h-8 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg px-3" onClick={() => navigate('/newsbox')}>
                            View All
                        </Button>
                    </div>
                    
                    {/* Slideshow Area */}
                    <div className="flex-1 relative overflow-hidden">
                        {postsLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : featuredPosts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <Newspaper className="h-12 w-12 mb-3 opacity-50" />
                                <p className="text-sm">No posts available</p>
                            </div>
                        ) : (
                            <>
                                {featuredPosts.map((post, idx) => (
                                    <div
                                        key={post.id}
                                        onClick={() => navigate('/newsbox')}
                                        className={`absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer ${
                                            idx === currentSliderIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
                                        }`}
                                    >
                                        {post.images && post.images.length > 0 ? (
                                            <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                                                <Newspaper size={64} className="text-emerald-600/30" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
                                            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest">
                                                Featured • {post.category_name || 'News'}
                                            </span>
                                            <h3 className="text-xl md:text-2xl font-black text-white leading-tight drop-shadow-md line-clamp-2">
                                                {post.title}
                                            </h3>
                                            {post.description && (
                                                <p className="text-sm text-white/80 line-clamp-2">
                                                    {post.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 pt-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold">
                                                        {post.author_name?.[0] || 'U'}
                                                    </div>
                                                    <span className="text-white/80 text-sm font-medium">{post.author_name || 'Anonymous'}</span>
                                                </div>
                                                <span className="text-white/40 text-sm">•</span>
                                                <span className="text-white/80 text-sm font-medium">{new Date(post.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Slider Nav Dots */}
                                {featuredPosts.length > 1 && (
                                    <div className="absolute bottom-6 right-6 flex gap-2 z-10">
                                        {featuredPosts.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentSliderIndex(idx);
                                                }}
                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                    idx === currentSliderIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-white/50 hover:bg-white'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom CTA Cards - REMOVED */}
            {/* <div className="grid gap-6 md:grid-cols-2">
                <div
                    className="relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br from-primary to-indigo-600 text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate('/marketplace')}
                >
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ShoppingBag className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold mb-2">Marketplace</h3>
                        <p className="text-white/80 mb-6 text-lg font-medium">Discover great deals from your campus community.</p>
                        <div className="flex items-center gap-2 font-bold bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-colors">
                            Browse Items <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>

                <div
                    className="relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br from-secondary to-purple-700 text-white shadow-xl shadow-secondary/25 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate('/chat')}
                >
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <MessageCircle className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold mb-2">Student Lounge</h3>
                        <p className="text-white/80 mb-6 text-lg font-medium">Connect with your peers in real-time. Share ideas and collaborate.</p>
                        <div className="flex items-center gap-2 font-bold bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-colors">
                            Enter Lounge <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Notice Details Modal */}
            {selectedNotice && (
                <div 
                    className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
                    style={{ margin: 0 }}
                    onClick={() => setSelectedNotice(null)}
                >
                    <div 
                        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header - Gradient Banner */}
                        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 pb-8">
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedNotice(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                            >
                                <X className="h-5 w-5 text-white" />
                            </button>
                            
                            {/* Header Content */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                                    <Bell className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">UIU Notice</span>
                                    <h2 className="text-xl font-bold text-white mt-1 leading-tight line-clamp-2">
                                        {selectedNotice.title}
                                    </h2>
                                </div>
                            </div>
                            
                            {/* Meta Tags */}
                            <div className="flex flex-wrap items-center gap-3 mt-4">
                                <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                                    <Calendar className="h-4 w-4" />
                                    {selectedNotice.date}
                                </span>
                                {selectedNotice.attachments?.length > 0 && (
                                    <span className="flex items-center gap-2 bg-emerald-500/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-semibold animate-pulse">
                                        <Download className="h-4 w-4" />
                                        {selectedNotice.attachments.length} Download{selectedNotice.attachments.length > 1 ? 's' : ''} Available
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] bg-white dark:bg-gray-900">
                            {/* Notice Image */}
                            {selectedNotice.image && (
                                <div className="mb-6 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-inner">
                                    <img 
                                        src={selectedNotice.image} 
                                        alt={selectedNotice.title}
                                        className="w-full h-auto max-h-64 object-contain"
                                        onError={(e) => {
                                            e.target.parentElement.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Notice Content */}
                            {selectedNotice.content ? (
                                <div 
                                    className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed
                                        [&>p]:mb-4 
                                        [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4
                                        [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4
                                        [&>li]:mb-2
                                        [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mt-6 [&>h1]:mb-4
                                        [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-5 [&>h2]:mb-3
                                        [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mt-4 [&>h3]:mb-2
                                        [&>a]:text-blue-600 [&>a]:underline [&>a]:hover:text-blue-800
                                        [&>table]:w-full [&>table]:border-collapse [&>table]:my-4 [&>table]:rounded-lg [&>table]:overflow-hidden
                                        [&_.wp-block-table]:overflow-x-auto [&_.wp-block-table]:my-4
                                        [&_.wp-block-table_table]:w-full [&_.wp-block-table_table]:border-collapse [&_.wp-block-table_table]:rounded-xl [&_.wp-block-table_table]:overflow-hidden [&_.wp-block-table_table]:shadow-sm
                                        [&_.wp-block-table_th]:bg-gradient-to-r [&_.wp-block-table_th]:from-blue-50 [&_.wp-block-table_th]:to-indigo-50 [&_.wp-block-table_th]:dark:from-blue-900/30 [&_.wp-block-table_th]:dark:to-indigo-900/30 [&_.wp-block-table_th]:p-3 [&_.wp-block-table_th]:text-left [&_.wp-block-table_th]:font-bold [&_.wp-block-table_th]:text-gray-800 [&_.wp-block-table_th]:dark:text-gray-200 [&_.wp-block-table_th]:border [&_.wp-block-table_th]:border-gray-200 [&_.wp-block-table_th]:dark:border-gray-700
                                        [&_.wp-block-table_td]:p-3 [&_.wp-block-table_td]:border [&_.wp-block-table_td]:border-gray-200 [&_.wp-block-table_td]:dark:border-gray-700 [&_.wp-block-table_td]:bg-white [&_.wp-block-table_td]:dark:bg-gray-800
                                        [&_.wp-block-table_tr:hover_td]:bg-blue-50 [&_.wp-block-table_tr:hover_td]:dark:bg-blue-900/20
                                        [&_.wp-block-table_a]:text-blue-600 [&_.wp-block-table_a]:font-semibold [&_.wp-block-table_a]:hover:text-blue-800
                                        [&_.wp-block-heading]:font-bold [&_.wp-block-heading]:mt-6 [&_.wp-block-heading]:mb-3 [&_.wp-block-heading]:text-gray-900 [&_.wp-block-heading]:dark:text-white
                                        [&_.wp-block-list]:pl-6 [&_.wp-block-list]:my-3
                                        [&>strong]:font-bold [&>strong]:text-gray-900 [&>strong]:dark:text-white
                                    "
                                    dangerouslySetInnerHTML={{ __html: selectedNotice.content }}
                                />
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <FileText className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 italic">
                                        No additional content available for this notice.
                                    </p>
                                </div>
                            )}

                            {/* Content Images */}
                            {selectedNotice.contentImages?.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                        <ImageIcon className="h-4 w-4" />
                                        Gallery
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {selectedNotice.contentImages.map((img, idx) => (
                                            <a 
                                                key={idx}
                                                href={img.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 hover:shadow-lg hover:scale-105 transition-all duration-200"
                                            >
                                                <img 
                                                    src={img.url} 
                                                    alt={img.alt || `Image ${idx + 1}`}
                                                    className="w-full h-24 object-cover"
                                                    onError={(e) => {
                                                        e.target.parentElement.style.display = 'none';
                                                    }}
                                                />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-center gap-3 p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <button
                                onClick={() => setSelectedNotice(null)}
                                className="px-8 py-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all font-semibold shadow-sm hover:shadow-md"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;