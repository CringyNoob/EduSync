import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User,
    Calendar,
    Mail,
    MessageCircle,
    CheckCircle,
    Loader2,
    Package,
    Newspaper,
    Home,
    Clock,
    Tag,
    DollarSign,
    ChevronRight,
    Building,
    GraduationCap
} from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import newsboxService from '../../services/newsboxService';
import marketplaceService from '../../services/marketplaceService';
import renthubService from '../../services/renthubService';

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    // State
    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Activity state
    const [newsboxPosts, setNewsboxPosts] = useState([]);
    const [preownedListings, setPreownedListings] = useState([]);
    const [rentalListings, setRentalListings] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const activitiesPerPage = 5;

    // Determine if viewing own profile
    const isOwnProfile = currentUser && (id === currentUser.id || id === 'me' || !id);
    // Replace 'me' with actual user ID
    const profileId = (id === 'me' || !id) ? currentUser?.id : id;

    // Fetch user profile
    useEffect(() => {
        const fetchProfile = async () => {
            if (!profileId) {
                setError('No user ID provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await authService.getUserById(profileId);
                if (response.success) {
                    setProfileUser(response.data);
                } else {
                    setError('Failed to load profile');
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [profileId]);

    // Fetch user activities
    useEffect(() => {
        const fetchActivities = async () => {
            if (!profileId) return;

            setActivitiesLoading(true);
            try {
                // Fetch all activities in parallel
                const [postsRes, preownedRes, rentalsRes] = await Promise.allSettled([
                    newsboxService.getPostsByUser(profileId),
                    marketplaceService.getPreownedByUser(profileId),
                    renthubService.getUserListings(profileId)
                ]);

                if (postsRes.status === 'fulfilled' && postsRes.value?.success) {
                    setNewsboxPosts(postsRes.value.data || []);
                }
                if (preownedRes.status === 'fulfilled' && preownedRes.value?.success) {
                    setPreownedListings(preownedRes.value.data || []);
                }
                if (rentalsRes.status === 'fulfilled') {
                    // RentHub returns array directly, not wrapped in { success, data }
                    if (Array.isArray(rentalsRes.value)) {
                        setRentalListings(rentalsRes.value);
                    } else if (rentalsRes.value?.data && Array.isArray(rentalsRes.value.data)) {
                        setRentalListings(rentalsRes.value.data);
                    }
                }
            } catch (err) {
                console.error('Error fetching activities:', err);
            } finally {
                setActivitiesLoading(false);
            }
        };

        fetchActivities();
    }, [profileId]);

    // Combine and sort all activities by date (newest first)
    const allActivities = useMemo(() => {
        const activities = [
            ...newsboxPosts.map(post => ({
                type: 'newsbox',
                id: post.id,
                title: post.title,
                description: post.description,
                category: post.category_name,
                image: post.images?.[0],
                created_at: post.created_at,
                extra: { vote_count: post.vote_count, comment_count: post.comment_count }
            })),
            ...preownedListings.map(listing => ({
                type: 'preowned',
                id: listing.id,
                title: listing.title,
                description: listing.description,
                category: listing.category,
                image: listing.images?.[0],
                created_at: listing.created_at,
                extra: { price: listing.price, status: listing.status }
            })),
            ...rentalListings.map(rental => ({
                type: 'rental',
                id: rental.id,
                title: rental.title,
                description: rental.description,
                category: rental.category,
                image: rental.images?.[0],
                created_at: rental.created_at,
                extra: { daily_price: rental.daily_price, status: rental.status }
            }))
        ];

        // Sort by created_at (newest first)
        return activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [newsboxPosts, preownedListings, rentalListings]);

    // Paginated activities
    const paginatedActivities = useMemo(() => {
        const startIndex = (currentPage - 1) * activitiesPerPage;
        const endIndex = startIndex + activitiesPerPage;
        return allActivities.slice(startIndex, endIndex);
    }, [allActivities, currentPage]);

    // Total pages
    const totalPages = Math.ceil(allActivities.length / activitiesPerPage);

    // Reset to page 1 when activities change
    useEffect(() => {
        setCurrentPage(1);
    }, [allActivities.length]);

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        });
    };

    // Format time ago
    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return formatDate(dateStr);
    };

    // Get activity icon and color
    const getActivityStyle = (type) => {
        switch (type) {
            case 'newsbox':
                return { icon: Newspaper, color: 'bg-blue-500', label: 'NewsBox Post' };
            case 'preowned':
                return { icon: Package, color: 'bg-green-500', label: 'Pre-owned Listing' };
            case 'rental':
                return { icon: Home, color: 'bg-purple-500', label: 'Rental Listing' };
            default:
                return { icon: Package, color: 'bg-gray-500', label: 'Activity' };
        }
    };

    // Handle activity click
    const handleActivityClick = (activity) => {
        switch (activity.type) {
            case 'newsbox':
                navigate('/newsbox', { state: { openPost: activity.id } });
                break;
            case 'preowned':
                navigate('/marketplace/pre-owned', { state: { openListing: activity.id } });
                break;
            case 'rental':
                navigate('/renthub', { state: { openListing: activity.id } });
                break;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !profileUser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h2>
                    <p className="text-gray-500 mb-4">{error || 'Unable to load this profile'}</p>
                    <Button onClick={() => navigate(-1)}>Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen p-6 font-sans">
            {/* Background elements */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-indigo-100/40 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-[80px]"></div>
                <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-purple-100/40 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-[60px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Profile Header Card */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/60 dark:border-gray-700 shadow-xl shadow-gray-200/20 dark:shadow-black/20">
                    {/* Cover Banner */}
                    <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    </div>

                    <div className="px-8 pb-8">
                        <div className="relative flex flex-col md:flex-row items-end -mt-16 mb-6 gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="h-32 w-32 rounded-3xl bg-white dark:bg-gray-800 p-1.5 shadow-xl">
                                    {profileUser.avatarUrl ? (
                                        <img 
                                            src={profileUser.avatarUrl} 
                                            alt={profileUser.name}
                                            className="w-full h-full rounded-2xl object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                                            {profileUser.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-2 -right-2 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full p-1.5" title="Online"></div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left mb-2">
                                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                                    {profileUser.name}
                                    <CheckCircle className="h-6 w-6 text-blue-500" fill="currentColor" color="white" />
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg flex items-center justify-center md:justify-start gap-2">
                                    {profileUser.department && (
                                        <>
                                            <Building size={16} />
                                            {profileUser.department}
                                        </>
                                    )}
                                    {profileUser.batch && (
                                        <>
                                            <span className="mx-1">•</span>
                                            <GraduationCap size={16} />
                                            Batch {profileUser.batch}
                                        </>
                                    )}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mb-2">
                                {!isOwnProfile && (
                                    <Button variant="outline" onClick={() => navigate('/chat')}>
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        Message
                                    </Button>
                                )}
                                {isOwnProfile && (
                                    <Button onClick={() => navigate('/settings')}>
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Bio & Details */}
                        <div className="grid md:grid-cols-3 gap-8 border-t border-gray-100 dark:border-gray-700 pt-8">
                            <div className="md:col-span-2 space-y-6">
                                {profileUser.bio && (
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">About</h3>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                                            {profileUser.bio}
                                        </p>
                                    </div>
                                )}

                                {/* Role Badge */}
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-bold border border-indigo-100 dark:border-indigo-800 flex items-center gap-2">
                                        <GraduationCap size={16} />
                                        Student
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 flex items-center gap-4">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-blue-500">
                                        <Mail size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{profileUser.email}</div>
                                        <div className="text-xs text-gray-500 font-bold uppercase">Email</div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 flex items-center gap-4">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-green-500">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(profileUser.createdAt)}</div>
                                        <div className="text-xs text-gray-500 font-bold uppercase">Joined</div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 flex items-center gap-4">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-purple-500">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{allActivities.length}</div>
                                        <div className="text-xs text-gray-500 font-bold uppercase">Total Activities</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activities Section */}
                <div className="rounded-[2.5rem] bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/60 dark:border-gray-700 shadow-xl shadow-gray-200/20 dark:shadow-black/20 p-8">
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <Clock className="text-primary" />
                        Recent Activity
                    </h2>

                    {activitiesLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : allActivities.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No activities yet</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                {paginatedActivities.map((activity) => {
                                const style = getActivityStyle(activity.type);
                                const Icon = style.icon;

                                return (
                                    <div
                                        key={`${activity.type}-${activity.id}`}
                                        onClick={() => handleActivityClick(activity)}
                                        className="group flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-all"
                                    >
                                        {/* Activity Image or Icon */}
                                        <div className="relative flex-shrink-0">
                                            {activity.image ? (
                                                <div className="w-16 h-16 rounded-xl overflow-hidden">
                                                    <img src={activity.image} alt={activity.title} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className={`w-16 h-16 rounded-xl ${style.color} flex items-center justify-center`}>
                                                    <Icon className="text-white" size={24} />
                                                </div>
                                            )}
                                            {/* Type Badge */}
                                            <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg ${style.color}`}>
                                                <Icon className="text-white" size={12} />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                    activity.type === 'newsbox' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    activity.type === 'preowned' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                }`}>
                                                    {style.label}
                                                </span>
                                                {activity.category && (
                                                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                        <Tag size={10} />
                                                        {activity.category}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                                                {activity.title}
                                            </h3>

                                            {/* Extra Info */}
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {formatTimeAgo(activity.created_at)}
                                                </span>

                                                {activity.type === 'newsbox' && (
                                                    <>
                                                        <span className="flex items-center gap-1">
                                                            {activity.extra.vote_count} votes
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MessageCircle size={12} />
                                                            {activity.extra.comment_count} comments
                                                        </span>
                                                    </>
                                                )}

                                                {activity.type === 'preowned' && (
                                                    <>
                                                        <span className="flex items-center gap-1 font-bold text-green-600 dark:text-green-400">
                                                            <DollarSign size={12} />
                                                            ৳{activity.extra.price}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                            activity.extra.status === 'AVAILABLE' 
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                        }`}>
                                                            {activity.extra.status}
                                                        </span>
                                                    </>
                                                )}

                                                {activity.type === 'rental' && (
                                                    <>
                                                        <span className="flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400">
                                                            <DollarSign size={12} />
                                                            ৳{activity.extra.daily_price}/day
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                            activity.extra.status === 'AVAILABLE' 
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        }`}>
                                                            {activity.extra.status}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <ChevronRight className="text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" size={20} />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>

                                <div className="flex items-center gap-2">
                                    {[...Array(totalPages)].map((_, index) => {
                                        const page = index + 1;
                                        // Show first page, last page, current page, and pages around current
                                        const showPage = page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                                        const showEllipsis = (page === 2 && currentPage > 3) || (page === totalPages - 1 && currentPage < totalPages - 2);

                                        if (!showPage && !showEllipsis) return null;

                                        if (showEllipsis) {
                                            return <span key={`ellipsis-${page}`} className="text-gray-400 px-2">...</span>;
                                        }

                                        return (
                                            <button
                                                key={`page-${page}`}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-xl font-bold transition-all ${
                                                    currentPage === page
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>

                                <span className="ml-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    Page {currentPage} of {totalPages} • {allActivities.length} total
                                </span>
                            </div>
                        )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
