import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Shield, AlertTriangle, Activity, BarChart3, Store,
    Settings, Bell, CheckCircle, XCircle, FileText, MessageSquare,
    Loader2, RefreshCw, TrendingUp, TrendingDown, Clock, Eye,
    ChevronRight, Newspaper, ShoppingBag, Home, Lock, Mail, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import issueService from '../../services/issueService';
import adminService from '../../services/adminService';
import api from '../../utils/api';
import Button from '../../components/Button';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, switchRole } = useAuth();
    
    // OTP verification state
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpData, setOtpData] = useState({ otp: '', hash: '', email: '' });
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    
    // Dashboard state
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    
    // Stats from all services
    const [authStats, setAuthStats] = useState(null);
    const [marketStats, setMarketStats] = useState(null);
    const [newsStats, setNewsStats] = useState(null);
    const [issueStats, setIssueStats] = useState(null);
    const [rentalStats, setRentalStats] = useState(null);
    
    // Recent activities
    const [recentActivities, setRecentActivities] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(false);
    
    // Issues data for management
    const [pendingIssues, setPendingIssues] = useState([]);
    const [issuesLoading, setIssuesLoading] = useState(false);
    const [processingIssueId, setProcessingIssueId] = useState(null);

    // Check if user is admin
    const isAdmin = user?.roles?.includes('ADMIN') && user?.activeRole === 'ADMIN';
    const hasAdminRole = user?.roles?.includes('ADMIN');

    // Send OTP for admin verification
    const handleSendOtp = async () => {
        try {
            setOtpLoading(true);
            setOtpError('');
            const response = await authService.sendAdminOtp();
            if (response.success) {
                setOtpData(prev => ({ ...prev, hash: response.hash, email: user.email }));
                setOtpSent(true);
            } else {
                setOtpError(response.message || 'Failed to send OTP');
            }
        } catch (err) {
            console.error('Error sending OTP:', err);
            setOtpError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    // Verify OTP and switch to admin role
    const handleVerifyOtp = async () => {
        if (!otpData.otp || otpData.otp.length !== 6) {
            setOtpError('Please enter a valid 6-digit OTP');
            return;
        }
        
        try {
            setOtpLoading(true);
            setOtpError('');
            const result = await switchRole('ADMIN', otpData.otp, otpData.hash);
            if (result.success) {
                setShowOtpModal(false);
                setOtpData({ otp: '', hash: '', email: '' });
                setOtpSent(false);
                // Reload data
                fetchAllStats();
            } else {
                setOtpError(result.error || 'Invalid OTP');
            }
        } catch (err) {
            console.error('Error verifying OTP:', err);
            setOtpError('Failed to verify OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    // Fetch all stats from different services
    const fetchAllStats = useCallback(async () => {
        if (!isAdmin) return;
        
        try {
            setRefreshing(true);
            setError('');

            // Fetch stats in parallel
            const [authRes, issueRes, marketRes, newsRes, rentalRes] = await Promise.allSettled([
                authService.getAdminStats(),
                issueService.getAdminStats(),
                api.get('/market/admin/stats'),
                api.get('/newsbox/admin/stats'),
                api.get('/renthub/admin/stats')
            ]);

            console.log('Auth Stats:', authRes);
            console.log('Issue Stats:', issueRes);
            console.log('Market Stats:', marketRes);
            console.log('Market Stats Full Response:', marketRes.value?.data);
            console.log('Market Stats Data:', marketRes.value?.data?.data);
            console.log('News Stats:', newsRes);
            console.log('Rental Stats:', rentalRes);

            if (authRes.status === 'fulfilled' && authRes.value.success) {
                setAuthStats(authRes.value.data);
            }
            if (issueRes.status === 'fulfilled' && issueRes.value.success) {
                setIssueStats(issueRes.value.data);
            }
            if (marketRes.status === 'fulfilled' && marketRes.value?.data?.success) {
                const marketData = marketRes.value.data.data;
                console.log('Setting marketStats to:', marketData);
                setMarketStats(marketData);
            }
            if (newsRes.status === 'fulfilled' && newsRes.value?.data?.success) {
                setNewsStats(newsRes.value.data.data);
            }
            if (rentalRes.status === 'fulfilled' && rentalRes.value?.data?.success) {
                setRentalStats(rentalRes.value.data.data);
            }

        } catch (err) {
            console.error('Error fetching stats:', err);
            setError('Failed to load some statistics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [isAdmin]);

    // Fetch recent activities
    const fetchRecentActivities = useCallback(async () => {
        if (!isAdmin) return;
        
        try {
            setActivitiesLoading(true);
            const response = await adminService.getRecentActivities();
            if (response.success) {
                setRecentActivities(response.data || []);
            }
        } catch (err) {
            console.error('Error fetching recent activities:', err);
        } finally {
            setActivitiesLoading(false);
        }
    }, [isAdmin]);

    // Fetch pending issues for management
    const fetchPendingIssues = useCallback(async () => {
        if (!isAdmin) return;
        
        try {
            setIssuesLoading(true);
            const response = await issueService.getIssues({ status: 'PENDING' });
            if (response.success) {
                setPendingIssues(response.data || []);
            }
        } catch (err) {
            console.error('Error fetching pending issues:', err);
        } finally {
            setIssuesLoading(false);
        }
    }, [isAdmin]);

    // Handle issue status update
    const handleIssueAction = async (issueId, action) => {
        try {
            setProcessingIssueId(issueId);
            const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
            const response = await issueService.updateIssueStatus(issueId, newStatus);
            
            if (response.success) {
                // Remove from pending list
                setPendingIssues(prev => prev.filter(issue => issue.id !== issueId));
                // Refresh stats
                fetchAllStats();
            }
        } catch (err) {
            console.error('Error updating issue:', err);
        } finally {
            setProcessingIssueId(null);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchAllStats();
            fetchPendingIssues();
            fetchRecentActivities();
        } else {
            setLoading(false);
        }
    }, [isAdmin, fetchAllStats, fetchPendingIssues, fetchRecentActivities]);

    // If user is not logged in
    if (!user || user.id === '00000001-0000-0000-0000-000000000001') {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 shadow-xl border border-gray-100 dark:border-gray-700 text-center">
                    <div className="h-20 w-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} className="text-red-500" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Authentication Required</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Please log in to access the admin dashboard.</p>
                    <Button onClick={() => navigate('/login')} className="w-full">
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    // If user doesn't have admin role
    if (!hasAdminRole) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 shadow-xl border border-gray-100 dark:border-gray-700 text-center">
                    <div className="h-20 w-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield size={32} className="text-red-500" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Access Denied</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">You don't have administrator privileges.</p>
                    <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    // If user has admin role but not switched to admin mode
    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 to-orange-600"></div>
                    
                    <div className="text-center mb-8">
                        <div className="h-20 w-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-gray-700 shadow-lg">
                            <Shield size={32} className="text-red-500" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Admin Verification</h1>
                        <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Security Check Required</p>
                    </div>

                    {!showOtpModal ? (
                        <div className="space-y-6">
                            <p className="text-gray-600 dark:text-gray-300 text-center">
                                To access admin features, you need to verify your identity via OTP sent to your registered email.
                            </p>
                            <Button 
                                onClick={() => {
                                    setShowOtpModal(true);
                                    handleSendOtp();
                                }}
                                className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900"
                            >
                                <Mail className="mr-2 h-5 w-5" />
                                Send Verification Code
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {!otpSent ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <span className="ml-3 text-gray-500">Sending OTP...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-green-700 dark:text-green-400 text-sm">
                                        <p className="font-bold">OTP sent to {user.email}</p>
                                        <p className="text-xs mt-1 opacity-75">Check your inbox and enter the 6-digit code below</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            Verification Code
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-red-500 focus:outline-none transition-all font-bold text-2xl text-center tracking-[0.5em] text-gray-900 dark:text-white"
                                            placeholder="000000"
                                            value={otpData.otp}
                                            onChange={(e) => setOtpData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                                        />
                                    </div>

                                    {otpError && (
                                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2">
                                            <AlertTriangle size={16} /> {otpError}
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleVerifyOtp}
                                        disabled={otpLoading || otpData.otp.length !== 6}
                                        className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-800"
                                    >
                                        {otpLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            'Verify & Access Dashboard'
                                        )}
                                    </Button>

                                    <button
                                        onClick={handleSendOtp}
                                        disabled={otpLoading}
                                        className="w-full text-center text-sm text-gray-500 hover:text-primary transition-colors"
                                    >
                                        Didn't receive code? Resend OTP
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Main admin dashboard (when authenticated as admin)
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    // Calculate overview stats
    console.log('Calculating stats - marketStats:', marketStats);
    console.log('marketStats as JSON:', JSON.stringify(marketStats, null, 2));
    console.log('marketStats.vendors:', marketStats?.vendors);
    const totalUsers = authStats?.total_users || authStats?.totalUsers || 0;
    const activeUsers = authStats?.activeUsers || authStats?.active_users_30d || 0;
    const totalVendors = marketStats?.vendors?.total || marketStats?.total_vendors || 0;
    const activeVendors = marketStats?.vendors?.active || marketStats?.active_vendors || 0;
    console.log('Vendor counts - total:', totalVendors, 'active:', activeVendors);
    const pendingIssuesCount = issueStats?.pending_issues || 0;
    const resolvedIssues = issueStats?.resolved_issues || 0;
    const totalPosts = newsStats?.total_posts || 0;
    const totalRentals = rentalStats?.listings?.total || 0;
    const newToday = authStats?.newToday || 0;

    const overviewStats = [
        { 
            title: "Total Users", 
            value: totalUsers.toLocaleString(), 
            icon: Users, 
            color: "bg-blue-500",
            trend: `+${authStats?.new_users_7d || 0} this week`,
            trendUp: true
        },
        { 
            title: "Vendors", 
            value: totalVendors.toLocaleString(), 
            icon: Store, 
            color: "bg-purple-500",
            trend: `${activeVendors} active`,
            trendUp: true
        },
        { 
            title: "Pending Issues", 
            value: pendingIssuesCount.toLocaleString(), 
            icon: AlertTriangle, 
            color: "bg-red-500",
            trend: "Needs review",
            trendUp: false
        },
        { 
            title: "News Posts", 
            value: totalPosts.toLocaleString(), 
            icon: Newspaper, 
            color: "bg-green-500",
            trend: `${newsStats?.posts?.published || newsStats?.approved_posts || 0} published`,
            trendUp: true
        },
    ];

    return (
        <div className="space-y-8 font-sans animate-in fade-in duration-500 text-gray-900 dark:text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-xl">
                            <Shield size={24} className="text-red-500" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h1>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-11">
                        Welcome back, {user.name} • System Overview & Moderation
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            fetchAllStats();
                            fetchPendingIssues();
                            fetchRecentActivities();
                        }}
                        disabled={refreshing}
                        className="rounded-xl"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <button className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative">
                        <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                        {pendingIssuesCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
                                {pendingIssuesCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-center gap-3 text-yellow-700 dark:text-yellow-400">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {overviewStats.map((stat, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${stat.color} bg-opacity-10`}>
                                    <stat.icon size={24} className={stat.color.replace('bg-', 'text-').replace('-500', '-600')} />
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${
                                    stat.trendUp 
                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                                        : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                                }`}>
                                    {stat.trendUp ? <TrendingUp size={12} /> : <Clock size={12} />}
                                    {stat.trend}
                                </span>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{stat.title}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions & Recent Activity */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Quick Actions */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-8 text-white shadow-xl">
                        <h3 className="text-xl font-black mb-1">Quick Actions</h3>
                        <p className="text-sm text-gray-400 mb-6 font-medium">Manage your platform</p>
                        <div className="space-y-3">
                            <button 
                                onClick={() => navigate('/admin/users')}
                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <Users size={20} />
                                    <span className="font-bold text-sm">Manage Users</span>
                                </div>
                                <ChevronRight size={18} />
                            </button>
                            <button 
                                onClick={() => navigate('/admin/vendors')}
                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <Store size={20} />
                                    <span className="font-bold text-sm">Manage Vendors</span>
                                </div>
                                <ChevronRight size={18} />
                            </button>
                            <button 
                                onClick={() => navigate('/admin/rentals')}
                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <Home size={20} />
                                    <span className="font-bold text-sm">Manage RentHub</span>
                                </div>
                                <ChevronRight size={18} />
                            </button>
                            <button 
                                onClick={() => navigate('/admin/newsManager')}
                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <Newspaper size={20} />
                                    <span className="font-bold text-sm">News Manager</span>
                                </div>
                                <ChevronRight size={18} />
                            </button>
                            <button 
                                onClick={() => navigate('/admin/analytics')}
                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <BarChart3 size={20} />
                                    <span className="font-bold text-sm">View Analytics</span>
                                </div>
                                <ChevronRight size={18} />
                            </button>
                            <button 
                                onClick={() => navigate('/admin/issues')}
                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <AlertTriangle size={20} />
                                    <span className="font-bold text-sm">Review Issues</span>
                                </div>
                                {pendingIssuesCount > 0 && (
                                    <span className="px-2 py-1 bg-red-500 rounded-lg text-xs font-bold">{pendingIssuesCount}</span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <Activity size={20} className="text-blue-500" />
                                Recent Activities
                            </h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/admin/activities')}
                                className="text-xs"
                            >
                                View All <ChevronRight size={14} className="ml-1" />
                            </Button>
                        </div>
                        
                        {activitiesLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : recentActivities.length === 0 ? (
                            <div className="text-center py-12">
                                <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentActivities.map((activity, idx) => (
                                    <div 
                                        key={activity.id || idx} 
                                        className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-600"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                                                    {activity.description}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <User size={12} />
                                                        {activity.user_name || 'System'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {new Date(activity.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                                                activity.action_type?.includes('APPROVED') || activity.action_type?.includes('RESOLVED')
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                    : activity.action_type?.includes('REJECTED') || activity.action_type?.includes('BLOCKED')
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                            }`}>
                                                {activity.entity_type || 'System'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-blue-500" />
                        Recent Activity
                    </h2>
                    <div className="space-y-3">
                        {pendingIssuesCount > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle size={20} className="text-yellow-600" />
                                    <span className="font-bold text-gray-900 dark:text-white">{pendingIssuesCount} pending issues awaiting review</span>
                                </div>
                                <Button size="sm" onClick={() => navigate('/admin/issues')}>
                                    Review
                                </Button>
                            </div>
                        )}
                        {marketStats?.vendors?.pending > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                                <div className="flex items-center gap-3">
                                    <Store size={20} className="text-purple-600" />
                                    <span className="font-bold text-gray-900 dark:text-white">{marketStats.vendors.pending} vendor applications pending</span>
                                </div>
                                <Button size="sm" onClick={() => navigate('/admin/vendors')}>
                                    Review
                                </Button>
                            </div>
                        )}
                        {authStats?.newToday > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                                <div className="flex items-center gap-3">
                                    <Users size={20} className="text-blue-600" />
                                    <span className="font-bold text-gray-900 dark:text-white">{authStats.newToday} new users registered today</span>
                                </div>
                                <Button size="sm" onClick={() => navigate('/admin/users')}>
                                    View
                                </Button>
                            </div>
                        )}
                        {(!pendingIssuesCount && !marketStats?.vendors?.pending && !authStats?.newToday) && (
                            <div className="text-center py-8">
                                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">All caught up! No pending actions.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;