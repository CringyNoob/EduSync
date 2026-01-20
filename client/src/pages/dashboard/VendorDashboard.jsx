<<<<<<< HEAD
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
=======
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Store, Package, ShoppingBag, DollarSign, TrendingUp, Plus,
    Clock, ChefHat, Filter, Search, ChevronRight, Star, CheckCircle, Shield
} from 'lucide-react';
import Button from '../../components/Button';

const VendorDashboard = () => {
    const navigate = useNavigate();
    // idle, applied, active
    const [vendorStatus, setVendorStatus] = React.useState(() => localStorage.getItem('vendorStatus') || 'idle');
    const [subscriptionId, setSubscriptionId] = React.useState(''); // Input for login

    React.useEffect(() => {
        localStorage.setItem('vendorStatus', vendorStatus);
    }, [vendorStatus]);
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)

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

<<<<<<< HEAD
=======
    const [onboardingStep, setOnboardingStep] = React.useState(0);
    const [selectedPlan, setSelectedPlan] = React.useState(null);
    const [shopDetails, setShopDetails] = React.useState({ name: '', category: 'Food', bio: '' });

    const plans = [
        { id: 'free', name: 'Student Basic', price: 'Free', period: '/forever', features: ['5 Product Listings', 'Basic Orders', 'Community Support'] },
        { id: 'pro', name: 'Campus Pro', price: '৳500', period: '/month', features: ['Unlimited Listings', 'Priority Support', 'Analytics Dashboard', 'Featured Badge'], recommended: true }
    ];

    const handleSubmitApplication = () => {
        // Send to admin (mock)
        localStorage.setItem('vendorApplication', JSON.stringify({ ...shopDetails, plan: selectedPlan, date: new Date().toISOString() }));
        setVendorStatus('applied');
    };

    const handleLoginWithId = () => {
        // Mock validation: "SUB-ADMIN-123" is the magic key for now, or anything starting with SUB
        if (subscriptionId.length > 5 && subscriptionId.toUpperCase().startsWith('SUB')) {
            setVendorStatus('active');
        } else {
            alert("Invalid Subscription ID. Please check your email or ask an Admin.");
        }
    };

    const resetDemo = () => {
        setVendorStatus('idle');
        localStorage.removeItem('vendorStatus');
        localStorage.removeItem('vendorApplication');
    };

    if (vendorStatus !== 'active') {
        // STATE: APPLIED / PENDING
        if (vendorStatus === 'applied') {
            return (
                <div className="min-h-screen p-6 flex items-center justify-center animate-in fade-in duration-500 relative">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 shadow-2xl border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 animate-pulse"></div>
                        <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock size={40} className="text-blue-500 animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Application Sent</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-6 leading-relaxed">
                            Your application for <strong className="text-gray-900 dark:text-white">{shopDetails.name}</strong> has been sent to the Admin.
                        </p>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-6">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Next Steps</p>
                            <ul className="text-sm text-gray-600 font-medium space-y-2 text-left">
                                <li className="flex gap-2"><CheckCircle size={16} className="text-green-500" /> Admin reviews your application</li>
                                <li className="flex gap-2"><CheckCircle size={16} className="text-gray-300" /> Admin generates <strong>Subscription ID</strong></li>
                                <li className="flex gap-2"><CheckCircle size={16} className="text-gray-300" /> You receive ID via Email/Notice</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400 font-bold">Already have an ID?</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 outline-none font-mono text-center uppercase font-bold text-gray-900 dark:text-white"
                                    placeholder="Enter SUB-ID"
                                    value={subscriptionId}
                                    onChange={e => setSubscriptionId(e.target.value)}
                                    maxLength={15}
                                />
                                <Button className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleLoginWithId}>
                                    Login
                                </Button>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-dashed border-gray-200">
                            <button onClick={resetDemo} className="text-[10px] font-bold text-red-400 hover:text-red-600">Reset Demo</button>
                        </div>
                    </div>
                </div>
            );
        }

        // STATE: IDLE (Onboarding)
        return (
            <div className="min-h-screen p-6 flex items-center justify-center animate-in fade-in duration-500">
                <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Side: Login with ID option for existing users */}
                    <div className="space-y-8 order-2 lg:order-1">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                                Vendor <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Portal.</span>
                            </h1>
                            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium mt-4 leading-relaxed">
                                Apply to become a verified vendor or login with your subscription ID.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Shield size={20} className="text-indigo-600" /> Vendor Login
                            </h3>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subscription ID</label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        className="flex-1 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-indigo-500 transition-all font-mono font-bold text-gray-900 dark:text-white uppercase"
                                        placeholder="SUB-XXXX-XXXX"
                                        value={subscriptionId}
                                        onChange={e => setSubscriptionId(e.target.value)}
                                        maxLength={20}
                                    />
                                    <Button className="px-8 bg-gray-900 text-white hover:bg-black" onClick={handleLoginWithId}>
                                        Enter
                                    </Button>
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium">* Check your email for the ID sent by Admin.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Application Wizard */}
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 relative overflow-hidden order-1 lg:order-2">
                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

                        {onboardingStep === 0 && (
                            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Apply for Subscription</h2>
                                <div className="space-y-4">
                                    {plans.map(plan => (
                                        <div
                                            key={plan.id}
                                            onClick={() => setSelectedPlan(plan.id)}
                                            className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-200 ${selectedPlan === plan.id
                                                ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/20 ring-4 ring-indigo-100 dark:ring-indigo-900/30'
                                                : 'border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{plan.name}</h3>
                                                <div className="text-right">
                                                    <span className="block text-xl font-black text-indigo-600">{plan.price}</span>
                                                </div>
                                            </div>
                                            <div className="text-xs font-medium text-gray-500 mb-3">{plan.features.join(' • ')}</div>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    className="w-full py-4 text-lg bg-gray-900 text-white hover:bg-black"
                                    disabled={!selectedPlan}
                                    onClick={() => setOnboardingStep(1)}
                                >
                                    Next: Shop Details
                                </Button>
                            </div>
                        )}

                        {onboardingStep === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                <button onClick={() => setOnboardingStep(0)} className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 mb-2">
                                    <ChevronRight className="rotate-180" size={14} /> Back
                                </button>

                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Shop Application</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shop Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-indigo-500 focus:outline-none transition-all font-bold text-gray-900 dark:text-white"
                                            placeholder="e.g. Alex's Canteen"
                                            value={shopDetails.name}
                                            onChange={e => setShopDetails({ ...shopDetails, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                                        <select
                                            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-indigo-500 focus:outline-none transition-all font-bold text-gray-900 dark:text-white"
                                            value={shopDetails.category}
                                            onChange={e => setShopDetails({ ...shopDetails, category: e.target.value })}
                                        >
                                            <option>Food & Beverage</option>
                                            <option>Stationery</option>
                                            <option>Services</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Why do you want to sell?</label>
                                        <textarea
                                            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-indigo-500 focus:outline-none transition-all font-bold text-gray-900 dark:text-white h-20 resize-none"
                                            value={shopDetails.bio}
                                            onChange={e => setShopDetails({ ...shopDetails, bio: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <Button
                                    className="w-full py-4 text-lg bg-gray-900 hover:bg-black text-white"
                                    disabled={!shopDetails.name}
                                    onClick={handleSubmitApplication}
                                >
                                    Submit Application
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
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
