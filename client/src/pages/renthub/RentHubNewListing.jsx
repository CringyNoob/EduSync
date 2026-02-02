import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Calendar, DollarSign, Package, FileText, Image as ImageIcon } from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { uploadMultipleImages } from '../../utils/imageUpload';
import renthubService from '../../services/renthubService';

const RentHubNewListing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        daily_price: '',
        category: '',
        availability_start: '',
        availability_end: ''
    });

    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = [
        'Books',
        'Electronics',
        'Furniture',
        'Sports Equipment',
        'Musical Instruments',
        'Tools',
        'Clothing',
        'Other'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files);

        if (images.length + files.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        // Add to images array
        setImages(prev => [...prev, ...files]);

        // Create previews
        const newPreviews = await Promise.all(
            files.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
            })
        );
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Check if user is logged in
        if (!user?.id || user.id.length < 36 || user.id.startsWith('temp-')) {
            setError('Please login to create a listing');
            return;
        }

        // Validation
        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }
        if (!formData.daily_price || parseFloat(formData.daily_price) <= 0) {
            setError('Valid daily price is required');
            return;
        }
        if (!formData.category) {
            setError('Category is required');
            return;
        }
        if (!formData.availability_start) {
            setError('Availability start date is required');
            return;
        }
        if (!formData.availability_end) {
            setError('Availability end date is required');
            return;
        }
        if (new Date(formData.availability_end) <= new Date(formData.availability_start)) {
            setError('End date must be after start date');
            return;
        }
        if (images.length === 0) {
            setError('At least one image is required');
            return;
        }

        setLoading(true);
        setUploading(true);

        try {
            // Upload images
            console.log('Uploading images...', images.length);
            const imageUrls = await uploadMultipleImages(images);
            console.log('Images uploaded successfully');

            // Create listing
            const listingData = {
                owner_id: user.id,
                owner_name: user.name,
                owner_email: user.email,
                title: formData.title,
                description: formData.description,
                daily_price: parseFloat(formData.daily_price),
                category: formData.category,
                images: imageUrls,
                availability_start: formData.availability_start,
                availability_end: formData.availability_end
            };

            console.log('Creating rental listing...');
            const response = await renthubService.createListing(listingData);

            if (response.success) {
                alert('Rental listing created successfully!');
                navigate('/renthub');
            }
        } catch (err) {
            console.error('Error creating rental listing:', err);
            setError(err.message || 'Failed to create listing. Please try again.');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => navigate('/renthub')}
                    className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-900 dark:text-white"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">List Your Item for Rent</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in the details to create your rental listing</p>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 transition-colors duration-300">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                <Package className="inline mr-2 h-4 w-4" />
                                Item Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., MacBook Pro M2, Calculus Textbook"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                required
                            />
                        </div>

                        {/* Category & Price */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    <DollarSign className="inline mr-2 h-4 w-4" />
                                    Daily Price ($) *
                                </label>
                                <input
                                    type="number"
                                    name="daily_price"
                                    value={formData.daily_price}
                                    onChange={handleInputChange}
                                    placeholder="10"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Availability Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    <Calendar className="inline mr-2 h-4 w-4" />
                                    Available From *
                                </label>
                                <input
                                    type="date"
                                    name="availability_start"
                                    value={formData.availability_start}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    <Calendar className="inline mr-2 h-4 w-4" />
                                    Available Until *
                                </label>
                                <input
                                    type="date"
                                    name="availability_end"
                                    value={formData.availability_end}
                                    onChange={handleInputChange}
                                    min={formData.availability_start || new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                <FileText className="inline mr-2 h-4 w-4" />
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe your item, its condition, any included accessories, usage rules, etc."
                                rows="4"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none placeholder-gray-400 dark:placeholder-gray-500"
                            />
                        </div>

                        {/* Images */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                <ImageIcon className="inline mr-2 h-4 w-4" />
                                Images * (Max 5)
                            </label>

                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-gray-700/50">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    id="image-upload"
                                    disabled={images.length >= 5}
                                />
                                <label
                                    htmlFor="image-upload"
                                    className={`cursor-pointer ${images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        {images.length >= 5 ? 'Maximum images reached' : 'Click to upload images'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        PNG, JPG, WEBP up to 10MB ({images.length}/5)
                                    </p>
                                </label>
                            </div>

                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/renthub')}
                                className="flex-1"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1"
                                disabled={loading || uploading}
                            >
                                {uploading ? 'Uploading...' : loading ? 'Creating...' : 'Create Listing'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RentHubNewListing;
