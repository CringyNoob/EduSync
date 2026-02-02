import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Send, Users, MoreVertical, Bell, BellOff, 
    LogOut, Loader2, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';

const BatchChatRoom = ({ batchId, onBack }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const [batchRoom, setBatchRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [showMenu, setShowMenu] = useState(false);

    // Fetch batch room details and messages
    useEffect(() => {
        const fetchBatchData = async () => {
            if (!batchId) return;
            
            setLoading(true);
            setError(null);
            
            try {
                // Fetch room details and messages in parallel
                const [roomResponse, messagesResponse] = await Promise.all([
                    chatService.getBatchChatroom(batchId),
                    chatService.getBatchMessages(batchId, { limit: 100 })
                ]);

                if (roomResponse.success) {
                    setBatchRoom(roomResponse.batchChatroom);
                }
                if (messagesResponse.success) {
                    setMessages(messagesResponse.messages || []);
                }
            } catch (err) {
                console.error('Error fetching batch chat:', err);
                setError(err.message || 'Failed to load batch chat');
            } finally {
                setLoading(false);
            }
        };

        fetchBatchData();
    }, [batchId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Listen for new messages via socket
    useEffect(() => {
        if (!batchRoom?.conversation_id) return;

        const handleNewMessage = (message) => {
            if (message.conversation_id === batchRoom.conversation_id) {
                setMessages(prev => [...prev, message]);
            }
        };

        // Join the conversation room
        if (chatService.isConnected()) {
            chatService.joinRoom(batchRoom.conversation_id);
            chatService.on('receive_message', handleNewMessage);

            return () => {
                chatService.leaveRoom(batchRoom.conversation_id);
                chatService.off('receive_message', handleNewMessage);
            };
        }
    }, [batchRoom?.conversation_id]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        const messageContent = newMessage.trim();
        setNewMessage('');
        setSending(true);

        try {
            const response = await chatService.sendBatchMessage(batchId, messageContent);
            
            if (response.success && response.message) {
                // Add message locally (socket will also broadcast)
                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.some(m => m.id === response.message.id)) {
                        return prev;
                    }
                    return [...prev, response.message];
                });

                // Emit via socket for real-time
                if (chatService.isConnected() && batchRoom?.conversation_id) {
                    chatService.sendMessage(batchRoom.conversation_id, messageContent);
                }
            }
        } catch (err) {
            console.error('Error sending message:', err);
            // Restore message on error
            setNewMessage(messageContent);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const handleToggleMute = async () => {
        try {
            const response = await chatService.toggleBatchMute(batchId);
            if (response.success) {
                setBatchRoom(prev => ({ ...prev, is_muted: response.is_muted }));
            }
        } catch (err) {
            console.error('Error toggling mute:', err);
        }
        setShowMenu(false);
    };

    const handleLeave = async () => {
        if (!window.confirm('Are you sure you want to leave this batch chatroom?')) {
            return;
        }
        
        try {
            await chatService.leaveBatchChatroom(batchId);
            navigate('/chat');
        } catch (err) {
            console.error('Error leaving batch:', err);
        }
    };

    const formatMessageTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = new Date(message.created_at).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Loading batch chat...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <p className="text-gray-900 dark:text-white font-medium mb-2">Error loading chat</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-purple-600">
                <button
                    onClick={onBack || (() => navigate('/chat'))}
                    className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <Users size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-white truncate">
                        {batchRoom?.batch_name || 'Batch Chat'}
                    </h2>
                    <p className="text-xs text-white/80">
                        {batchRoom?.member_count || 0} members
                    </p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <MoreVertical size={20} />
                    </button>

                    {showMenu && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                                <button
                                    onClick={handleToggleMute}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {batchRoom?.is_muted ? (
                                        <>
                                            <Bell size={18} />
                                            <span>Unmute</span>
                                        </>
                                    ) : (
                                        <>
                                            <BellOff size={18} />
                                            <span>Mute</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleLeave}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <LogOut size={18} />
                                    <span>Leave Batch</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                    <div key={date}>
                        {/* Date divider */}
                        <div className="flex items-center justify-center my-4">
                            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {formatDate(date)}
                                </span>
                            </div>
                        </div>

                        {/* Messages for this date */}
                        {dateMessages.map((message, idx) => {
                            const isOwn = message.sender_id === user?.id;
                            const isSystem = message.message_type === 'SYSTEM';

                            if (isSystem) {
                                return (
                                    <div key={message.id} className="flex justify-center my-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                            {message.content}
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
                                >
                                    <div
                                        className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                                            isOwn
                                                ? 'bg-indigo-500 text-white rounded-br-md'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                                        }`}
                                    >
                                        {!isOwn && (
                                            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                                                {message.sender_name || 'Member'}
                                            </p>
                                        )}
                                        <p className="text-sm whitespace-pre-wrap break-words">
                                            {message.content}
                                        </p>
                                        <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {formatMessageTime(message.created_at)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Users size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                            No messages yet. Be the first to say hello!
                        </p>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {sending ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BatchChatRoom;
