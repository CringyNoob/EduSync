import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    ChefHat,
    Truck,
    ShoppingBag,
    RefreshCw,
    Filter,
    Search,
    MapPin,
    Phone,
    Store,
    AlertCircle,
    ChevronRight,
    MessageCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import { OrderChatButton } from '../../components/Chat/ChatButton';

const statusConfig = {
    PENDING: { 
        label: 'Pending', 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: Clock,
        description: 'Order received, waiting for confirmation'
    },
    PREPARING: { 
        label: 'Preparing', 
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: ChefHat,
        description: 'Your order is being prepared'
    },
    READY: { 
        label: 'Ready', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: Package,
        description: 'Ready for pickup/delivery'
    },
    COMPLETED: { 
        label: 'Completed', 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        icon: CheckCircle,
        description: 'Order completed successfully'
    },
    CANCELLED: { 
        label: 'Cancelled', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle,
        description: 'Order was cancelled'
    }
};

const MyOrders = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { orders, loadingOrders, fetchOrders, cancelOrder } = useCart();
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelling, setCancelling] = useState(null);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user, fetchOrders]);

    const filteredOrders = orders.filter(order => {
        const matchesFilter = activeFilter === 'ALL' || order.status === activeFilter;
        const matchesSearch = searchQuery === '' || 
            order.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items?.some(item => item.product_name?.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        
        setCancelling(orderId);
        try {
            await cancelOrder(orderId);
        } catch (error) {
            alert('Failed to cancel order: ' + error.message);
        } finally {
            setCancelling(null);
        }
    };

    const OrderCard = ({ order }) => {
        const status = statusConfig[order.status] || statusConfig.PENDING;
        const StatusIcon = status.icon;

        return (
            <div 
                className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedOrder(order)}
            >
                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
                                {order.vendor_logo ? (
                                    <img src={order.vendor_logo} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Store size={24} className="text-primary" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{order.vendor_name || 'Shop'}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {order.time_elapsed} • {order.items?.length || 0} items
                                </p>
                            </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${status.color}`}>
                            <StatusIcon size={14} />
                            {status.label}
                        </div>
                    </div>

                    {/* Items Preview */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-3 mb-4">
                        <div className="space-y-2">
                            {order.items?.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {item.quantity}x {item.product_name}
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        ৳{(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(0)}
                                    </span>
                                </div>
                            ))}
                            {order.items?.length > 2 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    +{order.items.length - 2} more items
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                            <p className="text-lg font-black text-gray-900 dark:text-white">৳{parseFloat(order.total).toFixed(0)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {order.status === 'PENDING' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancelOrder(order.id);
                                    }}
                                    disabled={cancelling === order.id}
                                    className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {cancelling === order.id ? 'Cancelling...' : 'Cancel'}
                                </button>
                            )}
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                                <ChevronRight size={18} className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress Bar for Active Orders */}
                {['PENDING', 'PREPARING', 'READY'].includes(order.status) && (
                    <div className="h-1 bg-gray-100 dark:bg-gray-700">
                        <div 
                            className={`h-full transition-all duration-500 ${
                                order.status === 'PENDING' ? 'w-1/4 bg-yellow-500' :
                                order.status === 'PREPARING' ? 'w-2/4 bg-blue-500' :
                                'w-3/4 bg-green-500'
                            }`}
                        />
                    </div>
                )}
            </div>
        );
    };

    const OrderDetailModal = ({ order, onClose }) => {
        if (!order) return null;
        const status = statusConfig[order.status] || statusConfig.PENDING;
        const StatusIcon = status.icon;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="p-6 space-y-6">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                    Order #{order.id?.slice(-8)}
                                </p>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                                    {order.vendor_name}
                                </h2>
                            </div>
                            <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${status.color}`}>
                                <StatusIcon size={14} />
                                {status.label}
                            </div>
                        </div>

                        {/* Status Description */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{status.description}</p>
                        </div>

                        {/* Items */}
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Order Items</h3>
                            <div className="space-y-3">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center text-xs font-bold text-primary">
                                                {item.quantity}
                                            </span>
                                            <span className="text-gray-700 dark:text-gray-300">{item.product_name}</span>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            ৳{(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(0)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Info */}
                        {(order.customer_address || order.customer_phone) && (
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Delivery Details</h3>
                                <div className="space-y-2">
                                    {order.customer_address && (
                                        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                                            {order.customer_address}
                                        </div>
                                    )}
                                    {order.customer_phone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Phone size={16} />
                                            {order.customer_phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Payment Summary */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                                <span className="text-gray-900 dark:text-white">৳{parseFloat(order.subtotal).toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Delivery Fee</span>
                                <span className="text-gray-900 dark:text-white">৳{parseFloat(order.delivery_fee).toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-gray-900 dark:text-white">Total</span>
                                <span className="text-primary">৳{parseFloat(order.total).toFixed(0)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            {/* Chat with Vendor Button */}
                            {order.vendor_id && !['COMPLETED', 'CANCELLED'].includes(order.status) && (
                                <OrderChatButton
                                    vendorId={order.vendor_id}
                                    vendorName={order.vendor_name}
                                    orderId={order.id}
                                    variant="outline"
                                    fullWidth
                                    className="rounded-2xl border-blue-200 text-blue-600 hover:bg-blue-50"
                                >
                                    <MessageCircle size={18} className="mr-2" />
                                    Message Vendor
                                </OrderChatButton>
                            )}
                            
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl">
                                    Close
                                </Button>
                                {order.status === 'PENDING' && (
                                    <Button 
                                        onClick={() => {
                                            handleCancelOrder(order.id);
                                            onClose();
                                        }}
                                        className="flex-1 rounded-2xl bg-red-500 hover:bg-red-600"
                                    >
                                        Cancel Order
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <AlertCircle size={48} className="mx-auto text-gray-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Please Log In</h2>
                    <p className="text-gray-500 dark:text-gray-400">You need to be logged in to view your orders</p>
                    <Button onClick={() => navigate('/login')} className="rounded-2xl">
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-primary transition-all"
                    >
                        <ArrowLeft size={20} className="text-gray-900 dark:text-white" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Orders</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {orders.length} total orders
                        </p>
                    </div>
                    <button
                        onClick={fetchOrders}
                        disabled={loadingOrders}
                        className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-primary transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={20} className={`text-gray-900 dark:text-white ${loadingOrders ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Filter Dropdown */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                            {['ALL', 'PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                                        activeFilter === filter
                                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {filter === 'ALL' ? 'All' : statusConfig[filter]?.label || filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                {loadingOrders ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw size={32} className="animate-spin text-primary" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center">
                        <ShoppingBag size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Orders Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {activeFilter === 'ALL' 
                                ? "You haven't placed any orders yet"
                                : `No ${statusConfig[activeFilter]?.label.toLowerCase()} orders`
                            }
                        </p>
                        <Button onClick={() => navigate('/marketplace')} className="rounded-2xl">
                            Start Shopping
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredOrders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
        </div>
    );
};

export default MyOrders;
