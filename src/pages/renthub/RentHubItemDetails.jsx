import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar, Shield, Clock, Star, ArrowLeft, MessageCircle,
    CheckCircle2, AlertCircle, Info, ChevronRight, Share2, Heart,
    DollarSign, FileText, Smartphone, Package, User
} from 'lucide-react';
import Button from '../../components/Button';

const RentHubItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Mock data for the item
    const item = {
        id: id,
        title: "Sony Alpha a7 III Camera",
        category: "Electronics",
        price: 25,
        deposit: 100,
        owner: {
            name: "Sarah Williams",
            rating: 4.9,
            totalRentals: 156,
            joined: "Sep 2023"
        },
        description: "Professional grade mirrorless camera. Perfect for student projects, events, and high-quality vlogging. Includes 28-70mm lens, 2 batteries, and a 64GB SD card.",
        rules: [
            "Handle with extreme care",
            "Return with full battery",
            "Do not use in rain without protection",
            "Late return fee: $10/hour"
        ],
        images: [
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
            "https://images.unsplash.com/photo-1513650125333-0d366486cdc1?w=800&q=80"
        ],
        availability: "Available from Oct 15",
        rating: 4.9,
        reviewsCount: 24
    };

    const calculateTotal = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff * item.price : 0;
    };

    const days = calculateTotal() / item.price;

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
                    <div className="relative h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden group shadow-xl">
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
                                <h3 className="text-lg font-black mb-4">What's included</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Lens', 'Bag', 'SD Card', '2 Batteries', 'Charger'].map((tag) => (
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
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                                {item.owner.name.charAt(0)}
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
                                    Remember to inspect the item upon handover. RentHub will send reminders 3 days, 1 day, and on the due date.
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
