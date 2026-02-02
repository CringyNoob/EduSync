import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle, CheckCircle, XCircle, Loader2, RefreshCw,
    Search, Filter, Calendar, MapPin, User, Eye, MessageSquare,
    TrendingUp, Shield, ChevronLeft, ChevronRight, Trash2, Edit3, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Cards/Card';
import Button from '../../components/Button';
import issueService from '../../services/issueService';
import { useAuth } from '../../context/AuthContext';

const AdminIssues = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [issues, setIssues] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [processingIssueId, setProcessingIssueId] = useState(null);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); // Empty string = All statuses
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 15;
    
    // Stats
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        resolved: 0,
        totalVotes: 0
    });
    
    // Selected issue for detail view
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    
    // Delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [issueToDelete, setIssueToDelete] = useState(null);
    
    // Status change
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    // Check if user is admin
    const isAdmin = (user?.roles?.includes('ADMIN') && user?.activeRole === 'ADMIN') || 
                    user?.role === 'ADMIN' || 
                    user?.role === 'Admin';

    const fetchIssues = useCallback(async () => {
        if (!isAdmin) return;
        
        try {
            setLoading(true);
            setError('');
            
            const params = {
                page: currentPage,
                limit: itemsPerPage
            };
            if (statusFilter) params.status = statusFilter;
            if (categoryFilter) params.category = categoryFilter;
            if (searchQuery) params.search = searchQuery;
            
            const response = await issueService.getIssues(params);
            
            if (response.success) {
                setIssues(response.data || []);
                setFilteredIssues(response.data || []);
                setTotalPages(Math.ceil((response.total || response.data?.length || 0) / itemsPerPage));
            } else {
                setError(response.message || 'Failed to load issues');
            }
        } catch (err) {
            console.error('Error fetching issues:', err);
            setError(err.response?.data?.message || 'Failed to load issues');
        } finally {
            setLoading(false);
        }
    }, [isAdmin, currentPage, statusFilter, categoryFilter, searchQuery]);

    const fetchStats = useCallback(async () => {
        if (!isAdmin) return;
        
        try {
            const response = await issueService.getAdminStats();
            if (response.success && response.data) {
                setStats({
                    total: response.data.issues?.total || 0,
                    pending: response.data.issues?.pending || 0,
                    approved: response.data.issues?.approved || 0,
                    rejected: response.data.issues?.rejected || 0,
                    resolved: response.data.issues?.resolved || 0,
                    totalVotes: response.data.votes?.total || 0
                });
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchIssues();
        fetchStats();
    }, [fetchIssues, fetchStats]);

    // Calculate stats from issues if backend stats are not available
    useEffect(() => {
        if (issues.length > 0 && stats.total === 0) {
            const total = issues.length;
            const pending = issues.filter(i => i.status === 'PENDING').length;
            const approved = issues.filter(i => i.status === 'APPROVED').length;
            const rejected = issues.filter(i => i.status === 'REJECTED').length;
            const resolved = issues.filter(i => i.status === 'RESOLVED').length;
            const totalVotes = issues.reduce((sum, i) => sum + (i.votes_count || 0), 0);
            
            setStats({
                total,
                pending,
                approved,
                rejected,
                resolved,
                totalVotes
            });
        }
    }, [issues, stats.total]);

    // Local search filter
    useEffect(() => {
        if (!searchQuery) {
            setFilteredIssues(issues);
            return;
        }
        
        const query = searchQuery.toLowerCase();
        const filtered = issues.filter(issue => 
            issue.title?.toLowerCase().includes(query) ||
            issue.description?.toLowerCase().includes(query) ||
            issue.location?.toLowerCase().includes(query) ||
            issue.reporter_name?.toLowerCase().includes(query)
        );
        setFilteredIssues(filtered);
    }, [searchQuery, issues]);

    const handleIssueAction = async (issueId, action) => {
        try {
            setProcessingIssueId(issueId);
            setError('');
            setSuccess('');
            
            const newStatus = action === 'approve' ? 'APPROVED' : 
                            action === 'reject' ? 'REJECTED' :
                            action === 'resolve' ? 'RESOLVED' : null;
            
            if (!newStatus) return;
            
            const response = await issueService.updateIssueStatus(issueId, newStatus);
            
            if (response.success) {
                setSuccess(`Issue ${newStatus.toLowerCase()} successfully!`);
                // Update local state
                setIssues(prev => prev.map(issue => 
                    issue.id === issueId ? { ...issue, status: newStatus } : issue
                ));
                // Refresh data
                fetchIssues();
                fetchStats();
                setShowDetailModal(false);
            }
        } catch (err) {
            console.error('Error updating issue:', err);
            setError(err.response?.data?.message || 'Failed to update issue status');
        } finally {
            setProcessingIssueId(null);
        }
    };

    const handleDeleteIssue = async () => {
        if (!issueToDelete) return;
        
        try {
            setProcessingIssueId(issueToDelete.id);
            setError('');
            setSuccess('');
            
            const response = await issueService.deleteIssue(issueToDelete.id);
            
            if (response.success) {
                setSuccess('Issue deleted successfully!');
                // Remove from local state
                setIssues(prev => prev.filter(issue => issue.id !== issueToDelete.id));
                setShowDeleteModal(false);
                setIssueToDelete(null);
                // Refresh stats
                fetchStats();
            }
        } catch (err) {
            console.error('Error deleting issue:', err);
            setError(err.response?.data?.message || 'Failed to delete issue');
        } finally {
            setProcessingIssueId(null);
        }
    };

    const handleStatusChange = async () => {
        if (!selectedIssue || !newStatus) return;
        
        try {
            setProcessingIssueId(selectedIssue.id);
            setError('');
            setSuccess('');
            
            const response = await issueService.updateIssueStatus(selectedIssue.id, newStatus);
            
            if (response.success) {
                setSuccess(`Issue status changed to ${newStatus}!`);
                // Update local state
                setIssues(prev => prev.map(issue => 
                    issue.id === selectedIssue.id ? { ...issue, status: newStatus } : issue
                ));
                setSelectedIssue(prev => ({ ...prev, status: newStatus }));
                setShowStatusModal(false);
                setNewStatus('');
                // Refresh data
                fetchIssues();
                fetchStats();
            }
        } catch (err) {
            console.error('Error changing status:', err);
            setError(err.response?.data?.message || 'Failed to change status');
        } finally {
            setProcessingIssueId(null);
        }
    };

    const openDetailModal = (issue) => {
        setSelectedIssue(issue);
        setShowDetailModal(true);
    };

    const openDeleteModal = (issue) => {
        setIssueToDelete(issue);
        setShowDeleteModal(true);
    };

    const openStatusChangeModal = (issue) => {
        setSelectedIssue(issue);
        setNewStatus(issue.status);
        setShowStatusModal(true);
    };

    const getStatusBadge = (status) => {
        const config = {
            PENDING: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: AlertTriangle },
            APPROVED: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle },
            REJECTED: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
            RESOLVED: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle }
        };
        
        const { color, icon: Icon } = config[status] || config.PENDING;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
                <Icon size={10} />
                {status}
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

    if (loading && issues.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans text-gray-900 dark:text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
                            <AlertTriangle size={24} className="text-yellow-600" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Issue Management</h1>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-11">
                        Review, approve, and manage campus issues
                    </p>
                </div>
                <Button variant="outline" onClick={() => { fetchIssues(); fetchStats(); }} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <p className="font-medium">{success}</p>
                </div>
            )}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-4">
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</p>
                        <p className="text-xs text-gray-500">Total Issues</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-4">
                        <p className="text-2xl font-black text-yellow-600">{stats.pending}</p>
                        <p className="text-xs text-gray-500">Pending</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-4">
                        <p className="text-2xl font-black text-blue-600">{stats.approved}</p>
                        <p className="text-xs text-gray-500">Approved</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-4">
                        <p className="text-2xl font-black text-red-600">{stats.rejected}</p>
                        <p className="text-xs text-gray-500">Rejected</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-4">
                        <p className="text-2xl font-black text-green-600">{stats.resolved}</p>
                        <p className="text-xs text-gray-500">Resolved</p>
                    </CardContent>
                </Card>
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-4">
                        <p className="text-2xl font-black text-purple-600">{stats.totalVotes}</p>
                        <p className="text-xs text-gray-500">Total Votes</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search by title, location, reporter..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:outline-none font-medium"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:outline-none font-medium"
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="RESOLVED">Resolved</option>
                        </select>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:outline-none font-medium"
                        >
                            <option value="">All Categories</option>
                            <option value="Infrastructure">Infrastructure</option>
                            <option value="Safety">Safety</option>
                            <option value="Cleanliness">Cleanliness</option>
                            <option value="Facilities">Facilities</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Issues List */}
            <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                <CardHeader>
                    <CardTitle>
                        Issues ({filteredIssues.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredIssues.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertTriangle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No issues found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredIssues.map((issue) => (
                                <div
                                    key={issue.id}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-600 cursor-pointer"
                                    onClick={() => openDetailModal(issue)}
                                >
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                                        issue.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600' :
                                        issue.status === 'APPROVED' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' :
                                        issue.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-900/20 text-red-600' :
                                        'bg-green-100 dark:bg-green-900/20 text-green-600'
                                    }`}>
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{issue.title}</h4>
                                            {getStatusBadge(issue.status)}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin size={12} />
                                                {issue.location}
                                            </span>
                                            {' • '}
                                            <span className="inline-flex items-center gap-1">
                                                <User size={12} />
                                                {issue.reporter_name || 'Anonymous'}
                                            </span>
                                            {' • '}
                                            {issue.category}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <TrendingUp size={14} className="text-blue-400" />
                                            {issue.votes_count || 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageSquare size={14} className="text-green-400" />
                                            {issue.comments_count || 0}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {issue.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleIssueAction(issue.id, 'approve');
                                                    }}
                                                    disabled={processingIssueId === issue.id}
                                                    className="p-2 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors text-green-600 dark:text-green-400 disabled:opacity-50"
                                                    title="Approve"
                                                >
                                                    {processingIssueId === issue.id ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <CheckCircle size={18} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleIssueAction(issue.id, 'reject');
                                                    }}
                                                    disabled={processingIssueId === issue.id}
                                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400 disabled:opacity-50"
                                                    title="Reject"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDeleteModal(issue);
                                            }}
                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
                                            title="Delete Issue"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail Modal */}
            {showDetailModal && selectedIssue && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 dark:bg-gray-800">
                        <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="mb-2">{selectedIssue.title}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(selectedIssue.status)}
                                        <span className="text-xs text-gray-500">{selectedIssue.category}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <h4 className="font-bold text-sm text-gray-500 mb-2">Description</h4>
                                <p className="text-gray-700 dark:text-gray-300">{selectedIssue.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-bold text-sm text-gray-500 mb-1">Location</h4>
                                    <p className="text-gray-900 dark:text-white">{selectedIssue.location}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-500 mb-1">Reporter</h4>
                                    {selectedIssue.reporter_id ? (
                                        <button
                                            onClick={() => {
                                                setShowDetailModal(false);
                                                navigate(`/profile/${selectedIssue.reporter_id}`);
                                            }}
                                            className="text-primary hover:text-primary/80 font-bold flex items-center gap-1 transition-colors"
                                        >
                                            {selectedIssue.reporter_name || 'View Profile'}
                                            <ExternalLink size={14} />
                                        </button>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 italic">Anonymous</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-bold text-sm text-gray-500 mb-1">Votes</h4>
                                    <p className="text-gray-900 dark:text-white">{selectedIssue.votes_count || 0}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-500 mb-1">Comments</h4>
                                    <p className="text-gray-900 dark:text-white">{selectedIssue.comments_count || 0}</p>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-bold text-sm text-gray-500 mb-1">Created</h4>
                                <p className="text-gray-900 dark:text-white">{formatDate(selectedIssue.created_at)}</p>
                            </div>
                            
                            {selectedIssue.image_url && (
                                <div>
                                    <h4 className="font-bold text-sm text-gray-500 mb-2">Image</h4>
                                    <img 
                                        src={selectedIssue.image_url} 
                                        alt="Issue" 
                                        className="w-full rounded-xl object-cover max-h-96"
                                    />
                                </div>
                            )}
                            
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                                {selectedIssue.status === 'PENDING' && (
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => handleIssueAction(selectedIssue.id, 'approve')}
                                            disabled={processingIssueId === selectedIssue.id}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                            {processingIssueId === selectedIssue.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                            )}
                                            Approve
                                        </Button>
                                        <Button
                                            onClick={() => handleIssueAction(selectedIssue.id, 'reject')}
                                            disabled={processingIssueId === selectedIssue.id}
                                            variant="outline"
                                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                        </Button>
                                    </div>
                                )}
                                
                                {selectedIssue.status === 'APPROVED' && (
                                    <Button
                                        onClick={() => handleIssueAction(selectedIssue.id, 'resolve')}
                                        disabled={processingIssueId === selectedIssue.id}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        {processingIssueId === selectedIssue.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                        )}
                                        Mark as Resolved
                                    </Button>
                                )}
                                
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => {
                                            openStatusChangeModal(selectedIssue);
                                        }}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <Edit3 className="h-4 w-4 mr-2" />
                                        Change Status
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            openDeleteModal(selectedIssue);
                                        }}
                                        variant="outline"
                                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && issueToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full animate-in fade-in zoom-in duration-200 dark:bg-gray-800">
                        <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                                    <Trash2 className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <CardTitle>Delete Issue</CardTitle>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This action cannot be undone</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <p className="text-gray-700 dark:text-gray-300">
                                Are you sure you want to delete <strong>"{issueToDelete.title}"</strong>? 
                                This will permanently remove the issue and all associated data.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setIssueToDelete(null);
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDeleteIssue}
                                    disabled={processingIssueId === issueToDelete.id}
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                >
                                    {processingIssueId === issueToDelete.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Trash2 className="h-4 w-4 mr-2" />
                                    )}
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Status Change Modal */}
            {showStatusModal && selectedIssue && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full animate-in fade-in zoom-in duration-200 dark:bg-gray-800">
                        <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                                    <Edit3 className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle>Change Issue Status</CardTitle>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedIssue.title}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Select New Status
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:outline-none font-medium"
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="REJECTED">Rejected</option>
                                    <option value="RESOLVED">Resolved</option>
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setNewStatus('');
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleStatusChange}
                                    disabled={processingIssueId === selectedIssue.id || !newStatus || newStatus === selectedIssue.status}
                                    className="flex-1"
                                >
                                    {processingIssueId === selectedIssue.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Update Status
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminIssues;
