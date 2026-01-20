import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Store, 
    FileText, 
    Briefcase,
    Utensils,
    Rocket,
    CheckCircle,
    Loader2,
    AlertCircle,
    Mail,
    Phone,
    MapPin,
    Image,
    Building
} from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import marketplaceService from '../../services/marketplaceService';
import authService from '../../services/authService';

const VendorRegistration = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    const [formData, setFormData] = useState({
        shopName: '',
        type: '',
        description: '',
        logoUrl: '',
        businessAddress: '',
        contactEmail: user?.email || '',
        contactPhone: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const vendorTypes = [
        {
            id: 'STARTUP',
            name: 'Startup',
            icon: Rocket,
            description: 'Sell products, crafts, or services to fellow students',
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
            borderColor: 'border-indigo-500',
            textColor: 'text-indigo-600'
        },
        {
            id: 'FOOD_VENDOR',
            name: 'Food Vendor',
            icon: Utensils,
            description: 'Serve delicious food and beverages on campus',
            color: 'from-orange-500 to-red-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            borderColor: 'border-orange-500',
            textColor: 'text-orange-600'
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTypeSelect = (typeId) => {
        setFormData(prev => ({
            ...prev,
            type: typeId
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!user?.id || user.id.length < 36 || user.id.startsWith('temp-')) {
            setError('Please login to register as a vendor');
            return;
        }

        if (!formData.shopName.trim()) {
            setError('Shop name is required');
            return;
        }

        if (formData.shopName.trim().length < 3) {
            setError('Shop name must be at least 3 characters');
            return;
        }

        if (!formData.type) {
            setError('Please select a vendor type');
            return;
        }

        if (!formData.businessAddress.trim()) {
            setError('Business address is required');
            return;
        }

        if (!formData.contactEmail.trim()) {
            setError('Contact email is required');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.contactEmail.trim())) {
            setError('Please enter a valid email address');
            return;
        }

        if (!formData.contactPhone.trim()) {
            setError('Contact phone is required');
            return;
        }

        // Basic phone validation (at least 10 digits)
        const phoneDigits = formData.contactPhone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            setError('Please enter a valid phone number (at least 10 digits)');
            return;
        }

        if (!formData.description.trim()) {
            setError('Description is required');
            return;
        }

        setLoading(true);

        try {
            const response = await marketplaceService.registerVendor({
                name: formData.shopName.trim(),
                type: formData.type,
                description: formData.description.trim(),
                logoUrl: formData.logoUrl.trim() || null,
                businessAddress: formData.businessAddress.trim(),
                contactEmail: formData.contactEmail.trim(),
                contactPhone: formData.contactPhone.trim()
            });

            if (response.success) {
                // Store vendor ID for payment page
                sessionStorage.setItem('pendingVendorId', response.vendorId);
                sessionStorage.setItem('pendingVendorName', formData.shopName.trim());
                sessionStorage.setItem('pendingVendorType', formData.type);
                
                console.log('✅ Vendor registered successfully, vendorId:', response.vendorId);
                
                // Wait for backend to update roles (marketplace-service calls auth-service)
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Refresh user profile to get updated roles (VENDOR role was added by backend)
                try {
                    console.log('🔄 Fetching updated user profile...');
                    const profileResponse = await authService.getProfile();
                    console.log('Profile response:', profileResponse);
                    
                    if (profileResponse.success && profileResponse.profile) {
                        // Update user context with new roles
                        updateUser({
                            roles: profileResponse.profile.roles,
                            activeRole: profileResponse.profile.activeRole
                        });
                        console.log('✅ User context updated with roles:', profileResponse.profile.roles);
                        console.log('✅ Active role:', profileResponse.profile.activeRole);
                    } else {
                        console.warn('⚠️ Profile response not successful:', profileResponse);
                    }
                } catch (profileError) {
                    console.error('❌ Failed to refresh profile:', profileError);
                    console.error('Error details:', profileError.response?.data || profileError.message);
                    // Continue anyway - vendor is created
                }

                // Extra delay to ensure context update propagates to all components
                await new Promise(resolve => setTimeout(resolve, 300));
                
                console.log('🚀 Navigating to payment page...');
                // Navigate to payment page
                navigate('/vendor/payment');
            }
        } catch (err) {
            console.error('Error registering vendor:', err);
            setError(err.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-900 dark:text-white"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Become a Vendor</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Start your business journey on campus
                        </p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                            1
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Registration</span>
                    </div>
                    <div className="h-px w-12 bg-gray-300 dark:bg-gray-600"></div>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center text-sm font-bold">
                            2
                        </div>
                        <span className="text-sm font-semibold text-gray-400">Payment</span>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 transition-colors duration-300 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                            <Store size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shop Details</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tell us about your business</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Shop Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                <Briefcase className="inline mr-2 h-4 w-4" />
                                Shop/Business Name *
                            </label>
                            <input
                                type="text"
                                name="shopName"
                                value={formData.shopName}
                                onChange={handleInputChange}
                                placeholder="e.g., Campus Canteen, Tech Startup Hub"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                maxLength={255}
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                This will be used as both your shop name and legal business name
                            </p>
                        </div>

                        {/* Vendor Type Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                                Vendor Type *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vendorTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => handleTypeSelect(type.id)}
                                        className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left group ${
                                            formData.type === type.id
                                                ? `${type.borderColor} ${type.bgColor} shadow-lg`
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center flex-shrink-0`}>
                                                <type.icon size={20} className="text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className={`font-bold ${formData.type === type.id ? type.textColor : 'text-gray-900 dark:text-white'}`}>
                                                        {type.name}
                                                    </h3>
                                                    {formData.type === type.id && (
                                                        <CheckCircle size={18} className={type.textColor} />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {type.description}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                <FileText className="inline mr-2 h-4 w-4" />
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Tell customers what makes your shop special..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                                maxLength={500}
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                {formData.description.length}/500 characters
                            </p>
                        </div>

                        {/* Business Details Section */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                Business Details
                            </h3>
                            
                            <div className="space-y-4">
                                {/* Business Address */
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        <MapPin className="inline mr-2 h-4 w-4" />
                                        Business Address *
                                    </label>
                                    <textarea
                                        name="businessAddress"
                                        value={formData.businessAddress}
                                        onChange={handleInputChange}
                                        placeholder="Full business address"
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                                    />
                                </div>
                                }
                                {/* Contact Email & Phone */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            <Mail className="inline mr-2 h-4 w-4" />
                                            Contact Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="contactEmail"
                                            value={formData.contactEmail}
                                            onChange={handleInputChange}
                                            placeholder="vendor@example.com"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            <Phone className="inline mr-2 h-4 w-4" />
                                            Contact Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            name="contactPhone"
                                            value={formData.contactPhone}
                                            onChange={handleInputChange}
                                            placeholder="01XXXXXXXXX"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                        />
                                    </div>
                                </div>

                                {/* Logo URL (Optional) */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        <Image className="inline mr-2 h-4 w-4" />
                                        Logo URL (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        name="logoUrl"
                                        value={formData.logoUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">
                                        Provide a direct link to your shop logo image
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">
                                What happens next?
                            </h4>
                            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={12} />
                                    Your shop will be created with pending status
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={12} />
                                    Complete payment to activate your vendor account
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={12} />
                                    Start adding products and serving customers
                                </li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 text-base font-bold bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Registering...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Continue to Payment
                                    <ArrowLeft size={18} className="rotate-180" />
                                </span>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer Note */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    By registering, you agree to our vendor terms and conditions
                </p>
            </div>
        </div>
    );
};

export default VendorRegistration;
