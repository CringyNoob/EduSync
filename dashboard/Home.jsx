import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag, MessageSquare, Bell, AlertCircle, TrendingUp, Clock, ArrowRight,
    Zap, Star, Shield, Search, User, Heart, Bookmark, Calendar, Users,
    Package, MessageCircle, Activity, Filter, ChevronRight, Plus, Settings,
    BookOpen, Award, Target, Sparkles
} from 'lucide-react';

// Reusing the styled Button from LandingPage for consistency
const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseStyles = "relative overflow-hidden inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";

    const variants = {
        primary: "bg-custom-taupe-grey text-white hover:bg-custom-taupe-grey/90 hover:shadow-lg hover:shadow-custom-taupe-grey/20 focus:ring-custom-taupe-grey border border-transparent",
        outline: "bg-white/50 backdrop-blur-sm text-custom-taupe-grey border-2 border-custom-taupe-grey/20 hover:border-custom-taupe-grey hover:text-custom-taupe-grey hover:bg-custom-beige/30",
        ghost: "bg-transparent text-custom-taupe-grey hover:bg-custom-celadon/20 hover:text-custom-taupe-grey",
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
        className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-md border border-white/60 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
        onClick={onClick}
    >
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-extrabold text-gray-900">{value}</h3>
            </div>
            <div className={`rounded-xl p-2.5 ${colorClass.replace('text-', 'bg-')}/20 ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-5 w-5" />
            </div>
        </div>
    </div>
);

// Priority Notification Component
const PriorityNotification = ({ notification, onClick }) => {
    const priorityColors = {
        urgent: 'bg-custom-cotton-candy/10 border-custom-cotton-candy/30 text-custom-taupe-grey',
        high: 'bg-custom-soft-apricot/10 border-custom-soft-apricot/30 text-custom-taupe-grey',
        normal: 'bg-custom-celadon/10 border-custom-celadon/30 text-custom-taupe-grey',
    };

    const iconColors = {
        urgent: 'bg-custom-cotton-candy/20 text-custom-taupe-grey',
        high: 'bg-custom-soft-apricot/20 text-custom-taupe-grey',
        normal: 'bg-custom-celadon/20 text-custom-taupe-grey',
    };

    return (
        <div
            className={`p-4 rounded-xl border-2 ${priorityColors[notification.priority]} hover:shadow-md transition-all duration-300 cursor-pointer group`}
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
                    <p className="text-xs opacity-80 line-clamp-2">{notification.message}</p>
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
        marketplace: 'bg-custom-soft-apricot/20 text-custom-taupe-grey',
        forum: 'bg-custom-cotton-candy/20 text-custom-taupe-grey',
        notice: 'bg-custom-beige/40 text-custom-taupe-grey',
        user: 'bg-custom-celadon/20 text-custom-taupe-grey',
    };

    const Icon = typeIcons[activity.type] || Activity;

    return (
        <div
            className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/60 transition-all duration-300 cursor-pointer group"
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
        className={`relative overflow-hidden rounded-2xl p-6 ${colorClass} border-2 border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group`}
        onClick={onClick}
    >
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <Plus className="h-5 w-5 text-white/60 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-white/80">{description}</p>
        </div>
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
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

    // --- Backend Integration Notes ---
    // 1. User Profile Data:
    //    - Endpoint: GET /api/user/profile
    //    - Response: { name, avatar, role, stats: {...} }

    // 2. Personal Stats:
    //    - Endpoint: GET /api/dashboard/user-stats
    //    - Response: { myListings: {...}, myDiscussions: {...}, savedItems: number, unreadMessages: number }

    // 3. Priority Notifications:
    //    - Endpoint: GET /api/dashboard/notifications
    //    - Response: { urgent: [...], high: [...], normal: [...] }

    // 4. Activity Feed:
    //    - Endpoint: GET /api/dashboard/activity-feed?filter={all|marketplace|forum|notices}
    //    - Response: { activities: [...], hasMore: boolean }

    // 5. Global Search:
    //    - Endpoint: GET /api/search?q={query}&type={all|marketplace|forum|notices}
    //    - Response: { results: [...], total: number }

    // Mock data - Replace with actual API calls
    const userName = "Alex"; // From user profile API
    const unreadNotifications = 3;

    const personalStats = [
        { title: "My Listings", value: "5", icon: Package, colorClass: "text-orange-400", onClick: () => navigate('/marketplace?filter=my-listings') },
        { title: "My Posts", value: "12", icon: MessageCircle, colorClass: "text-custom-taupe-grey", onClick: () => navigate('/forum?filter=my-posts') },
        { title: "Saved Items", value: "8", icon: Bookmark, colorClass: "text-custom-cotton-candy", onClick: () => navigate('/saved') },
        { title: "Messages", value: "4", icon: MessageSquare, colorClass: "text-custom-celadon", onClick: () => navigate('/chat') },
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
        { title: "Sell Item", description: "List something on marketplace", icon: ShoppingBag, colorClass: "bg-gradient-to-br from-custom-soft-apricot to-orange-300", onClick: () => navigate('/marketplace/new') },
        { title: "Ask Question", description: "Start a forum discussion", icon: MessageSquare, colorClass: "bg-gradient-to-br from-custom-cotton-candy to-pink-300", onClick: () => navigate('/forum/new') },
        { title: "Report Issue", description: "Submit a campus issue", icon: AlertCircle, colorClass: "bg-gradient-to-br from-custom-taupe-grey to-gray-500", onClick: () => navigate('/issues/new') },
        { title: "View Schedule", description: "Check your class schedule", icon: Calendar, colorClass: "bg-gradient-to-br from-custom-celadon to-green-300", onClick: () => navigate('/schedule') },
    ];

    const campusStats = [
        { title: "Active Users", value: "1,234", icon: Users, trend: "+8%", colorClass: "text-custom-taupe-grey" },
        { title: "Total Listings", value: "456", icon: ShoppingBag, trend: "+12%", colorClass: "text-orange-400" },
        { title: "Discussions", value: "89", icon: MessageSquare, trend: "+5%", colorClass: "text-custom-cotton-candy" },
        { title: "Events", value: "23", icon: Calendar, trend: "+3%", colorClass: "text-custom-celadon" },
    ];

    return (
        <div className="relative min-h-screen p-4 md:p-6 space-y-6 font-sans">
            {/* --- Soothing Background Elements --- */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                {/* Soft pastel gradient blobs */}
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-custom-celadon/50 via-custom-beige/40 to-custom-soft-apricot/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-custom-cotton-candy/40 via-custom-soft-apricot/30 to-custom-beige/40 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-gradient-to-bl from-custom-soft-apricot/30 via-white/20 to-custom-cotton-candy/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000"></div>
                <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-gradient-to-tl from-custom-celadon/30 via-custom-beige/20 to-custom-soft-apricot/25 rounded-full mix-blend-multiply filter blur-[90px] animate-blob animation-delay-2000"></div>

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]"></div>

                {/* Soft overlay for better readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/30"></div>
            </div>

            {/* Smart Header */}
            <div className="rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-gray-200/20 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Personalized Greeting */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {userName.charAt(0)}
                            </div>
                            {unreadNotifications > 0 && (
                                <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                                    {unreadNotifications}
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-custom-taupe-grey to-custom-cotton-candy leading-none pb-1">
                                {getGreeting()}, {userName}!
                            </h1>
                            <p className="text-sm text-gray-500 font-medium">Ready to make today productive?</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search marketplace, forums, notices..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/80 border-2 border-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex gap-2">
                        <Button size="icon" variant="outline" className="rounded-xl" onClick={() => navigate('/notifications')}>
                            <Bell className="h-5 w-5" />
                        </Button>
                        <Button size="icon" variant="outline" className="rounded-xl" onClick={() => navigate('/settings')}>
                            <Settings className="h-5 w-5" />
                        </Button>
                        <Button className="shadow-custom-taupe-grey/10" onClick={() => navigate('/marketplace/new')}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">New Listing</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Personal Stats Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Target className="h-5 w-5 text-custom-taupe-grey" />
                        My Activity
                    </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {personalStats.map((stat, i) => (
                        <PersonalStatCard key={i} {...stat} />
                    ))}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Priority Notifications */}
                <div className="lg:col-span-1 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-gray-200/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-yellow-500" />
                            Needs Attention
                        </h2>
                        <Button variant="ghost" size="sm" className="text-custom-taupe-grey hover:bg-custom-celadon/20" onClick={() => navigate('/notifications')}>
                            View All
                        </Button>
                    </div>
                    <div className="space-y-3">
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
                <div className="lg:col-span-2 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-gray-200/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-custom-taupe-grey" />
                            What's Happening
                        </h2>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActivityFilter('all')}>
                                All
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActivityFilter('marketplace')}>
                                Marketplace
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActivityFilter('forum')}>
                                Forum
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {activityFeed.map((activity) => (
                            <ActivityFeedItem
                                key={activity.id}
                                activity={activity}
                                onClick={() => navigate(activity.link)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-custom-taupe-grey" />
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
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Award className="h-5 w-5 text-custom-taupe-grey" />
                        Campus Overview
                    </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {campusStats.map((stat, i) => (
                        <div
                            key={i}
                            className="relative overflow-hidden rounded-2xl p-5 bg-white/60 backdrop-blur-md border border-white/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className={`rounded-xl p-2.5 ${stat.colorClass.replace('text-', 'bg-')}/20 ${stat.colorClass}`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <span className={`text-xs font-bold ${stat.trend.includes('+') ? 'text-green-600' : 'text-red-600'} bg-white px-2 py-1 rounded-lg`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{stat.value}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom CTA Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                <div
                    className="relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br from-custom-soft-apricot to-orange-300 text-white shadow-xl shadow-custom-soft-apricot/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate('/marketplace')}
                >
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <ShoppingBag className="h-10 w-10 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-2xl font-bold mb-2">Explore Marketplace</h3>
                        <p className="text-white/90 mb-4">Discover great deals from your campus community</p>
                        <div className="flex items-center gap-2 font-semibold">
                            Browse Items <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                        </div>
                    </div>
                </div>

                <div
                    className="relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br from-custom-cotton-candy to-pink-300 text-white shadow-xl shadow-custom-cotton-candy/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate('/forum')}
                >
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <MessageSquare className="h-10 w-10 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-2xl font-bold mb-2">Join Discussions</h3>
                        <p className="text-white/90 mb-4">Connect with peers and share knowledge</p>
                        <div className="flex items-center gap-2 font-semibold">
                            Visit Forum <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;