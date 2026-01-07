import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar, Shield, Clock, Star, ArrowLeft, MessageCircle,
    CheckCircle2, AlertCircle, Info, ChevronRight, Share2, Heart,
    DollarSign, FileText, Smartphone, Package, User
} from 'lucide-react';
import Button from '../../components/Button';
import renthubService from '../../services/renthubService';

const RentHubItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    // Old mock data (removed)
    const rentals = [
        {
            id: 1,
            title: "Calculus: Early Transcendentals (8th Edition)",
            category: "Textbooks",
            price: 5,
            deposit: 30,
            images: [
                "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
                "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80"
            ],
            rating: 4.9,
            reviewsCount: 12,
            owner: { name: "Sarah W.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", joined: "Sep 2023", totalRentals: 45 },
            description: "Essential textbook for early calculus students. Perfect condition, no markings.",
            rules: ["Return on time", "No page folding"],
            availability: "Available Now"
        },
        {
            id: 2,
            title: "MacBook Pro M2 - Space Gray (16GB RAM)",
            category: "Electronics",
            price: 40,
            deposit: 500,
            images: [
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
                "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80"
            ],
            rating: 5.0,
            reviewsCount: 8,
            owner: { name: "Alex K.", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&q=80", joined: "Jan 2024", totalRentals: 128 },
            description: "High performance MacBook Pro with M2 chip. Excellent for video editing and coding projects.",
            rules: ["Do not install malware", "Return with original charger"],
            availability: "Available Now"
        },
        {
            id: 3,
            title: "TI-84 Plus CE Graphing Calculator",
            category: "Exam Essentials",
            price: 5,
            deposit: 50,
            images: [
                "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80"
            ],
            rating: 5.0,
            reviewsCount: 32,
            owner: { name: "Professor Oak", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", joined: "Aug 2022", totalRentals: 210 },
            description: "The gold standard for math exams. Color screen, fast processing.",
            rules: ["Wipe memory before return", "No physical damage"],
            availability: "Available for Midterms"
        },
        {
            id: 4,
            title: "Digital Microscope - 1000x Magnification",
            category: "Research Gear",
            price: 15,
            deposit: 100,
            images: [
                "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80"
            ],
            rating: 4.8,
            reviewsCount: 5,
            owner: { name: "BioDept", avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&q=80", joined: "Mar 2023", totalRentals: 88 },
            description: "USB Digital Microscope with 1000x zoom. Includes base station and slides.",
            rules: ["Clean lens after use", "Handle base with care"],
            availability: "Available Now"
        },
        {
            id: 5,
            title: "Ergonomic Office Chair - Black Mesh",
            category: "Furniture",
            price: 10,
            deposit: 80,
            images: [
                "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80"
            ],
            rating: 4.5,
            reviewsCount: 15,
            owner: { name: "Mike R.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", joined: "Dec 2023", totalRentals: 12 },
            description: "Premium mesh chair for long study sessions. Fully adjustable height and armrests.",
            rules: ["Weight limit 250lbs", "No food spills"],
            availability: "Available Now"
        },
        {
            id: 6,
            title: "Tennis Racket - Wilson Pro Staff",
            category: "Sports",
            price: 8,
            deposit: 40,
            images: [
                "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80"
            ],
            rating: 4.7,
            reviewsCount: 10,
            owner: { name: "Athlete J.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", joined: "May 2024", totalRentals: 5 },
            description: "Professional grade tennis racket for competitive play.",
            rules: ["Do not throw racket", "Keep in bag when traveling"],
            availability: "Available on Weekends"
        },
        {
            id: 7,
            title: "Sony Alpha a7 III Camera",
            category: "Electronics",
            price: 25,
            deposit: 200,
            images: [
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
                "https://images.unsplash.com/photo-1513650125333-0d366486cdc1?w=800&q=80"
            ],
            rating: 4.9,
            reviewsCount: 24,
            owner: { name: "John D.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", joined: "Sep 2023", totalRentals: 156 },
            description: "Professional mirrorless camera. Includes 28-70mm lens and kit bag.",
            rules: ["Handle with care", "Return with full battery"],
            availability: "Available from Oct 15"
        }
    ];

    // Calculate rental cost
    const calculateTotal = () => {
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
                    <p className="text-gray-500">Loading item details...</p>
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Failed to load item</h2>
                    <p className="text-gray-500 mb-4">{error || 'Item not found'}</p>
                    <Button onClick={() => navigate('/renthub')}>Back to RentHub</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen p-4 md:p-6 space-y-8 font-sans text-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    className="group flex items-center gap-2 hover:bg-white/50 rounded-xl"
                    onClick={() => navigate('/renthub')}
                >
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    Back to RentHub
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl border-gray-200 bg-white">
                        <Share2 className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl border-gray-200 bg-white">
                        <Heart className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Images & Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Image Gallery */}
                    <div className="relative h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden group shadow-xl bg-gray-100">
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
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 md:p-10 space-y-6">
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

                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-lg font-black mb-4">About this rental</h3>
                            <p className="text-gray-600 font-medium leading-relaxed">
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
                                        <span key={tag} className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Owner Info */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-lg">
                                <img src={item.owner.avatar} alt={item.owner.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900">{item.owner.name}</h4>
                                <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Owner since {item.owner.joined}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="text-right hidden sm:block mr-4">
                                <p className="text-xs font-bold text-gray-400">SUCCESSFUL RENTALS</p>
                                <p className="text-xl font-black text-emerald-600">{item.owner.totalRentals}+</p>
                            </div>
                            <Button variant="outline" className="rounded-xl border-gray-200">
                                <MessageCircle className="mr-2 h-4 w-4" /> Message
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right: Booking Card */}
                <div className="space-y-6">
                    <div className="sticky top-6 bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden">
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Rental Rate</p>
                                    <h3 className="text-4xl font-black">${item.price}<span className="text-lg font-normal text-gray-500"> /day</span></h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Security Deposit</p>
                                    <h4 className="text-2xl font-black text-emerald-600">${item.deposit}</h4>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">START DATE</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:outline-none font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1">END DATE</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:outline-none font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {days > 0 && (
                                <div className="pt-4 space-y-3">
                                    <div className="flex justify-between text-sm font-bold text-gray-500">
                                        <span>${item.price} x {days} days</span>
                                        <span>${calculateTotal()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold text-emerald-600">
                                        <span>Refundable Deposit</span>
                                        <span>${item.deposit}</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 flex justify-between">
                                        <span className="text-lg font-black">Total to pay</span>
                                        <span className="text-2xl font-black">${calculateTotal() + item.deposit}</span>
                                    </div>
                                </div>
                            )}

                            <Button
                                className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-lg font-black shadow-lg shadow-emerald-100"
                                disabled={!startDate || !endDate}
                            >
                                Proceed to Booking
                            </Button>

                            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                You won't be charged yet
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
