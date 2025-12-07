import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    ShoppingBag,
    Plus,
    Tag,
    DollarSign,
    MessageCircle,
    Heart,
    MoreHorizontal,
    Image as ImageIcon,
    X,
    CheckCircle,
    Trash2,
    UploadCloud
} from 'lucide-react';

// --- Backend Integration Notes ---
// 1. Fetch Marketplace Items:
//    - Endpoint: GET /api/marketplace/items
//    - Parameters: 
//        - page: number (default 1)
//        - limit: number (default 20)
//        - search: string (optional)
//        - category: string (optional)
//        - sort: 'price_asc' | 'price_desc' | 'newest' (default 'newest')
//    - Response: { items: Array<Item>, total: number, page: number }

// 2. Create Listing:
//    - Endpoint: POST /api/marketplace/items
//    - Body: { title: string, price: number, category: string, description: string, images: Array<string> }
//    - Auth: Required

// 3. Contact Seller:
//    - Endpoint: POST /api/marketplace/items/:id/contact
//    - Purpose: Creates a conversation in the chat system referencing this item.

// --- UI Components ---

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseStyles = "relative overflow-hidden inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";

    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 focus:ring-indigo-500 border border-transparent",
        secondary: "bg-white text-gray-700 hover:bg-gray-50 hover:text-indigo-600 border border-gray-200 shadow-sm",
        outline: "bg-white/50 backdrop-blur-sm text-gray-700 border-2 border-gray-200 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50/50",
        ghost: "bg-transparent text-gray-600 hover:bg-indigo-50 hover:text-indigo-600",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-transparent"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
        icon: "p-2",
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
        className="group relative bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
        {/* Image Section */}
        <div className={`h-56 w-full ${product.bg} p-6 flex items-center justify-center relative overflow-hidden`}>
            {/* Overlay Actions */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <button className="p-2 bg-white/90 backdrop-blur-md rounded-full text-red-500 shadow-sm hover:scale-110 transition-transform">
                    <Heart size={18} />
                </button>
            </div>

            <ShoppingBag className="h-16 w-16 text-gray-900/10 group-hover:scale-110 transition-transform duration-500" />

            {/* Price Tag */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-bold text-indigo-600 shadow-sm">
                ${product.price}
            </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded-md bg-indigo-50 text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                    {product.category}
                </span>
                <span className="text-xs text-gray-500 ml-auto">{product.timeAgo}</span>
            </div>

            <h3 className="font-bold text-gray-900 text-lg mb-1 leading-snug group-hover:text-indigo-600 transition-colors">
                {product.title}
            </h3>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                    {product.seller.charAt(0)}
                </div>
                <span className="text-sm text-gray-600 font-medium truncate">{product.seller}</span>
                <Button size="icon" variant="ghost" className="ml-auto h-8 w-8 text-gray-400 hover:text-indigo-600">
                    <MessageCircle size={18} />
                </Button>
            </div>
        </div>
    </div>
);

const SellItemModal = ({ isOpen, onClose }) => {
    const [images, setImages] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category: 'Textbooks',
        description: ''
    });

    if (!isOpen) return null;

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // Create object URLs for preview
            const newImages = files.map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                url: URL.createObjectURL(file),
                file: file
            }));
            setImages([...images, ...newImages]);
        }
    };

    const removeImage = (id) => {
        setImages(images.filter(img => img.id !== id));
    };

    const handleSubmit = () => {
        // Backend integration would go here
        console.log("Submitting:", { ...formData, images });
        alert('Demo: Listing created successfully!');
        setFormData({ title: '', price: '', category: 'Textbooks', description: '' });
        setImages([]);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Sell an Item</h2>
                        <p className="text-sm text-gray-500 mt-1">List your item for sale in seconds.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Photos</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {images.map((img) => (
                                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200">
                                    <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeImage(img.id)}
                                        className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}

                            <label className="aspect-square cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-400 transition-all group">
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                                <div className="p-3 bg-white rounded-full text-indigo-500 shadow-sm group-hover:scale-110 transition-transform mb-2">
                                    <UploadCloud size={20} />
                                </div>
                                <span className="text-xs font-semibold text-indigo-600">Add Photo</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                            <input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                placeholder="What are you selling?"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Price</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium appearance-none cursor-pointer"
                                >
                                    <option>Textbooks</option>
                                    <option>Electronics</option>
                                    <option>Furniture</option>
                                    <option>Clothing</option>
                                    <option>Services</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[120px] font-medium resize-none"
                                placeholder="Describe the item's condition, features, and reason for selling..."
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0 z-10">
                    <Button variant="secondary" onClick={onClose} className="border-gray-200 hover:bg-gray-100 font-semibold px-6">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} className="px-8 shadow-lg shadow-indigo-500/20">
                        Post Listing
                    </Button>
                </div>
            </div>
        </div>
    );
};

const MarketplaceHome = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);

    const categories = ['All', 'Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Services', 'Other'];

    // Mock Data - In production this would come from the API
    const products = [
        { id: 1, title: 'Calculus Early Transcendentals', price: '45.00', category: 'Textbooks', bg: 'bg-blue-100', seller: 'John D.', timeAgo: '2h ago' },
        { id: 2, title: 'Scientific Calculator TI-84', price: '85.00', category: 'Electronics', bg: 'bg-green-100', seller: 'Sarah M.', timeAgo: '4h ago' },
        { id: 3, title: 'IKEA Study Desk Lamp', price: '20.00', category: 'Furniture', bg: 'bg-yellow-100', seller: 'Mike R.', timeAgo: '1d ago' },
        { id: 4, title: 'Lab Coat (Size M)', price: '10.00', category: 'Clothing', bg: 'bg-red-100', seller: 'Emma W.', timeAgo: '1d ago' },
        { id: 5, title: 'Sony WH-1000XM4', price: '180.00', category: 'Electronics', bg: 'bg-purple-100', seller: 'Alex K.', timeAgo: '2d ago' },
        { id: 6, title: 'Mini Fridge for Dorm', price: '60.00', category: 'Furniture', bg: 'bg-orange-100', seller: 'Chris P.', timeAgo: '3d ago' },
        { id: 7, title: 'Organic Chemistry Set', price: '35.00', category: 'Textbooks', bg: 'bg-teal-100', seller: 'Lisa T.', timeAgo: '3d ago' },
        { id: 8, title: 'AirPods Pro Gen 2', price: '120.00', category: 'Electronics', bg: 'bg-pink-100', seller: 'Tom H.', timeAgo: '4d ago' },
    ];

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="relative min-h-screen p-6 space-y-8 font-sans">
            {/* Background elements to match Home */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-green-200/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
                <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-gray-200/50">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 tracking-tight">
                        Marketplace
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium text-lg">
                        Buy, sell, and trade with students on your campus.
                    </p>
                </div>
                <Button onClick={() => setIsSellModalOpen(true)} className="shadow-indigo-500/20">
                    <Plus className="mr-2 h-5 w-5" />
                    Sell Item
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative flex items-center bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                            <Search className="ml-4 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search textbook, electronics, etc..."
                                className="w-full px-4 py-4 bg-transparent outline-none text-gray-800 placeholder-gray-500 font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap ${activeCategory === cat
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-white/50 text-gray-600 hover:bg-white hover:text-indigo-600 border border-transparent hover:border-indigo-100'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 lg:items-start lg:pt-1">
                    <Button variant="outline" className="h-[58px]">
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                    <MarketplaceCard
                        key={product.id}
                        product={product}
                        onClick={() => navigate(`/marketplace/${product.id}`)}
                    />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6 text-gray-400">
                        <Search size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No items found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                </div>
            )}

            {/* Modals */}
            <SellItemModal isOpen={isSellModalOpen} onClose={() => setIsSellModalOpen(false)} />
        </div>
    );
};

export default MarketplaceHome;
