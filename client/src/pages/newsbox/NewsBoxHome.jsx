import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    MessageSquare,
    ArrowBigUp,
    ArrowBigDown,
    Newspaper,
    Search,
    Plus,
    X,
    TrendingUp,
    Filter,
    Clock,
    LayoutDashboard,
    Settings,
    Send,
    ArrowUpDown,
    ChevronDown,
    ArrowLeft,
    Camera,
    Loader2,
    Share2,
    Link2,
    User,
    Edit3,
    ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Cards/Card';
import Button from '../../components/Button';
import RichTextEditor from '../../components/RichTextEditor';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import newsboxService from '../../services/newsboxService';
import authService from '../../services/authService';
import 'react-quill-new/dist/quill.snow.css';

const NewsBoxHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // State for posts and categories
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter and sort state
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Modal and form state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', category_id: '', images: [] });
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Post detail modal state
    const [expandedPost, setExpandedPost] = useState(null);
    const [expandedPostData, setExpandedPostData] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [commentSubmitting, setCommentSubmitting] = useState(false);

    // Edit post state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editPost, setEditPost] = useState({ id: '', title: '', content: '', category_id: '', images: [] });
    const [editImagePreview, setEditImagePreview] = useState(null);
    const [editSubmitting, setEditSubmitting] = useState(false);

    // Featured slider state
    const [currentSliderIndex, setCurrentSliderIndex] = useState(0);

    // Avatar cache state
    const [avatarCache, setAvatarCache] = useState({});

    // Fetch user avatar by ID
    const fetchUserAvatar = useCallback(async (userId) => {
        // Check cache first
        if (avatarCache[userId] !== undefined) {
            return avatarCache[userId];
        }

        try {
            const response = await authService.getUserById(userId);
            if (response.success) {
                const avatarUrl = response.data.avatarUrl || null;
                setAvatarCache(prev => ({ ...prev, [userId]: avatarUrl }));
                return avatarUrl;
            }
        } catch (err) {
            console.error(`Error fetching avatar for user ${userId}:`, err);
            setAvatarCache(prev => ({ ...prev, [userId]: null }));
        }
        return null;
    }, [avatarCache]);

    // Fetch avatars for all posts
    useEffect(() => {
        if (posts.length > 0) {
            const authorIds = [...new Set(posts.map(post => post.author_id))];
            authorIds.forEach(id => {
                if (avatarCache[id] === undefined) {
                    fetchUserAvatar(id);
                }
            });
        }
    }, [posts, fetchUserAvatar, avatarCache]);

    // Get avatar for a user
    const getAuthorAvatar = (authorId) => {
        // If it's the current user, use their avatar
        if (user && authorId === user.id) {
            return user.avatarUrl;
        }
        // Otherwise use cached avatar
        return avatarCache[authorId] || null;
    };

    // Fetch categories on mount
    const fetchCategories = useCallback(async () => {
        try {
            const response = await newsboxService.getCategories();
            if (response.success) {
                setCategories(response.data);
                // Set default category for new post if available
                if (response.data.length > 0 && !newPost.category_id) {
                    setNewPost(prev => ({ ...prev, category_id: response.data[0].id }));
                }
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    }, []);

    // Fetch posts
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                sort: sortBy,
                status: 'APPROVED'
            };
            if (selectedCategory !== 'all') {
                params.category_id = selectedCategory;
            }
            const response = await newsboxService.getPosts(params);
            if (response.success) {
                setPosts(response.data);
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Failed to load posts. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, sortBy]);

    // Initial data fetch
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Fetch posts when filters change
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Featured posts for slider
    const featuredNews = useMemo(() => posts.slice(0, 3), [posts]);

    // Auto-advance slider
    useEffect(() => {
        if (featuredNews.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSliderIndex((prev) => (prev + 1) % featuredNews.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [featuredNews.length]);

    // Check for create intent from navigation
    useEffect(() => {
        if (location.state?.create) {
            setShowCreateModal(true);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Filter posts by search query (client-side)
    const filteredPosts = useMemo(() => {
        if (!searchQuery.trim()) return posts;
        const query = searchQuery.toLowerCase();
        return posts.filter(post =>
            post.title.toLowerCase().includes(query) ||
            post.description.toLowerCase().includes(query)
        );
    }, [posts, searchQuery]);

    // Handle Image Change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setNewPost({ ...newPost, images: [reader.result] });
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle Voting
    const handleVote = async (postId, voteType) => {
        if (!user) {
            alert('Please login to vote');
            return;
        }
        try {
            const response = await newsboxService.votePost(postId, voteType);
            if (response.success) {
                // Refresh posts to get updated vote count
                fetchPosts();
                // Also refresh expanded post if open
                if (expandedPost === postId) {
                    fetchPostDetails(postId);
                }
            }
        } catch (err) {
            console.error('Error voting:', err);
        }
    };

    // Fetch post details for modal
    const fetchPostDetails = async (postId) => {
        try {
            const response = await newsboxService.getPostById(postId);
            if (response.success) {
                setExpandedPostData(response.data);
            }
        } catch (err) {
            console.error('Error fetching post details:', err);
        }
    };

    // Handle opening post detail modal
    const handleOpenPost = async (postId) => {
        setExpandedPost(postId);
        await fetchPostDetails(postId);
    };

    // Handle Add Comment
    const handleAddComment = async () => {
        if (!newComment.trim() || !expandedPost) return;
        if (!user) {
            alert('Please login to comment');
            return;
        }

        setCommentSubmitting(true);
        try {
            const response = await newsboxService.addComment(expandedPost, newComment);
            if (response.success) {
                setNewComment('');
                // Refresh post details to show new comment
                await fetchPostDetails(expandedPost);
            }
        } catch (err) {
            console.error('Error adding comment:', err);
            alert('Failed to add comment');
        } finally {
            setCommentSubmitting(false);
        }
    };

    // Handle Comment Vote
    const handleCommentVote = async (commentId, voteType) => {
        if (!user) {
            alert('Please login to vote');
            return;
        }
        try {
            await newsboxService.voteComment(commentId, voteType);
            // Refresh post details
            if (expandedPost) {
                await fetchPostDetails(expandedPost);
            }
        } catch (err) {
            console.error('Error voting on comment:', err);
        }
    };

    // Handle New Post Submission
    const handleSubmitPost = async () => {
        if (!newPost.title || !newPost.content || !newPost.category_id) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const postData = {
                title: newPost.title,
                description: newPost.content,
                category_id: newPost.category_id,
                images: newPost.images
            };
            const response = await newsboxService.createPost(postData);
            if (response.success) {
                setNewPost({ title: '', content: '', category_id: categories[0]?.id || '', images: [] });
                setImagePreview(null);
                setShowCreateModal(false);
                fetchPosts();
            }
        } catch (err) {
            console.error('Error creating post:', err);
            alert('Failed to create post');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Edit Post
    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditImagePreview(reader.result);
                setEditPost({ ...editPost, images: [reader.result] });
            };
            reader.readAsDataURL(file);
        }
    };

    const openEditModal = (postData) => {
        setEditPost({
            id: postData.id,
            title: postData.title,
            content: postData.description,
            category_id: postData.category_id,
            images: postData.images || []
        });
        setEditImagePreview(postData.images?.[0] || null);
        setShowEditModal(true);
        setExpandedPost(null);
        setExpandedPostData(null);
    };

    const handleUpdatePost = async () => {
        if (!editPost.title || !editPost.content || !editPost.category_id) {
            alert('Please fill in all required fields');
            return;
        }

        setEditSubmitting(true);
        try {
            const postData = {
                title: editPost.title,
                description: editPost.content,
                category_id: editPost.category_id,
                images: editPost.images
            };
            const response = await newsboxService.updatePost(editPost.id, postData);
            if (response.success) {
                setEditPost({ id: '', title: '', content: '', category_id: '', images: [] });
                setEditImagePreview(null);
                setShowEditModal(false);
                fetchPosts();
            }
        } catch (err) {
            console.error('Error updating post:', err);
            alert('Failed to update post');
        } finally {
            setEditSubmitting(false);
        }
    };

    // Format time ago
    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    // Share post via URL
    const handleSharePost = async (e, postId, postTitle) => {
        e.stopPropagation();
        const shareUrl = `${window.location.origin}/newsbox?post=${postId}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: postTitle,
                    text: `Check out this post on EduSync NewsBox: ${postTitle}`,
                    url: shareUrl
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    copyToClipboard(shareUrl);
                }
            }
        } else {
            copyToClipboard(shareUrl);
        }
    };

    // Copy to clipboard helper
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Link copied to clipboard!');
        }).catch(() => {
            prompt('Copy this link:', text);
        });
    };

    // Get category name by ID
    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category?.name || 'Unknown';
    };

    return (
        <div className="relative min-h-screen p-3 md:p-5 space-y-6 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Background Details */}
            <div className="fixed inset-0 -z-50 pointer-events-none">
                <div className="absolute top-0 left-[-100px] w-[600px] h-[800px] bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent rounded-full mix-blend-multiply blur-[80px]"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-bl from-accent/20 to-primary/10 rounded-full mix-blend-multiply blur-[80px] animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-gradient-to-tr from-secondary/10 to-accent/20 rounded-full mix-blend-multiply blur-[80px] animate-blob animation-delay-2000"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
            </div>

            {/* Hero & Slider Section */}
            <div className="max-w-7xl mx-auto pt-8">
                <div className="grid lg:grid-cols-5 gap-8 items-center">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Live Campus Pulse
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-[1.1]">
                            Stay <span className="text-primary italic">Connected</span>, <br />
                            Stay Informed.
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-md">
                            Your daily dose of campus news, events, and community stories. Share what's happening around you.
                        </p>
                    </div>

                    {/* Featured News Slider */}
                    <div className="lg:col-span-3 h-[300px] md:h-[350px] relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/50 group">
                        {featuredNews.length > 0 ? (
                            featuredNews.map((news, idx) => (
                                <div
                                    key={news.id}
                                    className={cn(
                                        "absolute inset-0 transition-all duration-700 ease-in-out",
                                        idx === currentSliderIndex ? "opacity-100 scale-100" : "opacity-0 scale-110 pointer-events-none"
                                    )}
                                >
                                    {news.images?.[0] ? (
                                        <img src={news.images[0]} alt={news.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                            <Newspaper size={64} className="text-primary/30" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-8 space-y-2">
                                        <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest">
                                            Featured • {news.category_name}
                                        </span>
                                        <h3 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
                                            {news.title}
                                        </h3>
                                        <div className="flex items-center gap-4 pt-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold">
                                                    {news.author_name?.[0] || 'U'}
                                                </div>
                                                <span className="text-white/80 text-sm font-medium">{news.author_name}</span>
                                            </div>
                                            <span className="text-white/40 text-sm">•</span>
                                            <span className="text-white/80 text-sm font-medium">{formatTimeAgo(news.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                <div className="text-center">
                                    <Newspaper size={64} className="text-primary/30 mx-auto mb-4" />
                                    <p className="text-gray-500">No featured posts yet</p>
                                </div>
                            </div>
                        )}

                        {/* Slider Nav Dots */}
                        {featuredNews.length > 0 && (
                            <div className="absolute bottom-8 right-8 flex gap-2 z-10">
                                {featuredNews.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSliderIndex(idx)}
                                        className={cn(
                                            "h-2 rounded-full transition-all duration-300",
                                            idx === currentSliderIndex ? "w-8 bg-primary" : "w-2 bg-white/50 hover:bg-white"
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500/50 transition-all group"
                    >
                        <ArrowLeft size={18} className="text-gray-500 group-hover:text-blue-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">NewsBox</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The pulse of your campus community</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {user?.role === 'Admin' && (
                        <Button
                            variant="primary"
                            size="md"
                            className="rounded-xl shadow-lg shadow-emerald-200 bg-emerald-600 border-none px-6"
                            onClick={() => navigate('/newsbox/manage')}
                        >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Management Dashboard
                        </Button>
                    )}
                </div>
            </div>

            {/* Combined Filter Bar */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 border border-white/60 dark:border-gray-700 shadow-sm max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search campus news..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-medium"
                        />
                    </div>

                    {/* Sorting Bar */}
                    <div className="flex gap-2">
                        <div className="relative group">
                            <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none pl-9 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer transition-all"
                            >
                                <option value="newest">Newest</option>
                                <option value="popular">Most Popular</option>
                                <option value="oldest">Oldest</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        {user?.role === 'Admin' && (
                            <Button
                                variant="outline"
                                className="h-[42px] border-primary text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl font-bold"
                                onClick={() => navigate('/newsbox/manage')}
                            >
                                <Settings className="mr-1.5 h-4 w-4" />
                                Manage Feed
                            </Button>
                        )}

                        <Button
                            className="shadow-lg shadow-primary/20 h-[42px] bg-primary border-none rounded-xl font-bold"
                            onClick={() => setShowCreateModal(true)}
                            disabled={!user}
                        >
                            <Plus className="mr-1.5 h-4 w-4" />
                            Create Post
                        </Button>
                    </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={cn(
                            "px-5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap border-2",
                            selectedCategory === 'all'
                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                                : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary/30 hover:text-primary"
                        )}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "px-5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap border-2",
                                selectedCategory === cat.id
                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                                    : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary/30 hover:text-primary"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* News Feed Section */}
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <TrendingUp className="text-primary" />
                        Explore All Content
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <Filter size={14} />
                        {selectedCategory === 'all' ? 'All Categories' : getCategoryName(selectedCategory)}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500">{error}</p>
                        <Button onClick={fetchPosts} className="mt-4">Retry</Button>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((post) => (
                                <div
                                    key={post.id}
                                    onClick={() => handleOpenPost(post.id)}
                                    className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-white/60 dark:border-gray-700 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                                >
                                    {/* Image Section */}
                                    <div className="h-52 w-full relative overflow-hidden bg-gray-100">
                                        {post.images?.[0] ? (
                                            <img
                                                src={post.images[0]}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/20">
                                                <Newspaper size={64} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Floating Badge */}
                                        <div className="absolute top-4 left-4">
                                            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-primary shadow-sm border border-white/50 dark:border-gray-600 uppercase tracking-widest">
                                                {post.category_name}
                                            </div>
                                        </div>

                                        {post.is_pinned && (
                                            <div className="absolute top-4 right-4">
                                                <div className="bg-yellow-500 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase">
                                                    Pinned
                                                </div>
                                            </div>
                                        )}

                                        {/* Floating Action Buttons */}
                                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                            <button
                                                onClick={(e) => handleSharePost(e, post.id, post.title)}
                                                className="p-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-gray-700 dark:text-gray-300 rounded-xl shadow-lg hover:scale-110 hover:bg-primary hover:text-white active:scale-95 transition-all"
                                                title="Share post"
                                            >
                                                <Share2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                                <Clock size={12} className="text-primary/50" />
                                                {formatTimeAgo(post.created_at)}
                                            </span>
                                            {/* Comments count first, then votes */}
                                            <div className="ml-auto flex items-center gap-2">
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400">
                                                    <MessageSquare size={12} className="text-primary" />
                                                    <span className="text-[10px] font-black">{post.comment_count}</span>
                                                </span>
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400">
                                                    <ArrowBigUp size={12} />
                                                    <span className="text-[10px] font-black">{post.vote_count}</span>
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="font-black text-gray-900 dark:text-white text-lg mb-4 leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[48px]">
                                            {post.title}
                                        </h3>

                                        {/* Author section with image */}
                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100/50 dark:border-gray-700/50">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-black shadow-lg shadow-primary/20 overflow-hidden">
                                                {getAuthorAvatar(post.author_id) ? (
                                                    <img src={getAuthorAvatar(post.author_id)} alt={post.author_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={18} />
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="text-xs text-gray-700 dark:text-gray-300 font-bold truncate">{post.author_name}</span>
                                            </div>
                                            
                                            {/* Vote buttons */}
                                            <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-1 border border-gray-100 dark:border-gray-600">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleVote(post.id, 'UP'); }}
                                                    className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                                                    title="Upvote"
                                                >
                                                    <ArrowBigUp size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleVote(post.id, 'DOWN'); }}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                    title="Downvote"
                                                >
                                                    <ArrowBigDown size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center">
                                <div className="inline-block p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 mb-3">
                                    <Search size={32} className="text-gray-300 dark:text-gray-600" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">No news found</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters or search.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Post Detail Modal */}
            {expandedPost && expandedPostData && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-2xl rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 duration-300 overflow-hidden bg-white dark:bg-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 dark:border-gray-700 p-6 md:p-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <Newspaper className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Full Broadcast</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                {user && expandedPostData.author_id === user.id && (
                                    <button
                                        onClick={() => openEditModal(expandedPostData)}
                                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all group"
                                        title="Edit post"
                                    >
                                        <Edit3 className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                                    </button>
                                )}
                                <button
                                    onClick={() => { setExpandedPost(null); setExpandedPostData(null); }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                                >
                                    <X className="h-6 w-6 text-gray-400" />
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                            {expandedPostData.images?.[0] && (
                                <div className="rounded-2xl overflow-hidden shadow-sm">
                                    <img
                                        src={expandedPostData.images[0]}
                                        className="w-full h-auto object-cover"
                                        alt="News"
                                    />
                                </div>
                            )}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-full">
                                        {expandedPostData.category_name}
                                    </span>
                                    {expandedPostData.is_pinned && (
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-black rounded-full">
                                            Pinned
                                        </span>
                                    )}
                                    {expandedPostData.is_official && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black rounded-full">
                                            Official
                                        </span>
                                    )}
                                </div>
                                
                                {/* Author Info */}
                                <div 
                                    onClick={() => navigate(`/profile/${expandedPostData.author_id}`)}
                                    className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-black shadow-lg shadow-primary/20 overflow-hidden">
                                        {getAuthorAvatar(expandedPostData.author_id) ? (
                                            <img src={getAuthorAvatar(expandedPostData.author_id)} alt={expandedPostData.author_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={24} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">{expandedPostData.author_name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Posted {formatTimeAgo(expandedPostData.created_at)}</p>
                                    </div>
                                    <ChevronRight className="text-gray-400 group-hover:text-primary transition-colors" size={20} />
                                </div>

                                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight break-words">{expandedPostData.title}</h3>
                                <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg ql-viewer break-words overflow-wrap-anywhere" dangerouslySetInnerHTML={{ __html: expandedPostData.description }} />
                            </div>

                            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Community Reactions</h4>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => handleSharePost(e, expandedPost, expandedPostData.title)}
                                            className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-primary hover:text-white rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 transition-all"
                                        >
                                            <Share2 size={16} />
                                            Share
                                        </button>
                                        <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl p-1 border border-gray-100 dark:border-gray-600">
                                            <button
                                                onClick={() => handleVote(expandedPost, 'UP')}
                                                className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all"
                                            >
                                                <ArrowBigUp size={20} />
                                            </button>
                                            <span className="px-3 text-sm font-black italic text-gray-700 dark:text-gray-200">{expandedPostData.vote_count}</span>
                                            <button
                                                onClick={() => handleVote(expandedPost, 'DOWN')}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all"
                                            >
                                                <ArrowBigDown size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {user && (
                                <div className="flex gap-2 mt-4">
                                    <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                    />
                                    <Button
                                        size="icon"
                                        className="rounded-xl"
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim() || commentSubmitting}
                                    >
                                        {commentSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={18} />}
                                    </Button>
                                </div>
                            )}

                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {expandedPostData.comments?.map(comment => (
                                    <div key={comment.id} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-sm text-gray-900 dark:text-white">{comment.author_name}</span>
                                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                                                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{comment.vote_count}</span>
                                                <button
                                                    onClick={() => handleCommentVote(comment.id, 'UP')}
                                                    className="text-gray-400 hover:text-blue-600"
                                                >
                                                    <ArrowBigUp size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 text-left">{comment.content}</p>
                                    </div>
                                ))}
                                {expandedPostData.comments?.length === 0 && (
                                    <p className="text-center text-gray-400 py-4">No comments yet. Be the first to comment!</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 duration-300 bg-white dark:bg-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 dark:border-gray-700 p-8">
                            <div>
                                <CardTitle className="text-2xl font-black text-gray-900 dark:text-white">Create News Post</CardTitle>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Share something with the campus</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-400"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">News Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter a catchy headline..."
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Attachment (Optional)</label>
                                <div className="flex flex-col gap-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="post-image"
                                        onChange={handleImageChange}
                                    />
                                    {!imagePreview ? (
                                        <label
                                            htmlFor="post-image"
                                            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-100 dark:border-gray-600 rounded-[2rem] bg-gray-50/50 dark:bg-gray-700/30 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-700 transition-all group"
                                        >
                                            <div className="p-4 bg-white rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                <Camera className="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-500">Pick a catchy photo</span>
                                            <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">JPG, PNG up to 5MB</span>
                                        </label>
                                    ) : (
                                        <div className="relative group p-2 bg-gray-50 dark:bg-gray-700 rounded-[2rem] border border-gray-100 dark:border-gray-600">
                                            <img src={imagePreview} className="w-full h-48 object-cover rounded-[1.5rem]" alt="Preview" />
                                            <button
                                                onClick={() => { setImagePreview(null); setNewPost({ ...newPost, images: [] }); }}
                                                className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Category</label>
                                <select
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white"
                                    value={newPost.category_id}
                                    onChange={(e) => setNewPost({ ...newPost, category_id: e.target.value })}
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Content</label>
                                <RichTextEditor
                                    value={newPost.content}
                                    onChange={(val) => setNewPost({ ...newPost, content: val })}
                                    placeholder="Tell the full story..."
                                    className="min-h-[250px] text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 rounded-2xl py-4 font-bold border-gray-200 dark:border-gray-600 dark:text-gray-300"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmitPost}
                                    disabled={submitting || !newPost.title || !newPost.content || !newPost.category_id}
                                    className="flex-1 rounded-2xl py-4 font-bold shadow-lg shadow-blue-100"
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Broadcast News
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Edit Post Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 duration-300 bg-white dark:bg-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 dark:border-gray-700 p-8">
                            <div>
                                <CardTitle className="text-2xl font-black text-gray-900 dark:text-white">Edit News Post</CardTitle>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your post</p>
                            </div>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-400"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">News Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter a catchy headline..."
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white"
                                    value={editPost.title}
                                    onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Attachment (Optional)</label>
                                <div className="flex flex-col gap-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="edit-post-image"
                                        onChange={handleEditImageChange}
                                    />
                                    {!editImagePreview ? (
                                        <label
                                            htmlFor="edit-post-image"
                                            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-100 dark:border-gray-600 rounded-[2rem] bg-gray-50/50 dark:bg-gray-700/30 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-700 transition-all group"
                                        >
                                            <div className="p-4 bg-white rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                <Camera className="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-500">Pick a catchy photo</span>
                                            <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">JPG, PNG up to 5MB</span>
                                        </label>
                                    ) : (
                                        <div className="relative group p-2 bg-gray-50 dark:bg-gray-700 rounded-[2rem] border border-gray-100 dark:border-gray-600">
                                            <img src={editImagePreview} className="w-full h-48 object-cover rounded-[1.5rem]" alt="Preview" />
                                            <button
                                                onClick={() => { setEditImagePreview(null); setEditPost({ ...editPost, images: [] }); }}
                                                className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Category</label>
                                <select
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white"
                                    value={editPost.category_id}
                                    onChange={(e) => setEditPost({ ...editPost, category_id: e.target.value })}
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Content</label>
                                <RichTextEditor
                                    value={editPost.content}
                                    onChange={(val) => setEditPost({ ...editPost, content: val })}
                                    placeholder="Tell the full story..."
                                    className="min-h-[250px] text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 rounded-2xl py-4 font-bold border-gray-200 dark:border-gray-600 dark:text-gray-300"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdatePost}
                                    disabled={editSubmitting || !editPost.title || !editPost.content || !editPost.category_id}
                                    className="flex-1 rounded-2xl py-4 font-bold shadow-lg shadow-blue-100"
                                >
                                    {editSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Update Post
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Quill Styles for Viewer */}
            <style>{`
                .ql-viewer img { max-width: 100%; height: auto; border-radius: 1rem; margin: 1rem 0; }
                .ql-viewer p { margin-bottom: 0.5rem; }
                .ql-viewer h1 { font-size: 1.8rem; font-weight: 800; margin: 1rem 0; }
                .ql-viewer h2 { font-size: 1.4rem; font-weight: 700; margin: 0.8rem 0; }
                .ql-viewer ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                .ql-viewer ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
                .ql-viewer .ql-align-center { text-align: center; }
                .ql-viewer .ql-align-right { text-align: right; }
                .ql-viewer .ql-align-justify { text-align: justify; }
            `}</style>
        </div>
    );
};

export default NewsBoxHome;
