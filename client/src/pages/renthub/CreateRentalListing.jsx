import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Image, Smartphone, Shirt, Trophy,
    Calculator, Speaker, Package, DollarSign, Calendar,
    Shield, Clock, Info, CheckCircle2, X, BookOpen, Monitor, Armchair
} from 'lucide-react';
import Button from '../../components/Button';
import renthubService from '../../services/renthubService';

const CreateRentalListing = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        dailyRate: '',
        weeklyRate: '',
        deposit: '',
        rules: '',
        availability: []
    });

    const categories = [
        { name: 'Textbooks', icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
        { name: 'Electronics', icon: Monitor, color: 'text-indigo-600 bg-indigo-50' },
        { name: 'Research Gear', icon: Calculator, color: 'text-orange-600 bg-orange-50' },
        { name: 'Furniture', icon: Armchair, color: 'text-yellow-600 bg-yellow-50' },
        { name: 'Clothing', icon: Shirt, color: 'text-purple-600 bg-purple-50' },
        { name: 'Sports', icon: Trophy, color: 'text-emerald-600 bg-emerald-50' },
        { name: 'Exam Essentials', icon: Calculator, color: 'text-cyan-600 bg-cyan-50' },
        { name: 'Others', icon: Package, color: 'text-gray-600 bg-gray-50' },
    ];

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        // TODO: Get actual user info from auth context
        const listingData = {
            owner_id: 'user001',
            owner_name: 'Current User',
            owner_email: 'user@uiu.edu',
            title: formData.title,
            description: formData.description,
            daily_price: parseFloat(formData.dailyRate),
            category: formData.category,
            images: [], // Can add image upload functionality
            availability_start: new Date().toISOString().split('T')[0],
            availability_end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days from now
        };

        try {
            await renthubService.createListing(listingData);
            // Navigate to renthub on success
            navigate('/renthub');
        } catch (err) {
            console.error('Error creating listing:', err);
            alert('Failed to create listing. Please try again.');
        }
    };

    return (
        <div className="relative min-h-screen p-4 md:p-6 space-y-8 font-sans text-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between max-w-4xl mx-auto">
                <Button
                    variant="ghost"
                    className="group"
                    onClick={() => navigate('/renthub')}
                >
                    <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    Discard Listing
                </Button>
                <div className="flex items-center gap-2">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-2 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-emerald-500' : 'w-2 bg-gray-200'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white p-8 md:p-12 shadow-sm">
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h1 className="text-3xl font-black mb-2">Basic Information</h1>
                                <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Step 1 of 3: Describe your item</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 ml-1">ITEM TITLE</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Sony Alpha a7 III Camera"
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white focus:outline-none transition-all font-bold text-lg"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 ml-1">CATEGORY</label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.name}
                                                onClick={() => setFormData({ ...formData, category: cat.name })}
                                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.category === cat.name
                                                    ? 'border-emerald-500 bg-emerald-50'
                                                    : 'border-transparent bg-gray-50 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <cat.icon className={`h-6 w-6 ${cat.color} rounded-lg p-1`} />
                                                <span className="text-[10px] font-black uppercase tracking-tight">{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 ml-1">DESCRIPTION</label>
                                    <textarea
                                        placeholder="What are the specs? What is included in the rental?"
                                        rows={4}
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white focus:outline-none transition-all font-medium"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    className="h-14 px-10 rounded-2xl font-black bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100"
                                    onClick={nextStep}
                                    disabled={!formData.title || !formData.category}
                                >
                                    Pricing & Rules <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h1 className="text-3xl font-black mb-2">Pricing & Security</h1>
                                <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Step 2 of 3: Set your rates</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 ml-1">DAILY RATE ($)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white focus:outline-none transition-all font-bold text-xl"
                                                value={formData.dailyRate}
                                                onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 ml-1 flex justify-between">
                                            SECURITY DEPOSIT ($)
                                            <span className="text-[10px] text-emerald-600">REFUNDABLE</span>
                                        </label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white focus:outline-none transition-all font-bold text-xl"
                                                value={formData.deposit}
                                                onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Info className="h-5 w-5 text-emerald-600" />
                                        <h4 className="font-black text-emerald-900">Why a deposit?</h4>
                                    </div>
                                    <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                                        Security deposits are held by EduSync and released only after you confirm the item has been returned in good condition. This protects you from potential damages or losses.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-700 ml-1">USAGE RULES & GUIDELINES</label>
                                <textarea
                                    placeholder="e.g. No usage in rain, return with full charge, etc."
                                    rows={3}
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white focus:outline-none transition-all font-medium"
                                    value={formData.rules}
                                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" className="h-14 font-black" onClick={prevStep}>
                                    <ArrowLeft className="mr-2 h-5 w-5" /> Back
                                </Button>
                                <Button
                                    className="h-14 px-10 rounded-2xl font-black bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-100"
                                    onClick={nextStep}
                                    disabled={!formData.dailyRate || !formData.deposit}
                                >
                                    Availability <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h1 className="text-3xl font-black mb-2">Availability & Photos</h1>
                                <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Step 3 of 3: Finalize your listing</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-sm font-black text-gray-700 ml-1">UPLOAD PHOTOS</label>
                                    <div className="aspect-video rounded-[2.5rem] bg-gray-50 border-4 border-dashed border-gray-100 flex flex-col items-center justify-center group hover:border-emerald-200 transition-colors cursor-pointer">
                                        <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                            <Image className="h-8 w-8 text-gray-400 group-hover:text-emerald-500" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-500">Click to upload or drag & drop</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">MIN 2 PHOTOS REQUIRED</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-black text-gray-700 ml-1">SET AVAILABILITY</label>
                                    <div className="p-6 bg-gray-50 rounded-[2.5rem] border-2 border-transparent">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Calendar className="h-5 w-5 text-emerald-600" />
                                            <span className="font-black text-sm">Select Available Dates</span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium mb-4">
                                            Items listed as "Always Available" can be booked any time they aren't already rented.
                                        </p>
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            <span className="text-sm font-bold">Open for Bookings</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-gray-900 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xl font-black mb-1">Final Preview</h4>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                                            {formData.title || 'Your Item Title'} • ${formData.dailyRate || '0'}/day
                                        </p>
                                    </div>
                                    <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" className="h-14 font-black" onClick={prevStep}>
                                    <ArrowLeft className="mr-2 h-5 w-5" /> Back
                                </Button>
                                <Button
                                    className="h-14 px-12 rounded-2xl font-black bg-primary text-white hover:bg-primary-hover shadow-xl shadow-primary/20"
                                    onClick={handleSubmit}
                                    disabled={!formData.title || !formData.category || !formData.dailyRate}
                                >
                                    Publish Rental <Package className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <p className="mt-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                    By publishing, you agree to the RentHub Owner terms & conditions
                </p>
            </div>
        </div>
    );
};

export default CreateRentalListing;
