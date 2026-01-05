import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Filter, ShoppingBag, Plus, Tag, DollarSign, MessageCircle, Heart,
    Image as ImageIcon, X, Trash2, UploadCloud, BookOpen, Monitor, Armchair,
    Shirt, Zap, Grid, LayoutGrid, Sparkles, Utensils, Box, ArrowLeft,
    PackageCheck, Coffee, ArrowUpDown, ChevronDown, Store, MapPin, Star, ChevronRight,
    Clock, Ticket, Flame, Percent
} from 'lucide-react';

// --- UI Components ---

const ListingModal = ({ isOpen, onClose, section }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900">List New {section === 'Foods' ? 'Item' : section === 'Shops' ? 'Product' : 'Pre-Owned Item'}</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Fill in the details for your listing</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                                <input type="text" placeholder="e.g. Vintage Camera" className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary/30 focus:outline-none font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price ($)</label>
                                <input type="number" placeholder="25.00" className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary/30 focus:outline-none font-medium" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                            <select className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary/30 focus:outline-none font-medium appearance-none">
                                <option>Select a category</option>
                                <option>Electronics</option>
                                <option>Homemade Foods</option>
                                <option>Textbooks</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                            <textarea placeholder="Describe your item..." rows="3" className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary/30 focus:outline-none font-medium resize-none"></textarea>
                        </div>

                        <div className="border-2 border-dashed border-gray-100 rounded-3xl p-8 text-center space-y-2 hover:border-primary/30 transition-colors cursor-pointer group">
                            <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                                <UploadCloud size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Upload Images</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">PNG, JPG up to 10MB</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1 py-4 rounded-2xl" onClick={onClose}>Cancel</Button>
                        <Button className="flex-[2] py-4 rounded-2xl shadow-xl shadow-primary/20" onClick={() => {
                            alert('Listing created successfully!');
                            onClose();
                        }}>Create Listing</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OfferBanner = ({ title, desc, gradient, icon: Icon }) => (

    <div className={`min-w-[300px] h-40 rounded-[2rem] p-6 relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] shadow-lg shadow-gray-200/20`}>
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
    <div className="bg-white/80 backdrop-blur-md border border-dashed border-primary/30 p-4 rounded-2xl flex items-center justify-between group hover:border-primary transition-all shadow-sm">
        <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                <Ticket size={24} />
            </div>
            <div>
                <h5 className="font-black text-sm text-gray-900">{title}</h5>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Code: <span className="text-primary">{code}</span></p>
            </div>
        </div>
        <div className="text-right">
            <div className="text-lg font-black text-primary leading-none">{discount}</div>
            <div className="text-[8px] text-gray-400 font-black uppercase">Voucher</div>
        </div>
    </div>
);

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

const MarketplaceCard = ({ product, onClick }) => (
    <div
        onClick={onClick}
        className="group relative bg-white backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
        {/* Image Section - Compacted */}
        <div className={`h-40 w-full ${product.bg || 'bg-gray-50'} p-4 flex items-center justify-center relative overflow-hidden`}>
            {/* Product Image Placeholder */}
            {product.image ? (
                <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            ) : (
                <div className="relative z-0 group-hover:scale-110 transition-transform duration-500">
                    {product.icon && <product.icon size={48} className="text-gray-900/10" />}
                </div>
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* Floating Price Tag */}
        <div className="absolute top-2 left-2">
            <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm border border-white/50">
                ${product.price}
            </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{product.category}</span>
                <span className="text-[10px] font-bold text-gray-400">{product.timeAgo}</span>
            </div>
            <h3 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {product.title}
            </h3>
            <div className="flex items-center gap-1.5 pt-1 border-t border-gray-50">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                    {product.seller.charAt(0)}
                </div>
                <span className="text-[10px] font-bold text-gray-500 truncate">{product.seller}</span>
            </div>
        </div>
    </div>
);

const ShopCard = ({ shop, onClick }) => (
    <div
        onClick={onClick}
        className="group relative bg-white backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-6 text-center space-y-4 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden"
    >
        {shop.isNew && (
            <div className="absolute top-4 right-4 z-20">
                <div className="bg-accent text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-lg flex items-center gap-1.5">
                    <Flame size={12} /> NEW
                </div>
            </div>
        )}

        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Store size={80} />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-[1.5rem] bg-gradient-to-br from-primary via-secondary to-accent p-0.5 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <div className="h-full w-full rounded-[1.4rem] bg-white flex items-center justify-center overflow-hidden">
                    {shop.image ? (
                        <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-primary to-accent">
                            {shop.name.charAt(0)}
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">
                    {shop.name}
                </h3>
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <MapPin size={12} className="text-primary" />
                    {shop.location}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-50 text-yellow-600 text-[10px] font-black">
                    <Star size={10} fill="currentColor" /> {shop.rating}
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-tight">
                    {shop.itemCount} Items
                </div>
            </div>

            <Button className="w-full mt-2 rounded-2xl opacity-100 transition-all duration-300">
                Visit Shop
            </Button>
        </div>
    </div>
);

const CategorySelectionCard = ({ title, description, icon: Icon, colorClass, gradient, onClick }) => (
    <div
        onClick={onClick}
        className={`relative overflow-hidden group cursor-pointer rounded-3xl p-6 h-[250px] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl border border-white/40 bg-white`}
    >
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>

        {/* Decorative Circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-gray-100 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

        <div className="relative z-10 flex flex-col h-full items-center text-center justify-center gap-4">
            <div className={`p-4 rounded-xl bg-white shadow-lg shadow-gray-200/20 group-hover:scale-110 transition-transform duration-500 ${colorClass}`}>
                <Icon size={32} />
            </div>

            <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed px-4">{description}</p>
            </div>

            <div className={`mt-auto px-4 py-1.5 rounded-full text-xs font-bold bg-white shadow-sm opacity-100 transform translate-y-0 transition-all duration-300 border border-gray-100 ${colorClass}`}>
                Browse Catalog →
            </div>
        </div>
    </div>
);

const MarketplaceHome = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSection, setSelectedSection] = useState(null); // 'Foods', 'Pre-Owned', 'Shops'
    const [selectedShop, setSelectedShop] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [viewOrders, setViewOrders] = useState(false);
    const [viewMerchantMode, setViewMerchantMode] = useState(false);
    const [showListingModal, setShowListingModal] = useState(false);

    // Filter categories based on selection
    const filters = {
        'Foods': ['Snacks', 'Homemade', 'Beverages', 'Meal Prep', 'Others'],
        'Pre-Owned': ['Textbooks', 'Electronics', 'Research Gear', 'Furniture', 'Clothing', 'Sports', 'Exam Essentials', 'Others'],
        'Shops': ['Stationery', 'Dorm Essentials', 'Tech Accessories', 'Merch', 'Others']
    };

    const sectionOffers = {
        'Foods': [
            { title: "Term End Feast", desc: "Get 30% off on all meal preps.", gradient: "from-orange-400 to-red-500", icon: Sparkles },
            { title: "Study Fuel", desc: "Coffee & Snacks BOGO on Mondays.", gradient: "from-amber-400 to-orange-600", icon: Coffee },
            { title: "Dinner Deal", desc: "Groups of 4+ get 20% off canteen meals.", gradient: "from-red-400 to-rose-600", icon: Utensils }
        ],
        'Shops': [
            { title: "Tech Week", desc: "10% off on all student tech accessories.", gradient: "from-blue-400 to-indigo-600", icon: Zap },
            { title: "Stationery Sale", desc: "Buy 1 Get 1 on all notebooks.", gradient: "from-emerald-400 to-teal-600", icon: BookOpen },
            { title: "Merch Drop", desc: "Limited edition hoodies now available.", gradient: "from-purple-400 to-fuchsia-600", icon: Shirt }
        ]
    };

    const sectionVouchers = {
        'Foods': [
            { title: "Canteen Cash", code: "CANTEEN5", discount: "-$5.00" },
            { title: "Snack Saver", code: "SNACK20", discount: "-20%" }
        ],
        'Shops': [
            { title: "Tech Credit", code: "TECH10", discount: "-10%" },
            { title: "Store Bonus", code: "SYNC25", discount: "+$2.50" }
        ]
    };

    const [orders, setOrders] = useState([
        { id: 'ORD1', item: 'Calculus Textbook', status: 'In Transit', price: '45.00', date: 'Oct 12', image: null, type: 'Pre-Owned' },
        { id: 'ORD2', item: 'Chicken Teriyaki Bowl', status: 'Preparing', price: '8.50', date: 'Today', shop: 'Campus Canteen', type: 'Foods' },
        { id: 'ORD3', item: 'USB-C Adapter', status: 'Delivered', price: '12.99', date: 'Yesterday', shop: 'Tech Hub', type: 'Shops' }
    ]);

    const merchantOrders = [
        { id: 'M-101', item: 'Homemade Chocolate Chip Cookies', customer: 'Sarah W.', time: '10 mins ago', status: 'New', price: '12.00', location: 'Dorm C Lounge', type: 'Foods' },
        { id: 'M-102', item: 'Energy Drinks Bundle', customer: 'Mike R.', time: '25 mins ago', status: 'Preparing', price: '15.00', location: 'Lab 4', type: 'Foods' },
        { id: 'M-103', item: 'Blue Fountain Pen', customer: 'James L.', time: '1h ago', status: 'Shipped', price: '5.50', location: 'Main Library', type: 'Shops' }
    ];

    const shops = [
        { id: 's1', name: "Baker's Delight", section: 'Foods', location: 'Dorm C Lounge', rating: 4.8, itemCount: 12, bg: 'bg-orange-50', image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80", deal: "Fresh Baked", isNew: false },
        { id: 's2', name: "Campus Canteen", section: 'Foods', location: 'Main Hall', rating: 4.5, itemCount: 45, bg: 'bg-blue-50', image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80", deal: "20% OFF", isNew: true },
        { id: 's3', name: "University Store", section: 'Shops', location: 'Admin Block', rating: 4.9, itemCount: 156, bg: 'bg-emerald-50', image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80", deal: "Voucher Ready", isNew: false },
        { id: 's4', name: "Tech Hub", section: 'Shops', location: 'Science Building', rating: 5.0, itemCount: 28, bg: 'bg-cyan-50', image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80", deal: "10% Student Disc.", isNew: true },
        { id: 's5', name: "Green Bean Coffee", section: 'Foods', location: 'Library Annex', rating: 4.7, itemCount: 15, bg: 'bg-emerald-50', image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80", isNew: true },
        { id: 's6', name: "Night Owl Snacks", section: 'Foods', location: 'Student Union', rating: 4.6, itemCount: 22, bg: 'bg-purple-50', image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80", isNew: false },
        { id: 's7', name: "The Stationery Spot", section: 'Shops', location: 'Arts Building', rating: 4.8, itemCount: 64, bg: 'bg-yellow-50', image: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600&q=80", isNew: false },
        { id: 's8', name: "Fanatic Sports", section: 'Shops', location: 'Gym Complex', rating: 4.7, itemCount: 32, bg: 'bg-blue-50', image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80", isNew: true }
    ];

    const products = [
        // Foods - Baker's Delight
        { id: 1, section: 'Foods', shopId: 's1', title: 'Homemade Chocolate Chip Cookies', price: '12.00', category: 'Homemade', bg: 'bg-orange-50', icon: Utensils, seller: "Baker's Delight", timeAgo: '1h ago', image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80" },
        { id: 8, section: 'Foods', shopId: 's1', title: 'Blueberry Muffin Box (4pc)', price: '10.00', category: 'Snacks', bg: 'bg-blue-50', icon: Coffee, seller: "Baker's Delight", timeAgo: '2h ago', image: "https://images.unsplash.com/photo-1587538637146-8a03ca519f4a?w=400&q=80" },

        // Foods - Campus Canteen
        { id: 2, section: 'Foods', shopId: 's2', title: 'Energy Drinks Bundle', price: '15.00', category: 'Beverages', bg: 'bg-blue-50', icon: Coffee, seller: 'Campus Canteen', timeAgo: '3h ago', image: "https://images.unsplash.com/photo-1622543953490-3b7cec1e564d?w=400&q=80" },
        { id: 9, section: 'Foods', shopId: 's2', title: 'Chicken Teriyaki Bowl', price: '8.50', category: 'Meal Prep', bg: 'bg-orange-50', icon: Utensils, seller: 'Campus Canteen', timeAgo: '30m ago', image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80" },

        // Pre-Owned
        { id: 3, section: 'Pre-Owned', title: 'Calculus Early Transcendentals', price: '45.00', category: 'Textbooks', bg: 'bg-indigo-50', icon: BookOpen, seller: 'John D.', timeAgo: '2h ago' },
        { id: 4, section: 'Pre-Owned', title: 'Sony WH-1000XM4 Noise Cancelling', price: '180.00', category: 'Electronics', bg: 'bg-gray-50', icon: Monitor, seller: 'Alex K.', timeAgo: '1d ago' },

        // Shops - University Store
        { id: 6, section: 'Shops', shopId: 's3', title: 'University Hoodie - Size L', price: '45.00', category: 'Merch', bg: 'bg-purple-50', icon: Shirt, seller: 'University Store', timeAgo: '5h ago', image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80" },
        { id: 14, section: 'Shops', shopId: 's3', title: 'Classic Baseball Cap', price: '22.00', category: 'Merch', bg: 'bg-blue-50', icon: Shirt, seller: 'University Store', timeAgo: '1h ago', image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80" },
    ];

    const filteredShops = useMemo(() => {
        if (!selectedSection || selectedSection === 'Pre-Owned') return [];
        return shops.filter(s => s.section === selectedSection && s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [selectedSection, searchQuery, shops]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSection = selectedSection ? p.section === selectedSection : true;
            const matchesShop = (selectedSection === 'Pre-Owned') || (selectedShop ? p.shopId === selectedShop.id : true);
            const matchesCategory = activeFilter === 'All' || p.category === activeFilter;
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSection && matchesShop && matchesCategory && matchesSearch;
        });
    }, [products, selectedSection, selectedShop, activeFilter, searchQuery]);

    const showShops = (selectedSection === 'Foods' || selectedSection === 'Shops') && !selectedShop;

    return (
        <div className="relative min-h-screen p-3 md:p-5 space-y-6 font-sans">
            {/* Background elements */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-0 left-[-100px] w-[600px] h-[800px] bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent rounded-full mix-blend-multiply blur-[80px]"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-bl from-accent/20 to-primary/10 rounded-full mix-blend-multiply blur-[80px] animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-gradient-to-tr from-secondary/10 to-accent/20 rounded-full mix-blend-multiply blur-[80px] animate-blob animation-delay-2000"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
            </div>

            {/* Selection Screen (Main View) */}
            {!selectedSection && (
                <div className="max-w-6xl mx-auto space-y-8 py-4">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary to-gray-800 tracking-tight leading-tight">
                            Campus Marketplace
                        </h1>
                        <p className="text-base text-gray-500 max-w-xl mx-auto font-medium">
                            Choose your marketplace experience
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <CategorySelectionCard
                            title="Foods"
                            description="Restaurants, home chefs, and snacks."
                            icon={Utensils}
                            colorClass="text-orange-500"
                            gradient="from-orange-400 to-red-500"
                            onClick={() => {
                                setSelectedSection('Foods');
                                setSelectedShop(null);
                                setActiveFilter('All');
                            }}
                        />
                        <CategorySelectionCard
                            title="Pre-Owned"
                            description="Student-to-student pre-loved items."
                            icon={Box}
                            colorClass="text-indigo-500"
                            gradient="from-indigo-400 to-purple-600"
                            onClick={() => {
                                setSelectedSection('Pre-Owned');
                                setSelectedShop(null);
                                setActiveFilter('All');
                            }}
                        />
                        <CategorySelectionCard
                            title="Shops"
                            description="Retail stores and stationery items."
                            icon={PackageCheck}
                            colorClass="text-emerald-500"
                            gradient="from-emerald-400 to-teal-600"
                            onClick={() => {
                                setSelectedSection('Shops');
                                setSelectedShop(null);
                                setActiveFilter('All');
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Shop/Item View */}
            {selectedSection && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500 max-w-7xl mx-auto text-left">
                    {/* Header with Navigation */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => {
                                    if (viewMerchantMode) setViewMerchantMode(false);
                                    else if (viewOrders) setViewOrders(false);
                                    else if (selectedShop) setSelectedShop(null);
                                    else setSelectedSection(null);
                                }}
                                className="p-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-primary hover:text-primary transition-all group"
                            >
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-black text-gray-900 leading-none">
                                        {viewMerchantMode ? (selectedSection === 'Foods' ? "Restaurant Manager" : "Shop Manager") :
                                            viewOrders ? `${selectedSection} Orders` :
                                                selectedSection}
                                    </h2>
                                    {(selectedShop && !viewOrders && !viewMerchantMode) && (
                                        <>
                                            <ChevronRight size={20} className="text-gray-300" />
                                            <h2 className="text-2xl font-black text-primary leading-none">{selectedShop.name}</h2>
                                        </>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5 font-mono">
                                    {viewMerchantMode ? "Manage your business" :
                                        viewOrders ? "Track your purchases" :
                                            showShops ? "Available Shops" : "Item Selection"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search & Actions Bar */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-4 border border-white shadow-sm flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-all" />
                            <input
                                type="text"
                                placeholder={viewOrders ? `Search your ${selectedSection} orders...` :
                                    viewMerchantMode ? "Search incoming requests..." :
                                        showShops ? "Search shops..." : `Search items in ${selectedShop?.name || selectedSection}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:outline-none transition-all font-medium"
                            />
                        </div>
                        <div className="flex gap-2">
                            {!viewMerchantMode && (
                                <Button
                                    variant={viewOrders ? "primary" : "outline"}
                                    onClick={() => {
                                        setViewOrders(!viewOrders);
                                        setViewMerchantMode(false);
                                    }}
                                    className="rounded-2xl px-6 whitespace-nowrap"
                                >
                                    <ShoppingBag size={20} className="mr-2" />
                                    {viewOrders ? "Browse" : `${selectedSection} Orders`}
                                </Button>
                            )}

                            {(selectedSection === 'Foods' || selectedSection === 'Shops') && !viewOrders && (
                                <Button
                                    variant={viewMerchantMode ? "primary" : "outline"}
                                    onClick={() => {
                                        setViewMerchantMode(!viewMerchantMode);
                                        setViewOrders(false);
                                    }}
                                    className={`rounded-2xl px-6 whitespace-nowrap ${!viewMerchantMode ? 'bg-indigo-50/30 text-indigo-600 border-indigo-100' : ''} hover:bg-indigo-50 shadow-sm shadow-indigo-100/50`}
                                >
                                    {selectedSection === 'Foods' ? <Utensils size={20} className="mr-2" /> : <Store size={20} className="mr-2" />}
                                    {viewMerchantMode ? "Store View" : (selectedSection === 'Foods' ? "My Restaurant" : "My Shop")}
                                </Button>
                            )}

                            {selectedSection === 'Pre-Owned' && !viewOrders && (
                                <Button
                                    onClick={() => setShowListingModal(true)}
                                    className="rounded-2xl px-10 whitespace-nowrap shadow-lg"
                                >
                                    <Plus size={20} className="mr-2" /> List Item
                                </Button>
                            )}
                        </div>
                    </div>

                    {viewMerchantMode ? (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Management Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-1 relative overflow-hidden group">
                                    <div className="absolute -right-4 -bottom-4 text-primary/5 group-hover:scale-110 transition-transform"><DollarSign size={100} /></div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest relative">Today's Revenue</p>
                                    <div className="flex items-end gap-2 relative">
                                        <h4 className="text-3xl font-black text-gray-900">$284.50</h4>
                                        <span className="text-green-500 text-xs font-bold pb-1.5">+12.5%</span>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-1 relative overflow-hidden group">
                                    <div className="absolute -right-4 -bottom-4 text-primary/5 group-hover:scale-110 transition-transform"><ShoppingBag size={100} /></div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest relative">Processing</p>
                                    <h4 className="text-3xl font-black text-primary relative">6 Orders</h4>
                                </div>
                                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-1 relative overflow-hidden group">
                                    <div className="absolute -right-4 -bottom-4 text-yellow-500/5 group-hover:scale-110 transition-transform"><Star size={100} /></div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest relative">Satisfaction</p>
                                    <div className="flex items-center gap-2 relative">
                                        <h4 className="text-3xl font-black text-gray-900">4.9</h4>
                                        <div className="flex text-yellow-400"><Star size={20} fill="currentColor" /></div>
                                    </div>
                                </div>
                            </div>

                            {/* Merchant Actions */}
                            <div className="grid md:grid-cols-4 gap-4">
                                <button
                                    onClick={() => setShowListingModal(true)}
                                    className="p-6 rounded-[2rem] bg-primary text-white flex flex-col items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                                >
                                    <div className="p-3 bg-white/20 rounded-2xl"><Plus size={24} /></div>
                                    <span className="font-black text-xs uppercase tracking-widest">New Listing</span>
                                </button>
                                <button className="p-6 rounded-[2rem] bg-white border border-gray-100 flex flex-col items-center justify-center gap-3 hover:border-primary/20 transition-all">
                                    <div className="p-3 bg-gray-50 rounded-2xl text-gray-400"><LayoutGrid size={24} /></div>
                                    <span className="font-black text-xs uppercase tracking-widest text-gray-900">Inventory</span>
                                </button>
                                <button className="p-6 rounded-[2rem] bg-white border border-gray-100 flex flex-col items-center justify-center gap-3 hover:border-primary/20 transition-all">
                                    <div className="p-3 bg-gray-50 rounded-2xl text-gray-400"><Percent size={24} /></div>
                                    <span className="font-black text-xs uppercase tracking-widest text-gray-900">Promotions</span>
                                </button>
                                <button className="p-6 rounded-[2rem] bg-white border border-gray-100 flex flex-col items-center justify-center gap-3 hover:border-primary/20 transition-all">
                                    <div className="p-3 bg-gray-50 rounded-2xl text-gray-400"><ArrowUpDown size={24} /></div>
                                    <span className="font-black text-xs uppercase tracking-widest text-gray-900">Payouts</span>
                                </button>
                            </div>

                            {/* Incoming Orders Area */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xl font-black text-gray-900">Incoming Requests</h3>
                                    <button className="text-xs font-bold text-primary hover:underline">Full Analytics</button>
                                </div>
                                <div className="grid gap-4">
                                    {merchantOrders.filter(o => o.type === selectedSection).length > 0 ? (
                                        merchantOrders.filter(o => o.type === selectedSection).map(order => (
                                            <div key={order.id} className="bg-white/80 p-5 rounded-[2rem] border border-gray-100 flex items-center gap-6 group hover:shadow-xl hover:border-primary/20 transition-all">
                                                <div className={`h-14 w-14 rounded-2xl ${selectedSection === 'Foods' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'} flex items-center justify-center font-black`}>
                                                    {order.id.split('-')[1]}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h4 className="font-black text-gray-900">{order.item}</h4>
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${order.status === 'New' ? 'bg-green-100 text-green-600 animate-pulse' : 'bg-amber-100 text-amber-600'}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-medium">Customer: <span className="text-gray-900 font-bold">{order.customer}</span> • {order.location}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="font-black text-gray-900 tracking-tight">${order.price}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold">{order.time}</div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="iconSm" className="rounded-xl border-gray-100 hover:text-red-500">
                                                            <Trash2 size={18} />
                                                        </Button>
                                                        <Button size="iconSm" className="rounded-xl shadow-lg shadow-primary/20">
                                                            <Sparkles size={18} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center bg-white/40 rounded-[3rem] border-2 border-dashed border-gray-200">
                                            <Store size={48} className="mx-auto text-gray-200 mb-4" />
                                            <h3 className="text-lg font-black text-gray-900">No active {selectedSection} requests</h3>
                                            <p className="text-sm text-gray-500">New orders will appear here automatically.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : viewOrders ? (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${selectedSection === 'Foods' ? 'bg-orange-100 text-orange-600' : selectedSection === 'Shops' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                        <ShoppingBag size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">{selectedSection} Orders</h3>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Tracking your current purchases</p>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black text-gray-400 uppercase bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                    {orders.filter(o => o.type === selectedSection).length} Active Orders
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {orders.filter(o => o.type === selectedSection).length > 0 ? (
                                    orders.filter(o => o.type === selectedSection).map(order => (
                                        <div key={order.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
                                            <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                {order.type === 'Foods' ? <Utensils size={24} /> : order.type === 'Shops' ? <PackageCheck size={24} /> : <Box size={24} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${order.status === 'Preparing' ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                                                        {order.status}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{order.id}</span>
                                                </div>
                                                <h4 className="font-bold text-gray-900 truncate">{order.item}</h4>
                                                <p className="text-xs text-gray-500">{order.shop || order.type} • {order.date}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-gray-900 tracking-tight">${order.price}</div>
                                                <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">Track Status</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center bg-white/40 rounded-[3rem] border-2 border-dashed border-gray-200">
                                        <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                                        <h3 className="text-lg font-black text-gray-900">No {selectedSection} orders</h3>
                                        <p className="text-sm text-gray-500">You haven't ordered anything from this section yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>

                            {/* Filter Pills */}
                            {!showShops && (
                                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                                    <button
                                        onClick={() => setActiveFilter('All')}
                                        className={`px-6 py-2 rounded-xl text-xs font-black transition-all border-2 whitespace-nowrap ${activeFilter === 'All' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border-gray-100 hover:border-primary/30'}`}
                                    >
                                        All
                                    </button>
                                    {filters[selectedSection]?.map(filter => (
                                        <button
                                            key={filter}
                                            onClick={() => setActiveFilter(filter)}
                                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all border-2 whitespace-nowrap ${activeFilter === filter ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border-gray-100 hover:border-primary/30'}`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Content Grid */}
                            {showShops ? (
                                <div className="space-y-12 pt-4">
                                    {/* Offers Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                                <Percent size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900">Limited Time Offers</h3>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Flash deals & discounts</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                                            {sectionOffers[selectedSection]?.map((offer, idx) => (
                                                <OfferBanner
                                                    key={idx}
                                                    title={offer.title}
                                                    desc={offer.desc}
                                                    gradient={offer.gradient}
                                                    icon={offer.icon}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Vouchers Section */}
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {sectionVouchers[selectedSection]?.map((voucher, idx) => (
                                            <VoucherCard
                                                key={idx}
                                                title={voucher.title}
                                                code={voucher.code}
                                                discount={voucher.discount}
                                            />
                                        ))}
                                    </div>

                                    {/* New Arrivals Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-accent/10 rounded-xl text-accent">
                                                    <Flame size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-gray-900">New Arrivals</h3>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Freshly opened on campus</p>
                                                </div>
                                            </div>
                                            <button className="text-sm font-bold text-primary hover:underline">See All</button>
                                        </div>
                                        <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                                            {filteredShops.filter(s => s.isNew).map(shop => (
                                                <div key={shop.id} className="min-w-[280px]">
                                                    <ShopCard shop={shop} onClick={() => setSelectedShop(shop)} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* All Shops Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 rounded-xl text-gray-400">
                                                <Store size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900">Explore All {selectedSection}</h3>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{filteredShops.length} stores available</p>
                                            </div>
                                        </div>
                                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-2">
                                            {filteredShops.map(shop => (
                                                <ShopCard
                                                    key={shop.id}
                                                    shop={shop}
                                                    onClick={() => setSelectedShop(shop)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 pt-4">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <MarketplaceCard
                                                key={product.id}
                                                product={product}
                                                onClick={() => navigate(`/marketplace/${product.id}`)}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full py-20 text-center bg-white/40 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-gray-200">
                                            <div className="inline-block p-6 rounded-3xl bg-white shadow-sm mb-4">
                                                <ShoppingBag size={48} className="text-gray-200" />
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900">No items found</h3>
                                            <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
            {showListingModal && (
                <ListingModal
                    isOpen={showListingModal}
                    onClose={() => setShowListingModal(false)}
                    section={selectedSection}
                />
            )}
        </div>
    );
};

export default MarketplaceHome;
