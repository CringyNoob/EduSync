import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Store, MapPin, Mail, Phone, Clock, Star, ShoppingBag,
    Package, ArrowLeft, AlertCircle, Users, TrendingUp, MessageCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import marketplaceService from '../../services/marketplaceService';
import Button from '../../components/Button';
import { ChatWithVendorButton } from '../../components/Chat/ChatButton';

const PublicVendorProfile = () => {
    const { vendorId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchVendorProfile = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch vendor details
                const response = await marketplaceService.getVendorById(vendorId);
                
                if (response.success && response.vendor) {
                    const v = response.vendor;
                    setVendor(v);
                    setProducts(v.products || []);

                    // Increment profile views ONLY if visitor is not the owner
                    if (user && user.id !== v.owner_id) {
                        // Call backend to increment views
                        await marketplaceService.incrementVendorViews(vendorId);
                    }
                } else {
                    setError(response.error || 'Vendor not found');
                }
            } catch (err) {
                console.error('Error fetching vendor profile:', err);
                setError(err.message || 'Failed to load vendor profile');
            } finally {
                setLoading(false);
            }
        };

        if (vendorId) {
            fetchVendorProfile();
        }
    }, [vendorId, user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading Vendor Profile...</p>
                </div>
            </div>
        );
    }

    if (error || !vendor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="text-center max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Vendor Not Found</h2>
                    <p className="text-gray-500 mb-4">{error || 'This vendor does not exist'}</p>
                    <button 
                        onClick={() => navigate('/marketplace')}
                        className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-700"
                    >
                        Back to Marketplace
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

            {/* Back Button */}
            <button
                onClick={() => navigate('/marketplace')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold transition-colors"
            >
                <ArrowLeft size={20} />
                Back to Marketplace
            </button>

            {/* Vendor Header */}
            <div className="relative rounded-[2.5rem] bg-white shadow-sm border border-gray-100 overflow-hidden group">
                {/* Cover Image */}
                <div className="h-48 w-full relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10"></div>
                    <img
                        src={vendor.cover_url || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'}
                        alt="Shop Cover"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="px-8 pb-8 relative z-20 -mt-16 flex flex-col md:flex-row items-end md:items-center gap-6">
                    {/* Logo */}
                    <div className="h-32 w-32 rounded-[2rem] bg-white p-1.5 shadow-xl shadow-gray-200/50">
                        <img
                            src={vendor.logo_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                            alt="Logo"
                            className="w-full h-full object-cover rounded-[1.7rem] bg-gray-50"
                        />
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 mb-2">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{vendor.name}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide flex items-center gap-1.5 ${
                                vendor.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                <span className={`h-2 w-2 rounded-full ${vendor.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                {vendor.is_active ? 'OPEN' : 'CLOSED'}
                            </span>
                        </div>
                        <p className="text-gray-500 font-medium max-w-2xl text-base leading-relaxed">
                            {vendor.description || 'No description available'}
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-6 md:border-l md:pl-6 border-gray-100">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-yellow-500 font-black text-xl">
                                {vendor.rating || 0} <Star size={18} fill="currentColor" />
                            </div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Rating</div>
                        </div>
                        <div className="text-center">
                            <div className="font-black text-gray-900 text-xl">{products.length}</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Products</div>
                        </div>
                        {/* Chat with Vendor Button */}
                        {vendor.owner_id && vendor.owner_id !== user?.id && (
                            <ChatWithVendorButton
                                vendorId={vendor.owner_id}
                                vendorName={vendor.name}
                                variant="primary"
                                size="md"
                                className="self-center"
                            >
                                <MessageCircle size={18} className="mr-2" />
                                Chat
                            </ChatWithVendorButton>
                        )}
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <Package className="text-primary-500" size={24} />
                    Products
                </h3>

                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No products available yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => navigate(`/marketplace/product/${product.id}`)}
                            >
                                <img
                                    src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                                    alt={product.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h4 className="font-bold text-gray-900 mb-1">{product.name}</h4>
                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-black text-primary-600">৳{product.price}</span>
                                        {!product.is_available && (
                                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                                                Out of Stock
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <Store className="text-primary-500" size={24} />
                    Contact Information
                </h3>

                <div className="grid md:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <Clock className="text-gray-500" size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Operating Hours</p>
                            <p className="font-bold text-gray-900">{vendor.operating_hours || '9:00 AM - 9:00 PM'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <MapPin className="text-gray-500" size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Location</p>
                            <p className="font-bold text-gray-900">{vendor.business_address || 'UIU Campus'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <Mail className="text-gray-500" size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                            <p className="font-bold text-gray-900">{vendor.contact_email || 'Not provided'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <Phone className="text-gray-500" size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                            <p className="font-bold text-gray-900">{vendor.contact_phone || 'Not provided'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicVendorProfile;
