import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Search, MessageCircle, Archive, Inbox, Store, ShoppingBag,
    Clock, CheckCheck, User, Package, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import ChatRoom from '../chat/ChatRoom';

/**
 * VendorChats - Vendor-specific chat interface
 * Shows conversations where the vendor is a participant in their vendor capacity
 * Contexts: PRODUCT, ORDER (from their shop)
 */
const VendorChats = () => {
    const navigate = useNavigate();
    const { conversationId } = useParams();
    const { user } = useAuth();

    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('ACTIVE');

    // Initialize socket connection
    useEffect(() => {
        const token = localStorage.getItem('edusync_token');
        if (token && !chatService.isConnected()) {
            chatService.connect(token);
        }
    }, []);

    // Fetch vendor-related conversations
    useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await chatService.getMyConversations(activeFilter);
                if (response.success) {
                    // Filter for vendor-related contexts (PRODUCT, ORDER)
                    const vendorConvs = (response.conversations || []).filter(conv => 
                        conv.context_type === 'PRODUCT' || conv.context_type === 'ORDER'
                    );
                    setConversations(vendorConvs);
                }
            } catch (err) {
                console.error('Error fetching conversations:', err);
                setError(err.message || 'Failed to load conversations');
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();

        // Refresh on new messages
        const handleNewMessage = () => fetchConversations();
        if (chatService.isConnected()) {
            chatService.on('receive_message', handleNewMessage);
            return () => chatService.off('receive_message', handleNewMessage);
        }
    }, [activeFilter]);

    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery) return true;
        const title = conv.title || '';
        return title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getContextIcon = (type) => {
        switch (type) {
            case 'PRODUCT': return <Package size={12} />;
            case 'ORDER': return <ShoppingBag size={12} />;
            default: return <MessageCircle size={12} />;
        }
    };

    const getContextColor = (type) => {
        switch (type) {
            case 'PRODUCT': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
            case 'ORDER': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
        }
    };

    // Stats
    const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
    const productChats = conversations.filter(c => c.context_type === 'PRODUCT').length;
    const orderChats = conversations.filter(c => c.context_type === 'ORDER').length;

    // If viewing a specific conversation
    if (conversationId) {
        return (
            <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                {/* Sidebar - Hidden on mobile */}
                <div className="hidden lg:flex w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-col">
                    <VendorConversationsList
                        conversations={filteredConversations}
                        loading={loading}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        activeFilter={activeFilter}
                        setActiveFilter={setActiveFilter}
                        selectedId={conversationId}
                        formatTime={formatTime}
                        getContextIcon={getContextIcon}
                        getContextColor={getContextColor}
                        navigate={navigate}
                        totalUnread={totalUnread}
                        productChats={productChats}
                        orderChats={orderChats}
                    />
                </div>

                {/* Chat Room */}
                <div className="flex-1">
                    <ChatRoom />
                </div>
            </div>
        );
    }

    // Full list view
    return (
        <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            {/* Sidebar */}
            <div className="w-full lg:w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col">
                <VendorConversationsList
                    conversations={filteredConversations}
                    loading={loading}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    selectedId={null}
                    formatTime={formatTime}
                    getContextIcon={getContextIcon}
                    getContextColor={getContextColor}
                    navigate={navigate}
                    totalUnread={totalUnread}
                    productChats={productChats}
                    orderChats={orderChats}
                />
            </div>

            {/* Empty State */}
            <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-white dark:bg-gray-800 text-center p-8">
                <div className="h-20 w-20 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-4">
                    <Store className="h-10 w-10 text-pink-500 dark:text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Customer Messages</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    View and respond to customer inquiries about your products and orders.
                </p>
            </div>
        </div>
    );
};

// Vendor Conversations List Component
const VendorConversationsList = ({
    conversations,
    loading,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    selectedId,
    formatTime,
    getContextIcon,
    getContextColor,
    navigate,
    totalUnread,
    productChats,
    orderChats
}) => {
    return (
        <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
                            <Store className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Chats</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {totalUnread > 0 ? `${totalUnread} unread` : 'All caught up'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                            <Package size={16} />
                            <span className="text-xs font-medium">Product Inquiries</span>
                        </div>
                        <p className="text-lg font-bold text-orange-700 dark:text-orange-300 mt-1">{productChats}</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <ShoppingBag size={16} />
                            <span className="text-xs font-medium">Order Chats</span>
                        </div>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-1">{orderChats}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveFilter('ACTIVE')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            activeFilter === 'ACTIVE'
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        <Inbox size={14} className="inline mr-1" />
                        Active
                    </button>
                    <button
                        onClick={() => setActiveFilter('ARCHIVED')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            activeFilter === 'ARCHIVED'
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        <Archive size={14} className="inline mr-1" />
                        Archived
                    </button>
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                        <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No {activeFilter.toLowerCase()} chats</p>
                        <p className="text-sm mt-1">Customer messages will appear here</p>
                    </div>
                ) : (
                    conversations.map((conv) => {
                        const unreadCount = conv.unread_count || 0;
                        const lastMessage = conv.last_message;
                        const isSelected = selectedId === conv.id;

                        return (
                            <div
                                key={conv.id}
                                onClick={() => navigate(`/vendor/chats/${conv.id}`)}
                                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                                    isSelected
                                        ? 'bg-pink-50 dark:bg-pink-900/20'
                                        : 'hover:bg-white dark:hover:bg-gray-800'
                                }`}
                            >
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                    <User size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={`font-medium truncate ${unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {conv.title?.replace('Chat with ', '') || 'Customer'}
                                        </h3>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                            {formatTime(conv.last_message_at || conv.created_at)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${getContextColor(conv.context_type)}`}>
                                            {getContextIcon(conv.context_type)}
                                            {conv.context_type}
                                        </span>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">
                                            {lastMessage?.content || 'Start conversation'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {unreadCount > 0 && (
                                        <div className="h-5 w-5 rounded-full bg-pink-500 flex items-center justify-center text-xs text-white font-medium">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </div>
                                    )}
                                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
};

export default VendorChats;
