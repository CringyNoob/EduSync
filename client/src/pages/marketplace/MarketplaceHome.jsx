import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
    Search, Filter, ShoppingBag, Plus, Tag, DollarSign, MessageCircle, Heart,
    Image as ImageIcon, X, Trash2, UploadCloud, BookOpen, Monitor, Armchair,
    Shirt, Zap, Grid, LayoutGrid, Sparkles, Utensils, Box, ArrowLeft,
    PackageCheck, Coffee, ArrowUpDown, ChevronDown, Store, MapPin, Star, ChevronRight,
    Clock, Ticket, Flame, Percent, CheckCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import marketplaceService from '../../services/marketplaceService';
import { uploadMultipleImages, previewImage, validateImage } from '../../utils/imageUpload';

// --- UI Components ---

const TrackingModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    const steps = [
        { label: 'Order Placed', status: 'New', icon: ShoppingBag },
        { label: 'Preparing', status: 'Preparing', icon: Clock },
        { label: 'On the Way', status: 'Shipped', icon: MapPin },
        { label: 'Delivered', status: 'Delivered', icon: Sparkles }
    ];

    const currentStatusIdx = steps.findIndex(s => s.status === order.status);
    const activeIdx = currentStatusIdx === -1 ? 0 : currentStatusIdx;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-sm rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-500">
                <div className="p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 leading-none">Track Order</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">{order.id} • {order.item}</p>
                        </div>
                        <button onClick={onClose} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-0 relative">
                        {/* Progress Line */}
                        <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gray-100"></div>
                        <div
                            className="absolute left-[27px] top-6 w-0.5 bg-primary transition-all duration-1000 ease-out"
                            style={{ height: `${(activeIdx / (steps.length - 1)) * 100}%`, maxHeight: 'calc(100% - 48px)' }}
                        ></div>

                        {/* Steps */}
                        <div className="space-y-10 relative">
                            {steps.map((step, idx) => {
                                const isCompleted = idx <= activeIdx;
                                const isCurrent = idx === activeIdx;
                                return (
                                    <div key={idx} className="flex items-center gap-6 group">
                                        <div className={`relative z-10 h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' : 'bg-white border-2 border-gray-100 text-gray-300'
                                            }`}>
                                            <step.icon size={24} className={isCurrent ? 'animate-pulse' : ''} />
                                            {isCompleted && !isCurrent && (
                                                <div className="absolute -right-1 -bottom-1 bg-green-500 rounded-full p-1 border-2 border-white">
                                                    <CheckCircle size={8} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`text-sm font-black transition-colors ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>
                                                {step.label}
                                            </h4>
                                            <p className={`text-[10px] font-bold uppercase tracking-tight ${isCurrent ? 'text-primary' : 'text-gray-400'}`}>
                                                {isCurrent ? 'In Progress' : isCompleted ? 'Completed' : 'Pending'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-[2rem] p-6 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-400">Merchant</span>
                            <span className="font-black text-gray-900">{order.shop || order.type}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-400">Estimated Delivery</span>
                            <span className="font-black text-primary">Within 30 mins</span>
                        </div>
                    </div>

                    <Button className="w-full py-4 rounded-2xl shadow-xl shadow-primary/10" onClick={onClose}>
                        Close Tracker
                    </Button>
                </div>
            </div>
        </div>
    );
};

const ListingModal = ({ isOpen, onClose, section, onSuccess }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category: '',
        description: ''
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const categories = [
        'Textbooks',
        'Electronics',
        'Furniture',
        'Clothing',
        'Sports Equipment',
        'Musical Instruments',
        'Lab Equipment',
        'Stationery',
        'Others'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files);
        setError('');

        // Validate each file
        for (const file of files) {
            const validation = validateImage(file);
            if (!validation.valid) {
                setError(validation.error);
                return;
            }
        }

        // Limit to 5 images
        if (images.length + files.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        setImages(prev => [...prev, ...files]);

        // Generate previews
        const previews = await Promise.all(
            files.map(file => previewImage(file))
        );
        setImagePreviews(prev => [...prev, ...previews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setError('');

        // Check if user is logged in with valid UUID
        if (!user?.id || user.id.length < 36 || user.id.startsWith('temp-')) {
            setError('Please login to create a listing');
            return;
        }

        // Validation
        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            setError('Valid price is required');
            return;
        }
        if (!formData.category) {
            setError('Category is required');
            return;
        }
        if (!formData.description.trim()) {
            setError('Description is required');
            return;
        }
        if (images.length === 0) {
            setError('At least one image is required');
            return;
        }

        setLoading(true);
        setUploading(true);

        try {
            // Upload images
            console.log('Starting image upload...', images.length, 'images');
            const imageUrls = await uploadMultipleImages(images);
            console.log('Images uploaded successfully:', imageUrls.length, 'URLs');

            // Create listing
            const listingData = {
                seller_id: user.id,
                seller_name: user.name,
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                images: imageUrls
            };

            console.log('Sending listing data:', {
                ...listingData,
                images: `[${imageUrls.length} base64 strings]`
            });

            const response = await marketplaceService.createPreownedListing(listingData);
            console.log('Response received:', response);

            if (response.success) {
                alert('Listing created successfully!');
                onClose();
                if (onSuccess) onSuccess();
                // Reset form
                setFormData({ title: '', price: '', category: '', description: '' });
                setImages([]);
                setImagePreviews([]);
            }
        } catch (err) {
            console.error('Error creating listing:', err);
            console.error('Error details:', {
                message: err.message,
                status: err.status,
                response: err.response
            });
            setError(err.message || 'Failed to create listing. Please try again.');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900">List New {section === 'Foods' ? 'Item' : section === 'Shops' ? 'Product' : 'Pre-Owned Item'}</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Fill in the details for your listing</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors" disabled={loading}>
                            <X size={24} />
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Calculus Textbook"
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary/30 focus:outline-none font-medium"
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (৳) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="2500"
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary/30 focus:outline-none font-medium"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary/30 focus:outline-none font-medium appearance-none"
                                disabled={loading}
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe your item in detail..."
                                rows="3"
                                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-primary/30 focus:outline-none font-medium resize-none"
                                disabled={loading}
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Images * (Max 5)</label>

                            {/* Image Upload Area */}
                            <label className="border-2 border-dashed border-gray-100 rounded-3xl p-8 text-center space-y-2 hover:border-primary/30 transition-colors cursor-pointer group block">
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                    multiple
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    disabled={loading || images.length >= 5}
                                />
                                <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <UploadCloud size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Upload Images</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">PNG, JPG up to 10MB</p>
                                </div>
                            </label>

                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-3 gap-3 mt-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-xl border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                disabled={loading}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1 py-4 rounded-2xl"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-[2] py-4 rounded-2xl shadow-xl shadow-primary/20"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                uploading ? 'Uploading Images...' : 'Creating Listing...'
                            ) : (
                                'Create Listing'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
    <div className="bg-white/80 backdrop-blur-md border border-dashed border-primary/30 p-4 rounded-2xl flex items-center justify-between group hover:border-primary transition-all shadow-sm text-left">
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
            <div className="text-lg font-black text-primary leading-none">৳{discount}</div>
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
        className="group relative bg-white backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left"
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
                ৳{product.price}
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
    const location = useLocation();
    const { section } = useParams();
    const { cartCount, orders, updateOrderStatus } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSection, setSelectedSection] = useState(null); // 'Foods', 'Pre-Owned', 'Shops'
    const [selectedShop, setSelectedShop] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [viewOrders, setViewOrders] = useState(false);
    const [showListingModal, setShowListingModal] = useState(false);
    const [trackingOrder, setTrackingOrder] = useState(null);

    // State for API data
    const [vendors, setVendors] = useState([]);
    const [products, setProducts] = useState([]);
    const [preownedListings, setPreownedListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Handle incoming section from URL path
    useEffect(() => {
        const pathParts = location.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1].toLowerCase();

        const sectionMap = {
            'foods': 'Foods',
            'pre-owned': 'Pre-Owned',
            'shops': 'Shops'
        };

        if (sectionMap[lastPart]) {
            setSelectedSection(sectionMap[lastPart]);
            setSelectedShop(null);
            setViewOrders(false);
        } else if (location.pathname === '/marketplace') {
            setSelectedSection(null);
            setViewOrders(false);
        }
    }, [location.pathname]);

    // Handle incoming navigation state (e.g. from CartPage if state is used)
    useEffect(() => {
        if (location.state) {
            if (location.state.viewOrders) {
                setViewOrders(true);
            }
        }
    }, [location.state]);

    // Fetch data based on selected section
    useEffect(() => {
        fetchData();
    }, [selectedSection, selectedShop]);

    const fetchData = async () => {
        if (!selectedSection) return;

        setLoading(true);
        setError(null);

        try {
            if (selectedSection === 'Foods') {
                // Fetch food vendors
                const vendorsRes = await marketplaceService.getVendors('FOOD_VENDOR');
                setVendors(vendorsRes.vendors || []);
                // If a shop is selected, fetch its products
                if (selectedShop && selectedShop.id) {
                    const vendorRes = await marketplaceService.getVendorById(selectedShop.id);
                    setProducts(vendorRes.vendor?.products || []);
                }
            } else if (selectedSection === 'Shops') {
                // Fetch startup vendors
                const vendorsRes = await marketplaceService.getVendors('STARTUP');
                setVendors(vendorsRes.vendors || []);
                // If a shop is selected, fetch its products
                if (selectedShop && selectedShop.id) {
                    const vendorRes = await marketplaceService.getVendorById(selectedShop.id);
                    setProducts(vendorRes.vendor?.products || []);
                }
            } else if (selectedSection === 'Pre-Owned') {
                // Fetch pre-owned listings
                const listingsRes = await marketplaceService.getPreownedListings();
                setPreownedListings(listingsRes.listings || []);
            }
        } catch (err) {
            console.error('Error fetching marketplace data:', err);
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleListingSuccess = () => {
        // Refresh the data after successful listing creation
        fetchData();
    };

    // Filter categories based on selection
    const filters = {
        'Foods': ['Snacks', 'Homemade', 'Beverages', 'Meal Prep', 'Others'],
        'Pre-Owned': ['Textbooks', 'Electronics', 'Research Gear', 'Furniture', 'Clothing', 'Sports', 'Exam Essentials', 'Lab Equipment', 'Musical Instruments', 'Others'],
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
            { title: "Canteen Cash", code: "CANTEEN5", discount: "500" },
            { title: "Snack Saver", code: "SNACK20", discount: "-20%" }
        ],
        'Shops': [
            { title: "Tech Credit", code: "TECH10", discount: "-10%" },
            { title: "Store Bonus", code: "SYNC25", discount: "280" }
        ]
    };

    // Map vendors to shop format
    const shops = useMemo(() => {
        return vendors.map(vendor => ({
            id: vendor.id,
            name: vendor.name,
            section: vendor.type === 'FOOD_VENDOR' ? 'Foods' : 'Shops',
            location: 'Campus',
            rating: 4.5,
            itemCount: 0, // Will be populated when vendor products are fetched
            bg: 'bg-gray-50',
            image: vendor.logo_url,
            deal: vendor.type === 'FOOD_VENDOR' ? (vendor.is_active ? 'Open Now' : 'Closed') : 'Available',
            isNew: false,
            is_active: vendor.is_active
        }));
    }, [vendors]);

    // Map products/preowned to unified product format
    const allProducts = useMemo(() => {
        if (selectedSection === 'Pre-Owned') {
            return preownedListings.map(listing => ({
                id: listing.id,
                section: 'Pre-Owned',
                title: listing.title,
                price: listing.price,
                category: listing.category,
                bg: 'bg-indigo-50',
                icon: Box,
                seller: listing.seller_name,
                timeAgo: 'Recently',
                image: listing.images && listing.images.length > 0 ? listing.images[0] : null,
                status: listing.status
            }));
        } else {
            return products.map(product => ({
                id: product.id,
                section: selectedSection,
                shopId: product.vendor_id,
                title: product.name,
                price: product.price,
                category: 'Products',
                bg: 'bg-gray-50',
                icon: selectedSection === 'Foods' ? Utensils : PackageCheck,
                seller: selectedShop?.name || 'Shop',
                timeAgo: 'Available',
                image: product.image_url,
                is_available: product.is_available
            }));
        }
    }, [products, preownedListings, selectedSection, selectedShop]);

    const filteredShops = useMemo(() => {
        if (!selectedSection || selectedSection === 'Pre-Owned') return [];
        return shops.filter(s => s.section === selectedSection && s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [selectedSection, searchQuery, shops]);

    const filteredProducts = useMemo(() => {
        return allProducts.filter(p => {
            const matchesCategory = activeFilter === 'All' || p.category === activeFilter;
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category.toLowerCase().includes(searchQuery.toLowerCase());
            // Filter out unavailable products and sold items
            const isAvailable = selectedSection === 'Pre-Owned' ? p.status === 'AVAILABLE' : p.is_available !== false;
            return matchesCategory && matchesSearch && isAvailable;
        });
    }, [allProducts, activeFilter, searchQuery, selectedSection]);

    const showShops = (selectedSection === 'Foods' || selectedSection === 'Shops') && !selectedShop;

    return (
        <div className="relative min-h-screen p-3 md:p-5 space-y-6 font-sans">
            {/* Background elements */}
            <div className="fixed inset-0 -z-30 pointer-events-none">
                <div className="absolute top-0 left-[-100px] w-[600px] h-[800px] bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent rounded-full mix-blend-multiply blur-[80px]"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-bl from-accent/20 to-primary/10 rounded-full mix-blend-multiply blur-[80px] animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-gradient-to-tr from-secondary/10 to-accent/20 rounded-full mix-blend-multiply blur-[80px] animate-blob animation-delay-2000"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
            </div>

            {/* Selection Screen (Main View) */}
            {!selectedSection && (
                <div className="max-w-6xl mx-auto space-y-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-primary hover:text-primary transition-all group"
                            >
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div className="text-center md:text-left space-y-1">
                                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                                    Campus Marketplace
                                </h1>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    Choose your experience
                                </p>
                            </div>
                        </div>
                        <div className="relative cursor-pointer group" onClick={() => navigate('/marketplace/cart')}>
                            <Button variant="outline" size="icon" className="rounded-xl shadow-sm bg-white hover:text-primary transition-all p-3">
                                <ShoppingBag size={24} />
                            </Button>
                            {cartCount > 0 && (
                                <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in">
                                    {cartCount}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <CategorySelectionCard
                            title="Foods"
                            description="Restaurants, home chefs, and snacks."
                            icon={Utensils}
                            colorClass="text-orange-500"
                            gradient="from-orange-400 to-red-500"
                            onClick={() => navigate('/marketplace/foods')}
                        />
                        <CategorySelectionCard
                            title="Pre-Owned"
                            description="Student-to-student pre-loved items."
                            icon={PackageCheck}
                            colorClass="text-indigo-500"
                            gradient="from-indigo-400 to-purple-600"
                            onClick={() => navigate('/marketplace/pre-owned')}
                        />
                        <CategorySelectionCard
                            title="Shops"
                            description="Retail stores and stationery items."
                            icon={ShoppingBag}
                            colorClass="text-pink-500"
                            gradient="from-pink-400 to-rose-600"
                            onClick={() => navigate('/marketplace/shops')}
                        />
                    </div>
                </div>
            )}

            {/* Shop/Item View */}
            {selectedSection && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500 max-w-7xl mx-auto text-left">
                    {/* Header with Navigation */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-left">
                            <button
                                onClick={() => {
                                    if (viewOrders) setViewOrders(false);
                                    else if (selectedShop) setSelectedShop(null);
                                    else setSelectedSection(null);
                                }}
                                className="p-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-primary hover:text-primary transition-all group"
                            >
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div className="text-left">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-black text-gray-900 leading-none">
                                        {viewOrders ? `${selectedSection} Orders` : selectedSection}
                                    </h2>
                                    {(selectedShop && !viewOrders) && (
                                        <>
                                            <ChevronRight size={20} className="text-gray-300" />
                                            <h2 className="text-2xl font-black text-primary leading-none">{selectedShop.name}</h2>
                                        </>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5 font-mono text-left">
                                    {viewOrders ? "Track your purchases" :
                                        showShops ? "Available Shops" : "Item Selection"}
                                </p>
                            </div>
                        </div>

                        <div className="relative cursor-pointer group" onClick={() => navigate('/marketplace/cart')}>
                            <Button variant="outline" size="icon" className="rounded-2xl shadow-sm bg-white hover:text-primary transition-all p-3">
                                <ShoppingBag size={24} />
                            </Button>
                            {cartCount > 0 && (
                                <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in">
                                    {cartCount}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search & Actions Bar */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-4 border border-white shadow-sm flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-all" />
                            <input
                                type="text"
                                placeholder={viewOrders ? `Search your ${selectedSection} orders...` :
                                    showShops ? "Search shops..." : `Search items in ${selectedShop?.name || selectedSection}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50/50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:outline-none transition-all font-medium"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={viewOrders ? "primary" : "outline"}
                                onClick={() => {
                                    setViewOrders(!viewOrders);
                                }}
                                className="rounded-2xl px-6 whitespace-nowrap"
                            >
                                <ShoppingBag size={20} className="mr-2" />
                                {viewOrders ? "Browse" : `${selectedSection} Orders`}
                            </Button>

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

                    {viewOrders ? (
                        <div className="space-y-6 animate-in fade-in duration-500 text-left">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3 text-left">
                                    <div className={`p-2 rounded-xl ${selectedSection === 'Foods' ? 'bg-orange-100 text-orange-600' : selectedSection === 'Shops' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                        <ShoppingBag size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xl font-black text-gray-900">{selectedSection} Orders</h3>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest text-left">Tracking your current purchases</p>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black text-gray-400 uppercase bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                    {orders.filter(o => o.section === selectedSection).length} Active Orders
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {orders.filter(o => o.section === selectedSection).length > 0 ? (
                                    orders.filter(o => o.section === selectedSection).map(order => (
                                        <div key={order.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group text-left">
                                            <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                {order.section === 'Foods' ? <Utensils size={24} /> : order.section === 'Shops' ? <PackageCheck size={24} /> : <Box size={24} />}
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${order.status === 'Preparing' ? 'bg-amber-100 text-amber-600' :
                                                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' :
                                                            order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                                                                'bg-primary/10 text-primary'}`}>
                                                        {order.status}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{order.id}</span>
                                                </div>
                                                <h4 className="font-bold text-gray-900 truncate">{order.item}</h4>
                                                <p className="text-xs text-gray-500">{order.shop || order.section} • {order.date}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-gray-900 tracking-tight">${order.price}</div>
                                                <button
                                                    onClick={() => setTrackingOrder(order)}
                                                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                                                >
                                                    Track Status
                                                </button>
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
                                <div className="space-y-12 pt-4 text-left">
                                    {/* Offers Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 text-left">
                                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                                <Percent size={24} />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-xl font-black text-gray-900">Limited Time Offers</h3>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest text-left">Flash deals & discounts</p>
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
                                            <div className="flex items-center gap-3 text-left">
                                                <div className="p-2 bg-accent/10 rounded-xl text-accent">
                                                    <Flame size={24} />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="text-xl font-black text-gray-900">New Arrivals</h3>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest text-left">Freshly opened on campus</p>
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
                                        <div className="flex items-center gap-3 text-left">
                                            <div className="p-2 bg-gray-100 rounded-xl text-gray-400">
                                                <Store size={24} />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-xl font-black text-gray-900">Explore All {selectedSection}</h3>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest text-left">{filteredShops.length} stores available</p>
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
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 pt-4 text-left">
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
                    onSuccess={handleListingSuccess}
                />
            )}
            {trackingOrder && (
                <TrackingModal
                    isOpen={!!trackingOrder}
                    order={trackingOrder}
                    onClose={() => setTrackingOrder(null)}
                />
            )}
        </div>
    );
};

export default MarketplaceHome;
