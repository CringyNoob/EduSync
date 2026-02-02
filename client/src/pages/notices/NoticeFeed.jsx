import React, { useState, useEffect } from 'react';
import { Bell, Calendar, ExternalLink, RefreshCw, Loader2, AlertCircle, X, FileText, Download, Image as ImageIcon, File, FileSpreadsheet, Archive, Presentation } from 'lucide-react';
import { Card, CardContent } from '../../components/Cards/Card';
import api from '../../utils/api';

const NoticeFeed = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [lastScraped, setLastScraped] = useState(null);
    const [selectedNotice, setSelectedNotice] = useState(null);

    // Fetch notices from API
    const fetchNotices = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/notices');
            
            if (response.data.success) {
                setNotices(response.data.data || []);
                setLastScraped(response.data.lastScraped);
            } else {
                setError('Failed to load notices');
            }
        } catch (err) {
            console.error('Error fetching notices:', err);
            setError(err.response?.data?.message || 'Failed to connect to notices service');
        } finally {
            setLoading(false);
        }
    };

    // Force refresh notices from UIU website
    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            const response = await api.post('/notices/refresh');
            
            if (response.data.success) {
                setNotices(response.data.data || []);
                setLastScraped(new Date().toISOString());
            }
        } catch (err) {
            console.error('Error refreshing notices:', err);
            setError('Failed to refresh notices');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    // Format date for display
    const formatDate = (dateStr) => {
        if (!dateStr) return 'No date';
        return dateStr;
    };

    // Format last scraped time
    const formatLastScraped = (isoString) => {
        if (!isoString) return 'Never';
        const date = new Date(isoString);
        return date.toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-gray-500 dark:text-gray-400">Loading notices from UIU...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                <button 
                    onClick={fetchNotices}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">UIU Notice Board</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Showing {notices.length} notices from the last 3 months
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                        Last updated: {formatLastScraped(lastScraped)}
                    </span>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Notice Grid */}
            {notices.length === 0 ? (
                <div className="text-center py-12">
                    <Bell className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No notices found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {notices.map((notice) => (
                        <div
                            key={notice.id}
                            onClick={() => setSelectedNotice(notice)}
                            className="block group cursor-pointer"
                        >
                            <Card className="transition-all hover:shadow-lg hover:-translate-y-0.5 dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex">
                                        {/* Image Section */}
                                        {notice.image && (
                                            <div className="hidden sm:block w-48 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                                                <img 
                                                    src={notice.image} 
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Content Section */}
                                        <div className="flex-1 p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
                                                        <Bell className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors line-clamp-2">
                                                            {notice.title}
                                                        </h3>
                                                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar className="h-4 w-4" />
                                                                {formatDate(notice.date)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-400 group-hover:text-primary flex-shrink-0 transition-colors px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                                    View Details
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            )}

            {/* Source Attribution */}
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    Notices scraped from{' '}
                    <a 
                        href="https://www.uiu.ac.bd/notice/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                    >
                        uiu.ac.bd/notice
                    </a>
                </p>
            </div>

            {/* Notice Details Modal */}
            {selectedNotice && (
                <div 
                    className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
                    style={{ margin: 0 }}
                    onClick={() => setSelectedNotice(null)}
                >
                    <div 
                        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header - Gradient Banner */}
                        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 pb-8">
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedNotice(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                            >
                                <X className="h-5 w-5 text-white" />
                            </button>
                            
                            {/* Header Content */}
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                                    <Bell className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">UIU Notice</span>
                                    <h2 className="text-xl font-bold text-white mt-1 leading-tight line-clamp-2">
                                        {selectedNotice.title}
                                    </h2>
                                </div>
                            </div>
                            
                            {/* Meta Tags */}
                            <div className="flex flex-wrap items-center gap-3 mt-4">
                                <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(selectedNotice.date)}
                                </span>
                                {selectedNotice.attachments?.length > 0 && (
                                    <span className="flex items-center gap-2 bg-emerald-500/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-semibold animate-pulse">
                                        <Download className="h-4 w-4" />
                                        {selectedNotice.attachments.length} Download{selectedNotice.attachments.length > 1 ? 's' : ''} Available
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] bg-white dark:bg-gray-900">
                            {/* Notice Image */}
                            {selectedNotice.image && (
                                <div className="mb-6 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-inner">
                                    <img 
                                        src={selectedNotice.image} 
                                        alt={selectedNotice.title}
                                        className="w-full h-auto max-h-64 object-contain"
                                        onError={(e) => {
                                            e.target.parentElement.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Notice Content */}
                            {selectedNotice.content ? (
                                <div 
                                    className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed
                                        [&>p]:mb-4 
                                        [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4
                                        [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4
                                        [&>li]:mb-2
                                        [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mt-6 [&>h1]:mb-4
                                        [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-5 [&>h2]:mb-3
                                        [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mt-4 [&>h3]:mb-2
                                        [&>a]:text-blue-600 [&>a]:underline [&>a]:hover:text-blue-800
                                        [&>table]:w-full [&>table]:border-collapse [&>table]:my-4 [&>table]:rounded-lg [&>table]:overflow-hidden
                                        [&>table_th]:bg-gray-100 [&>table_th]:dark:bg-gray-800 [&>table_th]:p-3 [&>table_th]:text-left [&>table_th]:font-semibold [&>table_th]:border [&>table_th]:border-gray-200 [&>table_th]:dark:border-gray-700
                                        [&>table_td]:p-3 [&>table_td]:border [&>table_td]:border-gray-200 [&>table_td]:dark:border-gray-700
                                        [&>figure]:my-4
                                        [&_.wp-block-table]:overflow-x-auto [&_.wp-block-table]:my-4
                                        [&_.wp-block-table_table]:w-full [&_.wp-block-table_table]:border-collapse [&_.wp-block-table_table]:rounded-xl [&_.wp-block-table_table]:overflow-hidden [&_.wp-block-table_table]:shadow-sm
                                        [&_.wp-block-table_th]:bg-gradient-to-r [&_.wp-block-table_th]:from-blue-50 [&_.wp-block-table_th]:to-indigo-50 [&_.wp-block-table_th]:dark:from-blue-900/30 [&_.wp-block-table_th]:dark:to-indigo-900/30 [&_.wp-block-table_th]:p-3 [&_.wp-block-table_th]:text-left [&_.wp-block-table_th]:font-bold [&_.wp-block-table_th]:text-gray-800 [&_.wp-block-table_th]:dark:text-gray-200 [&_.wp-block-table_th]:border [&_.wp-block-table_th]:border-gray-200 [&_.wp-block-table_th]:dark:border-gray-700
                                        [&_.wp-block-table_td]:p-3 [&_.wp-block-table_td]:border [&_.wp-block-table_td]:border-gray-200 [&_.wp-block-table_td]:dark:border-gray-700 [&_.wp-block-table_td]:bg-white [&_.wp-block-table_td]:dark:bg-gray-800
                                        [&_.wp-block-table_tr:hover_td]:bg-blue-50 [&_.wp-block-table_tr:hover_td]:dark:bg-blue-900/20
                                        [&_.wp-block-table_a]:text-blue-600 [&_.wp-block-table_a]:font-semibold [&_.wp-block-table_a]:hover:text-blue-800
                                        [&_.wp-block-heading]:font-bold [&_.wp-block-heading]:mt-6 [&_.wp-block-heading]:mb-3 [&_.wp-block-heading]:text-gray-900 [&_.wp-block-heading]:dark:text-white
                                        [&_.wp-block-list]:pl-6 [&_.wp-block-list]:my-3
                                        [&>strong]:font-bold [&>strong]:text-gray-900 [&>strong]:dark:text-white
                                        [&>em]:italic
                                    "
                                    dangerouslySetInnerHTML={{ __html: selectedNotice.content }}
                                />
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <FileText className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 italic">
                                        No additional content available for this notice.
                                    </p>
                                </div>
                            )}

                            {/* Content Images */}
                            {selectedNotice.contentImages?.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                        <ImageIcon className="h-4 w-4" />
                                        Gallery
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {selectedNotice.contentImages.map((img, idx) => (
                                            <a 
                                                key={idx}
                                                href={img.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 hover:shadow-lg hover:scale-105 transition-all duration-200"
                                            >
                                                <img 
                                                    src={img.url} 
                                                    alt={img.alt || `Image ${idx + 1}`}
                                                    className="w-full h-24 object-cover"
                                                    onError={(e) => {
                                                        e.target.parentElement.style.display = 'none';
                                                    }}
                                                />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-center gap-3 p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <button
                                onClick={() => setSelectedNotice(null)}
                                className="px-8 py-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all font-semibold shadow-sm hover:shadow-md"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticeFeed;
