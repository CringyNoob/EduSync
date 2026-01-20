import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Store, MapPin, Mail, Phone, Clock, Star,
    Edit3, Save, X, TrendingUp, Users, DollarSign,
    Package, Settings, ShieldCheck, AlertCircle, Plus
} from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import marketplaceService from '../../services/marketplaceService';

const VendorShop = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);

    const [vendor, setVendor] = useState(null);
    const [formData, setFormData] = useState({});

    // Fetch vendor data from backend
    useEffect(() => {
        const fetchVendorData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await marketplaceService.getMyVendor();
                
                if (response.success && response.vendor) {
                    const v = response.vendor;
                    // Transform backend data to match component structure
                    const vendorData = {
                        id: v.id,
                        name: v.name,
                        description: v.description || '',
                        logo_url: v.logo_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                        cover_url: v.cover_url || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                        type: v.type,
                        status: v.is_active ? 'OPEN' : 'CLOSED',
                        rating: parseFloat(v.rating) || 0,
                        total_reviews: parseInt(v.total_reviews) || 0,
                        is_verified: v.is_verified_merchant || false,
                        contact: {
                            email: v.contact_email || '',
                            phone: v.contact_phone || '',
                            address: v.business_address || ''
                        },
                        stats: {
                            revenue_today: v.stats?.revenue_today || 0,
                            orders_today: v.stats?.orders_today || 0,
                            profile_views: v.stats?.profile_views || 0
                        },
                        operating_hours: v.operating_hours || '9:00 AM - 9:00 PM'
                    };
                    setVendor(vendorData);
                    setFormData(vendorData);
                }
            } catch (err) {
                console.error('Error fetching vendor:', err);
                setError(err.message || 'Failed to load shop data');
            } finally {
                setLoading(false);
            }
        };

        fetchVendorData();
    }, []);

    const handleEditToggle = () => {
        if (!isEditing) {
            setFormData({ ...vendor });
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e, imageType) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    [imageType]: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            // Transform form data back to backend format
            const updateData = {
                name: formData.name,
                description: formData.description,
                logo_url: formData.logo_url,
                cover_url: formData.cover_url,
                business_address: formData.contact?.address,
                contact_email: formData.contact?.email,
                contact_phone: formData.contact?.phone,
                operating_hours: formData.operating_hours,
                is_active: formData.status === 'OPEN'
            };

            const response = await marketplaceService.updateMyVendor(updateData);

            if (response.success) {
                setVendor(formData);
                setIsEditing(false);
            }
        } catch (err) {
            console.error('Error updating vendor:', err);
            setError(err.message || 'Failed to update shop profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading Shop Profile...</p>
                </div>
            </div>
        );
    }

    if (error && !vendor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="text-center max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Shop</h2>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="text-center max-w-md">
                    <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No Shop Found</h2>
                    <p className="text-gray-500 mb-4">You haven't registered a shop yet.</p>
                    <button 
                        onClick={() => navigate('/vendor/register')}
                        className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-700"
                    >
                        Register Your Shop
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 space-y-8 font-sans animate-in fade-in duration-500 pb-20">
            {/* Ambient Background */}
            <div className="fixed inset-0 -z-30 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                    <AlertCircle className="text-red-500" size={20} />
                    <p className="text-red-700 font-medium">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* Header Card */}
            <div className="relative rounded-[2.5rem] bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group">
                {/* Cover Image */}
                <div className="h-48 w-full relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10"></div>
                    <img
                        src={vendor.cover_url}
                        alt="Shop Cover"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 z-20">
                        <button
                            onClick={handleEditToggle}
                            className={`px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 text-white font-bold text-sm transition-all flex items-center gap-2 ${isEditing ? 'bg-red-500/80 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'}`}
                        >
                            {isEditing ? <><X size={16} /> Cancel Edit</> : <><Edit3 size={16} /> Edit Profile</>}
                        </button>
                    </div>
                </div>

                <div className="px-8 pb-8 relative z-20 -mt-16 flex flex-col md:flex-row items-end md:items-center gap-6">
                    {/* Logo */}
                    <div className="h-32 w-32 rounded-[2rem] bg-white p-1.5 shadow-xl shadow-gray-200/50 rotate-3 transition-transform hover:rotate-0">
                        <img
                            src={vendor.logo_url}
                            alt="Logo"
                            className="w-full h-full object-cover rounded-[1.7rem] bg-gray-50"
                        />
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 mb-2">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{vendor.name}</h1>
                            {vendor.is_verified && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                    <ShieldCheck size={12} /> Verified
                                </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide flex items-center gap-1.5 ${vendor.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                <span className={`h-2 w-2 rounded-full ${vendor.status === 'OPEN' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                {vendor.status}
                            </span>
                        </div>
                        <p className="text-gray-500 font-medium max-w-2xl text-base leading-relaxed">
                            {vendor.description}
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-6 md:border-l md:pl-6 border-gray-100">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-yellow-500 font-black text-xl">
                                {vendor.rating} <Star size={18} fill="currentColor" />
                            </div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{vendor.total_reviews} Reviews</div>
                        </div>
                        <div className="text-center">
                            <div className="font-black text-gray-900 text-xl">{vendor.total_reviews > 100 ? '98%' : 'New'}</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Satisfaction</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Details & Form */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
                                <DollarSign size={20} />
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Today's Sales</p>
                            <h3 className="text-2xl font-black text-gray-900 tabular-nums">৳{vendor.stats.revenue_today}</h3>
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-10 w-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
                                <Package size={20} />
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Orders</p>
                            <h3 className="text-2xl font-black text-gray-900 tabular-nums">{vendor.stats.orders_today}</h3>
                        </div>
                        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
                                <Users size={20} />
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Profile Views</p>
                            <h3 className="text-2xl font-black text-gray-900 tabular-nums">{vendor.stats.profile_views}</h3>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 relative overflow-hidden">
                        {isEditing ? (
                            <div className="space-y-6 animate-in hover:none">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                        <Settings className="text-primary-500" size={24} /> Edit Shop Details
                                    </h3>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary-500/30 disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                <span className="text-white">Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                <span className="text-white">Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Shop Logo</label>
                                        <div className="flex items-center gap-4">
                                            <img src={formData.logo_url} alt="Logo Preview" className="h-20 w-20 rounded-xl object-cover border-2 border-gray-200" />
                                            <label className="cursor-pointer bg-primary-50 hover:bg-primary-100 border border-primary-200 px-4 py-2 rounded-xl font-bold text-primary-700 text-sm transition-colors">
                                                Upload New Logo
                                                <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'logo_url')} className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Cover Image</label>
                                        <div className="flex items-center gap-4">
                                            <img src={formData.cover_url} alt="Cover Preview" className="h-20 w-32 rounded-xl object-cover border-2 border-gray-200" />
                                            <label className="cursor-pointer bg-primary-50 hover:bg-primary-100 border border-primary-200 px-4 py-2 rounded-xl font-bold text-primary-700 text-sm transition-colors">
                                                Upload New Cover
                                                <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'cover_url')} className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Shop Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name || ''}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Description</label>
                                        <textarea
                                            name="description"
                                            rows="3"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email Contact</label>
                                        <input
                                            type="email"
                                            name="contact.email"
                                            value={formData.contact?.email}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="contact.phone"
                                            value={formData.contact?.phone}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Business Address</label>
                                        <input
                                            type="text"
                                            name="contact.address"
                                            value={formData.contact?.address}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Shop Status</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none"
                                        >
                                            <option value="OPEN">Open For Business</option>
                                            <option value="BUSY">High Demand (Busy)</option>
                                            <option value="CLOSED">Closed temporarily</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                                    <Store className="text-primary-500" size={24} /> Shop Information
                                </h3>

                                <div className="grid md:grid-cols-2 gap-y-8 gap-x-12">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                            <Clock className="text-gray-500" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Operating Hours</p>
                                            <p className="font-bold text-gray-900">{vendor.operating_hours}</p>
                                            <p className="text-sm font-medium text-gray-500 mt-1">Currently: <span className="text-green-600">Open</span></p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                            <MapPin className="text-gray-500" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Campus Location</p>
                                            <p className="font-bold text-gray-900 max-w-xs">{vendor.contact.address}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                            <Mail className="text-gray-500" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Support</p>
                                            <p className="font-bold text-gray-900">{vendor.contact.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                            <Phone className="text-gray-500" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contact Phone</p>
                                            <p className="font-bold text-gray-900">{vendor.contact.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Add Product Card */}
                    <AddProductCard />

                    {/* Alerts */}
                    <div className="bg-orange-50 rounded-[2.5rem] border border-orange-100 p-6">
                        <h3 className="text-lg font-black text-orange-900 mb-4 flex items-center gap-2">
                            <AlertCircle className="text-orange-600" size={20} /> Shop Tips
                        </h3>
                        <p className="text-orange-800 text-sm font-medium leading-relaxed mb-4">
                            Complete your profile to increase trust! Adding a high-quality cover photo can boost views by 40%.
                        </p>
                        <button className="text-xs font-black uppercase tracking-wide text-orange-600 hover:text-orange-700 underline">
                            View All Tips
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add Product Card Component
const AddProductCard = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'FOOD',
        image_url: '',
        is_available: true,
        stock_count: 50
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    image_url: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError(null);

            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                image_url: formData.image_url,
                is_available: formData.is_available,
                stock_count: parseInt(formData.stock_count) || 50
            };

            const response = await marketplaceService.createProduct(productData);
            if (response.success) {
                // Reset form
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    category: 'FOOD',
                    image_url: '',
                    is_available: true,
                    stock_count: 50
                });
                setIsExpanded(false);
                alert('Product added successfully!');
            }
        } catch (err) {
            console.error('Error creating product:', err);
            setError(err.message || 'Failed to create product');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className="text-lg font-black flex items-center gap-2">
                    <Plus className="text-primary-500" /> Add New Product
                </h3>
                <p className="text-sm text-gray-500 mt-1">Click to expand the form</p>
            </div>

            {isExpanded && (
                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                            <AlertCircle className="text-red-500" size={16} />
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 font-medium text-gray-900 focus:ring-2 focus:ring-primary-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Description</label>
                        <textarea
                            name="description"
                            rows="3"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 font-medium text-gray-900 focus:ring-2 focus:ring-primary-500 transition-all"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price (৳)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 font-medium text-gray-900 focus:ring-2 focus:ring-primary-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Stock</label>
                            <input
                                type="number"
                                name="stock_count"
                                value={formData.stock_count}
                                onChange={handleInputChange}
                                required
                                min="0"
                                className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 font-medium text-gray-900 focus:ring-2 focus:ring-primary-500 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 font-medium text-gray-900 focus:ring-2 focus:ring-primary-500 transition-all"
                        >
                            <option value="FOOD">Food</option>
                            <option value="DRINKS">Drinks</option>
                            <option value="SNACKS">Snacks</option>
                            <option value="ELECTRONICS">Electronics</option>
                            <option value="ACCESSORIES">Accessories</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Product Image</label>
                        <div className="flex items-center gap-4">
                            {formData.image_url && (
                                <img src={formData.image_url} alt="Preview" className="h-20 w-20 rounded-xl object-cover border-2 border-gray-200" />
                            )}
                            <label className="cursor-pointer bg-primary-50 hover:bg-primary-100 border border-primary-200 px-4 py-2 rounded-xl font-bold text-primary-700 text-sm transition-colors">
                                {formData.image_url ? 'Change Image' : 'Upload Image'}
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="is_available"
                            checked={formData.is_available}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary-600 rounded"
                        />
                        <label className="text-sm font-medium text-gray-700">Available for sale</label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Adding...' : 'Add Product'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsExpanded(false)}
                            className="px-4 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default VendorShop;
