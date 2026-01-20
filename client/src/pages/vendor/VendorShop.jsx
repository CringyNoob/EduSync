import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Store, MapPin, Mail, Phone, Clock, Star,
    Edit3, Save, X, TrendingUp, Users, DollarSign,
    Package, Settings, ShieldCheck, AlertCircle
} from 'lucide-react';
import Button from '../../components/Button'; // Assuming we have a Button component, checking usage in VendorDashboard

// If Button component is not universally available or props differ, I'll fallback to standard HTML button with classes
// VendorDashboard uses: import Button from '../../components/Button';

const VendorShop = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Improved Mock Data
    const [vendor, setVendor] = useState({
        id: 'v1',
        name: 'The Daily Grind Cafe',
        description: 'Premium coffee and snacks for late-night study sessions. We source the finest beans and fresh local ingredients.',
        logo_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        cover_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        type: 'FOOD_VENDOR',
        status: 'OPEN', // OPEN, CLOSED, BUSY
        rating: 4.8,
        total_reviews: 124,
        is_verified: true,
        contact: {
            email: 'contact@dailygrind.uiu.ac.bd',
            phone: '+880 1711-223344',
            address: 'UIU Campus, Ground Floor, East Wing'
        },
        stats: {
            revenue_today: 15400,
            orders_today: 45,
            profile_views: 128
        },
        operating_hours: '8:00 AM - 9:00 PM'
    });

    const [formData, setFormData] = useState({});

    useEffect(() => {
        // Simulate initial load
        setTimeout(() => {
            setLoading(false);
            setFormData(vendor);
        }, 600);
    }, []);

    const handleEditToggle = () => {
        if (!isEditing) {
            setFormData({ ...vendor }); // Reset form to current cached data
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

    const handleSave = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setVendor(formData);
            setIsEditing(false);
            setLoading(false);
        }, 800);
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

    return (
        <div className="min-h-screen p-6 space-y-8 font-sans animate-in fade-in duration-500 pb-20">
            {/* Ambient Background */}
            <div className="fixed inset-0 -z-30 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]"></div>
            </div>

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
                                        className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-lg shadow-primary-500/30"
                                    >
                                        <Save size={18} /> Save Changes
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Shop Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
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
                    {/* Quick Actions */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] shadow-lg p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>

                        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                            <TrendingUp className="text-yellow-400" /> Quick Actions
                        </h3>

                        <div className="space-y-3 relative z-10">
                            <button className="w-full bg-white/10 hover:bg-white/20 border border-white/5 p-3 rounded-xl flex items-center gap-3 transition-colors text-left group">
                                <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Package size={16} />
                                </div>
                                <span className="font-bold text-sm">Add New Product</span>
                            </button>
                            <button className="w-full bg-white/10 hover:bg-white/20 border border-white/5 p-3 rounded-xl flex items-center gap-3 transition-colors text-left group">
                                <div className="h-8 w-8 rounded-lg bg-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Settings size={16} />
                                </div>
                                <span className="font-bold text-sm">Shop Settings</span>
                            </button>
                            <button className="w-full bg-white/10 hover:bg-white/20 border border-white/5 p-3 rounded-xl flex items-center gap-3 transition-colors text-left group">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <DollarSign size={16} />
                                </div>
                                <span className="font-bold text-sm">Withdraw Funds</span>
                            </button>
                        </div>
                    </div>

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

export default VendorShop;
