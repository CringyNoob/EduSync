import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertCircle, MapPin, Camera, X, ArrowLeft, Send,
    AlertTriangle, Info, CheckCircle2
} from 'lucide-react';
import Button from '../../components/Button';

const ReportIssue = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        category: 'Maintenance',
        priority: 'Normal',
        description: '',
        images: []
    });

    const categories = ['Maintenance', 'IT/Network', 'Cleaning', 'Safety', 'Lost & Found', 'Other'];
    const priorities = ['Low', 'Normal', 'High', 'Urgent'];

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, reader.result]
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setSubmitting(false);
            navigate('/issues');
        }, 1500);
    };

    return (
        <div className="min-h-screen p-4 md:p-8 font-sans max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Issues
                </Button>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                        <AlertTriangle size={32} />
                    </div>
                    Report an Issue
                </h1>
                <p className="text-gray-500 font-medium mt-2 text-lg ml-1">
                    Spot something wrong? Let us know so we can fix it.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col gap-8">

                {/* Title & Location Section */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Issue Title</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                placeholder="e.g. Broken Projector"
                                className="w-full pl-4 pr-4 py-3.5 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary focus:outline-none transition-all font-medium"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                required
                                placeholder="e.g. Room 304, Science Building"
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary focus:outline-none transition-all font-medium"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Category & Priority Section */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    type="button"
                                    key={cat}
                                    onClick={() => setFormData({ ...formData, category: cat })}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${formData.category === cat
                                            ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 scale-105'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Priority</label>
                        <div className="flex gap-2 p-1.5 bg-gray-50 rounded-xl w-fit">
                            {priorities.map(prio => (
                                <button
                                    type="button"
                                    key={prio}
                                    onClick={() => setFormData({ ...formData, priority: prio })}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${formData.priority === prio
                                            ? 'bg-white text-gray-900 shadow-md transform scale-105'
                                            : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {prio}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Description Section */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Description</label>
                    <textarea
                        required
                        rows="4"
                        placeholder="Please describe the issue in detail..."
                        className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary focus:outline-none transition-all font-medium resize-none"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center justify-between">
                        <span>Attach Photos</span>
                        <span className="text-xs font-normal text-gray-400">Optional</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm">
                                <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 rounded-lg text-white backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all group">
                            <div className="p-3 bg-gray-50 rounded-full group-hover:scale-110 transition-transform text-gray-400 group-hover:text-primary">
                                <Camera size={24} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 group-hover:text-primary">Add Photo</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>
                </div>

                {/* Submit Section */}
                <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl text-blue-700 text-sm max-w-lg">
                        <Info className="shrink-0 h-5 w-5" />
                        <p>Your report will be reviewed by the campus administration. You'll receive updates on its status.</p>
                    </div>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className={`w-full md:w-auto px-8 py-4 rounded-xl bg-gray-900 text-white font-bold text-lg hover:bg-black hover:shadow-xl transition-all flex items-center justify-center gap-2 ${submitting ? 'opacity-80' : ''}`}
                    >
                        {submitting ? (
                            <>
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                Submit Report <Send size={18} />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ReportIssue;
