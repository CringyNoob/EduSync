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
    Loader2
} from 'lucide-react';
import Button from '../../components/Button';
import marketplaceService from '../../services/marketplaceService';

const MarketplaceItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch product data from API
    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch pre-owned listing details
                const response = await marketplaceService.getPreownedById(id);
                
                if (response.success) {
                    const listing = response.listing;
                    
                    // Transform API data to match UI structure
                    const transformedProduct = {
                        id: listing.id,
                        title: listing.title,
                        price: parseFloat(listing.price).toFixed(2),
                        category: listing.category,
                        condition: 'Like New', // Default value - add to DB if needed
                        description: listing.description,
                        images: listing.images || ['bg-custom-celadon/30'],
                        location: 'Campus', // Default value - add to DB if needed
                        postedAt: formatTimeAgo(listing.created_at),
                        seller: {
                            id: listing.seller_id,
                            name: listing.seller_name,
                            avatar: 'bg-gradient-to-br from-custom-taupe-grey to-gray-600',
                            rating: 4.8, // Default value - add to DB if needed
                            joined: 'Sep 2023', // Default value - add to DB if needed
                            verified: true
                        },
                        status: listing.status
                    };
                    
                    setProduct(transformedProduct);
                } else {
                    setError('Failed to load product details');
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError(err.response?.data?.error || 'Failed to load product. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductDetails();
        }
    }, [id]);

    // Helper function to format time ago
    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const created = new Date(timestamp);
        const diffInMinutes = Math.floor((now - created) / (1000 * 60));
        
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    const handleContactSeller = () => {
        // Backend: Create conversation and navigate to chat
        // In a real app, you'd pass the sellerId to initiate a chat
        navigate('/chat');
    };

    // Loading state
    if (loading) {
        return (
            <div className="relative min-h-screen p-6 font-sans pb-24 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-gray-500">Loading product details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !product) {
        return (
            <div className="relative min-h-screen p-6 font-sans pb-24">
                <div className="fixed inset-0 -z-50 pointer-events-none">
                    <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-custom-celadon/40 rounded-full mix-blend-multiply filter blur-[80px]"></div>
                    <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-custom-cotton-candy/40 rounded-full mix-blend-multiply filter blur-[60px]"></div>
                </div>
                <div className="max-w-2xl mx-auto mt-20 text-center space-y-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-white/60 shadow-lg">
                        <ShoppingBag className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                        <p className="text-gray-500 mb-6">{error || 'The item you\'re looking for doesn\'t exist or has been removed.'}</p>
                        <Button onClick={() => navigate('/marketplace')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Marketplace
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen p-6 font-sans pb-24">
            {/* Background elements */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-custom-celadon/40 rounded-full mix-blend-multiply filter blur-[80px]"></div>
                <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-custom-cotton-candy/40 rounded-full mix-blend-multiply filter blur-[60px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/30"></div>
            </div>

            {/* Navigation Bar */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 hover:bg-white/60 pl-2"
                >
                    <ArrowLeft size={20} />
                    Back to Marketplace
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl shadow-sm">
                        <Share2 size={20} />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl shadow-sm hover:text-red-500 hover:border-red-200 hover:bg-red-50">
                        <Flag size={20} />
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className={`aspect-square w-full rounded-[2.5rem] ${product.images[0]} shadow-2xl shadow-custom-taupe-grey/10 flex items-center justify-center overflow-hidden border border-white/60 relative group`}>
                        {/* Placeholder for actual image */}
                        <div className="text-custom-taupe-grey/40 font-medium flex flex-col items-center group-hover:scale-110 transition-transform duration-500">
                            <ShoppingBag size={80} strokeWidth={1} />
                            <span className="mt-4 font-semibold">Product Image</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {product.images.map((img, index) => (
                            <div key={index} className={`aspect-square rounded-2xl ${img} cursor-pointer border-2 border-transparent hover:border-custom-taupe-grey/40 transition-all flex items-center justify-center`}>
                                <div className="w-2 h-2 rounded-full bg-custom-taupe-grey/20"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                {/* Product Info */}
                <div className="flex flex-col pt-2">
                    <div className="flex flex-col gap-6 mb-8 border-b border-gray-100 pb-8">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-custom-celadon/20 text-custom-taupe-grey text-xs font-bold uppercase tracking-wide border border-custom-celadon/30 mb-4">
                                    {product.category}
                                </span>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-custom-taupe-grey leading-tight tracking-tight break-words">
                                    {product.title}
                                </h1>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-3xl md:text-5xl font-extrabold text-custom-taupe-grey tracking-tight">${product.price}</div>
                                <div className="text-gray-400 text-sm mt-1 font-medium">USD</div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-gray-500 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <MapPin size={18} className="text-custom-taupe-grey" />
                                {product.location}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-custom-taupe-grey" />
                                {product.postedAt}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-8 border border-white/60 shadow-lg shadow-custom-taupe-grey/5 mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                            {product.description}
                        </p>
                        <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
                            <div className="flex-1 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                                <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Condition</div>
                                <div className="font-bold text-gray-900">{product.condition}</div>
                            </div>
                            <div className="flex-1 p-4 rounded-xl bg-custom-celadon/10 border border-custom-celadon/20">
                                <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">Status</div>
                                <div className="font-bold text-custom-taupe-grey flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                                    Available
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seller Card */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white/60 shadow-lg shadow-custom-taupe-grey/5 mb-8 flex items-center gap-5">
                        <div className={`h-16 w-16 rounded-2xl ${product.seller.avatar} flex items-center justify-center text-2xl font-bold text-white shadow-md`}>
                            {product.seller.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-gray-900">{product.seller.name}</h3>
                                {product.seller.verified && <CheckCircle size={18} className="text-blue-500 fill-blue-50" />}
                            </div>
                            <div className="text-sm text-gray-500 mt-1 font-medium">
                                Member since {product.seller.joined} • ⭐ {product.seller.rating} Rating
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => navigate(`/profile/${product.seller.id}`)}>
                            View Profile
                        </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto flex gap-4">
                        <Button className="flex-1 py-6 text-lg shadow-xl shadow-custom-taupe-grey/20" onClick={handleContactSeller}>
                            <MessageCircle className="mr-3 h-5 w-5" />
                            Message Seller
                        </Button>
                        <button
                            className={`p-4 rounded-xl border-2 transition-all ${isSaved ? 'bg-custom-cotton-candy/10 border-custom-cotton-candy text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:border-custom-taupe-grey hover:text-custom-taupe-grey'}`}
                            onClick={() => setIsSaved(!isSaved)}
                        >
                            <Heart size={28} fill={isSaved ? "currentColor" : "none"} />
                        </button>
                    </div>

                    {/* Safety Tip */}
                    <div className="mt-8 flex items-start gap-3 p-5 bg-custom-soft-apricot/20 border border-custom-soft-apricot/30 rounded-2xl text-sm text-gray-700">
                        <Shield className="shrink-0 mt-0.5 text-orange-400" size={20} />
                        <p className="leading-relaxed">
                            <strong>Safety Tip:</strong> Always meet in a public place on campus (like the library or student center). Avoid transferring money before seeing the item.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceItemDetails;
