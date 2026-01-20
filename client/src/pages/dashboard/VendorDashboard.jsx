import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Store, Package, ShoppingBag, TrendingUp, Plus,
    Clock, ChefHat, Filter, Search, ChevronRight, Star
} from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const VendorDashboard = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const verificationDone = useRef(false);

    // Verify user has VENDOR role - runs once on mount
    useEffect(() => {
        // Prevent multiple runs
        if (verificationDone.current) return;
        verificationDone.current = true;

        const verifyAccess = async () => {
            console.log('\n📍 VendorDashboard - Starting verification...');
            
            // Check if user is logged in
            const token = localStorage.getItem('edusync_token');
            if (!token) {
                console.log('❌ No token found, redirecting to login');
                navigate('/login');
                return;
            }

            // Always fetch fresh profile from server
            console.log('🔄 Fetching fresh profile from server...');
            
            try {
                const profileResponse = await authService.getProfile();
                console.log('Server response:', profileResponse);
                
                if (profileResponse.success && profileResponse.profile) {
                    const serverRoles = profileResponse.profile.roles || [];
                    console.log('✅ Server roles:', serverRoles);
                    
                    // Update context with server data
                    updateUser({
                        roles: serverRoles,
                        activeRole: profileResponse.profile.activeRole
                    });
                    
                    if (serverRoles.includes('VENDOR')) {
                        console.log('✅ User has VENDOR role - granting access');
                        setIsAuthorized(true);
                        setIsLoading(false);
                        // Clear pending data now that access is confirmed
                        sessionStorage.removeItem('pendingVendorId');
                        sessionStorage.removeItem('pendingVendorName');
                        sessionStorage.removeItem('pendingVendorType');
                        return;
                    }
                }
            } catch (err) {
                console.error('❌ Failed to fetch profile from server:', err);
            }
            
            // Server check failed or no VENDOR role - check pending registration
            const hasPendingVendor = sessionStorage.getItem('pendingVendorId');
            if (hasPendingVendor) {
                console.log('⚠️ Has pending vendor registration - allowing temporary access');
                setIsAuthorized(true);
                setIsLoading(false);
                // Clear pending data
                sessionStorage.removeItem('pendingVendorId');
                sessionStorage.removeItem('pendingVendorName');
                sessionStorage.removeItem('pendingVendorType');
                return;
            }
            
            // No VENDOR role and no pending registration - not authorized
            console.log('❌ Access denied - no VENDOR role and no pending registration');
            setIsLoading(false);
            alert('You must be a vendor to access this page');
            navigate('/dashboard');
        };

        verifyAccess();
    }, []); // Empty dependency array - run once on mount

    // Show loading spinner while checking
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500">Verifying vendor access...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authorized
    if (!isAuthorized) {
        return null;
    }

    // Mock Data
    const shopInfo = {
        name: "Campus Canteen",
        rating: 4.8,
        status: "Open Now",
        totalOrders: 1543,
        todayRevenue: 52000
    };

    const activeOrders = [
        { id: "ORD-9921", items: ["Chicken Teriyaki Bowl (x2)", "Cola"], total: 2800, status: "Pending", time: "2m ago", customer: "Alex J." },
        { id: "ORD-9920", items: ["Veggie Burger", "Fries"], total: 1400, status: "Preparing", time: "15m ago", customer: "Sarah M." },
        { id: "ORD-9918", items: ["Coffee (x4)"], total: 1840, status: "Ready", time: "25m ago", customer: "Lab Group 4" },
    ];

    return (
        <div className="min-h-screen p-6 space-y-8 font-sans animate-in fade-in duration-500">
            {/* Background elements */}
            <div className="fixed inset-0 -z-30 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Header / Shop Status */}
            <div className="rounded-[2.5rem] bg-white dark:bg-gray-800 p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-200">
                        <Store size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{shopInfo.name}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                {shopInfo.status}
                            </span>
                            <span className="flex items-center gap-1 text-sm font-bold text-gray-500">
                                <Star size={14} className="text-yellow-400 fill-current" /> {shopInfo.rating} Rating
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <Button className="flex-1 md:flex-none shadow-lg shadow-primary/20" onClick={() => navigate('/marketplace/new')}>
                        <Plus size={18} className="mr-2" /> Add Item
                    </Button>
                    <Button variant="outline" className="md:flex-none">
                        Store Settings
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Orders Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Today's Revenue</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                ৳<span className="tabular-nums">{shopInfo.todayRevenue}</span>
                            </h3>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Active Orders</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{activeOrders.length}</h3>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hidden sm:block">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Completed</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{shopInfo.totalOrders}</h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <ChefHat size={24} className="text-orange-500" />
                                Incoming Orders
                            </h2>
                            <div className="flex gap-2">
                                <button className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"><Search size={18} className="text-gray-400" /></button>
                                <button className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"><Filter size={18} className="text-gray-400" /></button>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-50 dark:divide-gray-700">
                            {activeOrders.map(order => (
                                <div key={order.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-tight ${order.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                                                order.status === 'Preparing' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-green-100 text-green-600'
                                                }`}>
                                                {order.status}
                                            </span>
                                            <span className="text-xs font-bold text-gray-400">#{order.id}</span>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                            <Clock size={14} /> {order.time}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{order.items.join(', ')}</h4>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer: {order.customer}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-gray-900 dark:text-white">৳{order.total.toFixed(2)}</div>
                                            <button className="mt-2 text-xs font-bold text-primary hover:underline flex items-center gap-1 justify-end">
                                                Manage Order <ChevronRight size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 text-center">
                            <button className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">View All History</button>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Quick Inventory */}
                <div>
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm p-6 h-full">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Package size={20} className="text-indigo-500" /> Quick Inventory
                        </h3>

                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer">
                                    <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                                        <ShoppingBag size={20} className="text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">Item Name {i}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">Stock: 12 left</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300">
                                        <TrendingUp size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button variant="outline" className="w-full mt-6 rounded-2xl border-dashed border-2">
                            View Full Inventory
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
