import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar, Shield, Clock, Star, ArrowLeft, MessageCircle,
    CheckCircle2, AlertCircle, Info, ChevronRight, Share2, Heart,
    DollarSign, FileText, Smartphone, Package, User
} from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import renthubService from '../../services/renthubService';

const RentHubItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [booking, setBooking] = useState(false);
    const [bookingError, setBookingError] = useState('');

    // Fetch listing details on mount
    useEffect(() => {
        const fetchListing = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await renthubService.getListingById(id);
                const listing = response.data;
                setItem({
                    id: listing.id,
                    title: listing.title,
                    category: listing.category,
                    price: parseFloat(listing.daily_price),
                    deposit: 0, // Can be added to backend if needed
                    images: listing.images || ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80'],
                    rating: 4.5,
                    reviewsCount: 10,
                    owner: {
                        name: listing.owner_name,
                        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
                        joined: 'Recently',
                        totalRentals: 0
                    },
                    description: listing.description || 'No description available',
                    rules: ['Return on time', 'Keep item in good condition'],
                    availability: listing.status === 'AVAILABLE' ? 'Available Now' : 'Currently Unavailable'
                });
            } catch (err) {
                console.error('Error fetching listing:', err);
                setError(err.message || 'Failed to load listing');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchListing();
        }
    }, [id]);

    // Calculate rental cost
    const calculateTotal = () => {
        if (!startDate || !endDate || !item) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return days > 0 ? days * item.price : 0;
    };

    const getDurationDays = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return days > 0 ? days : 0;
    };

    const handleRentNow = async () => {
        setBookingError('');

        // Check if user is logged in
        if (!user?.id || user.id.length < 36 || user.id.startsWith('temp-')) {
            setBookingError('Please login to rent items');
            return;
        }

        // Validation
        if (!startDate || !endDate) {
            setBookingError('Please select rental dates');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end <= start) {
            setBookingError('End date must be after start date');
            return;
        }

        if (start < new Date()) {
            setBookingError('Start date cannot be in the past');
            return;
        }

        setBooking(true);

        try {
            const transactionData = {
                listing_id: item.id,
                renter_id: user.id,
                renter_name: user.name,
                renter_email: user.email,
                start_date: startDate,
                end_date: endDate
            };

            const response = await renthubService.createTransaction(transactionData);

            if (response.success) {
                alert(`Rental confirmed! Total: ৳${calculateTotal()}\nDuration: ${getDurationDays()} days`);
                navigate('/renthub/my-rentals');
            }
        } catch (err) {
            console.error('Error creating rental:', err);
            setBookingError(err.error || err.message || 'Failed to create rental. Please try again.');
        } finally {
            setBooking(false);
        }
    };

    // Old calculateTotal function (removed)
    const calculateTotalOld = () => {
        if (!startDate || !endDate || !item) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff * item.price : 0;
    };

    const days = item ? calculateTotal() / item.price : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading item details...</p>
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Failed to load item</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{error || 'Item not found'}</p>
                    <Button onClick={() => navigate('/renthub')}>Back to RentHub</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen p-4 md:p-6 space-y-8 font-sans text-gray-900 dark:text-white transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    className="group flex items-center gap-2 hover:bg-white/50 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300"
                    onClick={() => navigate('/renthub')}
                >
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    Back to RentHub
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Share2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Heart className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Images & Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Image Gallery */}
                    <div className="relative h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden group shadow-xl bg-gray-100 dark:bg-gray-700">
                        <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-6 left-6">
                            <span className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest border border-white/20">
                                {item.category}
                            </span>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-gray-700/50 p-8 md:p-10 space-y-6 transition-colors duration-300">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black mb-2">{item.title}</h1>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                        <span className="font-bold">{item.rating}</span>
                                        <span className="text-gray-400 font-medium">({item.reviewsCount} reviews)</span>
                                    </div>
                                    <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                                    <span className="text-emerald-600 font-bold">{item.availability}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-black mb-4 text-gray-900 dark:text-white">About this rental</h3>
                            <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                                {item.description}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 pt-6">
                            <div>
                                <h3 className="text-lg font-black mb-4">Rental Rules</h3>
                                <ul className="space-y-3">
                                    {item.rules.map((rule, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-semibold text-gray-500">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-black mb-4">Quick Specs</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Official Kit', 'Certified', 'EduSync Insured'].map((tag) => (
                                        <span key={tag} className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Owner Info */}
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[2.5rem] border border-white dark:border-gray-700/50 p-8 flex items-center justify-between transition-colors duration-300">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700">
                                <img src={item.owner.avatar} alt={item.owner.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900 dark:text-white">{item.owner.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide">Owner since {item.owner.joined}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="text-right hidden sm:block mr-4">
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500">SUCCESSFUL RENTALS</p>
                                <p className="text-xl font-black text-emerald-600">{item.owner.totalRentals}+</p>
                            </div>
                            <Button variant="outline" className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <MessageCircle className="mr-2 h-4 w-4" /> Message
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right: Booking Card */}
                <div className="space-y-6">
                    <div className="sticky top-6 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden transition-colors duration-300">
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Rental Rate</p>
                                    <h3 className="text-4xl font-black text-gray-900 dark:text-white">৳{item.price}<span className="text-lg font-normal text-gray-500 dark:text-gray-400"> /day</span></h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Security Deposit</p>
                                    <h4 className="text-2xl font-black text-emerald-600">৳{item.deposit}</h4>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">START DATE</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-emerald-500 focus:outline-none font-bold text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">END DATE</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-emerald-500 focus:outline-none font-bold text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {bookingError && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl">
                                    <p className="text-sm text-red-600 dark:text-red-400 font-semibold">{bookingError}</p>
                                </div>
                            )}

                            {getDurationDays() > 0 && (
                                <div className="pt-4 space-y-3">
                                    <div className="flex justify-between text-sm font-bold text-gray-500 dark:text-gray-400">
                                        <span>৳{item.price} x {getDurationDays()} days</span>
                                        <span>৳{calculateTotal()}</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                                        <span className="text-lg font-black text-gray-900 dark:text-white" >Total to pay</span>
                                        <span className="text-2xl font-black text-gray-900 dark:text-white">৳{calculateTotal()}</span>
                                    </div>
                                </div>
                            )}

                            <Button
                                className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-lg font-black shadow-lg shadow-emerald-100"
                                disabled={!startDate || !endDate || booking}
                                onClick={handleRentNow}
                            >
                                {booking ? 'Processing...' : 'Rent Now'}
                            </Button>

                            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                Secure payment via EduSync
                            </p>
                        </div>

                        {/* Agreement Info */}
                        <div className="bg-gray-50 p-6 border-t border-gray-100 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                    <FileText className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-900">Rental Agreement</p>
                                    <p className="text-[10px] text-gray-500 font-bold">Automatic digital contract generation</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                    <Shield className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-900">Secure Deposit</p>
                                    <p className="text-[10px] text-gray-500 font-bold">Managed safely by EduSync system</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-orange-50 border border-orange-100">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-orange-600 shrink-0" />
                            <div>
                                <p className="text-xs font-black text-orange-900">Important Note</p>
                                <p className="text-[10px] text-orange-700 font-bold leading-relaxed mt-1">
                                    Remember to inspect the item upon handover. RentHub will send reminders 1 day before the due date.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RentHubItemDetails;
