import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Heart, MessageCircle, Share2, Shield, MapPin, Clock,
    CheckCircle, User, Package, ChevronLeft, ChevronRight
} from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import marketplaceService from '../../services/marketplaceService';
import { ChatWithSellerButton } from '../../components/Chat/ChatButton';

const PreownedItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const fetchListing = async () => {
            setLoading(true);
            try {
                const response = await marketplaceService.getPreownedById(id);
                const listingData = response.listing || response.data || response;
                
                if (!listingData || !listingData.id) {
                    throw new Error('Listing not found');
                }

                setListing({
                    id: listingData.id,
                    title: listingData.title,
                    price: listingData.price,
                    category: listingData.category,
                    description: listingData.description,
                    images: listingData.images || [],
                    seller_id: listingData.seller_id,
                    seller_name: listingData.seller_name,
                    status: listingData.status,
                    created_at: listingData.created_at
                });
            } catch (err) {
                console.error('Error fetching listing:', err);
                setError(err.message || 'Failed to load listing');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchListing();
    }, [id]);

    const handleContactSeller = () => {
        if (listing) {
            navigate(`/chat?seller=${listing.seller_id}&name=${encodeURIComponent(listing.seller_name)}&listing=${listing.id}`);
        }
    };

    const nextImage = () => {
        if (listing?.images?.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
        }
    };

    const prevImage = () => {
        if (listing?.images?.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center max-w-md p-8">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Shield size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Listing Not Found</h2>
                    <p className="text-gray-500 mb-8">{error || 'This listing could not be found'}</p>
                    <Button onClick={() => navigate('/marketplace/pre-owned')} className="w-full py-4 rounded-2xl bg-purple-500 hover:bg-purple-600">
                        Back to Pre-Owned Market
                    </Button>
                </div>
            </div>
        );
    }

    const isOwnListing = user?.id === listing.seller_id;

    return (
        <div className="relative min-h-screen p-6 font-sans pb-32">
            {/* Background */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-purple-100/30 rounded-full blur-[80px]"></div>
                <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-pink-100/30 rounded-full blur-[60px]"></div>
            </div>

            {/* Navigation Bar */}
            <div className="max-w-6xl mx-auto px-4 mb-8 flex items-center justify-between">
                <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2 rounded-2xl border-gray-100 shadow-sm bg-white px-5">
                    <ArrowLeft size={20} />
                    Back
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl shadow-sm bg-white"><Share2 size={20} /></Button>
                    <button
                        className={`p-2.5 rounded-xl border shadow-sm transition-all ${isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-100 text-gray-400 hover:text-red-500'}`}
                        onClick={() => setIsSaved(!isSaved)}
                    >
                        <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                {/* Image Section */}
                <div className="space-y-4">
                    <div className="aspect-square w-full rounded-[3rem] shadow-2xl overflow-hidden border border-white/60 relative group bg-purple-50 flex items-center justify-center">
                        {listing.images && listing.images.length > 0 ? (
                            <>
                                <img
                                    src={listing.images[currentImageIndex]}
                                    alt={listing.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {listing.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                            {listing.images.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentImageIndex(idx)}
                                                    className={`h-2 rounded-full transition-all ${idx === currentImageIndex ? 'w-8 bg-purple-500' : 'w-2 bg-white/60'}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <Package size={120} className="text-purple-200" />
                        )}
                        {listing.status === 'SOLD' && (
                            <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center">
                                <span className="bg-red-500 text-white px-8 py-4 rounded-2xl text-xl font-black">SOLD</span>
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Grid */}
                    {listing.images && listing.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-3">
                            {listing.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-purple-500 scale-95' : 'border-transparent hover:border-purple-200'}`}
                                >
                                    <img src={img} alt={`${listing.title} ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Listing Info */}
                <div className="flex flex-col pt-2 text-left">
                    <div className="mb-8 border-b border-gray-100 pb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-wide">
                                {listing.category}
                            </span>
                            {listing.status === 'SOLD' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wide">
                                    SOLD
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-2xl">
                                {listing.title}
                            </h1>
                            <div className="text-left sm:text-right flex flex-col items-start sm:items-end min-w-fit">
                                <div className="text-3xl md:text-4xl font-black text-purple-500 tracking-tight">৳{listing.price}</div>
                                <div className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Asking Price</div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                <MapPin size={14} className="text-purple-500" /> Campus
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                <Clock size={14} className="text-purple-500" /> Recently Listed
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-sm mb-6">
                        <h3 className="text-xs font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Item Description</h3>
                        <p className="text-gray-600 leading-relaxed text-lg font-medium">
                            {listing.description || 'No description provided'}
                        </p>
                    </div>

                    {/* Seller Card */}
                    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white shadow-sm mb-6 flex items-center gap-5 group hover:border-purple-200 transition-all">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-100">
                            {listing.seller_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-black text-gray-900">{listing.seller_name}</h3>
                            <div className="text-[10px] text-gray-400 font-bold flex items-center gap-2 uppercase tracking-widest mt-0.5">
                                <span className="flex items-center gap-1 text-blue-500">
                                    <CheckCircle size={12} /> Verified Student
                                </span>
                                {isOwnListing && (
                                    <>
                                        <span>•</span>
                                        <span className="text-purple-500">This is your listing</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <User size={20} className="text-gray-300" />
                    </div>

                    {/* Safety Tips */}
                    <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100 mb-6">
                        <h3 className="text-xs font-black text-amber-600 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Shield size={14} /> Safety Tips
                        </h3>
                        <ul className="text-sm text-amber-700 space-y-2 font-medium">
                            <li>• Meet in a public place on campus</li>
                            <li>• Inspect the item before payment</li>
                            <li>• Don't share personal financial information</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    {!isOwnListing && listing.status === 'AVAILABLE' && (
                        <div className="mt-auto flex gap-4">
                            <ChatWithSellerButton
                                sellerId={listing.seller_id}
                                sellerName={listing.seller_name}
                                listingId={listing.id}
                                className="flex-1 py-6 text-lg shadow-xl hover:-translate-y-1 rounded-[1.5rem] transition-all duration-300 bg-purple-500 hover:bg-purple-600 shadow-purple-200"
                                variant="primary"
                            >
                                <MessageCircle className="mr-3 h-5 w-5" />
                                Chat with Seller
                            </ChatWithSellerButton>
                            <button
                                className={`p-4 rounded-[1.5rem] border-2 transition-all shadow-sm ${isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-100 text-gray-400 hover:border-purple-200 hover:text-purple-500'}`}
                                onClick={() => setIsSaved(!isSaved)}
                            >
                                <Heart size={28} fill={isSaved ? "currentColor" : "none"} />
                            </button>
                        </div>
                    )}

                    {/* Own Listing Actions */}
                    {isOwnListing && (
                        <div className="mt-auto flex gap-4">
                            {listing.status === 'AVAILABLE' && (
                                <Button
                                    className="flex-1 py-6 text-lg shadow-xl rounded-[1.5rem] bg-green-500 hover:bg-green-600"
                                    onClick={async () => {
                                        try {
                                            await marketplaceService.markPreownedAsSold(listing.id);
                                            setListing(prev => ({ ...prev, status: 'SOLD' }));
                                        } catch (err) {
                                            alert('Failed to mark as sold');
                                        }
                                    }}
                                >
                                    <CheckCircle className="mr-3 h-5 w-5" />
                                    Mark as Sold
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="flex-1 py-6 text-lg border-purple-200 text-purple-500 rounded-[1.5rem]"
                                onClick={() => navigate(`/marketplace/pre-owned/${listing.id}/edit`)}
                            >
                                Edit Listing
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PreownedItemDetails;
