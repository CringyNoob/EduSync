import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Filter, ShoppingBag, Plus, Tag, DollarSign, MessageCircle, Heart,
    Image as ImageIcon, X, Trash2, UploadCloud, BookOpen, Monitor, Armchair,
    Shirt, Zap, Grid, LayoutGrid, Sparkles, Utensils, Box, ArrowLeft,
    PackageCheck, Coffee, Loader2
} from 'lucide-react';
import marketplaceService from '../../services/marketplaceService';

// --- UI Components ---

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseStyles = "relative overflow-hidden inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 focus:ring-primary border border-transparent",
        secondary: "bg-secondary text-white hover:bg-secondary-light hover:shadow-lg hover:shadow-secondary/30 focus:ring-secondary border border-transparent",
        outline: "bg-white/50 backdrop-blur-sm text-text-main border-2 border-gray-200 hover:border-primary hover:text-primary hover:bg-white focus:ring-gray-200",
        ghost: "bg-transparent text-gray-500 hover:bg-primary/10 hover:text-primary",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-transparent"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
        icon: "p-2",
        iconSm: "p-1.5",
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

const MarketplaceCard = ({ product, onClick }) => {
    const isUnavailable = product.status === 'SOLD' || product.status === 'UNAVAILABLE';
    const handleClick = () => {
        // Prevent navigation for sold/unavailable items
        if (!isUnavailable) {
            onClick();
        }
    };
    
    return (
        <div
            onClick={handleClick}
            className={`group relative bg-white backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all duration-300 ${isUnavailable ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'}`}
        >
            {/* SOLD/UNAVAILABLE Overlay Banner */}
            {product.status === 'SOLD' && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 to-gray-900/40 z-20 flex items-center justify-center pointer-events-none">
                    <div className="bg-red-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg transform -rotate-12">
                        SOLD OUT
                    </div>
                </div>
            )}
            {product.status === 'UNAVAILABLE' && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 to-gray-900/40 z-20 flex items-center justify-center pointer-events-none">
                    <div className="bg-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg transform -rotate-12">
                        UNAVAILABLE
                    </div>
                </div>
            )}

            {/* Image Section - Compacted */}
            <div className={`h-40 w-full ${product.bg} p-4 flex items-center justify-center relative overflow-hidden`}>
            {/* Overlay Actions */}
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <button className="p-2 bg-white/90 backdrop-blur-md rounded-full text-pink-500 shadow-sm hover:scale-110 transition-transform">
                    <Heart size={16} fill="currentColor" className="opacity-50 hover:opacity-100" />
                </button>
            </div>

            {/* Product Image Placeholder */}
            <div className="relative z-0 group-hover:scale-110 transition-transform duration-500">
                <product.icon className="h-16 w-16 text-gray-900/10" />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* Floating Price Tag */}
        <div className="absolute top-2 left-2">
            <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm border border-white/50">
                ${product.price}
            </div>
        </div>

        {/* Content Section - Compacted */}
        <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-600 uppercase tracking-wide">
                    {product.category}
                </span>
                <span className="text-[10px] text-gray-400 font-medium ml-auto flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {product.timeAgo}
                </span>
            </div>

            <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {product.title}
            </h3>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                    {product.seller.charAt(0)}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-medium">Seller</span>
                    <span className="text-xs text-gray-700 font-bold leading-none truncate">{product.seller}</span>
                </div>
                <Button size="iconSm" variant="ghost" className="ml-auto text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full p-1.5">
                    <MessageCircle size={16} />
                </Button>
            </div>
        </div>
        </div>
    );
};

const CategorySelectionCard = ({ title, description, icon: Icon, colorClass, gradient, onClick }) => (
    <div
        onClick={onClick}
        className={`relative overflow-hidden group cursor-pointer rounded-3xl p-6 h-[250px] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl border border-white/40 ${colorClass}`}
    >
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>

        {/* Decorative Circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

        <div className="relative z-10 flex flex-col h-full items-center text-center justify-center gap-4">
            <div className="p-4 rounded-xl bg-white shadow-lg shadow-gray-200/20 group-hover:scale-110 transition-transform duration-500">
                <Icon size={32} className={colorClass.replace('bg-', 'text-')} />
            </div>

            <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed px-4">{description}</p>
            </div>

            <div className={`mt-auto px-4 py-1.5 rounded-full text-xs font-bold bg-white shadow-sm opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ${colorClass.replace('bg-', 'text-')}`}>
                Browse →
            </div>
        </div>
    </div>
);

const MarketplaceHome = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSection, setSelectedSection] = useState(null); // 'Foods', 'Pre-Owned', 'New Items'
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filter categories based on selection
    const filters = {
        'Foods': ['Snacks', 'Homemade', 'Beverages', 'Meal Prep'],
        'Pre-Owned': ['TEXTBOOKS', 'ELECTRONICS', 'FURNITURE', 'CLOTHING', 'SPORTS'],
        'Shops': ['Stationery', 'Dorm Essentials', 'Tech Accessories', 'Merch']
    };

    const [activeFilter, setActiveFilter] = useState('All');

    // Fetch products when section changes
    useEffect(() => {
        const fetchProducts = async () => {
            if (!selectedSection) return;

            try {
                setLoading(true);
                setError(null);
                let data = [];

                if (selectedSection === 'Pre-Owned') {
                    // Fetch pre-owned listings
                    const response = await marketplaceService.getPreownedListings();
                    if (response.success) {
                        // Transform API data to match UI structure
                        data = response.listings.map(listing => ({
                            id: listing.id,
                            section: 'Pre-Owned',
                            title: listing.title,
                            price: parseFloat(listing.price).toFixed(2),
                            category: listing.category,
                            bg: getCategoryBackground(listing.category),
                            icon: getCategoryIcon(listing.category),
                            seller: listing.seller_name,
                            timeAgo: formatTimeAgo(listing.created_at),
                            status: listing.status
                        }));
                    }
                } else if (selectedSection === 'Foods') {
                    // Fetch food vendors
                    const response = await marketplaceService.getVendors('FOOD_VENDOR');
                    if (response.success) {
                        // Show all vendors with is_active status
                        data = response.vendors.map(vendor => ({
                            id: vendor.id,
                            section: 'Foods',
                            title: vendor.name,
                            price: '0.00', // Placeholder
                            category: 'Food Vendor',
                            bg: 'bg-orange-50',
                            icon: Utensils,
                            seller: vendor.name,
                            timeAgo: formatTimeAgo(vendor.created_at),
                            isVendor: true,
                            isActive: vendor.is_active,
                            status: vendor.is_active ? 'AVAILABLE' : 'UNAVAILABLE'
                        }));
                    }
                } else if (selectedSection === 'New Items') {
                    // Fetch startup vendors
                    const response = await marketplaceService.getVendors('STARTUP');
                    if (response.success) {
                        data = response.vendors.map(vendor => ({
                            id: vendor.id,
                            section: 'New Items',
                            title: vendor.name,
                            price: '0.00', // Placeholder
                            category: 'Startup',
                            bg: 'bg-purple-50',
                            icon: PackageCheck,
                            seller: vendor.name,
                            timeAgo: formatTimeAgo(vendor.created_at),
                            isVendor: true,
                            isActive: vendor.is_active,
                            status: vendor.is_active ? 'AVAILABLE' : 'UNAVAILABLE'
                        }));
                    }
                }

                setProducts(data);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load items. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [selectedSection]);

    // Helper functions
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

    const getCategoryBackground = (category) => {
        const backgrounds = {
            'TEXTBOOKS': 'bg-indigo-50',
            'ELECTRONICS': 'bg-gray-50',
            'FURNITURE': 'bg-yellow-50',
            'CLOTHING': 'bg-pink-50',
            'SPORTS': 'bg-green-50',
        };
        return backgrounds[category] || 'bg-gray-50';
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'TEXTBOOKS': BookOpen,
            'ELECTRONICS': Monitor,
            'FURNITURE': Armchair,
            'CLOTHING': Shirt,
            'SPORTS': Zap,
        };
        return icons[category] || Box;
    };

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeFilter === 'All' || p.category === activeFilter;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="relative min-h-screen p-3 md:p-5 space-y-6 font-sans">
            {/* --- Identical Dashboard Background --- */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                {/* Linked Gradient from Sidebar (Left) */}
                <div className="absolute top-0 left-[-100px] w-[600px] h-[800px] bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent rounded-full mix-blend-multiply blur-[80px]"></div>

                {/* Dynamic Floating Blobs */}
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-bl from-accent/20 to-primary/10 rounded-full mix-blend-multiply blur-[80px] animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-gradient-to-tr from-secondary/10 to-accent/20 rounded-full mix-blend-multiply blur-[80px] animate-blob animation-delay-2000"></div>

                {/* Noise Texture for Finish */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
            </div>

            {/* Selection Screen (Main View) */}
            {!selectedSection && (
                <div className="max-w-6xl mx-auto space-y-8 py-4">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary to-gray-800 tracking-tight leading-tight">
                            Campus Marketplace
                        </h1>
                        <p className="text-base text-gray-500 max-w-xl mx-auto">
                            The central hub for all your campus needs. Choose a category.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
                        <CategorySelectionCard
                            title="Foods"
                            description="Snacks, homemade meals, beverages."
                            icon={Utensils}
                            colorClass="text-orange-500"
                            gradient="from-orange-400 to-red-500"
                            onClick={() => setSelectedSection('Foods')}
                        />
                        <CategorySelectionCard
                            title="Pre-Owned"
                            description="Textbooks, electronics, furniture."
                            icon={Box}
                            colorClass="text-indigo-500"
                            gradient="from-indigo-400 to-purple-600"
                            onClick={() => setSelectedSection('Pre-Owned')}
                        />
                        <CategorySelectionCard
                            title="Shops"
                            description="Brand new stationery, merch."
                            icon={PackageCheck}
                            colorClass="text-emerald-500"
                            gradient="from-emerald-400 to-teal-600"
                            onClick={() => setSelectedSection('New Items')}
                        />
                    </div>
                </div>
            )}

            {/* Specific Category View */}
            {selectedSection && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    {/* Compact Header */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedSection(null)}
                            className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-all group"
                        >
                            <ArrowLeft size={18} className="text-gray-500 group-hover:text-primary" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-none">{selectedSection}</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Browsing listings</p>
                        </div>
                    </div>

                    {/* Compact Search & Filters */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder={`Search in ${selectedSection}...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium"
                                />
                            </div>
                            <Button size="sm" className="shadow-lg shadow-primary/20 h-[42px]">
                                <Plus className="mr-1.5 h-4 w-4" />
                                Sell Item
                            </Button>
                        </div>

                        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
                            <button
                                onClick={() => setActiveFilter('All')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeFilter === 'All' ? 'bg-primary text-white shadow-md' : 'bg-gray-100/50 text-gray-600 hover:bg-white hover:shadow-sm'}`}
                            >
                                All
                            </button>
                            {filters[selectedSection]?.map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeFilter === filter ? 'bg-primary text-white shadow-md' : 'bg-gray-100/50 text-gray-600 hover:bg-white hover:shadow-sm'}`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Compact Product Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {loading ? (
                            <div className="col-span-full py-12 text-center">
                                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-3" />
                                <p className="text-gray-500">Loading items...</p>
                            </div>
                        ) : error ? (
                            <div className="col-span-full py-12 text-center">
                                <div className="inline-block p-4 rounded-2xl bg-red-50 mb-3">
                                    <X size={32} className="text-red-400" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900 mb-2">{error}</h3>
                                <button 
                                    onClick={() => setSelectedSection(null)}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Go back
                                </button>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <MarketplaceCard
                                    key={product.id}
                                    product={product}
                                    onClick={() => navigate(`/marketplace/${product.id}`)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center">
                                <div className="inline-block p-4 rounded-2xl bg-gray-50 mb-3">
                                    <Search size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900">No items found</h3>
                                <p className="text-xs text-gray-500 mt-1">Try adjusting your filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketplaceHome;
