import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    AlertCircle, MapPin, Clock, ThumbsUp, ThumbsDown, Filter, Search,
    Loader2, AlertTriangle, CheckCircle2, XCircle, RefreshCw,
    ChevronUp, ChevronDown, User, Tag
} from 'lucide-react';
import { Card, CardContent } from '../../components/Cards/Card';
import Button from '../../components/Button';
import issueService from '../../services/issueService';
import { useAuth } from '../../context/AuthContext';

const IssueFeed = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [votingId, setVotingId] = useState(null);
    
    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const categories = ['Maintenance', 'IT/Network', 'Cleaning', 'Safety', 'Other'];
    const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'RESOLVED'];

    const fetchIssues = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (categoryFilter) params.category = categoryFilter;
            
            const response = await issueService.getIssues(params);
            if (response.success) {
                setIssues(response.data || []);
            } else {
                setError(response.message || 'Failed to load issues');
            }
        } catch (err) {
            console.error('Error fetching issues:', err);
            setError('Failed to load issues. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, categoryFilter]);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    const handleVote = async (e, issueId, voteType) => {
        e.stopPropagation(); // Prevent navigation to details
        if (!user) {
            navigate('/login');
            return;
        }
        
        try {
            setVotingId(`${issueId}-${voteType}`);
            const response = await issueService.voteIssue(issueId, voteType);
            if (response.success) {
                // Update the issue in the list with new upvotes/downvotes
                setIssues(prev => prev.map(issue => 
                    issue.id === issueId 
                        ? { 
                            ...issue, 
                            upvotes: response.data.upvotes,
                            downvotes: response.data.downvotes,
                            user_vote: issue.user_vote === voteType ? null : voteType
                        }
                        : issue
                ));
            }
        } catch (err) {
            console.error('Error voting:', err);
            // Show error toast or message
        } finally {
            setVotingId(null);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'PENDING':
                return { 
                    color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
                    icon: Clock,
                    label: 'Pending Review'
                };
            case 'APPROVED':
                return { 
                    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
                    icon: CheckCircle2,
                    label: 'Approved'
                };
            case 'REJECTED':
                return { 
                    color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
                    icon: XCircle,
                    label: 'Rejected'
                };
            case 'RESOLVED':
                return { 
                    color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
                    icon: CheckCircle2,
                    label: 'Resolved'
                };
            default:
                return { 
                    color: 'text-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400',
                    icon: AlertCircle,
                    label: status
                };
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Urgent': return 'text-red-600';
            case 'High': return 'text-orange-600';
            case 'Normal': return 'text-blue-600';
            case 'Low': return 'text-gray-500';
            default: return 'text-gray-500';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    // Filter issues by search query
    const filteredIssues = issues.filter(issue => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            issue.title.toLowerCase().includes(query) ||
            issue.description.toLowerCase().includes(query) ||
            issue.location.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading issues...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                            <AlertTriangle size={28} />
                        </div>
                        Campus Issues
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                        Report and track campus maintenance issues. Vote to help prioritize.
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/issues/new')}
                    className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30"
                >
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Report Issue
                </Button>
            </div>

            {/* Search & Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search issues..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-primary focus:outline-none transition-all font-medium text-gray-900 dark:text-white"
                        />
                    </div>
                    
                    {/* Filter Toggle */}
                    <Button 
                        variant="outline" 
                        onClick={() => setShowFilters(!showFilters)}
                        className="rounded-xl"
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                        {(statusFilter || categoryFilter) && (
                            <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                                {[statusFilter, categoryFilter].filter(Boolean).length}
                            </span>
                        )}
                    </Button>
                    
                    {/* Refresh */}
                    <Button 
                        variant="ghost" 
                        onClick={fetchIssues}
                        className="rounded-xl"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:outline-none font-medium text-gray-900 dark:text-white"
                            >
                                <option value="">All Statuses</option>
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:outline-none font-medium text-gray-900 dark:text-white"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="font-medium">{error}</p>
                    <Button variant="ghost" size="sm" onClick={fetchIssues} className="ml-auto">
                        Retry
                    </Button>
                </div>
            )}

            {/* Issues List */}
            {filteredIssues.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <AlertCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Issues Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {searchQuery || statusFilter || categoryFilter 
                            ? 'Try adjusting your filters or search query.'
                            : 'Be the first to report a campus issue!'}
                    </p>
                    <Button onClick={() => navigate('/issues/new')}>
                        Report an Issue
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredIssues.map((issue) => {
                        const statusConfig = getStatusConfig(issue.status);
                        const StatusIcon = statusConfig.icon;
                        const canVote = issue.status === 'APPROVED' && user;
                        const netVotes = (issue.upvotes || 0) - (issue.downvotes || 0);
                        
                        return (
                            <Card 
                                key={issue.id} 
                                className="border-gray-100 dark:border-gray-700 dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer group"
                                onClick={() => navigate(`/issues/${issue.id}`)}
                            >
                                <CardContent className="p-0">
                                    <div className="flex">
                                        {/* Vote Section */}
                                        <div className={`flex flex-col items-center justify-center px-3 py-4 border-r border-gray-100 dark:border-gray-700 ${canVote ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                            {/* Upvote Button */}
                                            <button
                                                onClick={(e) => canVote && handleVote(e, issue.id, 'UP')}
                                                disabled={!canVote || votingId === `${issue.id}-UP`}
                                                className={`p-1.5 rounded-lg transition-all ${
                                                    canVote 
                                                        ? issue.user_vote === 'UP'
                                                            ? 'bg-green-500 text-white'
                                                            : 'hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-400 hover:text-green-500'
                                                        : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                }`}
                                                title={
                                                    !user ? 'Login to vote' :
                                                    issue.status !== 'APPROVED' ? 'Voting closed' :
                                                    issue.user_vote === 'UP' ? 'Remove upvote' : 'Upvote'
                                                }
                                            >
                                                {votingId === `${issue.id}-UP` ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <ChevronUp className="h-4 w-4" />
                                                )}
                                            </button>
                                            
                                            {/* Vote Counts */}
                                            <div className="flex flex-col items-center my-1">
                                                <span className="text-xs font-bold text-green-600 dark:text-green-400">
                                                    {issue.upvotes || 0}
                                                </span>
                                                <span className={`text-sm font-black ${netVotes > 0 ? 'text-green-500' : netVotes < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                                    {netVotes > 0 ? '+' : ''}{netVotes}
                                                </span>
                                                <span className="text-xs font-bold text-red-600 dark:text-red-400">
                                                    {issue.downvotes || 0}
                                                </span>
                                            </div>

                                            {/* Downvote Button */}
                                            <button
                                                onClick={(e) => canVote && handleVote(e, issue.id, 'DOWN')}
                                                disabled={!canVote || votingId === `${issue.id}-DOWN`}
                                                className={`p-1.5 rounded-lg transition-all ${
                                                    canVote 
                                                        ? issue.user_vote === 'DOWN'
                                                            ? 'bg-red-500 text-white'
                                                            : 'hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500'
                                                        : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                }`}
                                                title={
                                                    !user ? 'Login to vote' :
                                                    issue.status !== 'APPROVED' ? 'Voting closed' :
                                                    issue.user_vote === 'DOWN' ? 'Remove downvote' : 'Downvote'
                                                }
                                            >
                                                {votingId === `${issue.id}-DOWN` ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                <div className="space-y-3 flex-1">
                                                    {/* Title & Status */}
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                                            {issue.title}
                                                        </h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusConfig.color}`}>
                                                            <StatusIcon className="h-3 w-3" />
                                                            {statusConfig.label}
                                                        </span>
                                                        <span className={`text-xs font-bold ${getPriorityColor(issue.priority)}`}>
                                                            {issue.priority}
                                                        </span>
                                                    </div>

                                                    {/* Description */}
                                                    <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed line-clamp-2">
                                                        {issue.description}
                                                    </p>

                                                    {/* Meta Info */}
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-medium pt-1">
                                                        <span className="flex items-center gap-1.5">
                                                            <MapPin className="h-4 w-4" />
                                                            {issue.location}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Tag className="h-4 w-4" />
                                                            {issue.category}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="h-4 w-4" />
                                                            {formatDate(issue.created_at)}
                                                        </span>
                                                        {issue.reporter_name && (
                                                            <span className="flex items-center gap-1.5">
                                                                <User className="h-4 w-4" />
                                                                {issue.reporter_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Image Preview */}
                                                {issue.image_url && (
                                                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                                                        <img 
                                                            src={issue.image_url} 
                                                            alt="Issue" 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Click to view hint */}
                                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Click to view details →
                                                </span>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <ThumbsUp className="h-3 w-3 text-green-500" />
                                                    <span>{issue.upvotes || 0}</span>
                                                    <ThumbsDown className="h-3 w-3 text-red-500" />
                                                    <span>{issue.downvotes || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Stats Footer */}
            <div className="text-center text-sm text-gray-400 py-4">
                Showing {filteredIssues.length} of {issues.length} issues
            </div>
        </div>
    );
};

export default IssueFeed;
