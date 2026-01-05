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
    Coffee
} from 'lucide-react';
import Button from '../../components/Button';

const MarketplaceItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(false);

    // Mock Database
    const products = [
        { id: '1', title: 'Homemade Chocolate Chip Cookies', price: '12.00', category: 'Homemade', bg: 'bg-orange-50', icon: Utensils, seller: 'Baker B.', location: 'Dorm C Lounge', description: 'Freshly baked this morning! Pack of 12 soft and chewy cookies.', postedAt: '1h ago', sellerRating: 4.8 },
        { id: '2', title: 'Energy Drinks Bundle', price: '15.00', category: 'Beverages', bg: 'bg-blue-50', icon: Coffee, seller: 'Gym Rat', location: 'Campus Gym', description: 'Bundle of 6 energy drinks. Mixed flavors.', postedAt: '3h ago', sellerRating: 4.5 },
        { id: '3', title: 'Calculus Early Transcendentals', price: '45.00', category: 'Textbooks', bg: 'bg-indigo-50', icon: BookOpen, seller: 'John D.', location: 'Main Library', description: '8th edition, great condition. No highlights.', postedAt: '2h ago', sellerRating: 4.9 },
        { id: '4', title: 'Sony WH-1000XM4 Noise Canceling', price: '180.00', category: 'Electronics', bg: 'bg-gray-50', icon: Monitor, seller: 'Alex K.', location: 'Tech Hub', description: 'Barely used headphones. Industry leading noise cancellation.', postedAt: '1d ago', sellerRating: 5.0 },
        { id: '5', title: 'IKEA Desk Lamp', price: '20.00', category: 'Furniture', bg: 'bg-yellow-50', icon: Armchair, seller: 'Mike R.', location: 'Dorm A', description: 'Adjustable desk lamp. Includes LED bulb.', postedAt: '1d ago', sellerRating: 4.7 },
        { id: '6', title: 'University Hoodie - Size L', price: '45.00', category: 'Merch', bg: 'bg-purple-50', icon: Shirt, seller: 'Campus Store', location: 'Bookstore', description: 'Official campus hoodie. New with tags.', postedAt: '5h ago', sellerRating: 4.9 },
        { id: '7', title: 'Scientific Calculator TI-84 Plus', price: '120.00', category: 'Tech Accessories', bg: 'bg-cyan-50', icon: Monitor, seller: 'Tech Hub', location: 'Science Building', description: 'Standard graphing calculator. Good as new.', postedAt: '1d ago', sellerRating: 5.0 },
    ];

    const product = products.find(p => p.id === id) || products[0];

    const handleContactSeller = () => {
        navigate('/chat');
    };

    return (
        <div className="relative min-h-screen p-6 font-sans pb-24">
            {/* Background elements */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-custom-celadon/20 rounded-full mix-blend-multiply filter blur-[80px]"></div>
                <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-custom-cotton-candy/20 rounded-full mix-blend-multiply filter blur-[60px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            {/* Navigation Bar */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
                    <ArrowLeft size={20} />
                    Back
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl shadow-sm"><Share2 size={20} /></Button>
                    <Button variant="outline" size="icon" className="rounded-xl shadow-sm hover:text-red-500"><Flag size={20} /></Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Section (Icon Based) */}
                <div className="space-y-4">
                    <div className={`aspect-square w-full rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/60 relative group ${product.bg} flex items-center justify-center`}>
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
                            <div className="text-right">
                                <div className="text-4xl font-black text-gray-900">${product.price}</div>
                                <div className="text-gray-400 text-xs font-bold">SALE PRICE</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 mt-6 text-gray-400 text-sm font-bold uppercase tracking-wider">
                            <div className="flex items-center gap-2"><MapPin size={16} /> {product.location}</div>
                            <div className="flex items-center gap-2"><Clock size={16} /> {product.postedAt}</div>
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white shadow-sm mb-8">
                        <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-widest">Description</h3>
                        <p className="text-gray-600 leading-relaxed text-lg font-medium">
                            {product.description}
                        </p>
                    </div>

                    {/* Seller Card */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white shadow-sm mb-8 flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                            {product.seller.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-black text-gray-900">{product.seller}</h3>
                            <div className="text-xs text-gray-500 font-bold flex items-center gap-1">
                                ⭐ {product.sellerRating} RATING • <CheckCircle size={14} className="text-blue-500" /> VERIFIED
                            </div>
                        </div>
                        <Button variant="outline" className="rounded-xl">Profile</Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto flex gap-4">
                        <Button className="flex-1 py-6 text-lg shadow-lg shadow-primary/20" onClick={handleContactSeller}>
                            <MessageCircle className="mr-3 h-5 w-5" />
                            Message Seller
                        </Button>
                        <button
                            className={`p-4 rounded-2xl border-2 transition-all ${isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-900'}`}
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
