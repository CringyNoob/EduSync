import React, { useState, useEffect } from 'react';
import {
    Search, Filter, Package, Clock, CheckCircle,
    XCircle, ChevronRight, MoreVertical, Truck,
    Calendar, ArrowUpRight, ArrowDownRight, DollarSign,
    User, Phone, MapPin, MessageSquare, AlertCircle,
    Printer, ChefHat
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import marketplaceService from '../../services/marketplaceService';

const VendorOrders = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [selectedTab, setSelectedTab] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [error, setError] = useState(null);

    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingOrders: 0,
        completedToday: 0,
        avgProcessingTime: '0m'
    });

    // Fetch orders from backend
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await marketplaceService.getMyOrders();
                
                if (response.success) {
                    // Transform backend data to match component structure
                    const transformedOrders = (response.orders || []).map(order => ({
                        id: order.id,
                        customer: order.customer_name,
                        phone: order.customer_phone || '',
                        address: order.customer_address || '',
                        customer_image: order.customer_image,
                        items: order.items || [],
                        subtotal: parseFloat(order.subtotal) || 0,
                        delivery_fee: parseFloat(order.delivery_fee) || 0,
                        total: parseFloat(order.total) || 0,
                        status: order.status,
                        payment_status: order.payment_status,
                        payment_method: order.payment_method,
                        time_elapsed: order.time_elapsed || 'Just now',
                        notes: order.notes || '',
                        is_new: order.is_new || false,
                        created_at: order.created_at
                    }));
                    setOrders(transformedOrders);
                    
                    if (response.stats) {
                        setStats({
                            totalRevenue: response.stats.totalRevenue || 0,
                            pendingOrders: response.stats.pendingOrders || 0,
                            completedToday: response.stats.completedToday || 0,
                            avgProcessingTime: response.stats.avgProcessingTime || '0m'
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError(err.message || 'Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            setUpdating(true);
            setError(null);
            const response = await marketplaceService.updateOrderStatus(orderId, newStatus);
            
            if (response.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(prev => ({ ...prev, status: newStatus }));
                }
            }
        } catch (err) {
            console.error('Error updating order status:', err);
            setError(err.message || 'Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (selectedTab !== 'ALL' && selectedTab === 'ACTIVE') {
            return ['PENDING', 'PREPARING', 'READY'].includes(order.status);
        }
        if (selectedTab !== 'ALL' && order.status !== selectedTab) return false;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                order.id.toLowerCase().includes(query) ||
                order.customer.toLowerCase().includes(query)
            );
        }
        return true;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return { bg: 'bg-orange-100', text: 'text-orange-600', dot: 'bg-orange-500' };
            case 'PREPARING': return { bg: 'bg-blue-100', text: 'text-blue-600', dot: 'bg-blue-500' };
            case 'READY': return { bg: 'bg-violet-100', text: 'text-violet-600', dot: 'bg-violet-500' };
            case 'COMPLETED': return { bg: 'bg-emerald-100', text: 'text-emerald-600', dot: 'bg-emerald-500' };
            case 'CANCELLED': return { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-500' };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 space-y-8 font-sans animate-in fade-in duration-700 pb-24 relative selection:bg-indigo-100 selection:text-indigo-900">
            {/* Background */}
            <div className="fixed inset-0 -z-30 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[10%] w-[800px] h-[800px] bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-[120px] mix-blend-multiply"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-tl from-indigo-500/5 to-violet-500/5 rounded-full blur-[100px] mix-blend-multiply"></div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span className="font-medium">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Orders
                        <span className="bg-red-500 text-white text-sm px-2.5 py-1 rounded-full font-bold shadow-lg shadow-red-500/30 animate-pulse">
                            {orders.filter(o => o.status === 'PENDING').length} New
                        </span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-2 text-lg">Manage incoming orders in real-time</p>
                </div>

                <div className="flex gap-4">
                    <div className="hidden md:block bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
                        <p className="text-xl font-black text-gray-900">৳{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="hidden md:block bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Avg. Time</p>
                        <p className="text-xl font-black text-gray-900 flex items-center gap-1">
                            <Clock size={18} className="text-gray-400" /> {stats.avgProcessingTime}
                        </p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white/70 backdrop-blur-xl p-2 rounded-[1.5rem] border border-white/20 shadow-lg shadow-gray-100/50 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-6 z-30 transition-all">
                {/* Tabs */}
                <div className="flex bg-gray-100/50 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar gap-1">
                    {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setSelectedTab(tab); setSelectedOrder(null); }}
                            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 relative ${selectedTab === tab
                                    ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5 scale-100'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-white/40'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search order ID or name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/50 border border-gray-100 focus:border-primary-300 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-primary-100/50 transition-all shadow-sm group-hover:shadow-md"
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Orders List */}
                <div className={`lg:col-span-1 space-y-4 ${selectedOrder ? 'hidden lg:block' : 'col-span-3'}`}>
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-20 bg-white/50 rounded-[2.5rem] border border-dashed border-gray-200">
                            <Package size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-400">No orders found</h3>
                        </div>
                    ) : (
                        filteredOrders.map(order => {
                            const statusStyle = getStatusStyle(order.status);
                            return (
                                <div
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className={`group relative p-5 rounded-[2rem] border transition-all cursor-pointer overflow-hidden ${selectedOrder?.id === order.id
                                            ? 'bg-white border-primary-200 shadow-xl shadow-primary-100 scale-[1.02] ring-2 ring-primary-500/20'
                                            : 'bg-white border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 hover:-translate-y-1'
                                        }`}
                                >
                                    {order.is_new && order.status === 'PENDING' && (
                                        <div className="absolute top-0 right-0 p-3">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                                {order.customer_image ? (
                                                    <img src={order.customer_image} alt={order.customer} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                                                        {order.customer.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">{order.customer}</h4>
                                                <p className="text-xs font-medium text-gray-400">#{order.id}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-black text-gray-900">৳{order.total}</span>
                                            <span className="text-[10px] font-bold text-gray-400">{order.time_elapsed} ago</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${statusStyle.bg} ${statusStyle.text}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></div>
                                            {order.status}
                                        </div>
                                        <div className="flex items-center text-xs font-bold text-gray-400">
                                            <Package size={12} className="mr-1" /> {order.items.reduce((acc, i) => acc + i.quantity, 0)} Items
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Detail View */}
                {selectedOrder ? (
                    <div className="lg:col-span-2 animate-in slide-in-from-right duration-300">
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden relative">
                            {/* Detail Header */}
                            <div className="bg-gray-50/50 p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-black text-gray-900 text-3xl">Order #{selectedOrder.id}</h2>
                                        <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${getStatusStyle(selectedOrder.status).bg} ${getStatusStyle(selectedOrder.status).text}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                        <Calendar size={14} /> {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                                        <Printer size={20} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors lg:hidden"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Customer Info Card */}
                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 border border-gray-100">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Customer Details</h3>
                                    <div className="flex items-start gap-4">
                                        <div className="h-16 w-16 rounded-2xl bg-gray-200 overflow-hidden shrink-0 shadow-sm border-2 border-white">
                                            {selectedOrder.customer_image ? (
                                                <img src={selectedOrder.customer_image} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-xl">
                                                    {selectedOrder.customer.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                    {selectedOrder.customer}
                                                    <span className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full uppercase">Regular</span>
                                                </p>
                                                <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mt-1">
                                                    <Phone size={14} /> {selectedOrder.phone}
                                                </p>
                                            </div>
                                            <div>
                                                <div className="flex items-start gap-2">
                                                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                                                    <p className="text-sm font-medium text-gray-600 leading-relaxed">
                                                        {selectedOrder.address}
                                                    </p>
                                                </div>
                                                <button className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline">
                                                    <MessageSquare size={12} /> Message Customer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedOrder.notes && (
                                        <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-start gap-3">
                                            <AlertCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                                            <p className="text-sm font-medium text-orange-800">
                                                <span className="font-bold">Note:</span> {selectedOrder.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Items Ordered</h3>
                                    <div className="space-y-4">
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 -mx-2 rounded-xl transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center font-black text-gray-400 text-sm">
                                                        {item.quantity}x
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                        {item.options && <p className="text-xs font-medium text-gray-500">{item.options}</p>}
                                                    </div>
                                                </div>
                                                <span className="font-bold text-gray-900">৳{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                                        <div className="flex justify-between text-sm font-medium text-gray-500">
                                            <span>Subtotal</span>
                                            <span>৳{selectedOrder.subtotal}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-medium text-gray-500">
                                            <span>Delivery Fee</span>
                                            <span>৳{selectedOrder.delivery_fee}</span>
                                        </div>
                                        <div className="flex justify-between text-xl font-black text-gray-900 pt-2">
                                            <span>Total</span>
                                            <span>৳{selectedOrder.total}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="grid grid-cols-2 gap-4">
                                    {selectedOrder.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                                                disabled={updating}
                                                className="py-4 rounded-2xl border border-red-100 text-red-600 font-bold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {updating ? 'Updating...' : 'Reject Order'}
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedOrder.id, 'PREPARING')}
                                                disabled={updating}
                                                className="py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black transition-colors shadow-lg shadow-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {updating ? 'Updating...' : 'Accept & Cook'}
                                            </button>
                                        </>
                                    )}
                                    {selectedOrder.status === 'PREPARING' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'READY')}
                                            disabled={updating}
                                            className="col-span-2 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {updating ? 'Updating...' : <><ChefHat /> Mark as Ready</>}
                                        </button>
                                    )}
                                    {selectedOrder.status === 'READY' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'COMPLETED')}
                                            disabled={updating}
                                            className="col-span-2 py-4 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {updating ? 'Updating...' : <><CheckCircle /> Complete Order</>}
                                        </button>
                                    )}
                                    {selectedOrder.status === 'COMPLETED' && (
                                        <div className="col-span-2 py-4 rounded-2xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center gap-2 border border-emerald-100 cursor-default">
                                            <CheckCircle size={20} /> Order Completed
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="lg:col-span-2 hidden lg:flex items-center justify-center bg-white/30 backdrop-blur-sm rounded-[2.5rem] border border-white/50 border-dashed min-h-[500px]">
                        <div className="text-center">
                            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-6">
                                <Package size={40} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-400">Select an order to view details</h3>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorOrders;
