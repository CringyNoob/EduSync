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
    UploadCloud,
    BookOpen,
    Monitor,
    Armchair,
    Shirt,
    Zap,
    Grid,
    LayoutGrid,
    Sparkles
} from 'lucide-react';

// --- UI Components ---

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseStyles = "relative overflow-hidden inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";

    const variants = {
        primary: "bg-custom-taupe-grey text-white hover:bg-custom-taupe-grey/90 hover:shadow-lg hover:shadow-custom-taupe-grey/20 focus:ring-custom-taupe-grey border border-transparent",
        secondary: "bg-white text-custom-taupe-grey hover:bg-custom-beige/30 hover:text-custom-taupe-grey border border-gray-200 shadow-sm",
        outline: "bg-white/50 backdrop-blur-sm text-custom-taupe-grey border-2 border-custom-taupe-grey/20 hover:border-custom-taupe-grey hover:text-custom-taupe-grey hover:bg-custom-beige/30",
        ghost: "bg-transparent text-custom-taupe-grey hover:bg-custom-celadon/20 hover:text-custom-taupe-grey",
        danger: "bg-custom-cotton-candy/20 text-red-600 hover:bg-custom-cotton-candy/40 border border-transparent"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
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
        className="group relative bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-custom-taupe-grey/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
        {/* Image Section */}
        <div className={`h-64 w-full ${product.bg} p-6 flex items-center justify-center relative overflow-hidden`}>
            {/* Overlay Actions */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <button className="p-2.5 bg-white/90 backdrop-blur-md rounded-full text-custom-cotton-candy shadow-sm hover:scale-110 transition-transform">
                    <Heart size={20} fill="currentColor" className="opacity-50 hover:opacity-100" />
                </button>
            </div>

            {/* Product Image Placeholder */}
            <div className="relative z-0 group-hover:scale-110 transition-transform duration-500">
                <ShoppingBag className="h-20 w-20 text-custom-taupe-grey/10" />
            </div>

            {/* Gradient Overlay for Text readability if needed */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* Floating Price Tag - Overlapping */}
        <div className="absolute top-4 left-4">
            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-sm font-bold text-custom-taupe-grey shadow-sm border border-white/50">
                ${product.price}
            </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-custom-celadon/20 text-xs font-bold text-custom-taupe-grey/80 uppercase tracking-wide">
                    {product.category}
                </span>
                <span className="text-xs text-gray-400 font-medium ml-auto flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-custom-celadon"></span>
                    {product.timeAgo}
                </span>
            </div>

            <h3 className="font-bold text-gray-900 text-lg mb-2 leading-snug group-hover:text-custom-taupe-grey transition-colors line-clamp-2">
                {product.title}
            </h3>

            <div className="flex items-center gap-3 pt-3 border-t border-gray-100/80">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-custom-taupe-grey to-gray-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {product.seller.charAt(0)}
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-medium">Seller</span>
                    <span className="text-sm text-gray-700 font-bold leading-none truncate">{product.seller}</span>
                </div>
                <Button size="iconSm" variant="ghost" className="ml-auto text-gray-400 hover:text-custom-taupe-grey hover:bg-custom-beige/30 rounded-full">
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
        console.log("Submitting:", { ...formData, images });
        alert('Demo: Listing created successfully!');
        setFormData({ title: '', price: '', category: 'Textbooks', description: '' });
        setImages([]);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-custom-taupe-grey/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/60 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Sell an Item</h2>
                        <p className="text-sm text-gray-500 mt-1">List your item for sale in seconds.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar bg-gray-50/50">
                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Photos</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {images.map((img) => (
                                <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-200 shadow-sm">
                                    <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeImage(img.id)}
                                        className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}

                            <label className="aspect-square cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-custom-taupe-grey/20 bg-white hover:bg-custom-beige/20 hover:border-custom-taupe-grey/40 transition-all group">
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                                <div className="p-3 bg-custom-celadon/20 rounded-full text-custom-taupe-grey shadow-sm group-hover:scale-110 transition-transform mb-2">
                                    <UploadCloud size={20} />
                                </div>
                                <span className="text-xs font-semibold text-custom-taupe-grey">Add Photo</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                            <input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-custom-taupe-grey/20 focus:border-custom-taupe-grey transition-all font-medium"
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
                                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-custom-taupe-grey/20 focus:border-custom-taupe-grey transition-all font-medium"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-custom-taupe-grey/20 focus:border-custom-taupe-grey transition-all font-medium appearance-none cursor-pointer"
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
                                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-custom-taupe-grey/20 focus:border-custom-taupe-grey transition-all min-h-[120px] font-medium resize-none"
                                placeholder="Describe the item's condition, features, and reason for selling..."
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 sticky bottom-0 z-10">
                    <Button variant="secondary" onClick={onClose} className="border-gray-200 px-6">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} className="px-8 shadow-lg shadow-custom-taupe-grey/20">
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

    const categories = [
        { id: 'All', label: 'All Items', icon: Grid },
        { id: 'Textbooks', label: 'Textbooks', icon: BookOpen },
        { id: 'Electronics', label: 'Electronics', icon: Monitor },
        { id: 'Furniture', label: 'Furniture', icon: Armchair },
        { id: 'Clothing', label: 'Clothing', icon: Shirt },
        { id: 'Services', label: 'Services', icon: Zap },
        { id: 'Other', label: 'Other', icon: Sparkles },
    ];

    const products = [
        { id: 1, title: 'Calculus Early Transcendentals', price: '45.00', category: 'Textbooks', bg: 'bg-blue-100/50', seller: 'John D.', timeAgo: '2h ago' },
        { id: 2, title: 'Scientific Calculator TI-84', price: '85.00', category: 'Electronics', bg: 'bg-green-100/50', seller: 'Sarah M.', timeAgo: '4h ago' },
        { id: 3, title: 'IKEA Study Desk Lamp', price: '20.00', category: 'Furniture', bg: 'bg-yellow-100/50', seller: 'Mike R.', timeAgo: '1d ago' },
        { id: 4, title: 'Lab Coat (Size M)', price: '10.00', category: 'Clothing', bg: 'bg-red-100/50', seller: 'Emma W.', timeAgo: '1d ago' },
        { id: 5, title: 'Sony WH-1000XM4', price: '180.00', category: 'Electronics', bg: 'bg-purple-100/50', seller: 'Alex K.', timeAgo: '2d ago' },
        { id: 6, title: 'Mini Fridge for Dorm', price: '60.00', category: 'Furniture', bg: 'bg-orange-100/50', seller: 'Chris P.', timeAgo: '3d ago' },
        { id: 7, title: 'Organic Chemistry Set', price: '35.00', category: 'Textbooks', bg: 'bg-teal-100/50', seller: 'Lisa T.', timeAgo: '3d ago' },
        { id: 8, title: 'AirPods Pro Gen 2', price: '120.00', category: 'Electronics', bg: 'bg-pink-100/50', seller: 'Tom H.', timeAgo: '4d ago' },
    ];

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="relative min-h-screen p-4 md:p-6 space-y-8 font-sans">
            {/* Background elements to match Home */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-custom-celadon/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
                <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] bg-custom-cotton-candy/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
                <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-custom-soft-apricot/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/30"></div>
            </div>

            {/* Hero Section */}
            <div className="relative rounded-[2.5rem] overflow-hidden p-8 md:p-12 text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-custom-celadon/30 via-custom-beige/40 to-custom-soft-apricot/30 backdrop-blur-xl border border-white/60"></div>
                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-white/50 text-xs font-bold text-custom-taupe-grey uppercase tracking-wider">
                        <Sparkles size={12} className="text-custom-cotton-candy" />
                        Campus Marketplace
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-custom-taupe-grey tracking-tight leading-none">
                        Find what you need,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-custom-taupe-grey to-custom-cotton-candy">sell what you don't.</span>
                    </h1>
                    <p className="text-lg text-gray-600 font-medium leading-relaxed">
                        The easiest way to buy and sell textbooks, electronics, and dorm essentials within your campus community.
                    </p>

                    {/* Search Bar */}
                    <div className="relative group max-w-xl mx-auto mt-8">
                        <div className="absolute inset-0 bg-custom-soft-apricot/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative flex items-center bg-white/90 backdrop-blur-xl border border-white/80 rounded-2xl shadow-lg shadow-custom-taupe-grey/5 overflow-hidden focus-within:ring-2 focus-within:ring-custom-taupe-grey/10 transition-all transform group-hover:-translate-y-0.5">
                            <Search className="ml-5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search textbooks, furniture..."
                                className="w-full px-4 py-4 bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="pr-2">
                                <Button size="sm" className="rounded-xl shadow-none">Search</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="space-y-8">
                {/* Controls Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar mask-gradient-right">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap border ${activeCategory === cat.id
                                    ? 'bg-custom-taupe-grey text-white border-custom-taupe-grey shadow-lg shadow-custom-taupe-grey/20'
                                    : 'bg-white/60 text-gray-600 border-white/60 hover:bg-white hover:border-white hover:text-custom-taupe-grey hover:shadow-sm'
                                    }`}
                            >
                                <cat.icon size={16} />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 shrink-0">
                        <div className="flex bg-white/60 backdrop-blur-sm rounded-xl p-1 border border-white/60">
                            <button className="p-2 rounded-lg bg-white shadow-sm text-custom-taupe-grey">
                                <LayoutGrid size={18} />
                            </button>
                            <button className="p-2 rounded-lg text-gray-400 hover:text-custom-taupe-grey hover:bg-white/50 transition-colors">
                                <Grid size={18} />
                            </button>
                        </div>
                        <Button variant="outline" className="h-[46px] border-white/60 bg-white/40">
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                        <Button onClick={() => setIsSellModalOpen(true)} className="h-[46px] shadow-custom-soft-apricot/30 bg-gradient-to-r from-custom-taupe-grey to-gray-600">
                            <Plus className="mr-2 h-5 w-5" />
                            Sell Item
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
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-custom-soft-apricot/30 blur-2xl rounded-full"></div>
                            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-lg text-custom-taupe-grey/30 border border-white/60">
                                <Search size={40} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-custom-taupe-grey">No items found</h3>
                        <p className="text-gray-500 mt-2 max-w-xs">We couldn't find any matches for "{searchQuery}". Try a different keyword or category.</p>
                        <Button variant="ghost" onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="mt-6">
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <SellItemModal isOpen={isSellModalOpen} onClose={() => setIsSellModalOpen(false)} />
        </div>
    );
};

export default MarketplaceHome;
