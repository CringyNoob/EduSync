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
    BookOpen
} from 'lucide-react';
import Button from '../../components/Button';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
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

    // Group items by section
    const groupedItems = cartItems.reduce((acc, item) => {
        const section = item.section || 'General';
        if (!acc[section]) acc[section] = [];
        acc[section].push(item);
        return acc;
    }, {});

    const sectionNames = Object.keys(groupedItems);

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

    const handleOrderConfirm = (e) => {
        e.preventDefault();
        setIsOrdered(true);
        const sectionToPlace = sectionCheckingOut;
        const itemsToPlace = groupedItems[sectionToPlace];
        const summary = calculateSectionSummary(itemsToPlace, sectionToPlace);

        // Removed automatic navigation timeout
        placeOrder(sectionToPlace, itemsToPlace, summary.total, deliveryInfo);
    };

    if (isOrdered) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-6">
                <div className="text-center space-y-6 max-w-sm animate-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-100/50">
                        <CheckCircle size={48} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Order Placed!</h2>
                        <p className="text-gray-500 mt-2 font-medium">Your items are being prepared. What would you like to do next?</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button
                            className="w-full py-4 rounded-2xl shadow-lg"
                            onClick={() => navigate(`/marketplace/${sectionCheckingOut?.toLowerCase() || 'foods'}`)}
                        >
                            Return to {sectionCheckingOut || 'Marketplace'}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full py-4 rounded-2xl"
                            onClick={() => navigate(`/marketplace/${sectionCheckingOut?.toLowerCase() || 'foods'}`, { state: { viewOrders: true, section: sectionCheckingOut } })}
                        >
                            View My Orders
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen p-6 flex flex-col items-center justify-center space-y-8">
                <div className="w-32 h-32 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center shadow-inner">
                    <ShoppingBag size={64} />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-gray-900">Your cart is empty</h2>
                    <p className="text-gray-500 font-medium max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
                </div>

                <div className="w-full max-w-2xl">
                    <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Where would you like to shop?</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Foods Card */}
                        <button
                            onClick={() => navigate('/marketplace/foods')}
                            className="group relative bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 border-2 border-gray-100 hover:border-orange-300 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Utensils size={32} />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-black text-gray-900">Foods</h3>
                                    <p className="text-xs text-gray-500 font-medium mt-1">Fresh meals & snacks</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Browse Now <ChevronRight size={14} />
                                </div>
                            </div>
                        </button>

                        {/* Pre-Owned Card */}
                        <button
                            onClick={() => navigate('/marketplace/pre-owned')}
                            className="group relative bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 border-2 border-gray-100 hover:border-indigo-300 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                                    <ShoppingBag size={32} />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-black text-gray-900">Pre-Owned</h3>
                                    <p className="text-xs text-gray-500 font-medium mt-1">Student marketplace</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Browse Now <ChevronRight size={14} />
                                </div>
                            </div>
                        </button>

                        {/* Shops Card */}
                        <button
                            onClick={() => navigate('/marketplace/shops')}
                            className="group relative bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 border-2 border-gray-100 hover:border-blue-300 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                                    <BookOpen size={32} />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-black text-gray-900">Shops</h3>
                                    <p className="text-xs text-gray-500 font-medium mt-1">Campus stores</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Browse Now <ChevronRight size={14} />
                                </div>
                            </div>
                        </button>
                    </div>
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
                        onClick={() => navigate(-1)}
                        className="p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-primary transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shopping Cart</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} in your bag
                        </p>
                    </div>
                </div>

                <div className="space-y-12">
                    {sectionNames.map((sectionName) => {
                        const items = groupedItems[sectionName];
                        const summary = calculateSectionSummary(items, sectionName);

                        return (
                            <div key={sectionName} className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                                    <div className={`p-2 rounded-xl bg-primary/10 text-primary`}>
                                        {sectionName === 'Foods' ? <Utensils size={20} /> : sectionName === 'Shops' ? <ShoppingBag size={20} /> : <BookOpen size={20} />}
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{sectionName} Order</h2>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Item List for this section */}
                                    <div className="lg:col-span-2 space-y-4">
                                        {items.map((item) => (
                                            <div key={item.id} className="bg-white/80 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white shadow-sm flex items-center gap-6 group hover:shadow-xl hover:border-primary/20 transition-all">
                                                <div className={`h-24 w-24 rounded-3xl ${item.bg || 'bg-gray-50'} flex items-center justify-center text-primary group-hover:scale-105 transition-transform overflow-hidden`}>
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        item.icon && <item.icon size={40} className="text-gray-900/10" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div>
                                                            <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">{item.category}</span>
                                                            <h3 className="text-lg font-black text-gray-900 truncate">{item.title}</h3>
                                                            <p className="text-xs text-gray-400 font-bold">{item.seller}</p>
                                                        </div>

                                                        <div className="flex items-center gap-6">
                                                            <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    className="p-1.5 hover:bg-white hover:text-primary rounded-xl transition-all"
                                                                >
                                                                    <Minus size={16} />
                                                                </button>
                                                                <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    className="p-1.5 hover:bg-white hover:text-primary rounded-xl transition-all"
                                                                >
                                                                    <Plus size={16} />
                                                                </button>
                                                            </div>

                                                            <div className="text-right min-w-[80px]">
                                                                <div className="text-xl font-black text-gray-900 leading-none">৳{(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                                                                <div className="text-[10px] text-gray-400 font-bold mt-1">৳{item.price} / unit</div>
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
                                        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] border border-white shadow-xl shadow-gray-200/50 space-y-6">
                                            <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Summary: {sectionName}</h3>

                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm font-bold text-gray-500">
                                                    <span>Subtotal</span>
                                                    <span className="text-gray-900">৳{summary.subtotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm font-bold text-gray-500">
                                                    <span>Delivery Fee</span>
                                                    <span className="text-gray-900">৳{summary.shipping.toFixed(2)}</span>
                                                </div>
                                                {summary.discount > 0 && (
                                                    <div className="flex justify-between text-sm font-bold text-green-600">
                                                        <span>Discount ({appliedCoupons[sectionName]})</span>
                                                        <span>-৳{summary.discount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                <div className="pt-3 border-t border-gray-100 flex justify-between">
                                                    <span className="text-sm font-black text-gray-900 uppercase">Total</span>
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
                                                        className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary/20 transition-all font-bold text-xs uppercase outline-none"
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
                        className="relative w-full max-w-lg bg-white rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-20 duration-500"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Checkout</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Order for {sectionCheckingOut}</p>
                            </div>
                            <button type="button" onClick={() => setSectionCheckingOut(null)} className="p-2 hover:bg-gray-100 rounded-2xl transition-all">
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
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary/20 transition-all font-medium outline-none"
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
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary/20 transition-all font-medium outline-none"
                                            value={deliveryInfo.phone}
                                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Payment Method Section */}
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Payment Method</label>
                                    <div
                                        className="p-4 rounded-2xl border-2 border-primary bg-primary/5 flex items-center gap-3"
                                    >
                                        <div className="p-2 rounded-xl bg-primary text-white">
                                            <CreditCard size={18} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-gray-900">Cash on Delivery</div>
                                            <div className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">Pay at Dorm / Delivery</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Any Special Notes</label>
                                    <textarea
                                        placeholder="Add any specific requests or delivery notes here..."
                                        className="w-full px-4 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary/20 transition-all font-medium outline-none min-h-[100px] resize-none text-sm"
                                        value={deliveryInfo.specialNotes}
                                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, specialNotes: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="py-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Final Total</div>
                                <div className="text-2xl font-black text-primary">
                                    ৳{calculateSectionSummary(groupedItems[sectionCheckingOut], sectionCheckingOut).total.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-6 border-t border-gray-100">
                            <Button type="submit" className="w-full py-5 rounded-[1.5rem] shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-xs">
                                Confirm {sectionCheckingOut} Order
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CartPage;
