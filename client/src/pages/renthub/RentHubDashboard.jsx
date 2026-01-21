import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, Clock, Shield, DollarSign, AlertCircle, CheckCircle2,
    Calendar, ChevronRight, Smartphone, Shirt, ArrowRight,
    MessageCircle, MoreVertical, RefreshCcw, FileText, Plus, ArrowLeft
} from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import renthubService from '../../services/renthubService';

const RentHubDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('renting');
    const [activeRentals, setActiveRentals] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            // Check if user is logged in
            if (!user?.id || user.id.length < 36 || user.id.startsWith('temp-')) {
                setError('Please login to view your rentals');
                return;
            }

            setLoading(true);
            setError('');
            try {
                // Fetch user's rentals (as renter)
                const rentalsRes = await renthubService.getUserRentals(user.id);
                const rentals = rentalsRes.data || [];

                // Map to component format
                const mappedRentals = rentals.map(rental => ({
                    id: rental.id,
                    title: rental.title,
                    image: rental.images && rental.images.length > 0 ? rental.images[0] : 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
                    owner: rental.owner_name,
                    dueDate: new Date(rental.end_date).toLocaleDateString(),
                    startDate: new Date(rental.start_date).toLocaleDateString(),
                    endDate: new Date(rental.end_date).toLocaleDateString(),
                    status: rental.status === 'ACTIVE' ? 'active' : rental.status.toLowerCase(),
                    totalPrice: parseFloat(rental.total_price) || 0,
                    durationDays: rental.duration_days,
                    dailyPrice: parseFloat(rental.daily_price) || 0,
                    progress: calculateProgress(rental.start_date, rental.end_date)
                }));
                setActiveRentals(mappedRentals);

                // Fetch user's listings (as owner)
                const listingsRes = await renthubService.getUserListings(user.id);
                const listings = listingsRes.data || [];

                // Map to component format  
                const mappedListings = listings.map(listing => ({
                    id: listing.id,
                    title: listing.title,
                    category: listing.category,
                    image: listing.images && listing.images.length > 0 ? listing.images[0] : 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
                    price: parseFloat(listing.daily_price),
                    status: listing.status,
                    availability: `${new Date(listing.availability_start).toLocaleDateString()} - ${new Date(listing.availability_end).toLocaleDateString()}`,
                    views: 0, // Can be added to backend later
                    bookings: 0 // Can be calculated from transactions
                }));
                setMyListings(mappedListings);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const calculateProgress = (startDate, endDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        const total = end - start;
        const elapsed = now - start;
        return Math.min(Math.max((elapsed / total) * 100, 0), 100);
    };

    const handleCompleteRental = async (transactionId) => {
        try {
            await renthubService.completeTransaction(transactionId);
            alert('Rental completed successfully!');
            // Refresh data
            window.location.reload();
        } catch (err) {
            console.error('Error completing rental:', err);
            alert(err.error || 'Failed to complete rental');
        }
    };

    return (
        <div className="relative min-h-screen p-4 md:p-6 space-y-8 font-sans text-gray-900 dark:text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/renthub')}
                        className="p-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:border-emerald-500 hover:text-emerald-600 dark:text-gray-200 dark:hover:text-emerald-400 transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">My Rental Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs mt-1">Manage your gear and bookings</p>
                    </div>
                </div>
                <div className="flex bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-1.5 rounded-2xl border border-white dark:border-gray-700 shadow-sm">
                    <button
                        onClick={() => setActiveTab('renting')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'renting' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Renting
                    </button>
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'listings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        My Listings
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                            <Clock className="h-5 w-5" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Rentals</p>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{activeRentals.filter(r => r.status === 'active').length}</h3>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                            <Package className="h-5 w-5" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">My Listings</p>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{myListings.length}</h3>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Spent</p>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">৳{activeRentals.reduce((sum, r) => sum + (parseFloat(r.totalPrice) || 0), 0).toFixed(2)}</h3>
                </div>
                <div className="bg-gray-900 p-6 rounded-[2rem] text-white shadow-xl shadow-gray-200 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Available Items</p>
                        <h3 className="text-2xl font-black flex items-center gap-2">
                            {myListings.filter(l => l.status === 'AVAILABLE').length} <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        </h3>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
                    <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
                    <Button onClick={() => navigate('/login')} className="mt-4">Go to Login</Button>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main List */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'renting' ? (
                        <>
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Active Rentals</h2>
                                <Button variant="ghost" size="sm" className="font-bold text-emerald-600 dark:text-emerald-400">History <ChevronRight className="ml-1 h-4 w-4" /></Button>
                            </div>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                        <p className="text-gray-500 mt-4">Loading rentals...</p>
                                    </div>
                                ) : activeRentals.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">No active rentals</p>
                                        <Button onClick={() => navigate('/renthub')} className="mt-4">Browse Items</Button>
                                    </div>
                                ) : (
                                    activeRentals.map((rental) => (
                                        <div key={rental.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                                <div className="h-24 w-24 rounded-3xl overflow-hidden shrink-0">
                                                    <img src={rental.image} alt={rental.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{rental.title}</h3>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Lent by <span className="font-bold text-gray-900 dark:text-gray-200">{rental.owner}</span></p>
                                                            <p className="text-xs text-gray-400 mt-1">{rental.startDate} - {rental.endDate} ({rental.durationDays} days)</p>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${rental.status === 'completed' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'}`}>
                                                            {rental.status}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                                            <span>Progress</span>
                                                            <span>Due: {rental.dueDate}</span>
                                                        </div>
                                                        <div className="h-2 bg-gray-50 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full bg-emerald-500"
                                                                style={{ width: `${rental.progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex md:flex-col gap-2">
                                                    <p className="text-xl font-black text-gray-900 dark:text-white">৳{(parseFloat(rental.totalPrice) || 0).toFixed(2)}</p>
                                                    {rental.status === 'ACTIVE' && (
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            className="rounded-xl font-bold bg-emerald-600 shadow-sm shadow-emerald-100"
                                                            onClick={() => handleCompleteRental(rental.id)}
                                                        >
                                                            Complete Rental
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-black">My Active Listings</h2>
                                <Button className="bg-blue-600 hover:bg-blue-700 font-bold" onClick={() => navigate('/renthub/new')}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Item
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                        <p className="text-gray-500 mt-4">Loading listings...</p>
                                    </div>
                                ) : myListings.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">No active listings</p>
                                        <Button onClick={() => navigate('/renthub/new')} className="mt-4">Create Listing</Button>
                                    </div>
                                ) : (
                                    myListings.map((listing) => (
                                        <div key={listing.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                                <div className="h-24 w-24 rounded-3xl overflow-hidden shrink-0">
                                                    <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{listing.title}</h3>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{listing.category}</p>
                                                            <p className="text-xs text-gray-400 mt-1">Available: {listing.availabilityStart} - {listing.availabilityEnd}</p>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${listing.status === 'AVAILABLE' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                                                            listing.status === 'RENTED' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                                                                'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                                                            }`}>
                                                            {listing.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-6">
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase">Daily Price</p>
                                                            <p className="text-lg font-black text-blue-600 dark:text-blue-400">৳{listing.dailyPrice}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex md:flex-col gap-2">
                                                    <Button size="sm" className="rounded-xl font-bold bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" onClick={() => navigate(`/renthub/${listing.id}`)}>View Details</Button>
                                                </div>
                                            </div>
                                        </div>
                                    )))}
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar Alerts */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-8 shadow-sm space-y-6">
                        <h3 className="text-lg font-black flex items-center gap-2">
                            <RefreshCcw className="h-5 w-5 text-emerald-600" /> Notifications
                        </h3>
                        <div className="space-y-6">
                            <div className="flex gap-4 group cursor-pointer">
                                <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Return date approaching!</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Canon EOS R6 is due in 24 hours. Plan your return accordingly.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 group cursor-pointer">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">New Rental Agreement</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Digital contract for Black Tuxedo has been signed by both parties.</p>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" className="w-full rounded-xl font-bold bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 h-12">View All Alerts</Button>
                    </div>

                    <div className="rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <h4 className="text-2xl font-black leading-tight mb-4">Inspecting returned <br />items?</h4>
                        <p className="text-emerald-100 text-xs font-medium mb-6 opacity-80">
                            Use the RentHub checklist to ensure everything is in order before releasing the security deposit.
                        </p>
                        <Button className="w-full rounded-xl bg-white text-emerald-900 font-black h-12 shadow-lg shadow-emerald-900/20">
                            Check Item
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RentHubDashboard;
