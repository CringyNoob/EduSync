import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    AlertTriangle, MapPin, Clock, ThumbsUp, ThumbsDown, ChevronUp, ChevronDown,
    Loader2, CheckCircle2, XCircle, ArrowLeft, User, Tag, Calendar,
    MessageSquare, Shield, Image as ImageIcon, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Cards/Card';
import Button from '../../components/Button';
import issueService from '../../services/issueService';
import { useAuth } from '../../context/AuthContext';

const IssueDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [voting, setVoting] = useState(null); // 'UP' or 'DOWN' when voting
    const [actionLoading, setActionLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [showAdminNotesInput, setShowAdminNotesInput] = useState(false);
    
    const isAdmin = user?.roles?.includes('ADMIN') && user?.activeRole === 'ADMIN';

    const fetchIssue = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await issueService.getIssueById(id);
            if (response.success) {
                setIssue(response.data);
            } else {
                setError(response.message || 'Failed to load issue');
            }
        } catch (err) {
            console.error('Error fetching issue:', err);
            setError(err.response?.data?.message || 'Failed to load issue. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchIssue();
    }, [fetchIssue]);

    const handleVote = async (voteType) => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        if (issue?.status !== 'APPROVED') {
            return;
        }
        
        try {
            setVoting(voteType);
            const response = await issueService.voteIssue(id, voteType);
            if (response.success) {
                setIssue(prev => ({
                    ...prev,
                    upvotes: response.data.upvotes,
                    downvotes: response.data.downvotes,
                    user_vote: prev.user_vote === voteType ? null : voteType
                }));
            }
        } catch (err) {
            console.error('Error voting:', err);
        } finally {
            setVoting(null);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            setActionLoading(true);
            const response = await issueService.updateIssueStatus(id, newStatus, adminNotes || undefined);
            if (response.success) {
                setIssue(prev => ({
                    ...prev,
                    status: newStatus,
                    admin_notes: adminNotes || prev.admin_notes
                }));
                setShowAdminNotesInput(false);
                setAdminNotes('');
            }
        } catch (err) {
            console.error('Error updating status:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'PENDING':
                return {
                    color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
                    icon: Clock,
                    label: 'Pending Review'
                };
            case 'APPROVED':
                return {
                    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                    icon: CheckCircle2,
                    label: 'Approved'
                };
            case 'REJECTED':
                return {
                    color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
                    icon: XCircle,
                    label: 'Rejected'
                };
            case 'RESOLVED':
                return {
                    color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
                    icon: CheckCircle2,
                    label: 'Resolved'
                };
            default:
                return {
                    color: 'text-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400 border-gray-200 dark:border-gray-700',
                    icon: AlertCircle,
                    label: status
                };
        }
    };

    const getPriorityConfig = (priority) => {
        switch (priority) {
            case 'Urgent':
                return { color: 'text-red-600 bg-red-50 dark:bg-red-900/20', label: 'Urgent' };
            case 'High':
                return { color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20', label: 'High' };
            case 'Normal':
                return { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', label: 'Normal' };
            case 'Low':
                return { color: 'text-gray-500 bg-gray-50 dark:bg-gray-700/50', label: 'Low' };
            default:
                return { color: 'text-gray-500 bg-gray-50 dark:bg-gray-700/50', label: priority };
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading issue details...</p>
            </div>
        );
    }

    if (error || !issue) {
        return (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 mx-4">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {error || 'Issue not found'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                    The issue you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={() => navigate('/issues')} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Issues
                </Button>
            </div>
        );
    }

    const statusConfig = getStatusConfig(issue.status);
    const StatusIcon = statusConfig.icon;
    const priorityConfig = getPriorityConfig(issue.priority);
    const canVote = issue.status === 'APPROVED' && user;
    const netVotes = (issue.upvotes || 0) - (issue.downvotes || 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Back Button */}
            <Link
                to="/issues"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Issues
            </Link>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                        <div className={`h-2 ${
                            issue.priority === 'Urgent' ? 'bg-red-500' :
                            issue.priority === 'High' ? 'bg-orange-500' :
                            issue.priority === 'Normal' ? 'bg-blue-500' : 'bg-gray-400'
                        }`} />
                        <CardContent className="p-6">
                            {/* Title & Status */}
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white flex-1">
                                    {issue.title}
                                </h1>
                                <span className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border ${statusConfig.color}`}>
                                    <StatusIcon className="h-4 w-4" />
                                    {statusConfig.label}
                                </span>
                            </div>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                <span className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {issue.location}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Tag className="h-4 w-4" />
                                    {issue.category}
                                </span>
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${priorityConfig.color}`}>
                                    {priorityConfig.label} Priority
                                </span>
                            </div>

                            {/* Description */}
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {issue.description}
                                </p>
                            </div>

                            {/* Image */}
                            {issue.image_url && (
                                <div className="mt-6">
                                    <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                                        <img
                                            src={issue.image_url}
                                            alt="Issue"
                                            className="w-full h-auto max-h-96 object-contain"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Reporter & Date */}
                            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {issue.reporter_name || 'Anonymous'}
                                        </p>
                                        <p className="text-sm text-gray-400">Reporter</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(issue.created_at)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin Notes (if any) */}
                    {issue.admin_notes && (
                        <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="h-5 w-5 text-purple-500" />
                                    <h3 className="font-bold text-gray-900 dark:text-white">Admin Notes</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                                    {issue.admin_notes}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Admin Actions */}
                    {isAdmin && (
                        <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                                    <Shield className="h-5 w-5" />
                                    Admin Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Admin Notes Input */}
                                {showAdminNotesInput && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                            Admin Notes (optional)
                                        </label>
                                        <textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Add notes about this action..."
                                            className="w-full p-3 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
                                            rows={3}
                                        />
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    {issue.status === 'PENDING' && (
                                        <>
                                            <Button
                                                onClick={() => {
                                                    if (!showAdminNotesInput) {
                                                        setShowAdminNotesInput(true);
                                                    } else {
                                                        handleStatusUpdate('APPROVED');
                                                    }
                                                }}
                                                disabled={actionLoading}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                {actionLoading ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                )}
                                                Approve Issue
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    if (!showAdminNotesInput) {
                                                        setShowAdminNotesInput(true);
                                                    } else {
                                                        handleStatusUpdate('REJECTED');
                                                    }
                                                }}
                                                disabled={actionLoading}
                                                variant="destructive"
                                            >
                                                {actionLoading ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                )}
                                                Reject Issue
                                            </Button>
                                        </>
                                    )}
                                    {issue.status === 'APPROVED' && (
                                        <Button
                                            onClick={() => {
                                                if (!showAdminNotesInput) {
                                                    setShowAdminNotesInput(true);
                                                } else {
                                                    handleStatusUpdate('RESOLVED');
                                                }
                                            }}
                                            disabled={actionLoading}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {actionLoading ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                            )}
                                            Mark as Resolved
                                        </Button>
                                    )}
                                    {showAdminNotesInput && (
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setShowAdminNotesInput(false);
                                                setAdminNotes('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Voting Card */}
                    <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800 sticky top-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Community Votes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Net Votes Display */}
                            <div className="text-center">
                                <div className={`text-5xl font-black ${netVotes > 0 ? 'text-green-500' : netVotes < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {netVotes > 0 ? '+' : ''}{netVotes}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Net Score</p>
                            </div>

                            {/* Vote Breakdown */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                                    <ThumbsUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {issue.upvotes || 0}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Upvotes</p>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                                    <ThumbsDown className="h-6 w-6 text-red-500 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {issue.downvotes || 0}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Downvotes</p>
                                </div>
                            </div>

                            {/* Voting Buttons */}
                            {canVote ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleVote('UP')}
                                        disabled={voting !== null}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                                            issue.user_vote === 'UP'
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600'
                                        }`}
                                    >
                                        {voting === 'UP' ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <ChevronUp className="h-5 w-5" />
                                                Upvote
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleVote('DOWN')}
                                        disabled={voting !== null}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                                            issue.user_vote === 'DOWN'
                                                ? 'bg-red-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600'
                                        }`}
                                    >
                                        {voting === 'DOWN' ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <ChevronDown className="h-5 w-5" />
                                                Downvote
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {!user ? (
                                            <>
                                                <Link to="/login" className="text-primary hover:underline font-bold">
                                                    Sign in
                                                </Link>
                                                {' '}to vote on this issue
                                            </>
                                        ) : issue.status !== 'APPROVED' ? (
                                            <>Voting is {issue.status === 'PENDING' ? 'not yet available' : 'closed'} for this issue</>
                                        ) : null}
                                    </p>
                                </div>
                            )}

                            {issue.user_vote && (
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                    You {issue.user_vote === 'UP' ? 'upvoted' : 'downvoted'} this issue. Click again to remove your vote.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Status Info Card */}
                    <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Status Info</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Status</span>
                                    <span className={`font-bold ${
                                        issue.status === 'APPROVED' ? 'text-blue-500' :
                                        issue.status === 'RESOLVED' ? 'text-green-500' :
                                        issue.status === 'REJECTED' ? 'text-red-500' : 'text-yellow-500'
                                    }`}>
                                        {issue.status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Priority</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{issue.priority}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Category</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{issue.category}</span>
                                </div>
                                {issue.updated_at && issue.updated_at !== issue.created_at && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {new Date(issue.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default IssueDetails;
