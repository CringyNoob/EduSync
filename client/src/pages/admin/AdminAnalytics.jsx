import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart3, TrendingUp, Users, Store, Package, MessageSquare,
    ShoppingCart, Newspaper, Megaphone, AlertTriangle, RefreshCw,
    ChevronLeft, Calendar, Activity, DollarSign, Eye, ArrowUpRight,
    ArrowDownRight, Loader2, Shield, AlertCircle, Home
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Cards/Card';
import Button from '../../components/Button';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const AdminAnalytics = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [analytics, setAnalytics] = useState(null);
    const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, all
    
    // Check if user is admin - support multiple role formats
    const isAdmin = (user?.roles?.includes('ADMIN') && user?.activeRole === 'ADMIN') || 
                    user?.role === 'ADMIN' || 
                    user?.role === 'Admin';
    
    // Debug logging
    useEffect(() => {
        console.log('AdminAnalytics - Current user:', user);
        console.log('AdminAnalytics - Is admin?', isAdmin);
    }, [user, isAdmin]);

    const fetchAnalytics = useCallback(async () => {
        if (!isAdmin) return;
        
        try {
            setLoading(true);
            setError('');
            
            // Fetch stats from all services in parallel
            const [authStats, marketStatsCall, issueStats, newsStats] = await Promise.allSettled([
                adminService.getUserStats(),
                adminService.getVendorStats(), // Get vendor stats directly
                adminService.getIssueStats(),
                adminService.getNewsStats()
            ]);

            // Extract data safely
            const authData = authStats.status === 'fulfilled' ? authStats.value?.data : {};
            const marketData = marketStatsCall.status === 'fulfilled' ? marketStatsCall.value?.data : {};
            const issueData = issueStats.status === 'fulfilled' ? issueStats.value?.data : {};
            const newsData = newsStats.status === 'fulfilled' ? newsStats.value?.data : {};

            console.log('Auth Data:', authData);
            console.log('Market Data:', marketData);
            console.log('Issue Data:', issueData);
            console.log('News Data:', newsData);

            // Calculate growth based on timeRange
            const calculateGrowth = (newCount, totalCount) => {
                if (!totalCount || totalCount === 0) return 0;
                const oldCount = totalCount - newCount;
                if (oldCount === 0) return 100;
                return ((newCount / oldCount) * 100).toFixed(1);
            };

            // Determine which "new" count to use based on timeRange
            const getNewCount = (new_7d, new_30d, total) => {
                if (timeRange === '7d') return new_7d || 0;
                if (timeRange === '30d') return new_30d || 0;
                if (timeRange === '90d') return Math.round((new_30d || 0) * 3); // Estimate
                return 0; // For 'all' time, don't show "new this week"
            };

            const newUsersCount = getNewCount(authData.new_users_7d, authData.new_users_30d, authData.total_users);
            const newVendorsCount = getNewCount(marketData.vendors?.new_7d, 0, marketData.vendors?.total);
            const newPostsCount = getNewCount(newsData.new_posts_7d, 0, newsData.total_posts);
            const newIssuesCount = getNewCount(issueData.recent_issues_7d, 0, issueData.total_issues);

            // Aggregate analytics data matching component structure
            const analyticsData = {
                users: {
                    total: parseInt(authData.total_users) || 0,
                    active: parseInt(authData.active_users_30d) || 0,
                    blocked: 0, // Not available in current API
                    newThisWeek: newUsersCount,
                    growth: calculateGrowth(newUsersCount, parseInt(authData.total_users) || 0)
                },
                vendors: {
                    total: parseInt(marketData.vendors?.total) || 0,
                    active: parseInt(marketData.vendors?.active) || 0,
                    pending: parseInt(marketData.vendors?.pending) || 0,
                    newThisWeek: newVendorsCount,
                    growth: calculateGrowth(newVendorsCount, parseInt(marketData.vendors?.total) || 0)
                },
                products: {
                    total: parseInt(marketData.products?.total) || 0,
                    inStock: parseInt(marketData.products?.available) || 0,
                    outOfStock: (parseInt(marketData.products?.total) || 0) - (parseInt(marketData.products?.available) || 0),
                    newThisWeek: 0
                },
                preowned: {
                    total: parseInt(marketData.preowned?.total) || 0,
                    available: parseInt(marketData.preowned?.available) || 0,
                    sold: parseInt(marketData.preowned?.sold) || 0,
                    newThisWeek: getNewCount(marketData.preowned?.new_7d, 0, marketData.preowned?.total)
                },
                rentals: {
                    total: 0, // Not available in current APIs
                    active: 0,
                    completed: 0,
                    newThisWeek: 0
                },
                news: {
                    totalPosts: parseInt(newsData.total_posts) || 0,
                    totalComments: parseInt(newsData.total_comments) || 0,
                    postsThisWeek: newPostsCount,
                    commentsThisWeek: 0
                },
                issues: {
                    total: parseInt(issueData.total_issues) || 0,
                    open: parseInt(issueData.pending_issues) || 0,
                    inProgress: parseInt(issueData.approved_issues) || 0,
                    resolved: parseInt(issueData.resolved_issues) || 0,
                    newThisWeek: newIssuesCount
                },
                revenue: {
                    total: parseFloat(marketData.orders?.total_revenue) || 0,
                    thisMonth: 0,
                    lastMonth: 0,
                    growth: 0
                }
            };
            
            setAnalytics(analyticsData);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    }, [isAdmin, timeRange]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const formatCurrency = (amount) => {
        if (!amount) return '৳0';
        return `৳${amount.toLocaleString()}`;
    };

    const getGrowthIndicator = (growth) => {
        if (!growth) return null;
        const isPositive = growth >= 0;
        return (
            <span className={`inline-flex items-center text-xs font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(growth)}%
            </span>
        );
    };

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
                    <p className="text-gray-500 dark:text-gray-400">You need admin privileges to access this page.</p>
                </div>
            </div>
        );
    }

    if (loading && !analytics) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading analytics data...</p>
                </div>
            </div>
        );
    }

    // Default analytics structure if API is not ready
    const data = analytics || {
        users: { total: 0, active: 0, blocked: 0, newThisWeek: 0, growth: 0 },
        vendors: { total: 0, active: 0, pending: 0, newThisWeek: 0, growth: 0 },
        products: { total: 0, inStock: 0, outOfStock: 0, newThisWeek: 0 },
        preowned: { total: 0, available: 0, sold: 0, newThisWeek: 0 },
        rentals: { total: 0, active: 0, completed: 0, newThisWeek: 0 },
        news: { totalPosts: 0, totalComments: 0, postsThisWeek: 0, commentsThisWeek: 0 },
        issues: { total: 0, open: 0, inProgress: 0, resolved: 0, newThisWeek: 0 },
        revenue: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Link to="/admin-dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <ChevronLeft className="h-5 w-5 text-gray-500" />
                        </Link>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                            <BarChart3 size={24} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Platform Analytics</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 ml-16">
                        Comprehensive insights across all services
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:outline-none font-medium text-sm"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="all">All Time</option>
                    </select>
                    <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* Key Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <Users size={20} className="text-blue-600" />
                            </div>
                            {getGrowthIndicator(data.users?.growth)}
                        </div>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{formatNumber(data.users?.total)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                        <p className="text-xs text-green-500 font-medium mt-1">+{data.users?.newThisWeek || 0} this week</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                <Store size={20} className="text-orange-600" />
                            </div>
                            {getGrowthIndicator(data.vendors?.growth)}
                        </div>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{formatNumber(data.vendors?.total)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Vendors</p>
                        <p className="text-xs text-green-500 font-medium mt-1">{data.vendors?.active || 0} active</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <Package size={20} className="text-green-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{formatNumber(data.products?.total)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Products</p>
                        <p className="text-xs text-blue-500 font-medium mt-1">{data.products?.inStock || 0} in stock</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <AlertTriangle size={20} className="text-red-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{formatNumber(data.issues?.open)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Open Issues</p>
                        <p className="text-xs text-yellow-500 font-medium mt-1">{data.issues?.inProgress || 0} in progress</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Sections */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* User Analytics */}
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="h-5 w-5 text-blue-500" />
                            User Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Active Users</span>
                                <span className="text-gray-900 dark:text-white font-bold">{data.users?.active || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Blocked Users</span>
                                <span className="text-red-500 font-bold">{data.users?.blocked || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">New This Week</span>
                                <span className="text-green-500 font-bold">+{data.users?.newThisWeek || 0}</span>
                            </div>
                            <Link to="/admin/users" className="block w-full">
                                <Button variant="outline" className="w-full mt-2">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View All Users
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Vendor Analytics */}
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Store className="h-5 w-5 text-orange-500" />
                            Vendor Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Active Vendors</span>
                                <span className="text-gray-900 dark:text-white font-bold">{data.vendors?.active || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Pending Approval</span>
                                <span className="text-yellow-500 font-bold">{data.vendors?.pending || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">New This Week</span>
                                <span className="text-green-500 font-bold">+{data.vendors?.newThisWeek || 0}</span>
                            </div>
                            <Link to="/admin/vendors" className="block w-full">
                                <Button variant="outline" className="w-full mt-2">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View All Vendors
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Marketplace Analytics */}
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ShoppingCart className="h-5 w-5 text-green-500" />
                            Marketplace Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Total Products</span>
                                <span className="text-gray-900 dark:text-white font-bold">{data.products?.total || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Preowned Listings</span>
                                <span className="text-gray-900 dark:text-white font-bold">{data.preowned?.total || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Items Sold</span>
                                <span className="text-green-500 font-bold">{data.preowned?.sold || 0}</span>
                            </div>
                            <Link to="/marketplace" className="block w-full">
                                <Button variant="outline" className="w-full mt-2">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Marketplace
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* RentHub Analytics */}
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Home className="h-5 w-5 text-purple-500" />
                            RentHub Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Total Listings</span>
                                <span className="text-gray-900 dark:text-white font-bold">{data.rentals?.total || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Active Rentals</span>
                                <span className="text-blue-500 font-bold">{data.rentals?.active || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Completed</span>
                                <span className="text-green-500 font-bold">{data.rentals?.completed || 0}</span>
                            </div>
                            <Link to="/renthub" className="block w-full">
                                <Button variant="outline" className="w-full mt-2">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View RentHub
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* News Analytics */}
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Newspaper className="h-5 w-5 text-cyan-500" />
                            News Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Total Posts</span>
                                <span className="text-gray-900 dark:text-white font-bold">{data.news?.totalPosts || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Total Comments</span>
                                <span className="text-gray-900 dark:text-white font-bold">{data.news?.totalComments || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Posts This Week</span>
                                <span className="text-green-500 font-bold">+{data.news?.postsThisWeek || 0}</span>
                            </div>
                            <Link to="/admin/newsManager" className="block w-full">
                                <Button variant="outline" className="w-full mt-2">
                                    <Megaphone className="h-4 w-4 mr-2" />
                                    Manage News
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Issues Analytics */}
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Issue Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Total Issues</span>
                                <span className="text-gray-900 dark:text-white font-bold">{data.issues?.total || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Open Issues</span>
                                <span className="text-red-500 font-bold">{data.issues?.open || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Resolved</span>
                                <span className="text-green-500 font-bold">{data.issues?.resolved || 0}</span>
                            </div>
                            <Link to="/issues" className="block w-full">
                                <Button variant="outline" className="w-full mt-2">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Issues
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Section (if applicable) */}
            <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        Revenue Overview
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                            <p className="text-2xl font-black text-green-600">{formatCurrency(data.revenue?.total)}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                            <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
                            <p className="text-2xl font-black text-blue-600">{formatCurrency(data.revenue?.thisMonth)}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Last Month</p>
                            <p className="text-2xl font-black text-gray-600">{formatCurrency(data.revenue?.lastMonth)}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Growth</p>
                            <p className="text-2xl font-black text-purple-600">
                                {data.revenue?.growth >= 0 ? '+' : ''}{data.revenue?.growth || 0}%
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Activity className="h-5 w-5 text-primary" />
                        Quick Actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link to="/admin/users">
                            <Button variant="outline" className="w-full h-24 flex-col gap-2">
                                <Users className="h-6 w-6 text-blue-500" />
                                <span className="text-sm">Manage Users</span>
                            </Button>
                        </Link>
                        <Link to="/admin/vendors">
                            <Button variant="outline" className="w-full h-24 flex-col gap-2">
                                <Store className="h-6 w-6 text-orange-500" />
                                <span className="text-sm">Manage Vendors</span>
                            </Button>
                        </Link>
                        <Link to="/admin/newsManager">
                            <Button variant="outline" className="w-full h-24 flex-col gap-2">
                                <Newspaper className="h-6 w-6 text-green-500" />
                                <span className="text-sm">Manage News</span>
                            </Button>
                        </Link>
                        <Link to="/issues">
                            <Button variant="outline" className="w-full h-24 flex-col gap-2">
                                <AlertTriangle className="h-6 w-6 text-red-500" />
                                <span className="text-sm">View Issues</span>
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminAnalytics;
