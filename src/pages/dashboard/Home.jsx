import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag, MessageSquare, Bell, AlertCircle, TrendingUp, Clock, ArrowRight,
    Zap, Star, Shield, Search, User, Heart, Bookmark, Calendar, Users,
    Package, MessageCircle, Activity, Filter, ChevronRight, Plus, Settings,
    BookOpen, Award, Target, Sparkles, Home as HomeIcon
} from 'lucide-react';

// Reusing the styled Button from LandingPage for consistency
const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseStyles = "relative overflow-hidden inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 focus:ring-primary border border-transparent",
        secondary: "bg-secondary text-white hover:bg-secondary-light hover:shadow-lg hover:shadow-secondary/30 focus:ring-secondary border border-transparent",
        outline: "bg-white/50 backdrop-blur-sm text-text-main border-2 border-gray-200 hover:border-primary hover:text-primary hover:bg-white focus:ring-gray-200",
        ghost: "bg-transparent text-text-main-light hover:bg-primary/10 hover:text-primary",
        white: "bg-white text-primary hover:bg-gray-50 shadow-md border border-transparent",
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

// Personal Stat Card Component
const PersonalStatCard = ({ title, value, icon: Icon, colorClass, onClick }) => (
    <div
        className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
        onClick={onClick}
    >
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-extrabold text-gray-900">{value}</h3>
            </div>
            <div className={`rounded-xl p-2.5 ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-5 w-5" />
            </div>
        </div>
    </div>
);

// Priority Notification Component
const PriorityNotification = ({ notification, onClick }) => {
    const priorityStyles = {
        urgent: 'bg-red-50 border-red-100 text-red-900',
        high: 'bg-orange-50 border-orange-100 text-orange-900',
        normal: 'bg-blue-50 border-blue-100 text-blue-900',
    };

    const iconColors = {
        urgent: 'text-red-600 bg-red-100',
        high: 'text-orange-600 bg-orange-100',
        normal: 'text-blue-600 bg-blue-100',
    };

    return (
        <div
            className={`p-4 rounded-xl border ${priorityStyles[notification.priority]} hover:shadow-md transition-all duration-300 cursor-pointer group`}
            onClick={onClick}
        >
            <div className="flex items-start gap-3">
                <div className={`rounded-lg p-2 ${iconColors[notification.priority]} group-hover:scale-110 transition-transform`}>
                    <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-sm truncate">{notification.title}</h4>
                        <span className="text-xs font-medium opacity-70">{notification.time}</span>
                    </div>
                    <p className="text-xs opacity-80 line-clamp-2 font-medium">{notification.message}</p>
                </div>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
    );
};

// Activity Feed Item Component
const ActivityFeedItem = ({ activity, onClick }) => {
    const typeIcons = {
        marketplace: ShoppingBag,
        forum: MessageSquare,
        notice: Bell,
        user: User,
    };

    const typeColors = {
        marketplace: 'bg-purple-100 text-purple-600',
        forum: 'bg-blue-100 text-blue-600',
        notice: 'bg-yellow-100 text-yellow-600',
        user: 'bg-green-100 text-green-600',
    };

    const Icon = typeIcons[activity.type] || Activity;

    return (
        <div
            className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/60 transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-100"
            onClick={onClick}
        >
            <div className={`rounded-lg p-2 ${typeColors[activity.type]} group-hover:scale-110 transition-transform`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 mb-0.5">{activity.title}</p>
                <p className="text-xs text-gray-600 line-clamp-1">{activity.description}</p>
                <span className="text-xs text-gray-400 mt-1 inline-block">{activity.time}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
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
    const [searchQuery, setSearchQuery] = useState('');
    const [activityFilter, setActivityFilter] = useState('all');

    // Get current time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Mock data
    const userName = "Alex";
    const unreadNotifications = 3;

    const personalStats = [
        { title: "My Listings", value: "5", icon: Package, colorClass: "bg-orange-100 text-orange-600", onClick: () => navigate('/marketplace?filter=my-listings') },
        { title: "My Posts", value: "12", icon: MessageCircle, colorClass: "bg-blue-100 text-blue-600", onClick: () => navigate('/forum?filter=my-posts') },
        { title: "Saved Items", value: "8", icon: Bookmark, colorClass: "bg-indigo-100 text-indigo-600", onClick: () => navigate('/saved') },
        { title: "Messages", value: "4", icon: MessageSquare, colorClass: "bg-green-100 text-green-600", onClick: () => navigate('/chat') },
    ];

    const priorityNotifications = [
        { id: 1, title: "Exam Tomorrow!", message: "Your Calculus final exam is scheduled for tomorrow at 9 AM", time: "1h ago", priority: "urgent", link: "/notices/1" },
        { id: 2, title: "New Message", message: "Someone is interested in your Calculus textbook listing", time: "2h ago", priority: "high", link: "/chat/2" },
        { id: 3, title: "Event Reminder", message: "Guest lecture on AI Ethics starts in 2 days", time: "5h ago", priority: "normal", link: "/notices/3" },
    ];

    const activityFeed = [
        { id: 1, type: "marketplace", title: "New listing in Electronics", description: "iPhone 13 Pro - Excellent Condition", time: "5 min ago", link: "/marketplace/201" },
        { id: 2, type: "forum", title: "Hot discussion in Computer Science", description: "Best programming languages for beginners?", time: "15 min ago", link: "/forum/45" },
        { id: 3, type: "notice", title: "Campus Update", description: "Library hours extended during exam week", time: "1h ago", link: "/notices/12" },
        { id: 4, type: "user", title: "Sarah joined your study group", description: "Calculus Study Group now has 8 members", time: "2h ago", link: "/groups/5" },
        { id: 5, type: "marketplace", title: "Price drop alert", description: "Graphing Calculator now $75 (was $85)", time: "3h ago", link: "/marketplace/102" },
    ];

    const quickActions = [
        { title: "Sell Item", description: "List on marketplace", icon: ShoppingBag, colorClass: "bg-gradient-to-br from-orange-400 to-pink-500", onClick: () => navigate('/marketplace/new') },
        { title: "Ask Question", description: "Start forum topic", icon: MessageSquare, colorClass: "bg-gradient-to-br from-blue-400 to-cyan-500", onClick: () => navigate('/forum/new') },
        { title: "Report Issue", description: "Submit campus issue", icon: AlertCircle, colorClass: "bg-gradient-to-br from-red-400 to-rose-500", onClick: () => navigate('/issues/new') },
        { title: "View Schedule", description: "Check class timing", icon: Calendar, colorClass: "bg-gradient-to-br from-emerald-400 to-teal-500", onClick: () => navigate('/schedule') },
    ];

    const campusStats = [
        { title: "Active Users", value: "1,234", icon: Users, trend: "+8%", colorClass: "bg-indigo-100 text-indigo-600" },
        { title: "Total Listings", value: "456", icon: ShoppingBag, trend: "+12%", colorClass: "bg-orange-100 text-orange-600" },
        { title: "Discussions", value: "89", icon: MessageSquare, trend: "+5%", colorClass: "bg-pink-100 text-pink-600" },
        { title: "Events", value: "23", icon: Calendar, trend: "+3%", colorClass: "bg-cyan-100 text-cyan-600" },
    ];

    return (
        <div className="relative min-h-screen p-4 md:p-6 space-y-6 font-sans text-gray-900 transition-all duration-300">
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
            <div className="rounded-[2.5rem] bg-white/90 backdrop-blur-2xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                    {/* Personalized Greeting */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white/80">
                                {userName.charAt(0)}
                            </div>
                            {unreadNotifications > 0 && (
                                <div className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white animate-pulse">
                                    {unreadNotifications}
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary to-gray-700 leading-tight">
                                {getGreeting()}, {userName}!
                            </h1>
                            <p className="text-sm text-gray-500 font-medium mt-1">Ready to sync your academic day?</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search marketplace, forums, notices..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder:text-gray-400 font-medium shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex gap-3">
                        <Button size="icon" variant="outline" className="rounded-2xl h-14 w-14 border-gray-200 hover:border-primary hover:bg-white hover:shadow-md bg-white" onClick={() => navigate('/notifications')}>
                            <Bell className="h-6 w-6" />
                        </Button>
                        <Button size="icon" variant="outline" className="rounded-2xl h-14 w-14 border-gray-200 hover:border-primary hover:bg-white hover:shadow-md bg-white" onClick={() => navigate('/settings')}>
                            <Settings className="h-6 w-6" />
                        </Button>
                        <Button className="rounded-2xl h-14 px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30" onClick={() => navigate('/marketplace/new')}>
                            <Plus className="mr-2 h-5 w-5" />
                            <span className="hidden sm:inline text-lg">New Listing</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Personal Stats Section */}
            <div>
                <div className="flex items-center justify-between mb-5 px-1">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg"><Target className="h-5 w-5 text-primary" /></div>
                        My Activity
                    </h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {personalStats.map((stat, i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-5 border border-white/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{stat.title}</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 group-hover:text-primary transition-colors">{stat.value}</h3>
                                </div>
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stat.colorClass} shadow-sm group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Priority Notifications */}
                <div className="lg:col-span-1 rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col h-full hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <div className="p-2 bg-yellow-100/50 rounded-lg"><Sparkles className="h-5 w-5 text-yellow-600" /></div>
                            Attention
                        </h2>
                        <Button variant="ghost" size="sm" className="text-xs font-bold h-8 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg px-3" onClick={() => navigate('/notifications')}>
                            View All
                        </Button>
                    </div>
                    <div className="space-y-4 flex-1">
                        {priorityNotifications.map((notification) => (
                            <PriorityNotification
                                key={notification.id}
                                notification={notification}
                                onClick={() => navigate(notification.link)}
                            />
                        ))}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="lg:col-span-2 rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col h-full hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-shadow">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg"><Activity className="h-5 w-5 text-primary" /></div>
                            Live Feed
                        </h2>
                        <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                            {['all', 'marketplace', 'forum'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActivityFilter(filter)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${activityFilter === filter ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-100' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {activityFeed.map((activity) => (
                            <ActivityFeedItem
                                key={activity.id}
                                activity={activity}
                                onClick={() => navigate(activity.link)}
                            />
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-50 text-center">
                        <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 w-full h-10 rounded-xl">
                            View More Updates <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
                <div className="flex items-center justify-between mb-5 px-1">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
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

            {/* Campus Overview Stats */}
            <div>
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Campus Overview
                    </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {campusStats.map((stat, i) => (
                        <div
                            key={i}
                            className="relative overflow-hidden rounded-2xl p-5 bg-white backdrop-blur-xl border border-white/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`rounded-xl p-2.5 ${stat.colorClass} shadow-sm`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <span className={`text-xs font-bold ${stat.trend.includes('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-lg border border-transparent`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{stat.value}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom CTA Cards */}
            <div className="grid gap-6 md:grid-cols-2">
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
                    onClick={() => navigate('/forum')}
                >
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <MessageSquare className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold mb-2">Student Forum</h3>
                        <p className="text-white/80 mb-6 text-lg font-medium">Connect with peers, share notes, and discuss topics.</p>
                        <div className="flex items-center gap-2 font-bold bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-colors">
                            Join Discussions <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;