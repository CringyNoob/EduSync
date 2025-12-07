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
    User
} from 'lucide-react';
import Button from '../../components/Button';

// --- Backend Integration Notes ---
// 1. Fetch Item Details:
//    - Endpoint: GET /api/marketplace/items/:id
//    - Response: { id, title, price, description, category, images[], seller: { id, name, avatar, joinedDate, rating }, location, postedAt, condition }

// 2. Contact Seller:
//    - Endpoint: POST /api/chat/conversations
//    - Body: { recipientId: seller.id, subject: `Inquiry about ${item.title}` }
//    - Redirects to chat page

// 3. Report Item:
//    - Endpoint: POST /api/marketplace/items/:id/report
//    - Body: { reason: string }

const MarketplaceItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(false);

    // Mock Data - In production, fetch this using the 'id' from useParams
    const product = {
        id: id,
        title: 'Calculus Early Transcendentals (8th Edition)',
        price: '45.00',
        category: 'Textbooks',
        condition: 'Like New',
        description: 'Hardcover edition. Used for one semester only. No highlighting or markings inside. Includes the online access code which has not been redeemed yet. Perfect for Math 101/102 courses.',
        images: ['bg-blue-100', 'bg-blue-50', 'bg-gray-100'],
        location: 'North Campus Library',
        postedAt: '2 hours ago',
        seller: {
            id: 'u123',
            name: 'John Doe',
            avatar: 'bg-indigo-100',
            rating: 4.8,
            joined: 'Sep 2023',
            verified: true
        }
    };

    const handleContactSeller = () => {
        // Backend: Create conversation and navigate to chat
        // In a real app, you'd pass the sellerId to initiate a chat
        navigate('/chat');
    };

    return (
        <div className="relative min-h-screen p-6 font-sans pb-24">
            {/* Background elements */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-100/40 rounded-full mix-blend-multiply filter blur-[80px]"></div>
                <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-indigo-100/40 rounded-full mix-blend-multiply filter blur-[60px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            {/* Navigation Bar */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium px-4 py-2 rounded-xl hover:bg-white/50"
                >
                    <ArrowLeft size={20} />
                    Back to Marketplace
                </button>
                <div className="flex gap-2">
                    <button className="p-3 rounded-xl bg-white/50 hover:bg-white text-gray-600 hover:text-indigo-600 transition-all shadow-sm">
                        <Share2 size={20} />
                    </button>
                    <button className="p-3 rounded-xl bg-white/50 hover:bg-white text-gray-600 hover:text-red-500 transition-all shadow-sm">
                        <Flag size={20} />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className={`aspect-square w-full rounded-3xl ${product.images[0]} shadow-lg shadow-indigo-500/10 flex items-center justify-center overflow-hidden border border-white/60 relative group`}>
                        {/* Placeholder for actual image */}
                        <div className="text-gray-400 font-medium flex flex-col items-center">
                            <span className="text-6xl mb-4">📖</span>
                            <span>Item Image (Main)</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {product.images.map((img, index) => (
                            <div key={index} className={`aspect-square rounded-2xl ${img} cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all flex items-center justify-center`}>
                                <span className="text-2xl opacity-50">📷</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <span className="px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-bold uppercase tracking-wide">
                                {product.category}
                            </span>
                            <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                                {product.title}
                            </h1>
                            <div className="flex items-center gap-4 mt-4 text-gray-500 text-sm font-medium">
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} />
                                    {product.location}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={16} />
                                    {product.postedAt}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-extrabold text-indigo-600">${product.price}</div>
                            <div className="text-gray-500 text-sm mt-1">USD (Cash/Venmo)</div>
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-sm mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {product.description}
                        </p>
                        <div className="mt-6 pt-6 border-t border-gray-200/50 flex gap-6">
                            <div>
                                <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Condition</div>
                                <div className="font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg inline-block">{product.condition}</div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Status</div>
                                <div className="font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-lg inline-block flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Available
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seller Card */}
                    <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-sm mb-8 flex items-center gap-4">
                        <div className={`h-16 w-16 rounded-2xl ${product.seller.avatar} flex items-center justify-center text-2xl font-bold text-indigo-600 shadow-inner`}>
                            {product.seller.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-gray-900">{product.seller.name}</h3>
                                {product.seller.verified && <CheckCircle size={16} className="text-blue-500 fill-blue-50" />}
                            </div>
                            <div className="text-sm text-gray-500">
                                Member since {product.seller.joined} • ⭐ {product.seller.rating} Rating
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/profile/${product.seller.id}`)}>
                            View Profile
                        </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto flex gap-4">
                        <Button className="flex-1 py-4 text-lg shadow-indigo-500/25" onClick={handleContactSeller}>
                            <MessageCircle className="mr-2" />
                            Message Seller
                        </Button>
                        <button
                            className={`p-4 rounded-xl border-2 transition-all ${isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}
                            onClick={() => setIsSaved(!isSaved)}
                        >
                            <Heart size={24} fill={isSaved ? "currentColor" : "none"} />
                        </button>
                    </div>

                    {/* Safety Tip */}
                    <div className="mt-6 flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl text-sm text-orange-800">
                        <Shield className="shrink-0 mt-0.5" size={18} />
                        <p>
                            <strong>Safety Tip:</strong> Always meet in a public place on campus (like the library or student center). Avoid transferring money before seeing the item.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceItemDetails;
