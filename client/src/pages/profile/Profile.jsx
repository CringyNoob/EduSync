import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import {
    User,
    MapPin,
    Calendar,
    Mail,
    Phone,
    Award,
    BookOpen,
    MessageCircle,
    CheckCircle,
    Star
} from 'lucide-react';
import Button from '../../components/Button';

// --- Backend Integration Notes ---
// 1. Fetch User Profile:
//    - Endpoint: GET /api/users/:id
//    - Response: { id, name, email, role, department, joinedDate, bio, stats: { listings, reputation, courses }, badges: [] }

// 2. Fetch User Listings:
//    - Endpoint: GET /api/users/:id/listings
//    - Response: Array of marketplace items

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                // If viewing own profile (id === 'me' or no id)
                const isOwnProfile = !id || id === 'me';
                
                if (isOwnProfile && currentUser) {
                    // Use current user data from context
                    setProfileData({
                        id: currentUser.id,
                        name: currentUser.name,
                        role: currentUser.role || 'Student',
                        major: currentUser.department || 'N/A',
                        university: 'UIU',
                        joined: new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) || 'Recently',
                        bio: currentUser.bio || 'No bio yet.',
                        email: currentUser.email,
                        phone: currentUser.phone,
                        studentId: currentUser.studentId,
                        department: currentUser.department,
                        batch: currentUser.batch,
                        stats: {
                            reputation: 5.0,
                            listingsSold: 0,
                            activeListings: 0
                        },
                        badges: currentUser.isVerified ? ['Verified Student'] : []
                    });
                } else {
                    // Fetch other user's profile
                    const response = await authService.getProfile();
                    if (response.success && response.data) {
                        const userData = response.data;
                        setProfileData({
                            id: userData.id,
                            name: userData.name,
                            role: userData.role || 'Student',
                            major: userData.department || 'N/A',
                            university: 'UIU',
                            joined: new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) || 'Recently',
                            bio: userData.bio || 'No bio yet.',
                            email: userData.email,
                            phone: userData.phone,
                            studentId: userData.studentId,
                            department: userData.department,
                            batch: userData.batch,
                            stats: {
                                reputation: 5.0,
                                listingsSold: 0,
                                activeListings: 0
                            },
                            badges: userData.isVerified ? ['Verified Student'] : []
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError(err.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id, currentUser]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
                    <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                </div>
            </div>
        );
    }

    const user = profileData;

    return (
        <div className="relative min-h-screen p-6 font-sans">
            {/* Background elements */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-indigo-100/40 rounded-full mix-blend-multiply filter blur-[80px]"></div>
                <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-purple-100/40 rounded-full mix-blend-multiply filter blur-[60px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Profile Header Card */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-gray-200/20">
                    {/* Cover Banner */}
                    <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    </div>

                    <div className="px-8 pb-8">
                        <div className="relative flex flex-col md:flex-row items-end -mt-16 mb-6 gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="h-32 w-32 rounded-3xl bg-white p-1.5 shadow-xl">
                                    <div className="w-full h-full rounded-2xl bg-indigo-100 flex items-center justify-center text-4xl font-bold text-indigo-600">
                                        {user.name.charAt(0)}
                                    </div>
                                </div>
                                <div className="absolute bottom-2 -right-2 bg-green-500 border-4 border-white rounded-full p-1.5" title="Online"></div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left mb-2">
                                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                                    {user.name}
                                    <CheckCircle className="h-6 w-6 text-blue-500" fill="currentColor" color="white" />
                                </h1>
                                <p className="text-gray-500 font-medium text-lg">{user.major} @ {user.university}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mb-2">
                                <Button variant="outline" onClick={() => navigate('/chat')}>
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    Message
                                </Button>
                                {/* Only show edit if own profile */}
                                {/* <Button>Edit Profile</Button> */}
                            </div>
                        </div>

                        {/* Bio & Details */}
                        <div className="grid md:grid-cols-3 gap-8 border-t border-gray-100 pt-8">
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">About</h3>
                                    <p className="text-gray-600 leading-relaxed text-lg">
                                        {user.bio}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {user.badges.map((badge, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold border border-indigo-100 flex items-center gap-1">
                                            <Award size={14} />
                                            {badge}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-xl shadow-sm text-yellow-500">
                                        <Star size={20} fill="currentColor" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-gray-900">{user.stats.reputation}</div>
                                        <div className="text-xs text-gray-500 font-bold uppercase">Reputation</div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-xl shadow-sm text-green-500">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-gray-900">{user.stats.listingsSold}</div>
                                        <div className="text-xs text-gray-500 font-bold uppercase">Sold Items</div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-xl shadow-sm text-blue-500">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-gray-900">{user.joined}</div>
                                        <div className="text-xs text-gray-500 font-bold uppercase">Joined</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity / Listings Tab Section could go here */}
            </div>
        </div>
    );
};

export default Profile;
