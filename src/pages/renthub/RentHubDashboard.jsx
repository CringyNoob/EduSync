import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, Clock, Shield, DollarSign, AlertCircle, CheckCircle2,
    Calendar, ChevronRight, Smartphone, Shirt, ArrowRight,
    MessageCircle, MoreVertical, RefreshCcw, FileText, Plus
} from 'lucide-react';
import Button from '../../components/Button';

const RentHubDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('renting');

    const activeRentals = [
        {
            id: 101,
            title: "Canon EOS R6 Kit",
            owner: "Sarah W.",
            dueDate: "Tomorrow, 5 PM",
            status: "due-soon",
            deposit: 150,
            paid: 45,
            progress: 85,
            image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&q=80"
        },
        {
            id: 102,
            title: "MacBook Pro M2 - Silver",
            owner: "TechLab",
            dueDate: "Oct 24, 2023",
            status: "active",
            deposit: 500,
            paid: 120,
            progress: 30,
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&q=80"
        }
    ];

    const myListings = [
        {
            id: 201,
            title: "MacBook Pro M2",
            renter: "Jane Doe",
            status: "rented",
            dueDate: "Oct 20, 2023",
            earnings: 120,
            depositHeld: 300,
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&q=80"
        }
    ];

    return (
        <div className="relative min-h-screen p-4 md:p-6 space-y-8 font-sans text-gray-900">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black">My Rental Dashboard</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-wider text-xs mt-1">Manage your gear and bookings</p>
                </div>
                <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-sm">
                    <button
                        onClick={() => setActiveTab('renting')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'renting' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Renting
                    </button>
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'listings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        My Listings
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Shield className="h-5 w-5" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Held Deposits</p>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900">$200.00</h3>
                </div>
                <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Earnings</p>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900">$120.00</h3>
                </div>
                <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                            <Clock className="h-5 w-5" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Rentals</p>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900">3</h3>
                </div>
                <div className="bg-gray-900 p-6 rounded-[2rem] text-white shadow-xl shadow-gray-200 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Power User Rank</p>
                        <h3 className="text-2xl font-black flex items-center gap-2">
                            Top 5% <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        </h3>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main List */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'renting' ? (
                        <>
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-black">Active Rentals</h2>
                                <Button variant="ghost" size="sm" className="font-bold text-emerald-600">History <ChevronRight className="ml-1 h-4 w-4" /></Button>
                            </div>
                            <div className="space-y-4">
                                {activeRentals.map((rental) => (
                                    <div key={rental.id} className="bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                                            <div className="h-24 w-24 rounded-3xl overflow-hidden shrink-0">
                                                <img src={rental.image} alt={rental.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-xl font-bold">{rental.title}</h3>
                                                        <p className="text-sm text-gray-500 font-medium">Lent by <span className="font-bold text-gray-900">{rental.owner}</span></p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${rental.status === 'due-soon' ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                                                        }`}>
                                                        {rental.status === 'due-soon' ? 'Due Tomorrow' : 'Active'}
                                                    </span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                                        <span>Progress</span>
                                                        <span>Due: {rental.dueDate}</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${rental.status === 'due-soon' ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${rental.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex md:flex-col gap-2">
                                                <Button size="sm" className="rounded-xl font-bold bg-gray-50 hover:bg-gray-100 text-gray-900 border-none">Details</Button>
                                                <Button size="sm" variant="primary" className="rounded-xl font-bold bg-emerald-600 shadow-sm shadow-emerald-100">Return Item</Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
                                {myListings.map((listing) => (
                                    <div key={listing.id} className="bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-sm">
                                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                                            <div className="h-24 w-24 rounded-3xl overflow-hidden shrink-0">
                                                <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-xl font-bold">{listing.title}</h3>
                                                        <p className="text-sm text-gray-500 font-medium">Current Renter: <span className="font-bold text-gray-900">{listing.renter}</span></p>
                                                    </div>
                                                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 border border-blue-200 text-[10px] font-black uppercase">Rented</span>
                                                </div>
                                                <div className="flex gap-6">
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase">Held Deposit</p>
                                                        <p className="text-lg font-black text-blue-600">${listing.depositHeld}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase">Earnings so far</p>
                                                        <p className="text-lg font-black text-gray-900">${listing.earnings}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex md:flex-col gap-2">
                                                <Button size="sm" className="rounded-xl font-bold bg-gray-50 text-gray-900">Manage</Button>
                                                <Button size="sm" className="rounded-xl font-bold bg-blue-600 text-white">Confirm Return</Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar Alerts */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm space-y-6">
                        <h3 className="text-lg font-black flex items-center gap-2">
                            <RefreshCcw className="h-5 w-5 text-emerald-600" /> Notifications
                        </h3>
                        <div className="space-y-6">
                            <div className="flex gap-4 group cursor-pointer">
                                <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">Return date approaching!</p>
                                    <p className="text-xs text-gray-500 font-medium mt-1">Canon EOS R6 is due in 24 hours. Plan your return accordingly.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 group cursor-pointer">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">New Rental Agreement</p>
                                    <p className="text-xs text-gray-500 font-medium mt-1">Digital contract for Black Tuxedo has been signed by both parties.</p>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" className="w-full rounded-xl font-bold bg-gray-50 text-gray-600 h-12">View All Alerts</Button>
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
