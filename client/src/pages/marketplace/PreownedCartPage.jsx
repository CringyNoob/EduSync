import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Trash2,
    ShoppingBag,
    CheckCircle,
    User,
    MapPin,
    Calendar,
    ChevronRight,
    CloseIcon,
    Phone,
    CreditCard,
    X
} from 'lucide-react';
import Button from '../../components/Button';
import { useCart } from '../../context/CartContext';

const PreownedCartPage = () => {
    const navigate = useNavigate();
    const {
        preownedCartItems,
        removeFromPreownedCart,
        clearPreownedCart,
        placeOrder,
        getPreownedTotal
    } = useCart();

    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [isOrdered, setIsOrdered] = useState(false);

    const [deliveryInfo, setDeliveryInfo] = useState({
        location: '',
        phone: '',
        specialNotes: ''
    });

    const handleOrderConfirm = (e) => {
        e.preventDefault();
        setIsOrdered(true);
        // Place order for Pre-Owned section
        placeOrder('Pre-Owned', preownedCartItems, getPreownedTotal(), deliveryInfo);
        // Note: placeOrder in context already handles clearing the cart via clearSectionItems logic if implemented correctly
        // But since we use clearPreownedCart specifically, let's verify context logic. 
        // Our updated context calls clearPreownedCart if section is 'Pre-Owned'.
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
                        <p className="text-gray-500 mt-2 font-medium">Your request has been sent to the sellers. You will be notified once they accept.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button
                            className="w-full py-4 rounded-2xl shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => navigate('/marketplace/pre-owned')}
                        >
                            Return to Pre-Owned
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full py-4 rounded-2xl"
                            onClick={() => navigate('/marketplace/pre-owned', { state: { viewOrders: true, section: 'Pre-Owned' } })}
                        >
                            View My Orders
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (preownedCartItems.length === 0) {
        return (
            <div className="min-h-screen p-6 flex flex-col items-center justify-center space-y-6">
                <div className="w-32 h-32 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center shadow-inner">
                    <ShoppingBag size={64} />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-gray-900">Your Pre-owned cart is empty</h2>
                    <p className="text-gray-500 font-medium max-w-xs mx-auto">Find great deals from other students in the marketplace.</p>
                </div>
                <Button onClick={() => navigate('/marketplace/pre-owned')} className="px-8 rounded-2xl py-4 font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-200 bg-indigo-600 text-white hover:bg-indigo-700">
                    Browse Pre-owned
                </Button>
            </div>
        );
    }

    const totalAmount = getPreownedTotal();

    return (
        <div className="min-h-screen p-6 font-sans pb-32">
            {/* Background elements */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-indigo-600 transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Pre-owned Cart</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            {preownedCartItems.length} {preownedCartItems.length === 1 ? 'Item' : 'Items'} selected
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {preownedCartItems.map((item) => (
                        <div key={item.id} className="bg-white/80 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white shadow-sm flex flex-col sm:flex-row items-center gap-6 group hover:shadow-xl hover:border-indigo-100 transition-all">
                            {/* Image */}
                            <div className={`h-28 w-28 shrink-0 rounded-3xl ${item.bg || 'bg-gray-50'} flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform overflow-hidden`}>
                                {item.image ? (
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    item.icon && <item.icon size={48} className="text-gray-900/10" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                                <div className="mb-2">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{item.category}</span>
                                    <h3 className="text-xl font-black text-gray-900 truncate">{item.title}</h3>
                                </div>

                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                                    <div className="flex items-center gap-1"><User size={14} className="text-indigo-500" /> {item.seller}</div>
                                    <div className="flex items-center gap-1"><MapPin size={14} className="text-indigo-500" /> {item.location}</div>
                                    <div className="flex items-center gap-1"><Calendar size={14} className="text-indigo-500" /> {item.postedAt}</div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-start gap-6 border-t border-gray-100 pt-4 sm:border-0 sm:pt-0">
                                    <div className="text-2xl font-black text-gray-900">৳{item.price}</div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => removeFromPreownedCart(item.id)}
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

                <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-10 md:w-96">
                    <div className="bg-gray-900 text-white p-6 rounded-[2rem] shadow-2xl flex items-center justify-between gap-4">
                        <div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Estimated</div>
                            <div className="text-2xl font-black">৳{totalAmount.toFixed(2)}</div>
                        </div>
                        <Button
                            onClick={() => setIsCheckingOut(true)}
                            className="px-8 py-4 bg-white text-gray-900 hover:bg-indigo-50 font-black uppercase tracking-widest text-xs rounded-xl"
                        >
                            Checkout <ChevronRight size={16} className="ml-2" />
                        </Button>
                    </div>
                </div>

            </div>

            {/* Checkout Modal */}
            {isCheckingOut && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsCheckingOut(false)}></div>
                    <form
                        onSubmit={handleOrderConfirm}
                        className="relative w-full max-w-lg bg-white rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-20 duration-500"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Checkout</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Order for Pre-Owned Items</p>
                            </div>
                            <button type="button" onClick={() => setIsCheckingOut(false)} className="p-2 hover:bg-gray-100 rounded-2xl transition-all">
                                <X size={24} />
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
                                            placeholder="Dorm Number, Room, or Meetup Spot"
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
                                            placeholder="Contact for coordination"
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
                                        className="p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50 flex items-center gap-3"
                                    >
                                        <div className="p-2 rounded-xl bg-indigo-600 text-white">
                                            <CreditCard size={18} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-gray-900">Cash on Meetup</div>
                                            <div className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">Pay typically when you inspect the item</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Message to Seller(s)</label>
                                    <textarea
                                        placeholder="Suggest a time to meet or ask questions..."
                                        className="w-full px-4 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-600/20 transition-all font-medium outline-none min-h-[100px] resize-none text-sm"
                                        value={deliveryInfo.specialNotes}
                                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, specialNotes: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="py-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total to Pay</div>
                                <div className="text-2xl font-black text-indigo-600">
                                    ৳{totalAmount.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-6 border-t border-gray-100">
                            <Button type="submit" className="w-full py-5 rounded-[1.5rem] shadow-xl shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-xs text-white">
                                Confirm Pre-Owned Order
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PreownedCartPage;
