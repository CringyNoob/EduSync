import React, { useState, useMemo, useEffect } from 'react';
import {
    MessageSquare,
    ArrowBigUp,
    ArrowBigDown,
    MessageCircle,
    Share2,
    Newspaper,
    Search,
    Plus,
    X,
    TrendingUp,
    Filter,
    ImageIcon,
    Camera,
    ArrowUpDown,
    ChevronDown,
    ArrowLeft,
    Clock,
    LayoutDashboard,
    Settings,
    Send
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Cards/Card';
import Button from '../../components/Button';
import RichTextEditor from '../../components/RichTextEditor';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import 'react-quill-new/dist/quill.snow.css';

const NewsBoxHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    // Initial Mock Data
    const [posts, setPosts] = useState([
        {
            id: 1,
            title: "Major Campus Renovation Starting Next Month",
            content: "The university has announced plans for a $10M renovation of the main library and student union. Expected completion is Fall 2026.",
            author: "Admin News",
            category: "Campus",
            image: "/images/campus_renovation.png",
            upboard: 156,
            downboard: 12,
            comments: [
                { id: 1, user: "John D.", content: "Finally! The library needed more outlets.", upboard: 24, downboard: 2 },
                { id: 2, user: "Sarah L.", content: "Will the library be closed during finals?", upboard: 45, downboard: 1 }
            ],
            time: "2 hours ago"
        },
        {
            id: 2,
            title: "UIU Tigers Win Regional Basketball Finals",
            content: "In a stunning upset, the UIU Tigers defeated the defending champions last night. The winning 3-pointer was scored in the last 2 seconds.",
            author: "Sports Desk",
            category: "Sports",
            image: "/images/basketball_victory.png",
            upboard: 482,
            downboard: 5,
            comments: [],
            time: "5 hours ago"
        },
        {
            id: 3,
            title: "Tech Career Fair: Register Now",
            content: "Over 50 top tech companies including Google and Microsoft will be attending this year's career fair on campus.",
            author: "Career Services",
            category: "Career",
            image: "/images/career_fair.png",
            upboard: 95,
            downboard: 3,
            comments: [],
            time: "1 day ago"
        }
    ]);

    const categories = ['All', 'Campus', 'Sports', 'Academics', 'Career', 'Lifestyle', 'Tech'];
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Campus', image: null });
    const [imagePreview, setImagePreview] = useState(null);
    const [expandedPost, setExpandedPost] = useState(null);
    const [currentSliderIndex, setCurrentSliderIndex] = useState(0);
    const [newComment, setNewComment] = useState('');

    const featuredNews = useMemo(() => posts.slice(0, 3), [posts]);

    // Auto-advance slider
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSliderIndex((prev) => (prev + 1) % featuredNews.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [featuredNews.length]);

    // Check for create intent from navigation
    useEffect(() => {
        if (location.state?.create) {
            setShowCreateModal(true);
            // Clear the state so it doesn't reopen on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Handle Image Change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setNewPost({ ...newPost, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredAndSortedPosts = useMemo(() => {
        let result = posts.filter(post => {
            const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
            const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.content.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        switch (sortBy) {
            case 'upboard': result.sort((a, b) => b.upboard - a.upboard); break;
            case 'score': result.sort((a, b) => (b.upboard - b.downboard) - (a.upboard - a.downboard)); break;
            default: result.sort((a, b) => b.id - a.id); break;
        }

        return result;
    }, [posts, selectedCategory, searchQuery, sortBy]);

    // Handle Voting
    const handleVote = (postId, type, commentId = null) => {
        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                if (commentId) {
                    return {
                        ...post,
                        comments: post.comments.map(comment => {
                            if (comment.id === commentId) {
                                return {
                                    ...comment,
                                    [type + 'board']: comment[type + 'board'] + 1
                                };
                            }
                            return comment;
                        })
                    };
                }
                return {
                    ...post,
                    [type + 'board']: post[type + 'board'] + 1
                };
            }
            return post;
        }));
    };

    // Handle Add Comment
    const handleAddComment = (postId) => {
        if (!newComment.trim()) return;

        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: [
                        ...post.comments,
                        {
                            id: Date.now(),
                            user: "Me", // In real app, get from user context
                            content: newComment,
                            upboard: 0,
                            downboard: 0
                        }
                    ]
                };
            }
            return post;
        }));
        setNewComment('');
    };

    // Handle New Post
    const handleSubmitPost = () => {
        if (!newPost.title || !newPost.content) return;

        const post = {
            id: Date.now(),
            ...newPost,
            author: "Me",
            upboard: 0,
            downboard: 0,
            comments: [],
            time: "Just now"
        };

        setPosts([post, ...posts]);
        setNewPost({ title: '', content: '', category: 'Campus', image: null });
        setImagePreview(null);
        setShowCreateModal(false);
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
                        {featuredNews.map((news, idx) => (
                            <div
                                key={news.id}
                                className={cn(
                                    "absolute inset-0 transition-all duration-700 ease-in-out",
                                    idx === currentSliderIndex ? "opacity-100 scale-100" : "opacity-0 scale-110 pointer-events-none"
                                )}
                            >
                                <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-8 space-y-2">
                                    <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest">
                                        Featured • {news.category}
                                    </span>
                                    <h3 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
                                        {news.title}
                                    </h3>
                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold">
                                                {news.author[0]}
                                            </div>
                                            <span className="text-white/80 text-sm font-medium">{news.author}</span>
                                        </div>
                                        <span className="text-white/40 text-sm">•</span>
                                        <span className="text-white/80 text-sm font-medium">{news.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Slider Nav Dots */}
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
                                <option value="upboard">Most Liked</option>
                                <option value="score">Highest Score</option>
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
                        >
                            <Plus className="mr-1.5 h-4 w-4" />
                            Broadcast News
                        </Button>
                    </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                "px-5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap border-2",
                                selectedCategory === cat
                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                                    : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary/30 hover:text-primary"
                            )}
                        >
                            {cat}
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
                        Filtered by {selectedCategory}
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredAndSortedPosts.length > 0 ? (
                        filteredAndSortedPosts.map((post) => (
                            <div
                                key={post.id}
                                onClick={() => setExpandedPost(post.id)}
                                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-white/60 dark:border-gray-700 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                            >
                                {/* Image Section */}
                                <div className="h-52 w-full relative overflow-hidden bg-gray-100">
                                    {post.image ? (
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/20">
                                            <Newspaper size={64} />
                                        </div>
                                    )}
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Floating Badge */}
                                    <div className="absolute top-4 left-4">
                                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-primary shadow-sm border border-white/50 dark:border-gray-600 uppercase tracking-widest">
                                            {post.category}
                                        </div>
                                    </div>

                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleVote(post.id, 'up'); }}
                                            className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all"
                                        >
                                            <ArrowBigUp size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                            <Clock size={12} className="text-primary/50" />
                                            {post.time}
                                        </span>
                                        <span className="ml-auto flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400">
                                            <ArrowBigUp size={12} />
                                            <span className="text-[10px] font-black">{post.upboard - post.downboard}</span>
                                        </span>
                                    </div>

                                    <h3 className="font-black text-gray-900 dark:text-white text-lg mb-4 leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[48px]">
                                        {post.title}
                                    </h3>

                                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100/50 dark:border-gray-700/50">
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-primary/20">
                                            {post.author[0]}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Verified Auth</span>
                                            <span className="text-xs text-gray-700 dark:text-gray-300 font-bold truncate">{post.author}</span>
                                        </div>
                                        <div className="ml-auto flex items-center gap-1.5 bg-gray-50/50 dark:bg-gray-700/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
                                            <MessageSquare size={14} className="text-primary" />
                                            <span className="text-[10px] font-black text-gray-900 dark:text-white">{post.comments.length}</span>
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
            </div>

            {/* Post Detail Modal */}
            {expandedPost && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-2xl rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 duration-300 overflow-hidden bg-white dark:bg-gray-800">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 dark:border-gray-700 p-6 md:p-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <Newspaper className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Full Broadcast</h2>
                            </div>
                            <button
                                onClick={() => setExpandedPost(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                            >
                                <X className="h-6 w-6 text-gray-400" />
                            </button>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                            {posts.find(p => p.id === expandedPost)?.image && (
                                <div className="rounded-2xl overflow-hidden shadow-sm">
                                    <img
                                        src={posts.find(p => p.id === expandedPost).image}
                                        className="w-full h-auto object-cover"
                                        alt="News"
                                    />
                                </div>
                            )}
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{posts.find(p => p.id === expandedPost).title}</h3>
                                <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg ql-viewer" dangerouslySetInnerHTML={{ __html: posts.find(p => p.id === expandedPost).content }} />
                            </div>

                            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Community Reactions</h4>
                                    <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl p-1 border border-gray-100 dark:border-gray-600">
                                        <button
                                            onClick={() => handleVote(expandedPost, 'up')}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all"
                                        >
                                            <ArrowBigUp size={20} />
                                        </button>
                                        <span className="px-3 text-sm font-black italic text-gray-700 dark:text-gray-200">{posts.find(p => p.id === expandedPost).upboard - posts.find(p => p.id === expandedPost).downboard}</span>
                                        <button
                                            onClick={() => handleVote(expandedPost, 'down')}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all"
                                        >
                                            <ArrowBigDown size={20} />
                                        </button>
                                    </div>
                                </div>

                            </div>
                            <div className="flex gap-2 mt-4">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment(expandedPost)}
                                />
                                <Button
                                    size="icon"
                                    className="rounded-xl"
                                    onClick={() => handleAddComment(expandedPost)}
                                    disabled={!newComment.trim()}
                                >
                                    <Send size={18} />
                                </Button>
                            </div>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {posts.find(p => p.id === expandedPost).comments.map(comment => (
                                    <div key={comment.id} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-sm text-gray-900 dark:text-white">{comment.user}</span>
                                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                                                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{comment.upboard - comment.downboard}</span>
                                                <button
                                                    onClick={() => handleVote(expandedPost, 'up', comment.id)}
                                                    className="text-gray-400 hover:text-blue-600"
                                                >
                                                    <ArrowBigUp size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 text-left">{comment.content}</p>
                                    </div>
                                ))}
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
                                                onClick={() => { setImagePreview(null); setNewPost({ ...newPost, image: null }); }}
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
                                    value={newPost.category}
                                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                >
                                    {categories.filter(c => c !== 'All').map(c => (
                                        <option key={c} value={c}>{c}</option>
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
                                    className="flex-1 rounded-2xl py-4 font-bold shadow-lg shadow-blue-100"
                                >
                                    Broadcast News
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
