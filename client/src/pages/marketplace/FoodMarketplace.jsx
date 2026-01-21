import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, ShoppingBag, MessageCircle,
    ArrowLeft, Store, MapPin, Star, ChevronRight,
    Clock, Ticket, Flame, Percent, Utensils, Coffee,
    Sparkles, X, CheckCircle, Package
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import marketplaceService from '../../services/marketplaceService';
import Button from '../../components/Button';

// --- UI Components ---

const OfferBanner = ({ title, desc, gradient, icon: Icon }) => (
    <div className={`min-w-[300px] h-40 rounded-[2rem] p-6 relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] shadow-lg shadow-gray-200/20 text-left`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
            <Icon size={120} />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-between text-white">
            <div>
                <h4 className="text-xl font-black leading-tight">{title}</h4>
                <p className="text-xs font-bold opacity-80 mt-1">{desc}</p>
            </div>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit border border-white/20 transition-all">
                Claim Now
            </button>
        </div>
    </div>
);

const VoucherCard = ({ title, code, discount }) => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-dashed border-orange-300 p-4 rounded-2xl flex items-center justify-between group hover:border-orange-500 transition-all shadow-sm text-left">
        <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Ticket size={24} />
            </div>
            <div>
                <h5 className="font-black text-sm text-gray-900 dark:text-white">{title}</h5>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Code: <span className="text-orange-500">{code}</span></p>
            </div>
        </div>
        <div className="text-right">
            <div className="text-lg font-black text-orange-500 leading-none">{discount}</div>
            <div className="text-[8px] text-gray-400 font-black uppercase">Voucher</div>
        </div>
    </div>
);

const ShopCard = ({ shop, onClick }) => (
    <div
        onClick={onClick}
        className="group relative bg-white dark:bg-gray-800 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-[2.5rem] p-6 text-center space-y-4 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden"
    >
        {shop.isNew && (
            <div className="absolute top-4 right-4 z-20">
                <div className="bg-orange-500 text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-lg flex items-center gap-1.5">
                    <Flame size={12} /> NEW
                </div>
            </div>
        )}

        {!shop.is_active && (
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-30 rounded-[2.5rem] flex items-center justify-center">
                <span className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-black">Currently Closed</span>
            </div>
        )}

        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Utensils size={80} />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-[1.5rem] bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 p-0.5 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <div className="h-full w-full rounded-[1.4rem] bg-white flex items-center justify-center overflow-hidden">
                    {shop.image ? (
                        <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-orange-500 to-red-500">
                            {shop.name.charAt(0)}
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-orange-500 transition-colors">
                    {shop.name}
                </h3>
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <MapPin size={12} className="text-orange-500" />
                    {shop.location}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-50 text-yellow-600 text-[10px] font-black">
                    <Star size={10} fill="currentColor" /> {shop.rating}
                </div>
                <div className={`text-[10px] font-black uppercase tracking-tight px-2 py-1 rounded-lg ${shop.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {shop.is_active ? 'Open Now' : 'Closed'}
                </div>
            </div>

            <Button className="w-full mt-2 rounded-2xl bg-orange-500 hover:bg-orange-600 opacity-100 transition-all duration-300">
                View Menu
            </Button>
        </div>
    </div>
);

const ProductCard = ({ product, onClick, onAddToCart }) => (
    <div className="group relative bg-white dark:bg-gray-800 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left">
        {/* Image Section */}
        <div className="h-40 w-full bg-orange-50 dark:bg-gray-700 p-4 flex items-center justify-center relative overflow-hidden">
            {product.image ? (
                <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                    onClick={onClick}
                />
            ) : (
                <Utensils size={48} className="text-orange-200" />
            )}
            {!product.is_available && (
                <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold">Sold Out</span>
                </div>
            )}
        </div>

        {/* Floating Price Tag */}
        <div className="absolute top-2 left-2">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-gray-900 dark:text-white shadow-sm border border-white/50 dark:border-gray-700/50">
                ৳{product.price}
            </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">{product.category}</span>
            </div>
            <h3 
                className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-orange-500 transition-colors cursor-pointer"
                onClick={onClick}
            >
                {product.title}
            </h3>
            
            {/* Quick Add Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                }}
                disabled={!product.is_available}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
                <ShoppingBag size={14} />
                {product.is_available ? 'Add to Cart' : 'Unavailable'}
            </button>
        </div>
    </div>
);

const FoodMarketplace = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, addToCart, cartCount } = useCart();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedShop, setSelectedShop] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');

    // API State
    const [vendors, setVendors] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch food vendors
    useEffect(() => {
        const fetchVendors = async () => {
            setLoading(true);
            try {
                const response = await marketplaceService.getVendors('FOOD_VENDOR');
                setVendors(response.vendors || []);
            } catch (err) {
                console.error('Error fetching vendors:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, []);

    // Fetch products when shop is selected
    useEffect(() => {
        if (selectedShop) {
            const fetchProducts = async () => {
                setLoading(true);
                try {
                    const response = await marketplaceService.getVendorById(selectedShop.id);
                    const productsList = response.products || response.vendor?.products || [];
                    setProducts(productsList);
                } catch (err) {
                    console.error('Error fetching products:', err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchProducts();
        }
    }, [selectedShop]);

    // Map vendors to shop format
    const shops = useMemo(() => {
        return vendors.map(vendor => ({
            id: vendor.id,
            name: vendor.name,
            location: 'Campus',
            rating: 4.5,
            image: vendor.logo_url,
            is_active: vendor.is_active,
            isNew: false,
            description: vendor.description
        }));
    }, [vendors]);

    // Map products to display format
    const displayProducts = useMemo(() => {
        return products.map(product => ({
            id: product.id,
            title: product.name,
            price: product.price,
            category: product.category || 'Food',
            image: product.image_url || product.image,
            is_available: product.is_available !== false,
            vendor_id: product.vendor_id,
            vendor_name: selectedShop?.name,
            description: product.description
        }));
    }, [products, selectedShop]);

    // Filtered shops
    const filteredShops = useMemo(() => {
        return shops.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, shops]);

    // Filtered products
    const filteredProducts = useMemo(() => {
        return displayProducts.filter(p => {
            const matchesCategory = activeFilter === 'All' || p.category === activeFilter;
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch && p.is_available;
        });
    }, [displayProducts, activeFilter, searchQuery]);

    // Get unique categories from products
    const categories = useMemo(() => {
        const cats = [...new Set(displayProducts.map(p => p.category))];
        return cats;
    }, [displayProducts]);

    const handleAddToCart = (product) => {
        addToCart({
            ...product,
            section: 'Foods',
            seller: selectedShop?.name,
            vendorId: selectedShop?.id
        });
    };

    const handleContactVendor = () => {
        if (selectedShop) {
            navigate(`/chat?vendor=${selectedShop.id}&name=${encodeURIComponent(selectedShop.name)}`);
        }
    };

    // Get cart items for current vendor
    const vendorCartItems = cartItems.filter(item => item.vendorId === selectedShop?.id);
    const vendorCartTotal = vendorCartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    const offers = [
        { title: "Term End Feast", desc: "Get 30% off on all meal preps.", gradient: "from-orange-400 to-red-500", icon: Sparkles },
        { title: "Study Fuel", desc: "Coffee & Snacks BOGO on Mondays.", gradient: "from-amber-400 to-orange-600", icon: Coffee },
        { title: "Dinner Deal", desc: "Groups of 4+ get 20% off.", gradient: "from-red-400 to-rose-600", icon: Utensils }
    ];

    const vouchers = [
        { title: "Canteen Cash", code: "CANTEEN5", discount: "৳500 OFF" },
        { title: "Snack Saver", code: "SNACK20", discount: "20% OFF" }
    ];

    return (
        <div className="relative min-h-screen p-3 md:p-5 space-y-6 font-sans">
            {/* Background */}
            <div className="fixed inset-0 -z-30 pointer-events-none">
                <div className="absolute top-0 left-[-100px] w-[600px] h-[800px] bg-gradient-to-br from-orange-100/50 via-red-100/50 to-transparent rounded-full mix-blend-multiply blur-[80px]"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-bl from-pink-100/50 to-orange-100/50 rounded-full mix-blend-multiply blur-[80px]"></div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => selectedShop ? setSelectedShop(null) : navigate('/marketplace')}
                            className="p-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-orange-500 hover:text-orange-500 transition-all group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className={`text-2xl font-black ${selectedShop ? 'text-gray-400 hover:text-orange-500 cursor-pointer' : 'text-gray-900 dark:text-white'}`}
                                    onClick={() => selectedShop && setSelectedShop(null)}>
                                    Food Market
                                </h1>
                                {selectedShop && (
                                    <>
                                        <ChevronRight className="text-gray-300" size={20} />
                                        <h1 className="text-2xl font-black text-orange-500">{selectedShop.name}</h1>
                                    </>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                {selectedShop ? 'Pre-order your favorites' : 'Campus food vendors & restaurants'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedShop && (
                            <Button
                                variant="outline"
                                onClick={handleContactVendor}
                                className="rounded-2xl px-4 border-orange-200 text-orange-500 hover:bg-orange-50"
                            >
                                <MessageCircle size={18} className="mr-2" />
                                Chat
                            </Button>
                        )}
                        <div className="relative cursor-pointer" onClick={() => navigate('/marketplace/foods/cart')}>
                            <Button variant="outline" size="icon" className="rounded-xl shadow-sm bg-white hover:text-orange-500 p-3">
                                <ShoppingBag size={24} />
                            </Button>
                            {cartCount > 0 && (
                                <div className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                    {cartCount}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[2rem] p-4 border border-white shadow-sm">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-all" />
                        <input
                            type="text"
                            placeholder={selectedShop ? `Search items in ${selectedShop.name}...` : "Search food vendors..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border-2 border-transparent focus:border-orange-200 focus:bg-white focus:outline-none transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                )}

                {/* Shop View (No shop selected) */}
                {!selectedShop && !loading && (
                    <div className="space-y-10">
                        {/* Offers */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-xl text-orange-500">
                                    <Percent size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Limited Time Offers</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Flash deals & discounts</p>
                                </div>
                            </div>
                            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                                {offers.map((offer, idx) => (
                                    <OfferBanner key={idx} {...offer} />
                                ))}
                            </div>
                        </div>

                        {/* Vouchers */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {vouchers.map((voucher, idx) => (
                                <VoucherCard key={idx} {...voucher} />
                            ))}
                        </div>

                        {/* All Shops */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-xl text-gray-500">
                                    <Store size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Food Vendors</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{filteredShops.length} available</p>
                                </div>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredShops.map(shop => (
                                    <ShopCard
                                        key={shop.id}
                                        shop={shop}
                                        onClick={() => shop.is_active && setSelectedShop(shop)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Products View (Shop selected) */}
                {selectedShop && !loading && (
                    <div className="space-y-6">
                        {/* Category Filter */}
                        <div className="p-3 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white">
                            <div className="flex flex-wrap gap-2 p-1">
                                <button
                                    onClick={() => setActiveFilter('All')}
                                    className={`px-5 py-2.5 rounded-2xl text-[10px] font-black transition-all border-2 ${activeFilter === 'All' 
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200' 
                                        : 'bg-white text-gray-400 border-gray-100 hover:border-orange-300'}`}
                                >
                                    ALL
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveFilter(cat)}
                                        className={`px-5 py-2.5 rounded-2xl text-[10px] font-black transition-all border-2 ${activeFilter === cat 
                                            ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200' 
                                            : 'bg-white text-gray-400 border-gray-100 hover:border-orange-300'}`}
                                    >
                                        {cat.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onClick={() => navigate(`/marketplace/foods/${product.id}`)}
                                        onAddToCart={handleAddToCart}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center bg-white/40 rounded-[3rem] border-2 border-dashed border-gray-200">
                                    <Package size={48} className="mx-auto text-gray-200 mb-4" />
                                    <h3 className="text-xl font-black text-gray-900">No items found</h3>
                                    <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filter.</p>
                                </div>
                            )}
                        </div>

                        {/* Floating Cart Summary */}
                        {vendorCartItems.length > 0 && (
                            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                                <div 
                                    onClick={() => navigate('/marketplace/foods/cart')}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-orange-500/30 flex items-center gap-6 cursor-pointer transition-all hover:-translate-y-1"
                                >
                                    <div className="flex items-center gap-3">
                                        <ShoppingBag size={24} />
                                        <span className="font-black">{vendorCartItems.length} items</span>
                                    </div>
                                    <div className="h-8 w-px bg-white/30"></div>
                                    <div className="font-black text-lg">৳{vendorCartTotal.toFixed(0)}</div>
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodMarketplace;
