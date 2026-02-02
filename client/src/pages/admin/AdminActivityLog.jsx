import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import Button from '../../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Cards/Card';
import {
    Activity, ChevronLeft, Loader2, AlertCircle, User, Clock,
    Filter, Calendar, RefreshCw
} from 'lucide-react';

export default function AdminActivityLog() {
    const { user } = useAuth();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const isAdmin = user?.roles?.includes('ADMIN') && user?.activeRole === 'ADMIN';

    const fetchActivities = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await adminService.getActivityLogs({ 
                page: currentPage, 
                limit: 20 
            });
            
            if (response.success) {
                setActivities(response.data || []);
                setTotalPages(response.pagination?.totalPages || 1);
                setTotalCount(response.pagination?.total || 0);
            }
        } catch (err) {
            console.error('Error fetching activities:', err);
            setError('Failed to load activity logs');
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        if (isAdmin) {
            fetchActivities();
        }
    }, [isAdmin, fetchActivities]);

    const getActivityIcon = (actionType) => {
        if (actionType?.includes('USER')) return '👤';
        if (actionType?.includes('VENDOR')) return '🏪';
        if (actionType?.includes('ISSUE')) return '⚠️';
        if (actionType?.includes('POST')) return '📰';
        if (actionType?.includes('RENTAL')) return '🏠';
        return '📝';
    };

    const getActivityColor = (actionType) => {
        if (actionType?.includes('APPROVED') || actionType?.includes('RESOLVED')) {
            return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
        }
        if (actionType?.includes('REJECTED') || actionType?.includes('BLOCKED') || actionType?.includes('DELETED')) {
            return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
        }
        if (actionType?.includes('PENDING') || actionType?.includes('SUBMITTED')) {
            return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
        }
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
    };

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
                    <p className="text-gray-500 dark:text-gray-400">You need admin privileges to access this page.</p>
                </div>
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
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                            <Activity size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Activity Log</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 ml-16">
                        Complete system activity history • {totalCount} total activities
                    </p>
                </div>
                <Button variant="outline" onClick={fetchActivities} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
            )}

            {/* Activity Log */}
            <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>All Activities</span>
                        <span className="text-sm font-normal text-gray-500">
                            Page {currentPage} of {totalPages}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-12">
                            <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">No activities found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activities.map((activity, idx) => (
                                <div 
                                    key={activity.id || idx}
                                    className={`p-5 rounded-xl border-2 transition-all hover:shadow-md ${getActivityColor(activity.action_type)}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl flex-shrink-0">
                                            {getActivityIcon(activity.action_type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                                    {activity.description}
                                                </h3>
                                                <span className="px-3 py-1 bg-white/50 dark:bg-gray-800/50 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                    {activity.entity_type || 'SYSTEM'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="flex items-center gap-1.5">
                                                    <User size={14} />
                                                    <span className="font-medium">{activity.user_name || 'System'}</span>
                                                    {activity.user_email && (
                                                        <span className="text-xs opacity-75">({activity.user_email})</span>
                                                    )}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={14} />
                                                    {new Date(activity.created_at).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                {activity.action_type && (
                                                    <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">
                                                        {activity.action_type}
                                                    </span>
                                                )}
                                            </div>
                                            {activity.metadata && (
                                                <details className="mt-3">
                                                    <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                                                        View metadata
                                                    </summary>
                                                    <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg text-xs overflow-x-auto">
                                                        {JSON.stringify(activity.metadata, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1 || loading}
                            >
                                Previous
                            </Button>
                            <div className="flex items-center gap-2">
                                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = idx + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = idx + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + idx;
                                    } else {
                                        pageNum = currentPage - 2 + idx;
                                    }
                                    
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentPage(pageNum)}
                                            disabled={loading}
                                            className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                                                pageNum === currentPage
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || loading}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
