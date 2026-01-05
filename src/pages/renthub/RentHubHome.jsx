import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Repeat, Search, Filter, Plus, Calendar, Shield, Clock,
    Smartphone, Shirt, Trophy, Calculator, Speaker,
    ChevronRight, ArrowRight, Star, Info, CheckCircle2,
    DollarSign, FileText, Bell, Package
} from 'lucide-react';
import Button from '../../components/Button';

const RentHubHome = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = [
        { name: 'All', icon: Package, color: 'bg-gray-100 text-gray-600' },
        { name: 'Study Tech', icon: Smartphone, color: 'bg-blue-100 text-blue-600', description: 'Laptops, tablets, e-readers' },
        { name: 'Research Gear', icon: Calculator, color: 'bg-orange-100 text-orange-600', description: 'Lab coats, kits, specialized tools' },
        { name: 'Media Equipment', icon: Speaker, color: 'bg-pink-100 text-pink-600', description: 'Cameras, microphones, lighting' },
        { name: 'Exam Essentials', icon: Calculator, color: 'bg-emerald-100 text-emerald-600', description: 'Calculators, clickers, study aids' },
    ];

    const featuredRentals = [
        {
            id: 1,
            title: "Sony Alpha a7 III Camera",
            category: "Media Equipment",
            price: 25,
            period: "day",
            deposit: 100,
            image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80",
            rating: 4.9,
            reviews: 24,
            owner: "Sarah W."
        },
        {
            id: 2,
            title: "MacBook Pro M2 - Space Gray",
            category: "Study Tech",
            price: 40,
            period: "day",
            deposit: 500,
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
            rating: 5.0,
            reviews: 18,
            owner: "Tech Support"
        },
        {
            id: 3,
            title: "TI-84 Plus CE Graphing Calculator",
            category: "Exam Essentials",
            price: 5,
            period: "day",
            deposit: 30,
            image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&q=80",
            rating: 5.0,
            reviews: 38,
            owner: "Professor Oak"
        }
    ];

    const howItWorks = {
        owners: [
            { icon: Plus, title: "List Item", desc: "Set rates, deposit, and availability" },
            { icon: CheckCircle2, title: "Approve Requests", desc: "Manage bookings via dashboard" },
            { icon: Bell, title: "Track Rental", desc: "Automated status notifications" },
            { icon: Shield, title: "Safe Return", desc: "Inspect and release deposit" }
        ],
        renters: [
            { icon: Search, title: "Search & View", desc: "Browse items and check dates" },
            { icon: DollarSign, title: "Secure Booking", desc: "Pay deposit and sign agreement" },
            { icon: Clock, title: "Smart Reminders", desc: "Get return date alerts" },
            { icon: Repeat, title: "Hassle-free Return", desc: "Get your deposit back instantly" }
        ]
    };

    return (
        <div className="relative min-h-screen p-4 md:p-6 space-y-8 font-sans text-gray-900">
            {/* Background Details */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
            </div>

            {/* Hero Section */}
            <div className="relative rounded-[3rem] bg-white/40 backdrop-blur-xl border border-white/60 p-8 md:p-12 overflow-hidden group shadow-sm hover:shadow-md transition-all duration-500">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-50 to-transparent opacity-50"></div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold mb-6">
                        <Repeat className="h-4 w-4" />
                        Smart Rental Ecosystem
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
                        Rent What You Need, <br />
                        <span className="text-emerald-600">Earn From What You Own.</span>
                    </h1>
                    <p className="text-lg text-gray-600 font-medium mb-8 leading-relaxed">
                        The specialized rental ecosystem for academic success. From high-end laptops
                        to specialized lab gear, find exactly what you need for your studies with
                        automated tracking and secure deposits.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Button
                            className="h-14 px-8 rounded-2xl text-lg font-bold shadow-lg shadow-emerald-200"
                            onClick={() => navigate('/renthub/new')}
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            List an Item
                        </Button>
                        <div className="relative flex-1 min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search laptops, calculators, lab gear..."
                                className="w-full pl-12 pr-4 h-14 rounded-2xl bg-white border-2 border-transparent focus:border-emerald-500 focus:outline-none shadow-sm transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <section>
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-2xl font-black text-gray-900">Browse Categories</h2>
                    <Button variant="ghost" className="text-emerald-600 font-bold">View All</Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.map((cat) => (
                        <button
                            key={cat.name}
                            onClick={() => setActiveCategory(cat.name)}
                            className={`p-6 rounded-3xl border-2 transition-all duration-300 group ${activeCategory === cat.name
                                ? 'bg-white border-emerald-500 shadow-lg scale-105'
                                : 'bg-white/60 border-transparent hover:bg-white hover:border-gray-200'
                                }`}
                        >
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${cat.color}`}>
                                <cat.icon className="h-6 w-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm mb-1">{cat.name}</h3>
                            <p className="text-[10px] text-gray-500 font-medium leading-tight">
                                {cat.name === 'All' ? 'Everything here' : cat.description}
                            </p>
                        </button>
                    ))}
                </div>
            </section>

            {/* How It Works - Split Section */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Owners Pathway */}
                <div className="rounded-[2.5rem] bg-white/60 backdrop-blur-md border border-white p-8 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                            <Smartphone className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900">For Item Owners</h3>
                            <p className="text-sm text-gray-500 font-bold">Monetize your unused assets</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        {howItWorks.owners.map((step, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-10 w-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center text-blue-600">
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <h4 className="text-sm font-bold text-gray-900">{step.title}</h4>
                                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Renters Pathway */}
                <div className="rounded-[2.5rem] bg-white/60 backdrop-blur-md border border-white p-8 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                            <Repeat className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900">For Renters</h3>
                            <p className="text-sm text-gray-500 font-bold">Access premium gear on budget</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        {howItWorks.renters.map((step, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-10 w-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center text-emerald-600">
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <h4 className="text-sm font-bold text-gray-900">{step.title}</h4>
                                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured Section */}
            <section>
                <div className="flex items-center justify-between mb-8 px-2">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Featured Rentals</h2>
                        <p className="text-gray-500 text-sm font-medium">Top rated items available now</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="rounded-xl border-gray-200">
                            <Filter className="mr-2 h-4 w-4" /> Filter
                        </Button>
                        <Button variant="primary" className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                            See More
                        </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredRentals.map((item) => (
                        <div
                            key={item.id}
                            className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                            onClick={() => navigate(`/renthub/${item.id}`)}
                        >
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
                                        {item.category}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <button className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors">
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 text-white">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-[10px] font-bold opacity-80 uppercase">Daily Rate</p>
                                            <p className="text-[10px] font-bold opacity-80 uppercase">Deposit</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-xl font-black">${item.price}<span className="text-xs font-normal opacity-70"> /day</span></p>
                                            <p className="text-xl font-black text-emerald-400">${item.deposit}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span className="text-sm font-bold text-gray-700">{item.rating}</span>
                                        <span className="text-xs text-gray-400 font-medium">({item.reviews})</span>
                                    </div>
                                    <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                            {item.owner.charAt(0)}
                                        </div>
                                        <span className="text-xs font-bold text-gray-500">{item.owner}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1 rounded-xl border-gray-100 font-bold group-hover:bg-gray-50">
                                        View Details
                                    </Button>
                                    <Button className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-100">
                                        Book Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Smart Tracker Preview (Mini Dashboard) */}
            <div className="rounded-[2.5rem] bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-12 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-md">
                        <h2 className="text-3xl font-black mb-4">Never miss a return with <br /><span className="text-emerald-400 font-extrabold italic">SmartNotify™</span></h2>
                        <p className="text-gray-400 font-medium mb-6">
                            RentHub automatically handles rental agreements, security deposits,
                            and sends intelligent notifications 3 days, 1 day, and on the due date.
                        </p>
                        <ul className="space-y-3 mb-8">
                            {[
                                "Automated Late Fee Calculation",
                                "Digital Rental Agreements",
                                "One-Click Deposit Release",
                                "Damage Protection Coverage"
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-bold">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                        <Button className="h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold">
                            View Dashboard
                        </Button>
                    </div>
                    <div className="relative w-full max-w-sm">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse"></div>
                        <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-3xl space-y-4">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <p className="font-bold text-sm">Active Rental</p>
                                <span className="px-2 py-1 rounded-md bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase">Return Tomorrow</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <Smartphone className="h-6 w-6 text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold">Canon EOS R6</p>
                                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-2">
                                        <div className="bg-emerald-400 h-full w-[85%] rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest flex justify-between">
                                <span>Rented: Oct 12</span>
                                <span>Due: Oct 17</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RentHubHome;
