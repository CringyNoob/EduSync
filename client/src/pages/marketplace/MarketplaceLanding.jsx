import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Utensils, Store, ShoppingBag, ArrowRight, Sparkles, 
    Coffee, Pizza, Salad, ShoppingCart, Laptop, 
    Book, Shirt, Clock, Users, TrendingUp, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MarketplaceLanding = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const marketplaces = [
        {
            id: 'foods',
            title: 'Food Market',
            subtitle: 'Campus Eateries & Vendors',
            description: 'Order delicious food from campus vendors. Pre-order meals, browse menus, and enjoy quick delivery.',
            icon: Utensils,
            path: '/marketplace/foods',
            gradient: 'from-orange-500 via-red-500 to-pink-500',
            bgGradient: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
            features: ['Pre-order Meals', 'Campus Delivery', 'Vendor Chat', 'Special Offers'],
            decorativeIcons: [Coffee, Pizza, Salad],
            stats: { vendors: '12+', rating: '4.8' }
        },
        {
            id: 'shops',
            title: 'Campus Shops',
            subtitle: 'Student Startups & Retail',
            description: 'Discover products from student entrepreneurs and campus retailers. Support local businesses!',
            icon: Store,
            path: '/marketplace/shops',
            gradient: 'from-indigo-500 via-purple-500 to-pink-500',
            bgGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
            features: ['Student Startups', 'Unique Products', 'Direct Chat', 'Campus Pickup'],
            decorativeIcons: [ShoppingCart, Laptop, TrendingUp],
            stats: { vendors: '25+', rating: '4.9' }
        },
        {
            id: 'preowned',
            title: 'Pre-Owned',
            subtitle: 'Student-to-Student Market',
            description: 'Buy and sell used items within the campus community. Textbooks, electronics, and more!',
            icon: ShoppingBag,
            path: '/marketplace/pre-owned',
            gradient: 'from-purple-500 via-pink-500 to-rose-500',
            bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
            features: ['Sell Your Items', 'Direct Messaging', 'Verified Students', 'Safe Deals'],
            decorativeIcons: [Book, Shirt, Laptop],
            stats: { listings: '150+', users: '500+' }
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-indigo-700">
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
                            <Sparkles size={16} className="text-yellow-300" />
                            Your Campus, Your Marketplace
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
                            EduSync
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">
                                Marketplace
                            </span>
                        </h1>
                        <p className="mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
                            Your one-stop destination for campus food, student businesses, and pre-owned treasures. 
                            Connect, shop, and thrive within your university community.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-12 flex flex-wrap justify-center gap-8">
                        {[
                            { label: 'Active Vendors', value: '40+', icon: Store },
                            { label: 'Happy Students', value: '2.5K+', icon: Users },
                            { label: 'Items Listed', value: '500+', icon: ShoppingBag }
                        ].map((stat, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-white/80">
                                <div className="p-2 bg-white/10 rounded-xl">
                                    <stat.icon size={20} className="text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                    <div className="text-xs text-white/60">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Marketplace Cards Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {marketplaces.map((market) => (
                        <div
                            key={market.id}
                            onClick={() => navigate(market.path)}
                            className="group cursor-pointer"
                        >
                            <div className={`relative h-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2`}>
                                {/* Card Header with Gradient */}
                                <div className={`relative h-40 bg-gradient-to-br ${market.gradient} p-6 overflow-hidden`}>
                                    {/* Floating Decorative Icons */}
                                    <div className="absolute inset-0 overflow-hidden opacity-20">
                                        {market.decorativeIcons.map((Icon, idx) => (
                                            <Icon 
                                                key={idx} 
                                                size={40 + idx * 10}
                                                className={`absolute text-white transform rotate-${idx * 15} animate-float`}
                                                style={{
                                                    top: `${20 + idx * 25}%`,
                                                    right: `${10 + idx * 20}%`,
                                                    animationDelay: `${idx * 0.5}s`
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* Main Icon */}
                                    <div className="relative">
                                        <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl">
                                            <market.icon size={28} className="text-white" />
                                        </div>
                                    </div>

                                    {/* Title on Gradient */}
                                    <div className="absolute bottom-4 left-6 right-6">
                                        <h3 className="text-xl font-black text-white">{market.title}</h3>
                                        <p className="text-sm text-white/80">{market.subtitle}</p>
                                    </div>

                                    {/* Arrow */}
                                    <div className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all">
                                        <ChevronRight size={20} className="text-white transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {market.description}
                                    </p>

                                    {/* Features */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {market.features.map((feature, idx) => (
                                            <span 
                                                key={idx}
                                                className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${market.bgGradient} font-medium text-gray-700 dark:text-gray-300`}
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        {Object.entries(market.stats).map(([key, value], idx) => (
                                            <div key={key} className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-gray-900 dark:text-white">{value}</span>
                                                <span className="text-xs text-gray-500 capitalize">{key}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Hover Glow Effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${market.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Info Cards */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: Clock, title: 'Quick Delivery', desc: 'Campus-wide delivery in 30 mins' },
                        { icon: Users, title: 'Verified Users', desc: 'All users are verified students' },
                        { icon: ShoppingBag, title: 'Safe Deals', desc: 'Meet in campus safe zones' },
                        { icon: TrendingUp, title: 'Best Prices', desc: 'Student-friendly pricing' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <item.icon size={20} className="text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action for Vendors */}
                {user && (
                    <div className="mt-12 bg-gradient-to-r from-primary via-indigo-600 to-purple-600 rounded-3xl p-8 text-center">
                        <h3 className="text-2xl font-bold text-white mb-2">Want to Sell on EduSync?</h3>
                        <p className="text-white/80 mb-6 max-w-lg mx-auto">
                            Start your campus business or list your pre-owned items. Join our growing community of student entrepreneurs!
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button 
                                onClick={() => navigate('/vendor/register')}
                                className="px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                Become a Vendor
                            </button>
                            <button 
                                onClick={() => navigate('/marketplace/pre-owned')}
                                className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                            >
                                Sell Pre-Owned Items
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default MarketplaceLanding;
