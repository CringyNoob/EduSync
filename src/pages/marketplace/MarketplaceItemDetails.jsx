import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Heart,
    MessageCircle,
    Share2,
    Shield,
    MapPin,
    Clock,
    Flag,
    CheckCircle,
    User,
    ShoppingBag,
    BookOpen,
    Monitor,
    Armchair,
    Shirt,
    Utensils,
    Coffee,
    Phone,
    Truck,
    CreditCard,
    ChevronRight,
    X as CloseIcon
} from 'lucide-react';
import Button from '../../components/Button';

const MarketplaceItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(false);
    const [isOrdered, setIsOrdered] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState({
        location: '',
        phone: '',
        instructions: ''
    });

    // Mock Database
    const products = [
        { id: '1', title: 'Homemade Chocolate Chip Cookies', price: '12.00', category: 'Homemade', bg: 'bg-orange-50', icon: Utensils, seller: 'Baker B.', location: 'Dorm C Lounge', description: 'Freshly baked this morning! Pack of 12 soft and chewy cookies.', postedAt: '1h ago', sellerRating: 4.8, type: 'Foods' },
        { id: '2', title: 'Energy Drinks Bundle', price: '15.00', category: 'Beverages', bg: 'bg-blue-50', icon: Coffee, seller: 'Gym Rat', location: 'Campus Gym', description: 'Bundle of 6 energy drinks. Mixed flavors.', postedAt: '3h ago', sellerRating: 4.5, type: 'Foods' },
        { id: '3', title: 'Calculus Early Transcendentals', price: '45.00', category: 'Textbooks', bg: 'bg-indigo-50', icon: BookOpen, seller: 'John D.', location: 'Main Library', description: '8th edition, great condition. No highlights.', postedAt: '2h ago', sellerRating: 4.9, type: 'Pre-Owned' },
        { id: '4', title: 'Sony WH-1000XM4 Noise Cancelling', price: '180.00', category: 'Electronics', bg: 'bg-gray-50', icon: Monitor, seller: 'Alex K.', location: 'Tech Hub', description: 'Barely used headphones. Industry leading noise cancellation.', postedAt: '1d ago', sellerRating: 5.0, type: 'Pre-Owned' },
        { id: '5', title: 'IKEA Desk Lamp', price: '20.00', category: 'Furniture', bg: 'bg-yellow-50', icon: Armchair, seller: 'Mike R.', location: 'Dorm A', description: 'Adjustable desk lamp. Includes LED bulb.', postedAt: '1d ago', sellerRating: 4.7, type: 'Pre-Owned' },
        { id: '6', title: 'University Hoodie - Size L', price: '45.00', category: 'Merch', bg: 'bg-purple-50', icon: Shirt, seller: 'Campus Store', location: 'Bookstore', description: 'Official campus hoodie. New with tags.', postedAt: '5h ago', sellerRating: 4.9, type: 'Shops' },
        { id: '7', title: 'Scientific Calculator TI-84 Plus', price: '120.00', category: 'Tech Accessories', bg: 'bg-cyan-50', icon: Monitor, seller: 'Tech Hub', location: 'Science Building', description: 'Standard graphing calculator. Good as new.', postedAt: '1d ago', sellerRating: 5.0, type: 'Shops' },
    ];

    const product = products.find(p => p.id === id) || products[0];

    const handleContactSeller = () => {
        navigate('/chat');
    };

    const handleOrderConfirm = (e) => {
        e.preventDefault();
        setIsOrdered(true);
        // In a real app, this would add the order to the database
        setTimeout(() => {
            navigate('/marketplace', { state: { orderSuccess: true, item: product.title } });
        }, 2000);
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
                        <p className="text-gray-500 mt-2 font-medium">Your request for {product.title} has been sent to {product.seller}. Redirecting you back...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen p-6 font-sans pb-24">
            {/* Background elements */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-custom-celadon/20 rounded-full mix-blend-multiply filter blur-[80px]"></div>
                <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-custom-cotton-candy/20 rounded-full mix-blend-multiply filter blur-[60px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            {/* Checkout Overlay */}
            {showCheckout && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowCheckout(false)}></div>
                    <form
                        onSubmit={handleOrderConfirm}
                        className="relative w-full max-w-lg bg-white rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-20 duration-500"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Checkout</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Confirm your delivery info</p>
                            </div>
                            <button type="button" onClick={() => setShowCheckout(false)} className="p-2 hover:bg-gray-100 rounded-2xl transition-all">
                                <CloseIcon size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-3xl flex items-center gap-4 border border-gray-100">
                                <div className={`h-12 w-12 rounded-2xl ${product.bg} flex items-center justify-center text-primary shadow-sm`}>
                                    <product.icon size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate">{product.title}</h4>
                                    <div className="text-lg font-black text-primary">${product.price}</div>
                                </div>
                            </div>

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
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
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

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Special Instructions</label>
                                    <textarea
                                        placeholder="Note for the seller (optional)"
                                        className="w-full px-4 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary/20 transition-all font-medium outline-none min-h-[100px] resize-none"
                                        value={deliveryInfo.instructions}
                                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, instructions: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
                            <div className="hidden sm:block">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Method</div>
                                <div className="flex items-center gap-2 text-sm font-bold mt-1">
                                    <CreditCard size={16} className="text-primary" /> Cash on Delivery
                                </div>
                            </div>
                            <Button type="submit" className="w-full sm:w-auto px-10 py-5 rounded-[1.5rem] shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-xs">
                                Confirm & Order
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Navigation Bar */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2 rounded-2xl border-gray-100 shadow-sm bg-white">
                    <ArrowLeft size={20} />
                    Back
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl shadow-sm bg-white"><Share2 size={20} /></Button>
                    <Button variant="outline" size="icon" className="rounded-xl shadow-sm hover:text-red-500 bg-white"><Flag size={20} /></Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Section (Icon Based) */}
                <div className="space-y-4">
                    <div className={`aspect-square w-full rounded-[3rem] shadow-2xl overflow-hidden border border-white/60 relative group ${product.bg} flex items-center justify-center`}>
                        <product.icon size={120} className="text-gray-900/10 transition-transform duration-700 group-hover:scale-110" />
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col pt-2">
                    <div className="mb-8 border-b border-gray-100 pb-8">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wide mb-4">
                            {product.category}
                        </span>
                        <div className="flex items-start justify-between">
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
                                {product.title}
                            </h1>
                            <div className="text-right ml-4">
                                <div className="text-4xl font-black text-gray-900 tracking-tight">${product.price}</div>
                                <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Total Amount</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 mt-6 text-gray-400 text-sm font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> {product.location}</div>
                            <div className="flex items-center gap-2"><Clock size={16} className="text-primary" /> {product.postedAt}</div>
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-sm mb-8">
                        <h3 className="text-xs font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Item Overview</h3>
                        <p className="text-gray-600 leading-relaxed text-lg font-medium">
                            {product.description}
                        </p>
                    </div>

                    {/* Seller Card */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white shadow-sm mb-8 flex items-center gap-5 group hover:border-primary/20 transition-all">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/10 transition-transform group-hover:scale-110">
                            {product.seller.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-black text-gray-900">{product.seller}</h3>
                            <div className="text-[10px] text-gray-400 font-bold flex items-center gap-2 uppercase tracking-widest mt-0.5">
                                <span className="flex items-center gap-1 text-yellow-500">⭐ {product.sellerRating} Rating</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-blue-500"><CheckCircle size={14} /> Verified</span>
                            </div>
                        </div>
                        <Button variant="outline" className="rounded-xl border-gray-100 bg-white">Profile</Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto flex gap-4">
                        <Button className="flex-[2] py-6 text-lg shadow-xl shadow-primary/20 hover:-translate-y-1 rounded-[1.5rem]" onClick={() => setShowCheckout(true)}>
                            <ShoppingBag className="mr-3 h-5 w-5" />
                            Place Order
                        </Button>
                        <Button variant="outline" className="flex-1 py-6 text-lg border-gray-100 bg-white rounded-[1.5rem]" onClick={handleContactSeller}>
                            <MessageCircle className="mr-3 h-5 w-5" />
                            Chat
                        </Button>
                        <button
                            className={`p-4 rounded-[1.5rem] border-2 transition-all shadow-sm ${isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-100 text-gray-400 hover:border-primary/20 hover:text-primary'}`}
                            onClick={() => setIsSaved(!isSaved)}
                        >
                            <Heart size={28} fill={isSaved ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceItemDetails;
