import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, MessageCircle, ArrowLeft, Tag, Heart, Clock,
    Package, BookOpen, Monitor, Armchair, Shirt, Music,
    Dumbbell, FlaskConical, MoreHorizontal, Edit3, Trash2,
    CheckCircle, X, UploadCloud, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import marketplaceService from '../../services/marketplaceService';
import Button from '../../components/Button';
import { uploadMultipleImages, previewImage, validateImage } from '../../utils/imageUpload';

// Category icons mapping
const categoryIcons = {
    'Textbooks': BookOpen,
    'Electronics': Monitor,
    'Furniture': Armchair,
    'Clothing': Shirt,
    'Sports Equipment': Dumbbell,
    'Musical Instruments': Music,
    'Lab Equipment': FlaskConical,
    'Stationery': Package,
    'Others': MoreHorizontal
};

// Listing Modal Component
const ListingModal = ({ isOpen, onClose, onSuccess, editingListing = null }) => {
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
        'Textbooks', 'Electronics', 'Furniture', 'Clothing',
        'Sports Equipment', 'Musical Instruments', 'Lab Equipment',
        'Stationery', 'Others'
    ];

    useEffect(() => {
        if (editingListing) {
            setFormData({
                title: editingListing.title || '',
                price: editingListing.price || '',
                category: editingListing.category || '',
                description: editingListing.description || ''
            });
            if (editingListing.images && editingListing.images.length > 0) {
                setImagePreviews(editingListing.images);
            }
        } else {
            setFormData({ title: '', price: '', category: '', description: '' });
            setImages([]);
            setImagePreviews([]);
        }
    }, [editingListing, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files);
        setError('');

        for (const file of files) {
            const validation = validateImage(file);
            if (!validation.valid) {
                setError(validation.error);
                return;
            }
        }

        if (images.length + files.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        setImages(prev => [...prev, ...files]);
        const previews = await Promise.all(files.map(file => previewImage(file)));
        setImagePreviews(prev => [...prev, ...previews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setError('');

        if (!user?.id || user.id.length < 36) {
            setError('Please login to create a listing');
            return;
        }

        if (!formData.title.trim() || !formData.price || !formData.category || !formData.description.trim()) {
            setError('All fields are required');
            return;
        }

        if (images.length === 0 && imagePreviews.length === 0) {
            setError('At least one image is required');
            return;
        }

        setLoading(true);
        setUploading(true);

        try {
            let imageUrls = imagePreviews.filter(url => url.startsWith('http') || url.startsWith('data:'));
            
            if (images.length > 0) {
                const newImageUrls = await uploadMultipleImages(images);
                imageUrls = [...imageUrls, ...newImageUrls];
            }

            const listingData = {
                seller_id: user.id,
                seller_name: user.name,
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                images: imageUrls
            };

            const response = await marketplaceService.createPreownedListing(listingData);

            if (response.success) {
                onClose();
                if (onSuccess) onSuccess();
                setFormData({ title: '', price: '', category: '', description: '' });
                setImages([]);
                setImagePreviews([]);
            }
        } catch (err) {
            console.error('Error creating listing:', err);
            setError(err.message || 'Failed to create listing');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-gray-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                                {editingListing ? 'Edit Listing' : 'List Pre-Owned Item'}
                            </h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                                Fill in the details
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Calculus Textbook"
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-purple-300 focus:outline-none font-medium"
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (৳) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="2500"
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-purple-300 focus:outline-none font-medium"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-purple-300 focus:outline-none font-medium"
                                disabled={loading}
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe your item..."
                                rows="3"
                                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-purple-300 focus:outline-none font-medium resize-none"
                                disabled={loading}
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Images * (Max 5)</label>
                            <label className="border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center space-y-2 hover:border-purple-300 transition-colors cursor-pointer group block">
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    multiple
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    disabled={loading || images.length >= 5}
                                />
                                <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-500 mx-auto flex items-center justify-center">
                                    <UploadCloud size={24} />
                                </div>
                                <p className="text-sm font-bold text-gray-900">Upload Images</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">PNG, JPG up to 10MB</p>
                            </label>

                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-4 gap-3 mt-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-20 object-cover rounded-xl border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                disabled={loading}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1 py-4 rounded-2xl" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button className="flex-[2] py-4 rounded-2xl bg-purple-500 hover:bg-purple-600" onClick={handleSubmit} disabled={loading}>
                            {loading ? (uploading ? 'Uploading...' : 'Creating...') : (editingListing ? 'Update Listing' : 'Create Listing')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Product Card Component
const ProductCard = ({ listing, onClick, onChat }) => {
    const Icon = categoryIcons[listing.category] || Package;
    
    return (
        <div className="group relative bg-white dark:bg-gray-800 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left">
            {/* Image Section */}
            <div className="h-44 w-full bg-purple-50 dark:bg-gray-700 flex items-center justify-center relative overflow-hidden cursor-pointer" onClick={onClick}>
                {listing.image ? (
                    <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <Icon size={48} className="text-purple-200" />
                )}
                {listing.status === 'SOLD' && (
                    <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-black">SOLD</span>
                    </div>
                )}
            </div>

            {/* Floating Price Tag */}
            <div className="absolute top-2 left-2">
                <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm border border-white/50">
                    ৳{listing.price}
                </div>
            </div>

            {/* Wishlist Button */}
            <button className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-md rounded-lg text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                <Heart size={16} />
            </button>

            {/* Content Section */}
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">{listing.category}</span>
                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                        <Clock size={10} /> {listing.timeAgo}
                    </span>
                </div>
                <h3 
                    className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-purple-500 transition-colors cursor-pointer"
                    onClick={onClick}
                >
                    {listing.title}
                </h3>
                
                {/* Seller Info */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-black text-purple-500">
                            {listing.seller?.charAt(0) || 'U'}
                        </div>
                        <span className="text-xs text-gray-500 font-medium truncate max-w-[80px]">{listing.seller}</span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onChat(listing);
                        }}
                        className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-500 rounded-lg transition-colors"
                    >
                        <MessageCircle size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const PreownedMarketplace = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [showListingModal, setShowListingModal] = useState(false);
    const [showMyListings, setShowMyListings] = useState(false);

    // API State
    const [listings, setListings] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const categories = [
        'All', 'Textbooks', 'Electronics', 'Furniture', 'Clothing',
        'Sports Equipment', 'Musical Instruments', 'Lab Equipment', 'Stationery', 'Others'
    ];

    // Fetch all listings
    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                const response = await marketplaceService.getPreownedListings();
                setListings(response.listings || []);
            } catch (err) {
                console.error('Error fetching listings:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    // Fetch user's listings
    useEffect(() => {
        if (user?.id && showMyListings) {
            const fetchMyListings = async () => {
                try {
                    const response = await marketplaceService.getPreownedByUser(user.id);
                    // API returns { success: true, data: [...] }
                    setMyListings(response.data || response.listings || []);
                } catch (err) {
                    console.error('Error fetching my listings:', err);
                }
            };
            fetchMyListings();
        }
    }, [user, showMyListings]);

    // Map listings to display format
    const displayListings = useMemo(() => {
        const listingsToShow = showMyListings ? myListings : listings;
        return listingsToShow.map(listing => ({
            id: listing.id,
            title: listing.title,
            price: listing.price,
            category: listing.category,
            description: listing.description,
            image: listing.images?.[0] || null,
            images: listing.images || [],
            seller: listing.seller_name,
            seller_id: listing.seller_id,
            timeAgo: 'Recently',
            status: listing.status
        }));
    }, [listings, myListings, showMyListings]);

    // Filtered listings
    const filteredListings = useMemo(() => {
        return displayListings.filter(listing => {
            const matchesCategory = activeCategory === 'All' || listing.category === activeCategory;
            const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                listing.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const isAvailable = showMyListings || listing.status === 'AVAILABLE';
            return matchesCategory && matchesSearch && isAvailable;
        });
    }, [displayListings, activeCategory, searchQuery, showMyListings]);

    const handleChatWithSeller = (listing) => {
        navigate(`/chat?seller=${listing.seller_id}&name=${encodeURIComponent(listing.seller)}&listing=${listing.id}`);
    };

    const handleListingSuccess = () => {
        // Refresh listings
        const fetchListings = async () => {
            try {
                const response = await marketplaceService.getPreownedListings();
                setListings(response.listings || []);
            } catch (err) {
                console.error('Error refreshing listings:', err);
            }
        };
        fetchListings();
    };

    const handleMarkAsSold = async (listingId) => {
        try {
            await marketplaceService.markPreownedAsSold(listingId);
            // Refresh my listings - API returns { success: true, data: [...] }
            if (user?.id) {
                const response = await marketplaceService.getPreownedByUser(user.id);
                setMyListings(response.data || response.listings || []);
            }
            // Also update the main listings
            const allListingsResponse = await marketplaceService.getPreownedListings();
            setListings(allListingsResponse.listings || []);
        } catch (err) {
            console.error('Error marking as sold:', err);
            alert('Failed to mark as sold');
        }
    };

    return (
        <div className="relative min-h-screen p-3 md:p-5 space-y-6 font-sans">
            {/* Background */}
            <div className="fixed inset-0 -z-30 pointer-events-none">
                <div className="absolute top-0 left-[-100px] w-[600px] h-[800px] bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-transparent rounded-full mix-blend-multiply blur-[80px]"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-bl from-indigo-100/50 to-purple-100/50 rounded-full mix-blend-multiply blur-[80px]"></div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => showMyListings ? setShowMyListings(false) : navigate('/marketplace')}
                            className="p-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 shadow-sm hover:border-purple-500 hover:text-purple-500 transition-all group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                                {showMyListings ? 'My Listings' : 'Pre-Owned Market'}
                            </h1>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                {showMyListings ? 'Manage your listings' : 'Student-to-student marketplace'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {user && (
                            <Button
                                variant="outline"
                                onClick={() => setShowMyListings(!showMyListings)}
                                className={`rounded-2xl px-4 ${showMyListings ? 'border-purple-500 text-purple-500 bg-purple-50' : 'border-gray-200'}`}
                            >
                                <Settings size={18} className="mr-2" />
                                {showMyListings ? 'Browse All' : 'My Listings'}
                            </Button>
                        )}
                        <Button
                            onClick={() => setShowListingModal(true)}
                            className="rounded-2xl px-6 bg-purple-500 hover:bg-purple-600"
                        >
                            <Plus size={18} className="mr-2" />
                            List Item
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-4 border border-white shadow-sm">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-all" />
                        <input
                            type="text"
                            placeholder="Search pre-owned items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50/50 border-2 border-transparent focus:border-purple-200 focus:bg-white focus:outline-none transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div className="p-3 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white">
                    <div className="flex flex-wrap gap-2 p-1">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black transition-all border-2 ${activeCategory === cat 
                                    ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-200' 
                                    : 'bg-white text-gray-400 border-gray-100 hover:border-purple-300'}`}
                            >
                                {cat.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    </div>
                )}

                {/* Listings Grid */}
                {!loading && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredListings.length > 0 ? (
                            filteredListings.map(listing => (
                                <div key={listing.id} className="relative">
                                    <ProductCard
                                        listing={listing}
                                        onClick={() => navigate(`/marketplace/pre-owned/${listing.id}`)}
                                        onChat={handleChatWithSeller}
                                    />
                                    {/* My Listings Actions */}
                                    {showMyListings && (
                                        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                                            {listing.status === 'AVAILABLE' && (
                                                <button
                                                    onClick={() => handleMarkAsSold(listing.id)}
                                                    className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1"
                                                >
                                                    <CheckCircle size={14} /> Mark Sold
                                                </button>
                                            )}
                                            <button
                                                onClick={() => navigate(`/marketplace/pre-owned/${listing.id}/edit`)}
                                                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-white/40 rounded-[3rem] border-2 border-dashed border-gray-200">
                                <Package size={48} className="mx-auto text-gray-200 mb-4" />
                                <h3 className="text-xl font-black text-gray-900">
                                    {showMyListings ? 'No listings yet' : 'No items found'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    {showMyListings 
                                        ? 'List your first item to start selling!' 
                                        : 'Try adjusting your search or category filter.'
                                    }
                                </p>
                                {showMyListings && (
                                    <Button 
                                        onClick={() => setShowListingModal(true)}
                                        className="mt-4 rounded-2xl bg-purple-500 hover:bg-purple-600"
                                    >
                                        <Plus size={18} className="mr-2" /> List Your First Item
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Listing Modal */}
            <ListingModal
                isOpen={showListingModal}
                onClose={() => setShowListingModal(false)}
                onSuccess={handleListingSuccess}
            />
        </div>
    );
};

export default PreownedMarketplace;
