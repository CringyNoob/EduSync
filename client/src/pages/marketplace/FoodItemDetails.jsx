import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Heart, MessageCircle, Share2, Shield, MapPin, Clock,
    CheckCircle, ShoppingBag, Minus, Plus, Store, Star, Utensils
} from 'lucide-react';
import Button from '../../components/Button';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import marketplaceService from '../../services/marketplaceService';
import { ChatWithVendorButton } from '../../components/Chat/ChatButton';

const FoodItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, cartItems, updateQuantity } = useCart();
    const { user } = useAuth();
    
    const [product, setProduct] = useState(null);
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isSaved, setIsSaved] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    // Check if item is already in cart
    const cartItem = cartItems.find(item => item.id === id);
    const currentQuantity = cartItem ? cartItem.quantity : 0;

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await marketplaceService.getProductById(id);
                const productData = response.product || response.data || response;
                
                if (!productData || !productData.id) {
                    throw new Error('Product not found');
                }

                setProduct({
                    id: productData.id,
                    title: productData.name || productData.title,
                    price: productData.price,
                    category: productData.category || 'Food',
                    description: productData.description,
                    image: productData.image_url || productData.image,
                    is_available: productData.is_available !== false,
                    vendor_id: productData.vendor_id
                });

                // Fetch vendor info
                if (productData.vendor_id) {
                    const vendorRes = await marketplaceService.getVendorById(productData.vendor_id);
                    const vendorData = vendorRes.vendor || vendorRes;
                    setVendor({
                        id: vendorData.id,
                        owner_id: vendorData.owner_id, // User UUID for chat
                        name: vendorData.name,
                        logo: vendorData.logo_url,
                        rating: 4.5,
                        is_active: vendorData.is_active
                    });
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError(err.message || 'Failed to load product');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!product.is_available) return;
        
        for (let i = 0; i < quantity; i++) {
            addToCart({
                ...product,
                section: 'Foods',
                seller: vendor?.name,
                vendorId: vendor?.id
            });
        }
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleContactVendor = () => {
        if (vendor) {
            navigate(`/chat?vendor=${vendor.id}&name=${encodeURIComponent(vendor.name)}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center max-w-md p-8">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Shield size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-500 mb-8">{error || 'This product could not be found'}</p>
                    <Button onClick={() => navigate('/marketplace/foods')} className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600">
                        Back to Food Market
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen p-6 font-sans pb-32">
            {/* Background */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-orange-100/30 rounded-full blur-[80px]"></div>
                <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-red-100/30 rounded-full blur-[60px]"></div>
            </div>

            {/* Navigation Bar */}
            <div className="max-w-6xl mx-auto px-4 mb-8 flex items-center justify-between">
                <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2 rounded-2xl border-gray-100 shadow-sm bg-white px-5">
                    <ArrowLeft size={20} />
                    Back
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl shadow-sm bg-white"><Share2 size={20} /></Button>
                    <button
                        className={`p-2.5 rounded-xl border shadow-sm transition-all ${isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-100 text-gray-400 hover:text-red-500'}`}
                        onClick={() => setIsSaved(!isSaved)}
                    >
                        <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                {/* Image Section */}
                <div className="space-y-4">
                    <div className="aspect-square w-full rounded-[3rem] shadow-2xl overflow-hidden border border-white/60 relative group bg-orange-50 flex items-center justify-center">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <Utensils size={120} className="text-orange-200" />
                        )}
                        {!product.is_available && (
                            <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                                <span className="bg-red-500 text-white px-6 py-3 rounded-2xl text-lg font-black">Sold Out</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col pt-2 text-left">
                    <div className="mb-8 border-b border-gray-100 pb-8">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-wide mb-4">
                            {product.category}
                        </span>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-2xl">
                                {product.title}
                            </h1>
                            <div className="text-left sm:text-right flex flex-col items-start sm:items-end min-w-fit">
                                <div className="text-3xl md:text-4xl font-black text-orange-500 tracking-tight">৳{product.price}</div>
                                <div className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Per Item</div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-sm mb-6">
                        <h3 className="text-xs font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Description</h3>
                        <p className="text-gray-600 leading-relaxed text-lg font-medium">
                            {product.description || 'No description available'}
                        </p>
                    </div>

                    {/* Vendor Card */}
                    {vendor && (
                        <div 
                            onClick={() => navigate(`/marketplace/vendor/${vendor.id}`)}
                            className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white shadow-sm mb-6 flex items-center gap-5 group hover:border-orange-200 transition-all cursor-pointer"
                        >
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-100 transition-transform group-hover:scale-110 overflow-hidden">
                                {vendor.logo ? (
                                    <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
                                ) : (
                                    vendor.name.charAt(0)
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-black text-gray-900">{vendor.name}</h3>
                                <div className="text-[10px] text-gray-400 font-bold flex items-center gap-2 uppercase tracking-widest mt-0.5">
                                    <span className="flex items-center gap-1 text-yellow-500">⭐ {vendor.rating} Rating</span>
                                    <span>•</span>
                                    <span className={`flex items-center gap-1 ${vendor.is_active ? 'text-green-500' : 'text-red-500'}`}>
                                        {vendor.is_active ? 'Open Now' : 'Closed'}
                                    </span>
                                </div>
                            </div>
                            <Store size={20} className="text-gray-300" />
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-sm mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Quantity</h3>
                                {currentQuantity > 0 && (
                                    <p className="text-[10px] text-orange-500 font-bold mt-1">{currentQuantity} already in cart</p>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="h-12 w-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    <Minus size={20} />
                                </button>
                                <span className="text-2xl font-black w-12 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="h-12 w-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-gray-500 font-bold">Total</span>
                            <span className="text-2xl font-black text-orange-500">৳{(parseFloat(product.price || 0) * quantity).toFixed(0)}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto flex gap-4">
                        <Button
                            className={`flex-[2] py-6 text-lg shadow-xl hover:-translate-y-1 rounded-[1.5rem] transition-all duration-300 ${
                                isAdded 
                                    ? 'bg-green-500 hover:bg-green-600 shadow-green-100' 
                                    : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
                            }`}
                            onClick={handleAddToCart}
                            disabled={!product.is_available}
                        >
                            {isAdded ? (
                                <>
                                    <CheckCircle className="mr-3 h-5 w-5" />
                                    Added to Cart!
                                </>
                            ) : (
                                <>
                                    <ShoppingBag className="mr-3 h-5 w-5" />
                                    Add {quantity > 1 ? `${quantity} Items` : 'to Cart'}
                                </>
                            )}
                        </Button>
                        {vendor && vendor.owner_id && vendor.owner_id !== user?.id && (
                            <ChatWithVendorButton
                                vendorId={vendor.owner_id}
                                vendorName={vendor.name}
                                productId={product.id}
                                className="flex-1 py-6 text-lg border-orange-200 bg-white text-orange-500 hover:bg-orange-50 rounded-[1.5rem]"
                                variant="outline"
                            >
                                <MessageCircle className="mr-3 h-5 w-5" />
                                Chat
                            </ChatWithVendorButton>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodItemDetails;
