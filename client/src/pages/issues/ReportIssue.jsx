import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertCircle, MapPin, Camera, X, ArrowLeft, Send,
    AlertTriangle, Info, CheckCircle2
} from 'lucide-react';
import Button from '../../components/Button';
import issueService from '../../services/issueService';
import { useAuth } from '../../context/AuthContext';

const ReportIssue = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        category: 'Maintenance',
        priority: 'Normal',
        description: '',
        image_url: ''
    });

    const categories = ['Maintenance', 'IT/Network', 'Cleaning', 'Safety', 'Other'];
    const priorities = ['Low', 'Normal', 'High', 'Urgent'];

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    image_url: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            image_url: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        // Validation
        if (!formData.title.trim()) {
            setError('Please enter a title for the issue');
            setSubmitting(false);
            return;
        }

        if (!formData.location.trim()) {
            setError('Please enter the location of the issue');
            setSubmitting(false);
            return;
        }

        if (!formData.description.trim()) {
            setError('Please provide a description of the issue');
            setSubmitting(false);
            return;
        }

        try {
            const response = await issueService.createIssue({
                title: formData.title.trim(),
                location: formData.location.trim(),
                category: formData.category,
                priority: formData.priority,
                description: formData.description.trim(),
                image_url: formData.image_url || null
            });

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/issues');
                }, 2000);
            } else {
                setError(response.message || 'Failed to submit issue');
            }
        } catch (err) {
            console.error('Error submitting issue:', err);
            setError(err.response?.data?.message || 'Failed to submit issue. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Check if user is logged in
    if (!user || user.id === '00000001-0000-0000-0000-000000000001') {
        return (
            <div className="min-h-screen p-4 md:p-8 font-sans max-w-4xl mx-auto space-y-8 animate-in fade-in">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 text-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Login Required</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">You need to be logged in to report an issue.</p>
                    <Button onClick={() => navigate('/login')}>Go to Login</Button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen p-4 md:p-8 font-sans max-w-4xl mx-auto flex items-center justify-center animate-in fade-in">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center max-w-md">
                    <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Issue Reported!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Your issue has been submitted and is pending review by an administrator.</p>
                    <p className="text-sm text-gray-500">Redirecting to issues feed...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 font-sans max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary dark:text-gray-400 dark:hover:text-primary" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Issues
                </Button>
                <h1 className="text-3xl font-black flex items-center gap-3">
                    <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl">
                        <AlertTriangle size={32} />
                    </div>
                    <span className="text-gray-900 dark:text-white">Report an Issue</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-lg ml-1">
                    Spot something wrong? Let us know so we can fix it.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-700 flex flex-col gap-8 transition-colors duration-300">

                {/* Title & Location Section */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Issue Title</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                placeholder="e.g. Broken Projector"
                                className="w-full pl-4 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-primary focus:outline-none transition-all font-medium text-gray-900 dark:text-white"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                required
                                placeholder="e.g. Room 304, Science Building"
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-primary focus:outline-none transition-all font-medium text-gray-900 dark:text-white"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Category & Priority Section */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    type="button"
                                    key={cat}
                                    onClick={() => setFormData({ ...formData, category: cat })}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${formData.category === cat
                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg shadow-gray-200 dark:shadow-none scale-105'
                                        : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Priority</label>
                        <div className="flex gap-2 p-1.5 bg-gray-50 dark:bg-gray-700 rounded-xl w-fit">
                            {priorities.map(prio => (
                                <button
                                    type="button"
                                    key={prio}
                                    onClick={() => setFormData({ ...formData, priority: prio })}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${formData.priority === prio
                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md transform scale-105'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
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
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Description</label>
                    <textarea
                        required
                        rows="4"
                        placeholder="Please describe the issue in detail..."
                        className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-primary focus:outline-none transition-all font-medium resize-none text-gray-900 dark:text-white"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center justify-between">
                        <span>Attach Photo</span>
                        <span className="text-xs font-normal text-gray-400">Optional (max 5MB)</span>
                    </label>
                    <div className="flex gap-4">
                        {formData.image_url && (
                            <div className="relative w-32 h-32 rounded-2xl overflow-hidden group shadow-sm">
                                <img src={formData.image_url} alt="Evidence" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 rounded-lg text-white backdrop-blur-sm transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                        {!formData.image_url && (
                            <label className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all group">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-full group-hover:scale-110 transition-transform text-gray-400 group-hover:text-primary">
                                    <Camera size={24} />
                                </div>
                                <span className="text-xs font-bold text-gray-400 group-hover:text-primary">Add Photo</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        )}
                    </div>
                </div>

                {/* Submit Section */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm max-w-lg">
                        <Info className="shrink-0 h-5 w-5" />
                        <p>Your report will be reviewed by the campus administration. Once approved, it will be visible to other students who can vote on it.</p>
                    </div>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className={`w-full md:w-auto px-8 py-4 rounded-xl bg-gray-900 dark:bg-primary text-white font-bold text-lg hover:bg-black dark:hover:bg-primary-dark hover:shadow-xl transition-all flex items-center justify-center gap-2 ${submitting ? 'opacity-80' : ''}`}
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
