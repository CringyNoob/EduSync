import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Store, Package, ShoppingBag, TrendingUp, Plus,
    Clock, ChefHat, Filter, Search, ChevronRight, Star, AlertCircle
} from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import marketplaceService from '../../services/marketplaceService';

const VendorDashboard = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const verificationDone = useRef(false);
    
    // Real data states
    const [shopInfo, setShopInfo] = useState(null);
    const [activeOrders, setActiveOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [dataLoading, setDataLoading] = useState(true);

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

    // Fetch dashboard data
    useEffect(() => {
        if (!isAuthorized) return;

        const fetchDashboardData = async () => {
            try {
                setDataLoading(true);
                setError(null);

                // Fetch vendor info
                const vendorResponse = await marketplaceService.getMyVendor();
                if (vendorResponse.success && vendorResponse.vendor) {
                    setShopInfo(vendorResponse.vendor);
                }

                // Fetch active orders
                const ordersResponse = await marketplaceService.getMyOrders();
                if (ordersResponse.success) {
                    const orders = ordersResponse.orders || [];
                    const active = orders.filter(o => 
                        ['PENDING', 'PREPARING', 'READY'].includes(o.status)
                    );
                    setActiveOrders(active);
                }

                // Fetch products for inventory
                const productsResponse = await marketplaceService.getMyProducts();
                if (productsResponse.success) {
                    setProducts(productsResponse.products || []);
                }

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setDataLoading(false);
            }
        };

        fetchDashboardData();
    }, [isAuthorized]);

    // Show loading spinner while checking authorization
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

    // Show loading spinner while fetching data
    if (dataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Calculate stats - use shopInfo.stats for today's revenue, fallback to orders
    const todayRevenue = shopInfo?.stats?.revenue_today || activeOrders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
    const totalOrders = shopInfo?.completed_orders || 0;
    const totalProducts = shopInfo?.total_products || products.length;
    const lowStockProducts = products.filter(p => (p.stock_count || 0) < 10);

    return (
        <div className="min-h-screen p-6 space-y-8 font-sans animate-in fade-in duration-500">
            {/* Background elements */}
            <div className="fixed inset-0 -z-30 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[20%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Header / Shop Status */}
            <div className="rounded-[2.5rem] bg-white dark:bg-gray-800 p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-3xl bg-white p-1 shadow-lg overflow-hidden border border-gray-200">
                        <img
                            src={shopInfo?.logo_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                            alt="Shop Logo"
                            className="w-full h-full object-cover rounded-2xl"
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{shopInfo?.name || 'My Shop'}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide flex items-center gap-1.5 ${
                                shopInfo?.is_active 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                <span className={`h-2 w-2 rounded-full ${shopInfo?.is_active ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                                {shopInfo?.is_active ? 'Open Now' : (shopInfo?.status || 'Pending')}
                            </span>
                            <span className="flex items-center gap-1 text-sm font-bold text-gray-500">
                                <Star size={14} className="text-yellow-400 fill-current" /> {parseFloat(shopInfo?.rating || 0).toFixed(1)} Rating
                            </span>
                            <span className="text-sm font-bold text-gray-400">
                                {shopInfo?.total_reviews || 0} reviews
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto flex-wrap">
                    <Button className="flex-1 md:flex-none shadow-lg shadow-primary/20" onClick={() => navigate('/vendor/products')}>
                        <Plus size={18} className="mr-2" /> Add Item
                    </Button>
                    <Button variant="outline" className="md:flex-none" onClick={() => navigate('/vendor/orders')}>
                        View Orders
                    </Button>
                    <Button variant="outline" className="md:flex-none" onClick={() => navigate('/vendor/analytics')}>
                        <TrendingUp size={18} className="mr-2" /> Analytics
                    </Button>
                    <Button variant="outline" className="md:flex-none" onClick={() => navigate('/vendor/shop')}>
                        Store Settings
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Stats & Orders */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Today's Revenue</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                <span className="tabular-nums">৳{todayRevenue.toLocaleString()}</span>
                            </h3>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Active Orders</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{activeOrders.length}</h3>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Completed</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{totalOrders}</h3>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Products</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{totalProducts}</h3>
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
                            {activeOrders.length > 0 ? (
                                activeOrders.slice(0, 5).map(order => {
                                    const timeAgo = new Date(order.created_at) ? 
                                        Math.floor((Date.now() - new Date(order.created_at)) / 60000) + 'm ago' : 
                                        'Just now';
                                    
                                    return (
                                        <div key={order.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer" onClick={() => navigate('/vendor/orders')}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-tight ${
                                                        order.status === 'PENDING' ? 'bg-orange-100 text-orange-600' :
                                                        order.status === 'PREPARING' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-green-100 text-green-600'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-400">#{order.id.slice(0, 8)}</span>
                                                </div>
                                                <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                    <Clock size={14} /> {timeAgo}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                                                        {order.items?.slice(0, 2).map(i => i.product_name || i.name).join(', ') || 'Order items'}
                                                        {order.items?.length > 2 && ` +${order.items.length - 2} more`}
                                                    </h4>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer: {order.customer_name || order.customer}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-black text-gray-900 dark:text-white">৳{parseFloat(order.total || 0).toFixed(2)}</div>
                                                    <button className="mt-2 text-xs font-bold text-primary hover:underline flex items-center gap-1 justify-end">
                                                        Manage Order <ChevronRight size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-12 text-center">
                                    <ChefHat size={48} className="mx-auto text-gray-300 mb-3" />
                                                <p className="text-gray-500 font-medium">No active orders right now</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
            
                            {/* Right Column - Inventory Alerts */}
                            <div className="space-y-8">
                                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                                        <Package size={24} className="text-red-500" />
                                        Low Stock Alert
                                    </h2>
            
                                    <div className="space-y-3">
                                        {lowStockProducts.length > 0 ? (
                                lowStockProducts.slice(0, 4).map(product => (
                                    <div key={product.id} className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/vendor/products')}>
                                        <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <ShoppingBag size={20} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{product.name}</h4>
                                            <p className={`text-xs font-bold ${product.stock_count < 5 ? 'text-red-500' : 'text-orange-500'}`}>
                                                Stock: {product.stock_count} left
                                            </p>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                                            <AlertCircle size={14} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Package size={40} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">All items well stocked!</p>
                                </div>
                            )}
                        </div>

                        <Button variant="outline" className="w-full mt-6 rounded-2xl border-dashed border-2" onClick={() => navigate('/vendor/products')}>
                            View Full Inventory
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
