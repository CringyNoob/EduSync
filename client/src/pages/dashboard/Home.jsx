import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import {
    ShoppingBag, MessageSquare, Bell, AlertCircle, TrendingUp, Clock, ArrowRight,
    Zap, Star, Shield, Search, User, Heart, Bookmark, Calendar, Users,
    Package, MessageCircle, Activity, Filter, ChevronRight, Plus, Settings,
    BookOpen, Award, Target, Sparkles, Home as HomeIcon, LayoutDashboard, Newspaper, Repeat
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

// Personal Stat Card Component
const PersonalStatCard = ({ title, value, icon: Icon, colorClass, onClick }) => (
    <div
        className="relative overflow-hidden rounded-2xl p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-white/60 dark:border-gray-700/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
        onClick={onClick}
    >
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</h3>
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
        urgent: 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/40 text-red-900 dark:text-red-300',
        high: 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/40 text-orange-900 dark:text-orange-300',
        normal: 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/40 text-blue-900 dark:text-blue-300',
    };

    const iconColors = {
        urgent: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40',
        high: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40',
        normal: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40',
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
        chat: MessageCircle,
        notice: Bell,
        newsbox: Newspaper,
        renthub: Repeat,
        issues: AlertCircle,
        user: User,
    };

    const typeColors = {
        marketplace: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300',
        chat: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300',
        notice: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-300',
        newsbox: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300',
        renthub: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300',
        issues: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-300',
        user: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-300',
    };

    const Icon = typeIcons[activity.type] || Activity;

    return (
        <div
            className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
            onClick={onClick}
        >
            <div className={`rounded-lg p-2 ${typeColors[activity.type]} group-hover:scale-110 transition-transform`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">{activity.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{activity.description}</p>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 inline-block">{activity.time}</span>
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
    const { unreadCount: unreadNotifications } = useNotifications();
    const [searchQuery, setSearchQuery] = useState('');
    const [activityFilter, setActivityFilter] = useState('all');
    const [isNewListingOpen, setIsNewListingOpen] = useState(false);

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

    const personalStats = [
        { title: "My Listings", value: "5", icon: Package, colorClass: "bg-orange-100 text-orange-600", onClick: () => navigate('/marketplace?filter=my-listings') },
        { title: "Active Chats", value: "12", icon: MessageCircle, colorClass: "bg-blue-100 text-blue-600", onClick: () => navigate('/chat') },
        { title: "Saved Items", value: "8", icon: Bookmark, colorClass: "bg-indigo-100 text-indigo-600", onClick: () => navigate('/saved') },
        { title: "Messages", value: "4", icon: MessageSquare, colorClass: "bg-green-100 text-green-600", onClick: () => navigate('/chat') },
    ];

    const priorityNotifications = [
        { id: 1, title: "Exam Tomorrow!", message: "Your Calculus final exam is scheduled for tomorrow at 9 AM", time: "1h ago", priority: "urgent", link: "/notices/1" },
        { id: 2, title: "New Message", message: "Someone is interested in your Calculus textbook listing", time: "2h ago", priority: "high", link: "/chat/2" },
        { id: 3, title: "Event Reminder", message: "Guest lecture on AI Ethics starts in 2 days", time: "5h ago", priority: "normal", link: "/notices/3" },
    ];

    const activityFeed = [
        { id: 1, type: "marketplace", title: "Term End Feast", description: "Get 30% off on all meal preps today!", time: "5 min ago", link: "/marketplace/foods" },
        { id: 2, type: "chat", title: "Study Group: Calculus II", description: "Alex: Hey, does anyone have the notes for yesterday?", time: "12 min ago", link: "/chat" },
        { id: 3, type: "newsbox", title: "Major Campus Renovation", description: "University announced ৳1150M plan for student union renovation.", time: "1h ago", link: "/newsbox" },
        { id: 4, type: "renthub", title: "New Academic Rental", description: "Texas Instruments TI-84 Plus available for rent.", time: "1.5h ago", link: "/renthub" },
        { id: 5, type: "marketplace", title: "Tech Week Sale", description: "10% off on all student tech accessories this week.", time: "2h ago", link: "/marketplace/shops" },
        { id: 6, type: "issues", title: "Broken Projector (RM 301)", description: "Issue reported: The projector won't turn on during lectures.", time: "2.5h ago", link: "/issues" },
        { id: 7, type: "newsbox", title: "UIU Tigers Victory", description: "UIU Tigers win regional basketball finals in stunning upset!", time: "3h ago", link: "/newsbox" },
        { id: 8, type: "chat", title: "General Lounge", description: "Sarah: Who's up for a coffee break at the Student Union?", time: "4h ago", link: "/chat" },
        { id: 9, type: "renthub", title: "MacBook Pro Rental", description: "M2 MacBook Pro available for short-term rental.", time: "4.5h ago", link: "/renthub" },
        { id: 10, type: "issues", title: "Wifi Connectivity Issues", description: "Reported in Library: Cannot connect to EduRoam in quiet area.", time: "5h ago", link: "/issues" },
        { id: 11, type: "newsbox", title: "Tech Career Fair", description: "Over 50 top tech companies (Google, Microsoft) attending.", time: "5.5h ago", link: "/newsbox" },
    ];

    const filteredActivity = React.useMemo(() => {
        let filtered = activityFeed;

        // Filter by type
        if (activityFilter !== 'all') {
            filtered = filtered.filter(item => item.type === activityFilter);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [activityFilter, searchQuery]);

    const quickActions = [
        { title: "Sell Item", description: "List on marketplace", icon: ShoppingBag, colorClass: "bg-gradient-to-br from-orange-400 to-pink-500", onClick: () => navigate('/marketplace/new') },
        { title: "Peer Chat", description: "Connect with students", icon: MessageCircle, colorClass: "bg-gradient-to-br from-blue-400 to-cyan-500", onClick: () => navigate('/chat') },
        { title: "My Rentals", description: "Manage your gear", icon: LayoutDashboard, colorClass: "bg-gradient-to-br from-emerald-400 to-teal-500", onClick: () => navigate('/renthub/my-rentals') },
        { title: "Report Issue", description: "Submit campus issue", icon: AlertCircle, colorClass: "bg-gradient-to-br from-red-400 to-rose-500", onClick: () => navigate('/issues/new') },
    ];

    const campusStats = [
        { title: "Active Users", value: "1,234", icon: Users, trend: "+8%", colorClass: "bg-indigo-100 text-indigo-600" },
        { title: "Total Listings", value: "456", icon: ShoppingBag, trend: "+12%", colorClass: "bg-orange-100 text-orange-600" },
        { title: "Online Now", value: "89", icon: MessageCircle, trend: "+5%", colorClass: "bg-pink-100 text-pink-600" },
        { title: "Events", value: "23", icon: Calendar, trend: "+3%", colorClass: "bg-cyan-100 text-cyan-600" },
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

                    {/* Search Bar */}
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search marketplace, chat, notices..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:border-primary dark:focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder:text-gray-400 font-medium shadow-sm dark:text-white"
                            />
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
                        <Button size="icon" variant="outline" className="rounded-2xl h-14 w-14 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:bg-white dark:hover:bg-gray-700 hover:shadow-md bg-white dark:bg-gray-800 overflow-visible" onClick={() => navigate('/settings')}>
                            <Settings className="h-6 w-6 text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-primary" />
                        </Button>

                        {/* New Listing Dropdown */}
                        <div className="relative">
                            <Button
                                className="rounded-2xl h-14 px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                                onClick={() => setIsNewListingOpen(!isNewListingOpen)}
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                <span className="hidden sm:inline text-lg">New Listing</span>
                                <ChevronRight className={`ml-2 h-4 w-4 transition-transform ${isNewListingOpen ? 'rotate-90' : ''}`} />
                            </Button>

                            {isNewListingOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in">
                                    <div className="p-2 space-y-1">

                                        <button
                                            onClick={() => {
                                                navigate('/renthub/new');
                                                setIsNewListingOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group"
                                        >
                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-110 transition-transform">
                                                <Package className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="font-bold text-gray-900 dark:text-white text-sm">Rent Out Item</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">List on RentHub</div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => {
                                                navigate('/newsbox', { state: { create: true } });
                                                setIsNewListingOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group"
                                        >
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:scale-110 transition-transform">
                                                <Newspaper className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="font-bold text-gray-900 dark:text-white text-sm">Create Post</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Broadcast news</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Personal Stats Section */}
            <div>
                <div className="flex items-center justify-between mb-5 px-1">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg"><Target className="h-5 w-5 text-primary" /></div>
                        My Activity
                    </h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {personalStats.map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-[2rem] p-5 border border-white/50 dark:border-gray-700/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{stat.title}</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{stat.value}</h3>
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
                <div className="lg:col-span-1 rounded-[2.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col h-full hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <div className="p-2 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-lg"><Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" /></div>
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
                <div className="lg:col-span-2 rounded-[2.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col h-full hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-shadow">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg"><Activity className="h-5 w-5 text-primary" /></div>
                            Live Feed
                        </h2>
                        <div className="flex bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded-xl border border-gray-100 dark:border-gray-600 overflow-x-auto no-scrollbar">
                            {['all', 'marketplace', 'newsbox', 'chat', 'renthub', 'issues'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActivityFilter(filter)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${activityFilter === filter ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm ring-1 ring-gray-100 dark:ring-gray-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-600/50'}`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar flex-1 text-left">
                        {filteredActivity.length > 0 ? (
                            filteredActivity.map((activity) => (
                                <ActivityFeedItem
                                    key={activity.id}
                                    activity={activity}
                                    onClick={() => navigate(activity.link)}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                <Activity size={32} className="mb-2 opacity-20" />
                                <p className="text-sm font-medium">No activity in this category</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-700 text-center">
                        <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 w-full h-10 rounded-xl">
                            View More Updates <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
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

            {/* Campus Overview Stats */}
            <div>
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Campus Overview
                    </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {campusStats.map((stat, i) => (
                        <div
                            key={i}
                            className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-800 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`rounded-xl p-2.5 ${stat.colorClass} shadow-sm`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <span className={`text-xs font-bold ${stat.trend.includes('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-lg border border-transparent`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.title}</p>
                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
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
        </div>
    );
};

export default Home;