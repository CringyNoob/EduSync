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
    X
} from 'lucide-react';
import Button from '../../components/Button';
import { useCart } from '../../context/CartContext';
import marketplaceService from '../../services/marketplaceService';

const MarketplaceItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch product details on mount
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                // Try fetching as preowned first, then as regular product
                let productData;
                try {
                    const response = await marketplaceService.getPreownedById(id);
                    const listing = response.listing || response.data;
                    productData = {
                        id: listing.id,
                        title: listing.title,
                        price: listing.price,
                        category: listing.category,
                        description: listing.description,
                        seller: listing.seller_name,
                        location: 'Campus',
                        postedAt: 'Recently',
                        sellerRating: 4.5,
                        section: 'Pre-Owned',
                        images: listing.images || [],
                        status: listing.status
                    };
                } catch (err) {
                    // If not preowned, try as regular product
                    const response = await marketplaceService.getProductById(id);
                    productData = {
                        id: response.product.id,
                        title: response.product.name,
                        price: response.product.price,
                        category: response.product.vendor?.name || 'Product',
                        description: response.product.description,
                        seller: response.product.vendor?.name || 'Vendor',
                        location: 'Campus',
                        postedAt: 'Available',
                        sellerRating: 4.5,
                        section: 'Shops',
                        image: response.product.image_url,
                        is_available: response.product.is_available
                    };
                }
                setProduct(productData);
            } catch (err) {
                console.error('Error fetching product:', err);
                setError(err.message || 'Failed to load product');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const { addToCart, cartCount } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleContactSeller = () => {
        navigate('/chat');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Shield size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Failed to load product</h2>
                    <p className="text-gray-500 mb-4">{error || 'Product not found'}</p>
                    <Button onClick={() => navigate('/marketplace')}>Back to Marketplace</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen p-6 font-sans pb-24 text-left">
            {/* Background elements */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-custom-celadon/20 rounded-full mix-blend-multiply filter blur-[80px]"></div>
                <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-custom-cotton-candy/20 rounded-full mix-blend-multiply filter blur-[60px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            {/* Navigation Bar */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2 rounded-2xl border-gray-100 shadow-sm bg-white">
                    <ArrowLeft size={20} />
                    Back
                </Button>
                <div className="flex gap-2">
                    <div className="relative mr-4 cursor-pointer group" onClick={() => navigate('/marketplace/cart')}>
                        <Button variant="outline" size="icon" className="rounded-xl shadow-sm bg-white hover:text-primary transition-colors">
                            <ShoppingBag size={20} />
                        </Button>
                        {cartCount > 0 && (
                            <div className="absolute -top-1.5 -right-1.5 h-6 w-6 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                {cartCount}
                            </div>
                        )}
                    </div>
                    <Button variant="outline" size="icon" className="rounded-xl shadow-sm bg-white"><Share2 size={20} /></Button>
                    <Button variant="outline" size="icon" className="rounded-xl shadow-sm hover:text-red-500 bg-white"><Flag size={20} /></Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Section */}
                <div className="space-y-4">
                    <div className="aspect-square w-full rounded-[3rem] shadow-2xl overflow-hidden border border-white/60 relative group bg-gray-50 flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                            <img 
                                src={product.images[0]} 
                                alt={product.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : product.image ? (
                            <img 
                                src={product.image} 
                                alt={product.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <ShoppingBag size={120} className="text-gray-300 transition-transform duration-700 group-hover:scale-110" />
                        )}
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col pt-2 text-left">
                    <div className="mb-8 border-b border-gray-100 pb-8 text-left">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wide mb-4">
                            {product.category}
                        </span>
                        <div className="flex items-start justify-between text-left">
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight text-left">
                                {product.title}
                            </h1>
                            <div className="text-right ml-4">
                                <div className="text-4xl font-black text-gray-900 tracking-tight">${product.price}</div>
                                <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Total Amount</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 mt-6 text-gray-400 text-sm font-bold uppercase tracking-wider text-left">
                            <div className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> {product.location}</div>
                            <div className="flex items-center gap-2"><Clock size={16} className="text-primary" /> {product.postedAt}</div>
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-sm mb-8 text-left">
                        <h3 className="text-xs font-black text-gray-400 mb-4 uppercase tracking-[0.2em] text-left">Item Overview</h3>
                        <p className="text-gray-600 leading-relaxed text-lg font-medium text-left">
                            {product.description}
                        </p>
                    </div>

                    {/* Seller Card */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white shadow-sm mb-8 flex items-center gap-5 group hover:border-primary/20 transition-all text-left">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/10 transition-transform group-hover:scale-110">
                            {product.seller.charAt(0)}
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="text-lg font-black text-gray-900">{product.seller}</h3>
                            <div className="text-[10px] text-gray-400 font-bold flex items-center gap-2 uppercase tracking-widest mt-0.5 text-left">
                                <span className="flex items-center gap-1 text-yellow-500">⭐ {product.sellerRating} Rating</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-blue-500"><CheckCircle size={14} /> Verified</span>
                            </div>
                        </div>
                        <Button variant="outline" className="rounded-xl border-gray-100 bg-white">Profile</Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto flex gap-4 text-left">
                        <Button
                            className={`flex-[2] py-6 text-lg shadow-xl hover:-translate-y-1 rounded-[1.5rem] transition-all duration-300 ${isAdded ? 'bg-green-500 hover:bg-green-600 shadow-green-100/50' : 'shadow-primary/20'}`}
                            onClick={handleAddToCart}
                        >
                            {isAdded ? (
                                <>
                                    <CheckCircle className="mr-3 h-5 w-5" />
                                    Added to Cart
                                </>
                            ) : (
                                <>
                                    <ShoppingBag className="mr-3 h-5 w-5" />
                                    Add to Cart
                                </>
                            )}
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
