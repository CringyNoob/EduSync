import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Newspaper, Search, Filter, Loader2, AlertCircle, CheckCircle,
    Trash2, Plus, Eye, MessageSquare, RefreshCw, ChevronLeft,
    ChevronRight, Calendar, User, Heart, Shield, Send, X,
    Megaphone, Image as ImageIcon, FileText, Camera
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Cards/Card';
import Button from '../../components/Button';
import adminService from '../../services/adminService';
import newsboxService from '../../services/newsboxService';
import { useAuth } from '../../context/AuthContext';

const AdminNewsManager = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 20;
    
    // Modals
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    
    // Post Detail Modal (like NewsBoxHome)
    const [expandedPost, setExpandedPost] = useState(null);
    const [expandedPostData, setExpandedPostData] = useState(null);
    
    // Categories
    const [categories, setCategories] = useState([]);
    
    // Announcement form (matching NewsBoxHome create post form)
    const [announcementForm, setAnnouncementForm] = useState({
        title: '',
        content: '',
        category_id: '',
        images: []
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [createLoading, setCreateLoading] = useState(false);
    
    // Stats
    const [stats, setStats] = useState({
        totalPosts: 0,
        totalAnnouncements: 0,
        totalComments: 0,
        postsToday: 0
    });
    
    // Check if user is admin - support multiple role formats
    const isAdmin = (user?.roles?.includes('ADMIN') && user?.activeRole === 'ADMIN') || 
                    user?.role === 'ADMIN' || 
                    user?.role === 'Admin';
    
    // Debug logging
    useEffect(() => {
        console.log('AdminNewsManager - Current user:', user);
        console.log('AdminNewsManager - Is admin?', isAdmin);
    }, [user, isAdmin]);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            // Using newsbox service to get categories
            const response = await adminService.getCategories();
            if (response.success && response.data) {
                setCategories(response.data);
                // Set first category as default
                if (response.data.length > 0 && !announcementForm.category_id) {
                    setAnnouncementForm(prev => ({ ...prev, category_id: response.data[0].id }));
                }
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            // Fallback to default categories
            setCategories([
                { id: 'announcement', name: 'Announcement' },
                { id: 'academic', name: 'Academic' },
                { id: 'events', name: 'Events' }
            ]);
        }
    }, [announcementForm.category_id]);

    const fetchPosts = useCallback(async () => {
        if (!isAdmin) return;
        
        try {
            setLoading(true);
            setError('');
            
            const params = {
                page: currentPage,
                limit: itemsPerPage
            };
            if (categoryFilter) params.category = categoryFilter;
            if (searchQuery) params.search = searchQuery;
            
            const response = await adminService.getAllPosts(params);
            
            if (response.success) {
                setPosts(response.data || []);
                setFilteredPosts(response.data || []);
                setTotalPages(Math.ceil((response.total || response.data?.length || 0) / itemsPerPage));
                
                if (response.stats) {
                    setStats(response.stats);
                }
            } else {
                setError(response.message || 'Failed to load posts');
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(err.response?.data?.message || 'Failed to load posts');
        } finally {
            setLoading(false);
        }
    }, [isAdmin, currentPage, categoryFilter, searchQuery]);

    useEffect(() => {
        if (isAdmin) {
            fetchCategories();
            fetchPosts();
        }
    }, [isAdmin, fetchCategories, fetchPosts]);

    // Local search filter
    useEffect(() => {
        if (!searchQuery) {
            setFilteredPosts(posts);
            return;
        }
        
        const query = searchQuery.toLowerCase();
        const filtered = posts.filter(p => 
            p.title?.toLowerCase().includes(query) ||
            p.content?.toLowerCase().includes(query) ||
            p.author_name?.toLowerCase().includes(query)
        );
        setFilteredPosts(filtered);
    }, [searchQuery, posts]);

    // Handle Image Change (identical to NewsBoxHome)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadedend = () => {
                setImagePreview(reader.result);
                setAnnouncementForm({ ...announcementForm, images: [reader.result] });
            };
            reader.readAsDataURL(file);
        }
    };

    const fetchComments = async (postId) => {
        try {
            setCommentsLoading(true);
            const response = await adminService.getPostComments(postId);
            if (response.success) {
                setComments(response.data || []);
            }
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setCommentsLoading(false);
        }
    };

    // Fetch post details for modal (like NewsBoxHome)
    const fetchPostDetails = async (postId) => {
        try {
            const response = await newsboxService.getPostById(postId);
            setExpandedPostData(response.data);
        } catch (err) {
            console.error('Error fetching post details:', err);
        }
    };

    // Handle opening post detail modal
    const handleOpenPost = async (postId) => {
        setExpandedPost(postId);
        await fetchPostDetails(postId);
    };

    const handleCreateAnnouncement = async () => {
        if (!announcementForm.title.trim() || !announcementForm.content.trim() || !announcementForm.category_id) {
            setError('Title, content, and category are required');
            return;
        }
        
        try {
            setCreateLoading(true);
            setError('');
            
            // Match NewsManagement format
            const response = await adminService.createAnnouncement({
                title: announcementForm.title,
                description: announcementForm.content, // Changed from content to description
                category_id: announcementForm.category_id,
                images: announcementForm.imageUrl ? [announcementForm.imageUrl] : [],
                is_official: true
            });
            
            if (response.success) {
                setSuccess('Announcement posted successfully!');
                setShowCreateModal(false);
                setAnnouncementForm({
                    title: '',
                    content: '',
                    category_id: categories[0]?.id || '',
                    imageUrl: ''
                });
                fetchPosts();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error creating announcement:', err);
            setError(err.response?.data?.message || 'Failed to create announcement');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeletePost = async () => {
        if (!selectedPost) return;
        
        try {
            setActionLoading(selectedPost.id);
            
            const response = await adminService.deletePost(selectedPost.id);
            
            if (response.success) {
                setPosts(prev => prev.filter(p => p.id !== selectedPost.id));
                setShowDeleteModal(false);
                setSelectedPost(null);
                setSuccess('Post deleted successfully');
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            console.error('Error deleting post:', err);
            setError(err.response?.data?.message || 'Failed to delete post');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            setActionLoading(commentId);
            
            const response = await adminService.deleteComment(commentId);
            
            if (response.success) {
                setComments(prev => prev.filter(c => c.id !== commentId));
            }
        } catch (err) {
            console.error('Error deleting comment:', err);
            setError(err.response?.data?.message || 'Failed to delete comment');
        } finally {
            setActionLoading(null);
        }
    };

    const openCommentsModal = async (post) => {
        setSelectedPost(post);
        setShowCommentsModal(true);
        await fetchComments(post.id);
    };

    const getCategoryBadge = (category) => {
        const colors = {
            Announcement: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            Academic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            Events: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            General: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
            Sports: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            Cultural: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
        };
        
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${colors[category] || colors.General}`}>
                {category}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
                    <p className="text-gray-500 dark:text-gray-400">You need admin privileges to access this page.</p>
                    <Button onClick={() => navigate('/admin-dashboard')} className="mt-4">
                        Go to Admin Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    if (loading && posts.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Link to="/admin-dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <ChevronLeft className="h-5 w-5 text-gray-500" />
                        </Link>
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-xl">
                            <Newspaper size={24} className="text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">News Manager</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 ml-16">
                        Post announcements and moderate user content
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchPosts} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Megaphone className="h-4 w-4 mr-2" />
                        Post Announcement
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <FileText size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalPosts}</p>
                                <p className="text-xs text-gray-500">Total Posts</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <Megaphone size={20} className="text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalAnnouncements}</p>
                                <p className="text-xs text-gray-500">Announcements</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <MessageSquare size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalComments}</p>
                                <p className="text-xs text-gray-500">Comments</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                <Calendar size={20} className="text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.postsToday}</p>
                                <p className="text-xs text-gray-500">Posts Today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <p className="font-medium">{success}</p>
                </div>
            )}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="font-medium">{error}</p>
                    <button onClick={() => setError('')} className="ml-auto">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Search & Filters */}
            <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search posts by title, content, or author..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-primary focus:outline-none transition-all font-medium text-gray-900 dark:text-white"
                            />
                        </div>
                        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </div>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full md:w-64 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:outline-none font-medium"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Posts Table */}
            <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Post</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stats</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Newspaper className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">No posts found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0">
                                                    {post.images?.[0] ? (
                                                        <img src={post.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Newspaper className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p 
                                                        className="font-bold text-gray-900 dark:text-white truncate max-w-xs cursor-pointer hover:text-primary transition-colors"
                                                        onClick={() => handleOpenPost(post.id)}
                                                    >
                                                        {post.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                        {post.content?.substring(0, 50)}...
                                                    </p>
                                                    {post.is_announcement && (
                                                        <span className="inline-flex items-center gap-1 text-xs text-red-500 font-bold mt-1">
                                                            <Megaphone size={12} />
                                                            Announcement
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {post.author_avatar ? (
                                                    <img src={post.author_avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                        {post.author_name?.charAt(0) || 'A'}
                                                    </div>
                                                )}
                                                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                                                    {post.author_name || 'Admin'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getCategoryBadge(post.category)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Heart size={14} className="text-red-400" />
                                                    {post.likes_count || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare size={14} className="text-blue-400" />
                                                    {post.comments_count || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                {formatDate(post.created_at)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openCommentsModal(post)}
                                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="View Comments"
                                                >
                                                    <MessageSquare size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedPost(post);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    disabled={actionLoading === post.id}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="Delete Post"
                                                >
                                                    {actionLoading === post.id ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Create Announcement Modal - Matching NewsBoxHome */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 duration-300 bg-white dark:bg-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 dark:border-gray-700 p-8">
                            <div>
                                <CardTitle className="text-2xl font-black text-gray-900 dark:text-white">Post Announcement</CardTitle>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Share an official announcement</p>
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
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Announcement Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter a clear headline..."
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-900 dark:text-white"
                                    value={announcementForm.title}
                                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Attachment (Optional)</label>
                                <div className="flex flex-col gap-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="announcement-image"
                                        onChange={handleImageChange}
                                    />
                                    {!imagePreview ? (
                                        <label
                                            htmlFor="announcement-image"
                                            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-100 dark:border-gray-600 rounded-[2rem] bg-gray-50/50 dark:bg-gray-700/30 cursor-pointer hover:bg-red-50/50 dark:hover:bg-red-900/10 hover:border-red-200 dark:hover:border-red-700 transition-all group"
                                        >
                                            <div className="p-4 bg-white rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                <Camera className="h-6 w-6 text-gray-400 group-hover:text-red-600" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-500">Add an image</span>
                                            <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">JPG, PNG up to 5MB</span>
                                        </label>
                                    ) : (
                                        <div className="relative group p-2 bg-gray-50 dark:bg-gray-700 rounded-[2rem] border border-gray-100 dark:border-gray-600">
                                            <img src={imagePreview} className="w-full h-48 object-cover rounded-[1.5rem]" alt="Preview" />
                                            <button
                                                onClick={() => { setImagePreview(null); setAnnouncementForm({ ...announcementForm, images: [] }); }}
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
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-900 dark:text-white"
                                    value={announcementForm.category_id}
                                    onChange={(e) => setAnnouncementForm({ ...announcementForm, category_id: e.target.value })}
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Content</label>
                                <textarea
                                    value={announcementForm.content}
                                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                                    placeholder="Write the full announcement message..."
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-900 dark:text-white min-h-[150px] resize-none"
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
                                    onClick={handleCreateAnnouncement}
                                    disabled={createLoading || !announcementForm.title || !announcementForm.content || !announcementForm.category_id}
                                    className="flex-1 rounded-2xl py-4 font-bold shadow-lg shadow-red-100 bg-red-600 hover:bg-red-700"
                                >
                                    {createLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Post Announcement
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Post Detail Modal */}
            {expandedPost && expandedPostData && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-2xl rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 duration-300 overflow-hidden bg-white dark:bg-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 dark:border-gray-700 p-6 md:p-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <Newspaper className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Post Details</h2>
                            </div>
                            <button
                                onClick={() => { setExpandedPost(null); setExpandedPostData(null); }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                            >
                                <X className="h-6 w-6 text-gray-400" />
                            </button>
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
                                    {expandedPostData.is_official && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black rounded-full">
                                            Official
                                        </span>
                                    )}
                                    {expandedPostData.is_announcement && (
                                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-black rounded-full flex items-center gap-1">
                                            <Megaphone size={12} />
                                            Announcement
                                        </span>
                                    )}
                                </div>
                                
                                {/* Author Info */}
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-black shadow-lg shadow-primary/20 overflow-hidden">
                                        {expandedPostData.author_avatar ? (
                                            <img src={expandedPostData.author_avatar} alt={expandedPostData.author_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={24} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-gray-900 dark:text-white">{expandedPostData.author_name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Posted {formatDate(expandedPostData.created_at)}</p>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight break-words">{expandedPostData.title}</h3>
                                <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-base break-words overflow-wrap-anywhere whitespace-pre-wrap">{expandedPostData.description || expandedPostData.content}</div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Post Statistics</h4>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                    <span className="flex items-center gap-2">
                                        <Heart size={16} className="text-red-400" />
                                        <span className="font-bold">{expandedPostData.likes_count || 0}</span> Likes
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <MessageSquare size={16} className="text-blue-400" />
                                        <span className="font-bold">{expandedPostData.comments_count || 0}</span> Comments
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Eye size={16} className="text-gray-400" />
                                        <span className="font-bold">{expandedPostData.views || 0}</span> Views
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Delete Post Modal */}
            {showDeleteModal && selectedPost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Post</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{selectedPost.title}</p>
                            </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            This will permanently delete this post and all its comments. This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                onClick={handleDeletePost}
                                disabled={actionLoading === selectedPost.id}
                            >
                                {actionLoading === selectedPost.id && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Comments Modal */}
            {showCommentsModal && selectedPost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Comments
                                    </h3>
                                    <p className="text-sm text-gray-500 truncate max-w-xs">{selectedPost.title}</p>
                                </div>
                                <button onClick={() => setShowCommentsModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {commentsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-12">
                                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No comments yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3">
                                                    {comment.author_avatar ? (
                                                        <img src={comment.author_avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                            {comment.author_name?.charAt(0) || 'U'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                            {comment.author_name || 'Unknown'}
                                                        </p>
                                                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                                                            {comment.content}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-2">
                                                            {formatDate(comment.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    disabled={actionLoading === comment.id}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="Delete Comment"
                                                >
                                                    {actionLoading === comment.id ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNewsManager;
