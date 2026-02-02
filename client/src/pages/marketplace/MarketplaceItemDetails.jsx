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
                    const listing = response.listing || response.data || response;
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
                        images: listing.images || (listing.image ? [listing.image] : (listing.image_url ? [listing.image_url] : [])),
                        status: listing.status
                    };
                } catch (err) {
                    // If not preowned, try as regular product
                    const response = await marketplaceService.getProductById(id);
                    const productObj = response.product || response.data || response;

                    if (!productObj || !productObj.id) {
                        throw new Error("Product data not found");
                    }

                    productData = {
                        id: productObj.id,
                        title: productObj.name || productObj.title,
                        price: productObj.price,
                        category: productObj.vendor?.name || productObj.category || 'Product',
                        description: productObj.description,
                        seller: productObj.vendor?.name || productObj.seller_name || 'Vendor',
                        location: 'Campus',
                        postedAt: 'Available',
                        sellerRating: 4.5,
                        section: 'Shops',
                        image: productObj.image_url || productObj.image || (productObj.images && productObj.images[0]),
                        is_available: productObj.is_available !== false
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
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
                <div className="text-center max-w-md p-8">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Shield size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Failed to load product</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">{error || 'Product not found'}</p>
                    <Button onClick={() => navigate('/marketplace')} className="w-full py-4 rounded-2xl">Back to Marketplace</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen p-6 font-sans pb-24 text-left">
            {/* Background elements */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-custom-celadon/20 dark:bg-custom-celadon/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px]"></div>
                <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-custom-cotton-candy/20 dark:bg-custom-cotton-candy/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[60px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-20"></div>
            </div>

            {/* Navigation Bar */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 mb-8 flex items-center justify-between">
                <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2 rounded-2xl border-gray-100 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 dark:text-gray-200 px-5">
                    <ArrowLeft size={20} />
                    Back
                </Button>
                <div className="flex gap-2">
                    <div className="relative mr-4 cursor-pointer group" onClick={() => navigate('/marketplace/cart')}>
                        <Button variant="outline" size="icon" className="rounded-xl shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 hover:text-primary transition-colors">
                            <ShoppingBag size={20} className="dark:text-gray-200" />
                        </Button>
                        {cartCount > 0 && (
                            <div className="absolute -top-1.5 -right-1.5 h-6 w-6 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800">
                                {cartCount}
                            </div>
                        )}
                    </div>
                    <Button variant="outline" size="icon" className="rounded-xl shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"><Share2 size={20} /></Button>
                    <Button variant="outline" size="icon" className="rounded-xl shadow-sm hover:text-red-500 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"><Flag size={20} /></Button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                {/* Image Section */}
                <div className="space-y-4">
                    <div className="aspect-square w-full rounded-[3rem] shadow-2xl overflow-hidden border border-white/60 dark:border-gray-700/60 relative group bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
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
                            <ShoppingBag size={120} className="text-gray-300 dark:text-gray-700 transition-transform duration-700 group-hover:scale-110" />
                        )}
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col pt-2 text-left">
                    <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-8 text-left">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wide mb-4">
                            {product.category}
                        </span>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-left">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight text-left leading-tight max-w-2xl">
                                {product.title}
                            </h1>
                            <div className="text-left sm:text-right flex flex-col items-start sm:items-end min-w-fit">
                                <div className="text-3xl md:text-4xl font-black text-primary dark:text-primary tracking-tight">৳{product.price}</div>
                                <div className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Asking Price</div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6 text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest text-left">
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700"><MapPin size={14} className="text-primary" /> {product.location}</div>
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700"><Clock size={14} className="text-primary" /> {product.postedAt}</div>
                        </div>
                    </div>

                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white dark:border-gray-700 shadow-sm mb-8 text-left">
                        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-[0.2em] text-left">Item Overview</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg font-medium text-left">
                            {product.description}
                        </p>
                    </div>

                    {/* Seller Card */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white dark:border-gray-700 shadow-sm mb-8 flex items-center gap-5 group hover:border-primary/20 transition-all text-left">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/10 transition-transform group-hover:scale-110">
                            {product.seller.charAt(0)}
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">{product.seller}</h3>
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold flex items-center gap-2 uppercase tracking-widest mt-0.5 text-left">
                                <span className="flex items-center gap-1 text-yellow-500">⭐ {product.sellerRating} Rating</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-blue-500"><CheckCircle size={14} /> Verified</span>
                            </div>
                        </div>
                        <Button variant="outline" className="rounded-xl border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200">Profile</Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto flex gap-4 text-left">
                        <Button
                            className={`flex-[2] py-6 text-lg shadow-xl hover:-translate-y-1 rounded-[1.5rem] transition-all duration-300 ${isAdded ? 'bg-green-500 hover:bg-green-600 shadow-green-100/50 dark:shadow-green-900/20' : 'shadow-primary/20 dark:shadow-primary/10'}`}
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
                        <Button variant="outline" className="flex-1 py-6 text-lg border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 rounded-[1.5rem]" onClick={handleContactSeller}>
                            <MessageCircle className="mr-3 h-5 w-5" />
                            Chat
                        </Button>
                        <button
                            className={`p-4 rounded-[1.5rem] border-2 transition-all shadow-sm ${isSaved ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-primary/20 hover:text-primary'}`}
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
