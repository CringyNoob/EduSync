import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    Ticket,
    CreditCard,
    ShieldCheck,
    ChevronRight,
    MapPin,
    Phone,
    CheckCircle,
    X as CloseIcon,
    Utensils,
    BookOpen,
    Store
} from 'lucide-react';
import Button from '../../components/Button';
import { useCart } from '../../context/CartContext';

const CartPage = ({ section }) => {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart, clearSectionItems, placeOrder } = useCart();
    const [couponInputs, setCouponInputs] = useState({}); // { section: input }
    const [appliedCoupons, setAppliedCoupons] = useState({}); // { section: code }
    const [sectionCheckingOut, setSectionCheckingOut] = useState(null);
    const [isOrdered, setIsOrdered] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState({
        location: '',
        phone: '',
        specialNotes: ''
    });

    // Filter items by section if provided
    const filteredCartItems = section
        ? cartItems.filter(item => {
            const itemSection = item.section?.toLowerCase();
            const targetSection = section.toLowerCase();
            return itemSection === targetSection || 
                   (targetSection === 'foods' && itemSection === 'foods') ||
                   (targetSection === 'shops' && itemSection === 'shops');
          })
        : cartItems;

    // Group items by section
    const groupedItems = filteredCartItems.reduce((acc, item) => {
        const sectionName = item.section || 'General';
        if (!acc[sectionName]) acc[sectionName] = [];
        acc[sectionName].push(item);
        return acc;
    }, {});

    const sectionNames = Object.keys(groupedItems);

    // Get section title and back path
    const getSectionInfo = () => {
        if (!section) return { title: 'Shopping Cart', backPath: '/marketplace', icon: ShoppingBag };
        switch (section.toLowerCase()) {
            case 'foods':
                return { title: 'Food Cart', backPath: '/marketplace/foods', icon: Utensils, color: 'orange' };
            case 'shops':
                return { title: 'Shop Cart', backPath: '/marketplace/shops', icon: Store, color: 'indigo' };
            default:
                return { title: 'Shopping Cart', backPath: '/marketplace', icon: ShoppingBag };
        }
    };

    const sectionInfo = getSectionInfo();

    const calculateSectionSummary = (sectionItems, sectionName) => {
        const subtotal = sectionItems.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);
        const shipping = 280;
        const coupon = appliedCoupons[sectionName];

        let discount = 0;
        if (sectionName === 'Foods') {
            if (coupon === 'SNACK20') discount = subtotal * 0.20;
            else if (coupon === 'CANTEEN5') discount = Math.min(500, subtotal);
        } else if (sectionName === 'Shops') {
            if (coupon === 'TECH10') discount = subtotal * 0.10;
            else if (coupon === 'SYNC25') discount = 280;
        } else {
            if (coupon === 'STUDENT10') discount = Math.min(1000, subtotal);
        }

        return { subtotal, shipping, discount, total: Math.max(0, subtotal - discount + shipping) };
    };

    const handleApplyCoupon = (sectionName) => {
        const code = (couponInputs[sectionName] || '').toUpperCase();

        const validCoupons = {
            'Foods': ['SNACK20', 'CANTEEN5'],
            'Shops': ['TECH10', 'SYNC25'],
            'Pre-Owned': ['STUDENT10']
        };

        if (validCoupons[sectionName]?.includes(code)) {
            setAppliedCoupons(prev => ({ ...prev, [sectionName]: code }));
            alert(`Coupon ${code} applied for ${sectionName}!`);
        } else {
            alert(`Invalid coupon code for ${sectionName}.`);
            setAppliedCoupons(prev => {
                const updated = { ...prev };
                delete updated[sectionName];
                return updated;
            });
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderError, setOrderError] = useState(null);

    const handleOrderConfirm = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setOrderError(null);
        
        const sectionToPlace = sectionCheckingOut;
        const itemsToPlace = groupedItems[sectionToPlace];
        const summary = calculateSectionSummary(itemsToPlace, sectionToPlace);

        try {
            const result = await placeOrder(sectionToPlace, itemsToPlace, summary.total, {
                ...deliveryInfo,
                name: deliveryInfo.location // Use location as name for now
            });
            
            if (result.success) {
                setIsOrdered(true);
            } else {
                setOrderError(result.errors?.[0]?.error || 'Failed to place order');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            setOrderError(error.message || 'Failed to place order');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isOrdered) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-6">
                <div className="text-center space-y-6 max-w-sm animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-100/50 dark:shadow-green-900/20">
                        <CheckCircle size={48} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Order Placed!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Your order has been sent to the vendor. Track it from your orders page.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button
                            className="w-full py-4 rounded-2xl shadow-lg"
                            onClick={() => navigate('/my-orders')}
                        >
                            View My Orders
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full py-4 rounded-2xl"
                            onClick={() => navigate(sectionInfo.backPath)}
                        >
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (filteredCartItems.length === 0) {
        return (
            <div className="min-h-screen p-6 flex flex-col items-center justify-center space-y-8 bg-white dark:bg-gray-900">
                <div className="w-32 h-32 bg-gray-50 dark:bg-gray-800 text-gray-200 dark:text-gray-700 rounded-full flex items-center justify-center shadow-inner">
                    <sectionInfo.icon size={64} />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Your {section ? sectionInfo.title.toLowerCase() : 'cart'} is empty</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto">Looks like you haven't added anything yet.</p>
                </div>

                <div className="w-full max-w-2xl">
                    {section ? (
                        // Single section back button
                        <div className="flex justify-center">
                            <Button
                                onClick={() => navigate(sectionInfo.backPath)}
                                className="px-8 py-4 rounded-2xl shadow-lg"
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        // All sections view
                        <>
                            <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Where would you like to shop?</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Foods Card */}
                                <button
                                    onClick={() => navigate('/marketplace/foods')}
                                    className="group relative bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-950/20 dark:hover:to-red-950/20 border-2 border-gray-100 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-800 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl group-hover:scale-110 transition-transform">
                                            <Utensils size={32} />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Foods</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Fresh meals & snacks</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-bold text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Browse Now <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </button>

                                {/* Shops Card */}
                                <button
                                    onClick={() => navigate('/marketplace/shops')}
                                    className="group relative bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/20 dark:hover:to-purple-950/20 border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-800 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
                                            <Store size={32} />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Shops</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Campus stores</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Browse Now <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </button>

                                {/* Pre-Owned Card */}
                                <button
                                    onClick={() => navigate('/marketplace/pre-owned')}
                                    className="group relative bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/20 dark:hover:to-pink-950/20 border-2 border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-800 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:scale-110 transition-transform">
                                            <ShoppingBag size={32} />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Pre-Owned</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Student marketplace</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Browse Now <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 font-sans pb-32">
            {/* Background elements */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(sectionInfo.backPath)}
                        className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-primary transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform text-gray-900 dark:text-white" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{sectionInfo.title}</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            {filteredCartItems.length} {filteredCartItems.length === 1 ? 'Item' : 'Items'} in your bag
                        </p>
                    </div>
                </div>

                <div className="space-y-12">
                    {sectionNames.map((sectionName) => {
                        const items = groupedItems[sectionName];
                        const summary = calculateSectionSummary(items, sectionName);

                        return (
                            <div key={sectionName} className="space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                                    <div className={`p-2 rounded-xl ${
                                        sectionName === 'Foods' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                                        sectionName === 'Shops' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
                                        'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                    }`}>
                                        {sectionName === 'Foods' ? <Utensils size={20} /> : sectionName === 'Shops' ? <Store size={20} /> : <ShoppingBag size={20} />}
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{sectionName} Order</h2>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Item List for this section */}
                                    <div className="lg:col-span-2 space-y-4">
                                        {items.map((item) => (
                                            <div key={item.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white dark:border-gray-700 shadow-sm flex items-center gap-6 group hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/50 transition-all">
                                                <div className={`h-24 w-24 rounded-3xl ${item.bg || 'bg-gray-50 dark:bg-gray-700'} flex items-center justify-center text-primary group-hover:scale-105 transition-transform overflow-hidden`}>
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        item.icon && <item.icon size={40} className="text-gray-900/10 dark:text-white/10" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div>
                                                            <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">{item.category}</span>
                                                            <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">{item.title}</h3>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold">{item.seller}</p>
                                                        </div>

                                                        <div className="flex items-center gap-6">
                                                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    className="p-1.5 hover:bg-white dark:hover:bg-gray-800 hover:text-primary rounded-xl transition-all text-gray-900 dark:text-white"
                                                                >
                                                                    <Minus size={16} />
                                                                </button>
                                                                <span className="w-6 text-center font-black text-sm text-gray-900 dark:text-white">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    className="p-1.5 hover:bg-white dark:hover:bg-gray-800 hover:text-primary rounded-xl transition-all text-gray-900 dark:text-white"
                                                                >
                                                                    <Plus size={16} />
                                                                </button>
                                                            </div>

                                                            <div className="text-right min-w-[80px]">
                                                                <div className="text-xl font-black text-gray-900 dark:text-white leading-none">৳{(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                                                                <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold mt-1">৳{item.price} / unit</div>
                                                            </div>

                                                            <button
                                                                onClick={() => removeFromCart(item.id)}
                                                                className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            >
                                                                <Trash2 size={20} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Summary for this section */}
                                    <div className="space-y-6">
                                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-[3rem] border border-white dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-black/20 space-y-6">
                                            <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Summary: {sectionName}</h3>

                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm font-bold text-gray-500 dark:text-gray-400">
                                                    <span>Subtotal</span>
                                                    <span className="text-gray-900 dark:text-white">৳{summary.subtotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm font-bold text-gray-500 dark:text-gray-400">
                                                    <span>Delivery Fee</span>
                                                    <span className="text-gray-900 dark:text-white">৳{summary.shipping.toFixed(2)}</span>
                                                </div>
                                                {summary.discount > 0 && (
                                                    <div className="flex justify-between text-sm font-bold text-green-600 dark:text-green-400">
                                                        <span>Discount ({appliedCoupons[sectionName]})</span>
                                                        <span>-৳{summary.discount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                                                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase">Total</span>
                                                    <span className="text-xl font-black text-primary">৳{summary.total.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            {/* Coupon for this section */}
                                            <div className="space-y-3 pt-2">
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Coupon for {sectionName}</div>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder={sectionName === 'Foods' ? 'SNACK20' : sectionName === 'Shops' ? 'TECH10' : 'Code'}
                                                        value={couponInputs[sectionName] || ''}
                                                        onChange={(e) => setCouponInputs(prev => ({ ...prev, [sectionName]: e.target.value }))}
                                                        className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-700 border border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-primary/20 transition-all font-bold text-xs uppercase outline-none text-gray-900 dark:text-white"
                                                    />
                                                    <button
                                                        onClick={() => handleApplyCoupon(sectionName)}
                                                        className="px-4 rounded-2xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => setSectionCheckingOut(sectionName)}
                                                className="w-full py-4 rounded-[1.2rem] shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                                            >
                                                Checkout {sectionName} <ChevronRight size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Checkout Modal */}
            {sectionCheckingOut && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setSectionCheckingOut(null)}></div>
                    <form
                        onSubmit={handleOrderConfirm}
                        className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-20 duration-500"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Checkout</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Order for {sectionCheckingOut}</p>
                            </div>
                            <button type="button" onClick={() => setSectionCheckingOut(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all text-gray-900 dark:text-white">
                                <CloseIcon size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Delivery Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Dorm Number, Room, or Lab Name"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-700 border border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-primary/20 transition-all font-medium outline-none text-gray-900 dark:text-white"
                                            value={deliveryInfo.location}
                                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, location: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Contact Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input
                                            required
                                            type="tel"
                                            placeholder="Contact for delivery update"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-700 border border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-primary/20 transition-all font-medium outline-none text-gray-900 dark:text-white"
                                            value={deliveryInfo.phone}
                                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Payment Method Section */}
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Payment Method</label>
                                    <div
                                        className="p-4 rounded-2xl border-2 border-primary bg-primary/5 dark:bg-primary/10 flex items-center gap-3"
                                    >
                                        <div className="p-2 rounded-xl bg-primary text-white">
                                            <CreditCard size={18} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-gray-900 dark:text-white">Cash on Delivery</div>
                                            <div className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">Pay at Dorm / Delivery</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Any Special Notes</label>
                                    <textarea
                                        placeholder="Add any specific requests or delivery notes here..."
                                        className="w-full px-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-700 border border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-primary/20 transition-all font-medium outline-none min-h-[100px] resize-none text-sm text-gray-900 dark:text-white"
                                        value={deliveryInfo.specialNotes}
                                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, specialNotes: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Final Total</div>
                                <div className="text-2xl font-black text-primary">
                                    ৳{calculateSectionSummary(groupedItems[sectionCheckingOut], sectionCheckingOut).total.toFixed(2)}
                                </div>
                            </div>

                            {orderError && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400 text-sm">
                                    {orderError}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full py-5 rounded-[1.5rem] shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-xs disabled:opacity-50"
                            >
                                {isSubmitting ? 'Processing...' : `Confirm ${sectionCheckingOut} Order`}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CartPage;
