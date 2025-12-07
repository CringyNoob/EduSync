import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MessageSquare, Bell, AlertCircle, TrendingUp, Clock, ArrowRight, Zap, Star, Shield } from 'lucide-react';

// Reusing the styled Button from LandingPage for consistency
const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseStyles = "relative overflow-hidden inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";

    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 focus:ring-indigo-500 border border-transparent",
        outline: "bg-white/50 backdrop-blur-sm text-gray-700 border-2 border-gray-200 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50/50",
        ghost: "bg-transparent text-gray-600 hover:bg-indigo-50 hover:text-indigo-600",
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

const StatCard = ({ title, value, icon: Icon, trend, colorClass, delay, onClick }) => (
    <div
        className="relative overflow-hidden rounded-3xl p-6 bg-white/60 backdrop-blur-md border border-white/60 shadow-lg shadow-gray-200/20 group hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-500 cursor-pointer"
        style={{ animationDelay: delay }}
        onClick={onClick}
    >
        {/* Background Glow on Hover */}
        <div className={`absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${colorClass.replace('text-', 'bg-')}`}></div>

        <div className="relative flex items-center justify-between">
            <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</p>
                <h3 className="mt-2 text-3xl font-extrabold text-gray-900">{value}</h3>
            </div>
            <div className={`rounded-2xl p-3 ${colorClass.replace('text-', 'bg-').replace('600', '100')} ${colorClass} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-6 w-6" />
            </div>
        </div>

        {trend && (
            <div className="mt-4 flex items-center text-sm font-medium">
                <span className={`${trend.includes('+') ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'} px-2 py-0.5 rounded-lg flex items-center`}>
                    <TrendingUp className={`mr-1 h-3 w-3 ${trend.includes('-') && 'rotate-180'}`} />
                    {trend}
                </span>
                <span className="ml-2 text-gray-400">vs last month</span>
            </div>
        )}
    </div>
);

const Home = () => {
    const navigate = useNavigate();

    // --- Backend Integration Notes ---
    // 1. Fetch Dashboard Stats:
    //    - Endpoint: GET /api/dashboard/stats
    //    - Response: { activeListings: number, discussions: number, notices: number, openIssues: number, trends: { ... } }

    // 2. Fetch Recent Notices:
    //    - Endpoint: GET /api/notices/recent
    //    - Limit: 3 items

    // 3. Fetch Trending Items:
    //    - Endpoint: GET /api/marketplace/trending
    //    - Criteria: Most viewed/liked items in last 24h

    return (
        <div className="relative min-h-screen p-6 space-y-8 font-sans">
            {/* --- Dynamic Background Elements (Matches Landing Page) --- */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
                <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-pink-100/40 rounded-full mix-blend-multiply filter blur-[60px] animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-gray-200/50">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 tracking-tight">
                        Dashboard Overview
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium text-lg">
                        Welcome back! Here's your daily campus sync.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate('/reports')}>View Reports</Button>
                    <Button className="shadow-indigo-500/20" onClick={() => navigate('/posts/new')}>
                        <Zap className="mr-2 h-4 w-4" />
                        New Post
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Active Listings"
                    value="124"
                    icon={ShoppingBag}
                    trend="+12%"
                    colorClass="text-orange-600"
                    delay="0ms"
                    onClick={() => navigate('/marketplace')}
                />
                <StatCard
                    title="Discussions"
                    value="45"
                    icon={MessageSquare}
                    trend="+5%"
                    colorClass="text-indigo-600"
                    delay="100ms"
                    onClick={() => navigate('/forum')}
                />
                <StatCard
                    title="Notices"
                    value="12"
                    icon={Bell}
                    trend="+2%"
                    colorClass="text-yellow-600"
                    delay="200ms"
                    onClick={() => navigate('/notices')}
                />
                <StatCard
                    title="Open Issues"
                    value="3"
                    icon={AlertCircle}
                    trend="-2%"
                    colorClass="text-red-600"
                    delay="300ms"
                    onClick={() => navigate('/issues')}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Recent Notices Card */}
                <div className="lg:col-span-2 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-gray-200/20 p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                            Recent Notices
                        </h2>
                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50" onClick={() => navigate('/notices')}>View All</Button>
                    </div>

                    <div className="space-y-4">
                        {/* Backend: Map through 'recentNotices' data here */}
                        {[
                            { title: "Exam Schedule Released", desc: "The final exam schedule for Spring 2025 has been published.", time: "2h ago", type: "Academic", color: "bg-indigo-100 text-indigo-600", id: 1 },
                            { title: "Campus Maintenance", desc: "Water supply interruption in Block A tomorrow.", time: "5h ago", type: "Alert", color: "bg-red-100 text-red-600", id: 2 },
                            { title: "Guest Lecture Series", desc: "Dr. Smith on AI Ethics this Friday.", time: "1d ago", type: "Event", color: "bg-green-100 text-green-600", id: 3 }
                        ].map((notice, i) => (
                            <div
                                key={i}
                                className="group relative p-4 rounded-2xl bg-white/50 border border-gray-100 hover:bg-white hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer"
                                onClick={() => navigate(`/notices/${notice.id}`)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`rounded-xl p-3 ${notice.color}`}>
                                        <Bell className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{notice.title}</h4>
                                            <span className="text-xs font-semibold text-gray-400 flex items-center bg-gray-100 px-2 py-1 rounded-full">
                                                <Clock className="h-3 w-3 mr-1" />{notice.time}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-1">{notice.desc}</p>
                                    </div>
                                    <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                                        <ArrowRight className="h-5 w-5 text-gray-300" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trending Marketplace Card */}
                <div className="lg:col-span-1 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30 p-8 flex flex-col relative overflow-hidden">
                    {/* Decorative background circles */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500/30 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                            <ShoppingBag className="h-6 w-6" />
                            Trending
                        </h2>
                        <p className="text-indigo-100 text-sm mb-8 opacity-80">Hot items on campus today</p>

                        <div className="space-y-4">
                            {/* Backend: Map through 'trendingItems' data here */}
                            {[
                                { title: "Calculus Textbook", price: "$45.00", bg: "bg-white/20", id: 101 },
                                { title: "Graphing Calculator", price: "$85.00", bg: "bg-white/10", id: 102 },
                                { title: "Dorm Mini Fridge", price: "$60.00", bg: "bg-white/5", id: 103 }
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center space-x-4 p-3 rounded-2xl ${item.bg} backdrop-blur-sm border border-white/10 hover:bg-white/25 transition-colors cursor-pointer group`}
                                    onClick={() => navigate(`/marketplace/${item.id}`)}
                                >
                                    <div className="h-12 w-12 rounded-xl bg-white/90 flex items-center justify-center text-indigo-600 shadow-sm">
                                        <ShoppingBag className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-white truncate">{item.title}</h4>
                                        <p className="text-sm font-bold text-indigo-200">{item.price}</p>
                                    </div>
                                    <Button size="icon" className="h-8 w-8 bg-white/20 hover:bg-white text-white hover:text-indigo-600 rounded-full">
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <button
                            className="w-full mt-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                            onClick={() => navigate('/marketplace')}
                        >
                            Visit Marketplace
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Actions / Bottom Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                <div
                    className="p-6 rounded-[2rem] bg-orange-50/50 border border-orange-100 flex items-center justify-between hover:bg-orange-50 transition-colors cursor-pointer group"
                    onClick={() => navigate('/safety')}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Safety Center</h3>
                            <p className="text-sm text-gray-500">Report an incident or view guidelines</p>
                        </div>
                    </div>
                    <ArrowRight className="text-gray-300 group-hover:text-orange-500 transition-colors" />
                </div>

                <div
                    className="p-6 rounded-[2rem] bg-green-50/50 border border-green-100 flex items-center justify-between hover:bg-green-50 transition-colors cursor-pointer group"
                    onClick={() => navigate('/forum')}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Community Forum</h3>
                            <p className="text-sm text-gray-500">Join the discussion on campus topics</p>
                        </div>
                    </div>
                    <ArrowRight className="text-gray-300 group-hover:text-green-500 transition-colors" />
                </div>
            </div>
        </div>
    );
};

export default Home;