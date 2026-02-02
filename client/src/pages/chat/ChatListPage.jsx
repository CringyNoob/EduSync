import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, MessageCircle, Archive, Inbox, Users, BellOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import ChatRoom from './ChatRoom';
import BatchChatRoom from './BatchChatRoom';

const ChatListPage = () => {
    const navigate = useNavigate();
    const { conversationId } = useParams();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    const [conversations, setConversations] = useState([]);
    const [batchChatrooms, setBatchChatrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('ACTIVE');
    const [selectedBatchId, setSelectedBatchId] = useState(null);

    // Check if we're initiating a new chat (URL has target params)
    const isNewChat = searchParams.get('targetUserId') || searchParams.get('seller') || searchParams.get('vendor') || searchParams.get('owner');

    // Check if viewing a batch chat
    const batchId = searchParams.get('batch');

    // Initialize socket connection
    useEffect(() => {
        const token = localStorage.getItem('edusync_token');
        if (token && !chatService.isConnected()) {
            chatService.connect(token);
        }
    }, []);

    // Auto-join user's batch chatroom
    useEffect(() => {
        const joinUserBatch = async () => {
            if (user?.batch) {
                try {
                    await chatService.joinBatchChatroom(user.batch);
                } catch (err) {
                    console.log('Could not auto-join batch chatroom:', err.message);
                }
            }
        };
        joinUserBatch();
    }, [user?.batch]);

    // Fetch conversations and batch chatrooms
    const fetchChats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch both conversations and batch chatrooms in parallel
            const [convResponse, batchResponse] = await Promise.all([
                chatService.getMyConversations(activeFilter),
                chatService.getMyBatchChatrooms().catch(() => ({ success: true, batchChatrooms: [] }))
            ]);

            if (convResponse.success) {
                setConversations(convResponse.conversations || []);
            }
            if (batchResponse.success) {
                setBatchChatrooms(batchResponse.batchChatrooms || []);
            }
        } catch (err) {
            console.error('Error fetching conversations:', err);
            setError(err.message || 'Failed to load conversations');
        } finally {
            setLoading(false);
        }
    }, [activeFilter]);

    useEffect(() => {
        fetchChats();

        // Refresh conversations when receiving new messages
        const handleNewMessage = () => {
            fetchChats();
        };
        
        if (chatService.isConnected()) {
            chatService.on('receive_message', handleNewMessage);
            return () => chatService.off('receive_message', handleNewMessage);
        }
    }, [fetchChats]);

    // Handle batch selection
    useEffect(() => {
        if (batchId) {
            setSelectedBatchId(batchId);
        } else {
            setSelectedBatchId(null);
        }
    }, [batchId]);

    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery) return true;
        const title = conv.title || '';
        return title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const filteredBatchRooms = batchChatrooms.filter(room => {
        if (!searchQuery) return true;
        return room.batch_name.toLowerCase().includes(searchQuery.toLowerCase());
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

    const getContextColor = (type) => {
        switch (type) {
            case 'PRODUCT': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
            case 'PREOWNED': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
            case 'RENTAL': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'ORDER': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            case 'BATCH': return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
            default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
        }
    };

    // If viewing a batch chatroom
    if (selectedBatchId || batchId) {
        const activeBatchId = selectedBatchId || batchId;
        return (
            <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                {/* Sidebar - Hidden on mobile when chat is open */}
                <div className="hidden lg:flex w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-col">
                    <ConversationsList
                        conversations={filteredConversations}
                        batchChatrooms={filteredBatchRooms}
                        loading={loading}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        activeFilter={activeFilter}
                        setActiveFilter={setActiveFilter}
                        selectedId={null}
                        selectedBatchId={activeBatchId}
                        formatTime={formatTime}
                        getContextColor={getContextColor}
                        navigate={navigate}
                        user={user}
                        onRefresh={fetchChats}
                    />
                </div>

                {/* Batch Chat Room */}
                <div className="flex-1">
                    <BatchChatRoom batchId={activeBatchId} onBack={() => navigate('/chat')} />
                </div>
            </div>
        );
    }

    // If we have a conversationId or initiating new chat, show full chat view
    if (conversationId || isNewChat) {
        return (
            <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                {/* Sidebar - Hidden on mobile when chat is open */}
                <div className="hidden lg:flex w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-col">
                    <ConversationsList
                        conversations={filteredConversations}
                        batchChatrooms={filteredBatchRooms}
                        loading={loading}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        activeFilter={activeFilter}
                        setActiveFilter={setActiveFilter}
                        selectedId={conversationId}
                        selectedBatchId={null}
                        formatTime={formatTime}
                        getContextColor={getContextColor}
                        navigate={navigate}
                        user={user}
                        onRefresh={fetchChats}
                    />
                </div>

                {/* Chat Room */}
                <div className="flex-1">
                    <ChatRoom />
                </div>
            </div>
        );
    }

    // No conversation selected - show full list
    return (
        <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            {/* Sidebar */}
            <div className="w-full lg:w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col">
                <ConversationsList
                    conversations={filteredConversations}
                    batchChatrooms={filteredBatchRooms}
                    loading={loading}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    selectedId={null}
                    selectedBatchId={null}
                    formatTime={formatTime}
                    getContextColor={getContextColor}
                    navigate={navigate}
                    user={user}
                    onRefresh={fetchChats}
                />
            </div>

            {/* Empty State */}
            <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-white dark:bg-gray-800 text-center p-8">
                <div className="h-20 w-20 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a conversation</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    Choose a chat from the list to start messaging, or start a new conversation from the marketplace.
                </p>
            </div>
        </div>
    );
};

// Conversation List Component
const ConversationsList = ({
    conversations,
    batchChatrooms,
    loading,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    selectedId,
    selectedBatchId,
    formatTime,
    getContextColor,
    navigate,
    user,
    onRefresh
}) => {
    return (
        <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Messages</h2>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                {/* Filter Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveFilter('ACTIVE')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            activeFilter === 'ACTIVE'
                                ? 'bg-blue-500 text-white'
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
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        <Archive size={14} className="inline mr-1" />
                        Archived
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Batch Chatrooms Section - Always at top */}
                        {batchChatrooms.length > 0 && (
                            <div className="border-b border-gray-200 dark:border-gray-700">
                                <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20">
                                    <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide flex items-center gap-1">
                                        <Users size={12} />
                                        Batch Chatrooms
                                    </h3>
                                </div>
                                {batchChatrooms.map((room) => {
                                    const unreadCount = room.unread_count || 0;
                                    const isSelected = selectedBatchId === room.id;

                                    return (
                                        <div
                                            key={room.id}
                                            onClick={() => navigate(`/chat?batch=${room.id}`)}
                                            className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                                                isSelected
                                                    ? 'bg-indigo-50 dark:bg-indigo-900/20'
                                                    : 'hover:bg-white dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                                                <Users size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className={`font-medium truncate ${unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {room.batch_name}
                                                    </h3>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                                        {formatTime(room.last_message_at)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getContextColor('BATCH')}`}>
                                                        {room.member_count} members
                                                    </span>
                                                    {room.is_muted && (
                                                        <BellOff size={12} className="text-gray-400" />
                                                    )}
                                                </div>
                                            </div>
                                            {unreadCount > 0 && (
                                                <div className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center text-xs text-white font-medium flex-shrink-0">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Regular Conversations */}
                        {conversations.length === 0 && batchChatrooms.length === 0 ? (
                            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                                <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
                                <p>No {activeFilter.toLowerCase()} conversations</p>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                                <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No direct messages yet</p>
                            </div>
                        ) : (
                            <>
                                {batchChatrooms.length > 0 && (
                                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900">
                                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                            Direct Messages
                                        </h3>
                                    </div>
                                )}
                                {conversations.map((conv) => {
                                    const unreadCount = conv.unread_count || 0;
                                    const lastMessage = conv.last_message;
                                    const isSelected = selectedId === conv.id;

                                    return (
                                        <div
                                            key={conv.id}
                                            onClick={() => navigate(`/chat/${conv.id}`)}
                                            className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                                                isSelected
                                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                                    : 'hover:bg-white dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                {(conv.title || 'C').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className={`font-medium truncate ${unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {conv.title || 'Conversation'}
                                                    </h3>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                                        {formatTime(conv.last_message_at || conv.created_at)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {conv.context_type && conv.context_type !== 'GENERAL' && (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getContextColor(conv.context_type)}`}>
                                                            {conv.context_type}
                                                        </span>
                                                    )}
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">
                                                        {lastMessage?.content || 'Start a conversation'}
                                                    </p>
                                                </div>
                                            </div>
                                            {unreadCount > 0 && (
                                                <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-medium flex-shrink-0">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default ChatListPage;
