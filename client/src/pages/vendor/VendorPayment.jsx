import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    ArrowLeft, 
    Clock,
    CheckCircle,
    Shield,
    Sparkles,
    Store,
    Loader2,
    AlertCircle,
    CreditCard
} from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const VendorPayment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, updateUser } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Get pending vendor data from session storage
    const vendorId = sessionStorage.getItem('pendingVendorId');
    const vendorName = sessionStorage.getItem('pendingVendorName');
    const vendorType = sessionStorage.getItem('pendingVendorType');

    // Verify user authentication
    useEffect(() => {
        console.log('VendorPayment - User:', user?.name, 'Roles:', user?.roles);
        console.log('VendorPayment - Pending vendor:', { vendorId, vendorName, vendorType });
        
        if (!user) {
            navigate('/login');
            return;
        }

        // If no pending vendor data, they shouldn't be on this page
        if (!vendorId || !vendorName) {
            // Check if user is already a vendor
            const hasVendorRole = user.roles?.includes('VENDOR');
            console.log('VendorPayment - No pending data, has VENDOR role:', hasVendorRole);
            if (hasVendorRole) {
                navigate('/vendor-dashboard');
            } else {
                navigate('/vendor/register');
            }
            return;
        }

        // Has pending vendor data - they just registered, allow access
        console.log('VendorPayment - Allowing access with pending vendor data');
    }, [user, vendorId, vendorName, vendorType, navigate]);

    const handleInitiatePayment = async () => {
        setError('');
        setLoading(true);

        try {
            // TODO: Integrate SSLCommerz API here
            // Call backend endpoint to initialize payment session
            // Backend will call SSLCommerz API and return payment URL
            // Redirect user to SSLCommerz payment gateway
            
            console.log('Initiating SSLCommerz payment for vendor:', vendorId);
            
            // Placeholder: Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // For now, show alert and redirect
            alert('SSLCommerz payment integration will be implemented here. Redirecting to dashboard...');
            
            // Clear session storage
            sessionStorage.removeItem('pendingVendorId');
            sessionStorage.removeItem('pendingVendorName');
            sessionStorage.removeItem('pendingVendorType');

            navigate('/vendor-dashboard');
        } catch (err) {
            console.error('Payment initialization error:', err);
            setError('Failed to initialize payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePayLater = async () => {
        setLoading(true);
        
        try {
            // Refresh user profile to ensure we have the latest roles
            console.log('🔄 Refreshing user profile before navigating...');
            const profileResponse = await authService.getProfile();
            
            if (profileResponse.success && profileResponse.profile) {
                updateUser({
                    roles: profileResponse.profile.roles,
                    activeRole: profileResponse.profile.activeRole
                });
                console.log('✅ User profile refreshed with roles:', profileResponse.profile.roles);
            }
        } catch (err) {
            console.error('Failed to refresh profile:', err);
            // Continue anyway - dashboard will handle the check
        }

        // Keep pending data - let dashboard clear it after successful access
        // This ensures dashboard can verify access even if context update hasn't propagated
        
        // Longer delay to ensure context update propagates
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setLoading(false);
        
        // Redirect to vendor dashboard
        console.log('🚀 Navigating to vendor dashboard...');
        navigate('/vendor-dashboard');
    };

    const subscriptionPrice = 500; // BDT

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/vendor/register')}
                        className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-900 dark:text-white"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Complete Payment</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Activate your vendor account
                        </p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                            <CheckCircle size={18} />
                        </div>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">Registration</span>
                    </div>
                    <div className="h-px w-12 bg-green-500"></div>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                            2
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Payment</span>
                    </div>
                </div>

                {/* Shop Info Banner */}
                <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-4 mb-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <Store size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-pink-100">Your Shop</p>
                            <h3 className="text-xl font-bold">{vendorName || 'Your Shop'}</h3>
                        </div>
                        <div className="ml-auto px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                            {vendorType === 'FOOD_VENDOR' ? '🍔 Food Vendor' : '🚀 Startup'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* SSLCommerz Payment Option */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 transition-colors duration-300 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <CreditCard size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pay with SSLCommerz</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Secure online payment</p>
                            </div>
                        </div>

                        {/* Price Display */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4 mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">৳{subscriptionPrice}</span>
                                <span className="text-gray-500 dark:text-gray-400">/month</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Campus Pro Subscription</p>
                        </div>

                        {/* Features */}
                        <div className="space-y-2 mb-6">
                            {[
                                'Unlimited Product Listings',
                                'Priority Customer Support',
                                'Sales Analytics Dashboard',
                                'Featured Badge on Profile'
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <CheckCircle size={16} className="text-green-500" />
                                    {feature}
                                </div>
                            ))}
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Payment Info */}
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-2">
                                <Shield className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Secure Payment Gateway</p>
                                    <p className="text-xs text-blue-700 dark:text-blue-400">
                                        You'll be redirected to SSLCommerz to complete your payment securely. 
                                        Accepts all major credit/debit cards, mobile banking, and internet banking.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pay Now Button */}
                        <Button
                            onClick={handleInitiatePayment}
                            disabled={loading}
                            className="w-full py-4 text-base font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Initializing...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <CreditCard size={18} />
                                    Proceed to Payment
                                </span>
                            )}
                        </Button>
                    </div>

                    {/* Pay Later Option */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 transition-colors duration-300 border border-gray-100 dark:border-gray-700 flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                                <Clock size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pay Later</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Start with limited access</p>
                            </div>
                        </div>

                        {/* Free Tier Info */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-gray-600 dark:text-gray-300">Free</span>
                                <span className="text-gray-500 dark:text-gray-400">/forever</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Student Basic Plan</p>
                        </div>

                        {/* Limited Features */}
                        <div className="space-y-2 mb-6 flex-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Included:</p>
                            {[
                                '5 Product Listings',
                                'Basic Order Management',
                                'Community Support'
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <CheckCircle size={16} className="text-gray-400" />
                                    {feature}
                                </div>
                            ))}

                            <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Not Included:</p>
                                {[
                                    'Analytics Dashboard',
                                    'Featured Badge',
                                    'Priority Support'
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm text-gray-400 line-through">
                                        <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs">✕</span>
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Info Note */}
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 mb-6">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Note</p>
                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                        Your vendor account will be created but some features will be limited until payment is completed.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pay Later Button */}
                        <Button
                            type="button"
                            onClick={handlePayLater}
                            className="w-full py-4 text-base font-bold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all border border-gray-200 dark:border-gray-600"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Clock size={18} />
                                Continue with Free Plan
                            </span>
                        </Button>

                        <p className="text-center text-xs text-gray-400 mt-3">
                            You can upgrade anytime from your dashboard
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <Shield size={14} />
                            <span>Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Sparkles size={14} />
                            <span>Instant Activation</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <CheckCircle size={14} />
                            <span>Cancel Anytime</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorPayment;
