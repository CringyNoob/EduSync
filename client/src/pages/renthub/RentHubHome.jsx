import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Filter, Repeat, Plus, Star,
    ArrowLeft, MessageCircle, Heart, Clock,
    ArrowUpDown, ChevronDown, LayoutDashboard
} from 'lucide-react';
import Button from '../../components/Button';
import { cn } from '../../utils/cn';
import renthubService from '../../services/renthubService';

const RentalCard = ({ item, onClick }) => (
    <div
        onClick={onClick}
        className="group relative bg-white backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
        {/* Image Section */}
        <div className="h-40 w-full relative overflow-hidden bg-gray-100">
            <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Overlay Actions */}
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <button className="p-2 bg-white/90 backdrop-blur-md rounded-full text-pink-500 shadow-sm hover:scale-110 transition-transform">
                    <Heart size={16} className="opacity-70 hover:opacity-100" />
                </button>
            </div>
            {/* Floating Price Tag */}
            <div className="absolute top-2 left-2">
                <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm border border-white/50">
                    ${item.price}/day
                </div>
            </div>
        </div>

        {/* Content Section */}
        <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-600 uppercase tracking-wide">
                    {item.category}
                </span>
                <span className="text-[10px] text-gray-400 font-medium ml-auto flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {item.timeAgo}
                </span>
            </div>

            <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {item.title}
            </h3>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                    {item.owner.charAt(0)}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-medium">Owner</span>
                    <span className="text-xs text-gray-700 font-bold leading-none truncate">{item.owner}</span>
                </div>
                <div className="ml-auto flex items-center gap-1">
                    <Star size={10} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-bold text-gray-600">{item.rating}</span>
                </div>
            </div>
        </div>
    </div>
);

const RentHubHome = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const categories = ['All', 'Books', 'Electronics', 'Other', 'Furniture', 'Clothing', 'Sports Equipment', 'Musical Instruments', 'Tools'];

    // Fetch rental listings on component mount
    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await renthubService.getAllListings({ status: 'AVAILABLE' });
                const listings = response.data || [];
                // Map to component format
                const mappedListings = listings.map(listing => ({
                    id: listing.id,
                    title: listing.title,
                    category: listing.category,
                    price: parseFloat(listing.daily_price),
                    image: listing.images && listing.images.length > 0 ? listing.images[0] : 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
                    rating: 4.5,
                    owner: listing.owner_name,
                    timeAgo: 'Recently',
                    createdAt: new Date(listing.created_at),
                    description: listing.description
                }));
                setRentals(mappedListings);
            } catch (err) {
                console.error('Error fetching rentals:', err);
                setError(err.message || 'Failed to load rentals');
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    const filteredAndSortedRentals = useMemo(() => {
        let result = rentals.filter(item => {
            const matchesCategory = activeFilter === 'All' || item.category === activeFilter;
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        switch (sortBy) {
            case 'price-low': result.sort((a, b) => a.price - b.price); break;
            case 'price-high': result.sort((a, b) => b.price - a.price); break;
            case 'rating': result.sort((a, b) => b.rating - a.rating); break;
            default: result.sort((a, b) => b.createdAt - a.createdAt); break;
        }

        return result;
    }, [rentals, searchQuery, activeFilter, sortBy]);

    return (
        <div className="relative min-h-screen p-3 md:p-5 space-y-6 font-sans">
            {/* Background Details */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-0 left-[-100px] w-[600px] h-[800px] bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent rounded-full mix-blend-multiply blur-[80px]"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-bl from-accent/20 to-primary/10 rounded-full mix-blend-multiply blur-[80px] animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-gradient-to-tr from-secondary/10 to-accent/20 rounded-full mix-blend-multiply blur-[80px] animate-blob animation-delay-2000"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
            </div>

            {/* Hero Section - New Statement */}
            <div className="max-w-7xl mx-auto pt-8 pb-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight">
                        Rent What You Need,
                    </h2>
                    <h2 className="text-4xl md:text-6xl font-black text-primary leading-tight">
                        Earn From What You Own.
                    </h2>
                </div>
            </div>

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-primary/50 transition-all group"
                    >
                        <ArrowLeft size={18} className="text-gray-500 group-hover:text-primary" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-none">RentHub</h1>
                        <p className="text-xs text-gray-500 mt-1">Specialized rental ecosystem for academic success</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="primary"
                        size="md"
                        className="rounded-xl shadow-lg shadow-emerald-200 bg-emerald-600 border-none"
                        onClick={() => navigate('/renthub/my-rentals')}
                    >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Management Dashboard
                    </Button>
                </div>
            </div>

            {/* Filter Bar - Exactly matching MarketplaceHome.jsx logic and styles */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-sm max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search in academic rentals..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium"
                        />
                    </div>

                    {/* Sorting Bar */}
                    <div className="flex gap-2">
                        <div className="relative group">
                            <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none pl-9 pr-8 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-bold text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer transition-all"
                            >
                                <option value="newest">Newest</option>
                                <option value="price-low">Price: Low</option>
                                <option value="price-high">Price: High</option>
                                <option value="rating">Top Rated</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        <Button className="shadow-lg shadow-primary/20 h-[42px]" onClick={() => navigate('/renthub/new')}>
                            <Plus className="mr-1.5 h-4 w-4" />
                            Rent Items
                        </Button>
                    </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeFilter === filter ? 'bg-primary text-white shadow-md' : 'bg-gray-100/50 text-gray-600 hover:bg-white hover:shadow-sm'}`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Items Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-7xl mx-auto">
                {filteredAndSortedRentals.length > 0 ? (
                    filteredAndSortedRentals.map((item) => (
                        <RentalCard
                            key={item.id}
                            item={item}
                            onClick={() => navigate(`/renthub/${item.id}`)}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center">
                        <div className="inline-block p-4 rounded-2xl bg-gray-50 mb-3">
                            <Search size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">No rentals found</h3>
                        <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RentHubHome;
