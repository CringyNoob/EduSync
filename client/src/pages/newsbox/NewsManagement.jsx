import React, { useState, useEffect } from 'react';
import {
    Newspaper,
    CheckCircle2,
    XCircle,
    AlertCircle,
    TrendingUp,
    Clock,
    MessageSquare,
    Plus,
    Search,
    Filter,
    ArrowUpCircle,
    Pin,
    MoreVertical,
    Check,
    Send,
    Eye,
    ChevronRight,
    Megaphone,
    Save,
    Trash2,
    FileText,
    Edit3,
    Settings
} from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../../components/Button';
import RichTextEditor from '../../components/RichTextEditor';

const NewsManagement = () => {
    const [activeTab, setActiveTab] = useState('moderation');
    const [loading, setLoading] = useState(true);

    // Initial Mock Data
    const [pendingPosts, setPendingPosts] = useState([
        {
            id: '1',
            author_name: 'Sarah Chen',
            title: 'Lost Keys in Library',
            content: '<p>Found a set of keys near the second floor elevators. Please contact me if they are yours.</p>',
            category: 'Campus',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            status: 'PENDING'
        },
        {
            id: '2',
            author_name: 'John Doe',
            title: 'Upcoming Tech Club Meetup',
            content: '<p>We are hosting a workshop on AI this Saturday. Everyone is invited!</p>',
            category: 'Tech',
            created_at: new Date(Date.now() - 7200000).toISOString(),
            status: 'PENDING'
        }
    ]);

    const [publishedPosts, setPublishedPosts] = useState([
        {
            id: '3',
            author_name: 'Admin - Varsity News',
            title: 'Library Renovation Complete',
            content: '<p>The 3rd floor is now open with new study pods and improved lighting.</p>',
            category: 'Campus',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            status: 'APPROVED',
            is_official: true,
            is_pinned: true,
            upboard_count: 45
        }
    ]);

    const [drafts, setDrafts] = useState([
        {
            id: 'd1',
            title: 'Draft Announcement',
            content: '<p>This is an official announcement currently being drafted for campus-wide distribution.</p>',
            category: 'Campus',
            created_at: new Date(Date.now() - 1800000).toISOString(),
            status: 'DRAFT'
        }
    ]);

    const [stats, setStats] = useState({
        totalPosts: 125,
        pendingReview: 2,
        todayApprovals: 5,
        totalInteractions: 1450
    });

    const [broadcastPost, setBroadcastPost] = useState({
        id: null,
        title: '',
        content: '',
        category: 'Campus',
        imageUrl: ''
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleApprove = (id) => {
        const post = pendingPosts.find(p => p.id === id);
        if (post) {
            setPendingPosts(pendingPosts.filter(p => p.id !== id));
            setPublishedPosts([{ ...post, status: 'APPROVED' }, ...publishedPosts]);
            setStats({
                ...stats,
                pendingReview: stats.pendingReview - 1,
                todayApprovals: stats.todayApprovals + 1,
                totalPosts: stats.totalPosts + 1
            });
        }
    };

    const handleReject = (id) => {
        setPendingPosts(pendingPosts.filter(p => p.id !== id));
        setStats({
            ...stats,
            pendingReview: stats.pendingReview - 1
        });
    };

    const handleBroadcast = (e) => {
        e.preventDefault();
        if (!broadcastPost.title || !broadcastPost.content) return;

        const newPost = {
            id: broadcastPost.id || Date.now().toString(),
            author_name: 'Admin (You)',
            title: broadcastPost.title,
            content: broadcastPost.content,
            category: broadcastPost.category,
            imageUrl: broadcastPost.imageUrl,
            created_at: new Date().toISOString(),
            status: 'APPROVED',
            is_official: true,
            is_pinned: true,
            upboard_count: 0
        };

        if (broadcastPost.id && broadcastPost.id.startsWith('d')) {
            setDrafts(drafts.filter(d => d.id !== broadcastPost.id));
        }

        setPublishedPosts([newPost, ...publishedPosts]);
        setStats({
            ...stats,
            totalPosts: stats.totalPosts + 1,
            todayApprovals: stats.todayApprovals + 1
        });

        alert("Official News Broadcasted Successfully!");
        setBroadcastPost({ id: null, title: '', content: '', category: 'Campus', imageUrl: '' });
        setActiveTab('content');
    };

    const handleSaveDraft = () => {
        if (!broadcastPost.title && !broadcastPost.content) return;

        const newDraft = {
            id: broadcastPost.id || 'd' + Date.now().toString(),
            title: broadcastPost.title || 'Untitled Draft',
            content: broadcastPost.content,
            category: broadcastPost.category,
            created_at: new Date().toISOString(),
            status: 'DRAFT'
        };

        if (broadcastPost.id && broadcastPost.id.startsWith('d')) {
            setDrafts(drafts.map(d => d.id === broadcastPost.id ? newDraft : d));
        } else {
            setDrafts([newDraft, ...drafts]);
        }

        alert("Draft Saved Successfully!");
        setBroadcastPost({ id: null, title: '', content: '', category: 'Campus', imageUrl: '' });
        setActiveTab('drafts');
    };

    const handleEditDraft = (draft) => {
        setBroadcastPost({
            id: draft.id,
            title: draft.title,
            content: draft.content,
            category: draft.category,
            imageUrl: draft.imageUrl || ''
        });
        setActiveTab('broadcast');
    };

    const handleDeleteDraft = (id) => {
        if (confirm("Are you sure you want to delete this draft?")) {
            setDrafts(drafts.filter(d => d.id !== id));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50 dark:bg-gray-900/50 transition-colors duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Megaphone className="text-primary h-8 w-8" />
                        News Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Control campus information flow and broadcast official news.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="rounded-xl border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        onClick={() => window.location.href = '/newsbox'}
                    >
                        <Eye size={16} className="mr-2" />
                        View Live Feed
                    </Button>
                    <Button
                        className="rounded-xl bg-primary shadow-lg shadow-primary/20"
                        onClick={() => setActiveTab('broadcast')}
                    >
                        <Plus size={16} className="mr-2" />
                        Quick Broadcast
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Posts', value: stats.totalPosts, icon: Newspaper, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pending Review', value: pendingPosts.length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Approved Today', value: stats.todayApprovals, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Engagements', value: stats.totalInteractions, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors">
                        <div className={cn("p-3 rounded-2xl", stat.bg, "dark:bg-opacity-20")}>
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs & Content */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden transition-colors">
                <div className="border-b border-gray-100 dark:border-gray-700 px-8 flex overflow-x-auto no-scrollbar">
                    {[
                        { id: 'moderation', label: 'Moderation Queue', icon: AlertCircle },
                        { id: 'broadcast', label: 'Broadcast Center', icon: Send },
                        { id: 'drafts', label: 'Saved Drafts', icon: Save },
                        { id: 'content', label: 'All Content', icon: Newspaper },
                        { id: 'categories', label: 'Categories', icon: Filter },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-5 text-sm font-bold transition-all border-b-2 relative whitespace-nowrap",
                                activeTab === tab.id
                                    ? "text-primary border-primary"
                                    : "text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-300"
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                            {tab.id === 'moderation' && pendingPosts.length > 0 && (
                                <span className="absolute top-4 right-2 h-4 min-w-[16px] px-1 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-black">
                                    {pendingPosts.length}
                                </span>
                            )}
                            {tab.id === 'drafts' && drafts.length > 0 && (
                                <span className="absolute top-4 right-2 h-4 min-w-[16px] px-1 bg-primary text-white text-[10px] flex items-center justify-center rounded-full font-black">
                                    {drafts.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    {activeTab === 'moderation' && (
                        <div className="space-y-6">
                            {pendingPosts.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 dark:bg-gray-700/30 rounded-[2rem]">
                                    <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4 opacity-20" />
                                    <p className="text-gray-400 font-bold">All clear! No pending news posts.</p>
                                </div>
                            ) : (
                                pendingPosts.map(post => (
                                    <div key={post.id} className="group bg-white dark:bg-gray-700/50 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col md:flex-row gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                    {post.author_name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{post.author_name}</p>
                                                    <p className="text-xs text-gray-400 font-medium">{new Date(post.created_at).toLocaleString()}</p>
                                                </div>
                                                <span className="ml-auto px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase rounded-full tracking-widest">
                                                    {post.category}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                                            <div className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-3 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
                                            <Button variant="outline" size="sm" className="rounded-lg h-8 text-[10px] font-black uppercase border-gray-100 dark:border-gray-600 dark:text-gray-400">
                                                Full Review
                                            </Button>
                                        </div>
                                        <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
                                            <Button
                                                onClick={() => handleApprove(post.id)}
                                                className="bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-md shadow-green-200"
                                            >
                                                <Check size={18} className="mr-2" />
                                                Approve
                                            </Button>
                                            <Button
                                                onClick={() => handleReject(post.id)}
                                                variant="outline"
                                                className="border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl"
                                            >
                                                <XCircle size={18} className="mr-2" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'broadcast' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-[2rem] border border-primary/10 mb-8 flex items-start gap-4">
                                <AlertCircle className="text-primary mt-1 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-primary italic">Broadcasting as Verified</p>
                                    <p className="text-xs text-primary/70 font-medium leading-relaxed mt-1">
                                        News broadcasted here will appear with a "Verified" badge and can optionally be pinned to the top of everyone's feed.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleBroadcast} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-1">News Title</label>
                                    <input
                                        type="text"
                                        placeholder="Headline for your official announcement..."
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-gray-900 dark:text-white"
                                        value={broadcastPost.title}
                                        onChange={(e) => setBroadcastPost({ ...broadcastPost, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase ml-1">Category</label>
                                        <select
                                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-gray-900 dark:text-white appearance-none"
                                            value={broadcastPost.category}
                                            onChange={(e) => setBroadcastPost({ ...broadcastPost, category: e.target.value })}
                                        >
                                            <option>Campus</option>
                                            <option>Emergency</option>
                                            <option>Academics</option>
                                            <option>Event</option>
                                            <option>Tech</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase ml-1">Image URL (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="https://..."
                                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-gray-900 dark:text-white"
                                            value={broadcastPost.imageUrl}
                                            onChange={(e) => setBroadcastPost({ ...broadcastPost, imageUrl: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase ml-1">Content</label>
                                    <RichTextEditor
                                        value={broadcastPost.content}
                                        onChange={(val) => setBroadcastPost({ ...broadcastPost, content: val })}
                                        placeholder="Detailed announcement content with formatting..."
                                        className="text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        onClick={handleSaveDraft}
                                        variant="outline"
                                        className="flex-1 h-[60px] rounded-2xl border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-black flex items-center justify-center gap-3"
                                    >
                                        <Save size={20} />
                                        Save as Draft
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-[2] h-[60px] rounded-2xl bg-primary text-lg font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                                    >
                                        <Megaphone size={20} />
                                        Broadcast Verified News
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'drafts' && (
                        <div className="space-y-6">
                            {drafts.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 dark:bg-gray-700/30 rounded-[2rem]">
                                    <FileText size={48} className="text-gray-300 mx-auto mb-4 opacity-20" />
                                    <p className="text-gray-400 font-bold">No saved drafts.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {drafts.map(draft => (
                                        <div key={draft.id} className="bg-white dark:bg-gray-700/50 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full tracking-widest">
                                                        {draft.category}
                                                    </span>
                                                    <p className="text-[10px] text-gray-400 font-bold">Updated {new Date(draft.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">{draft.title}</h3>
                                                <div className="text-gray-500 dark:text-gray-300 text-sm line-clamp-2 prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: draft.content }} />
                                            </div>
                                            <div className="flex gap-2 mt-6 pt-6 border-t border-gray-50 dark:border-gray-600">
                                                <Button
                                                    onClick={() => handleEditDraft(draft)}
                                                    className="flex-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl"
                                                >
                                                    <Edit3 size={16} className="mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteDraft(draft.id)}
                                                    variant="outline"
                                                    className="border-red-50 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl w-12 p-0"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div className="space-y-6">
                            {publishedPosts.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 dark:bg-gray-700/30 rounded-[2rem]">
                                    <Clock size={48} className="text-gray-300 mx-auto mb-4 opacity-20" />
                                    <p className="text-gray-400 font-bold">No published news yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {publishedPosts.map(post => (
                                        <div key={post.id} className="bg-white dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center justify-between hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "h-12 w-12 rounded-xl flex items-center justify-center text-white",
                                                    post.is_official ? "bg-primary shadow-lg shadow-primary/20" : "bg-gray-200 dark:bg-gray-600"
                                                )}>
                                                    {post.is_official ? <Megaphone size={20} /> : <Newspaper size={20} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        {post.title}
                                                        {post.is_pinned && <Pin size={12} className="text-primary fill-primary" />}
                                                    </h4>
                                                    <p className="text-xs text-gray-400 font-medium">
                                                        {post.category} • {new Date(post.created_at).toLocaleDateString()} • {post.upboard_count || 0} Upboards
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" className="rounded-lg h-9 w-9 p-0 border-gray-100 dark:border-gray-600 text-gray-400 hover:text-primary">
                                                    <Eye size={16} />
                                                </Button>
                                                <Button variant="outline" size="sm" className="rounded-lg h-9 w-9 p-0 border-gray-100 dark:border-gray-600 text-gray-400 hover:text-red-500">
                                                    <XCircle size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'categories' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['Campus', 'Emergency', 'Academics', 'Event', 'Tech', 'Lifestyle'].map(cat => (
                                <div key={cat} className="bg-white dark:bg-gray-700/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-primary/30 transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="h-12 w-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                            <Filter size={24} />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-300 dark:text-gray-500 uppercase">Manage</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{cat}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        {publishedPosts.filter(p => p.category === cat).length} Published Posts
                                    </p>
                                    <div className="mt-6 flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1 rounded-xl text-[10px] font-black uppercase">
                                            Explore
                                        </Button>
                                        <Button variant="outline" size="sm" className="rounded-xl w-10 p-0">
                                            <Settings size={14} className="text-gray-400" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <button className="border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary/30 transition-all text-gray-400 hover:text-primary group">
                                <div className="h-12 w-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary/5 transition-all">
                                    <Plus size={24} />
                                </div>
                                <span className="font-bold text-sm">Add New Category</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsManagement;
