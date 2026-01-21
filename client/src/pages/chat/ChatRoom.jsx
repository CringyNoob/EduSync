import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft, Send, MoreVertical, Phone, Video, Info,
    Image as ImageIcon, Smile, Paperclip, Check, CheckCheck,
    AlertCircle, Lock, Archive
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';

const ChatRoom = () => {
    const { conversationId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [isArchived, setIsArchived] = useState(false);

    // Get context from URL params for new chat initiation
    const targetUserId = searchParams.get('targetUserId') || searchParams.get('seller') || searchParams.get('vendor') || searchParams.get('owner');
    const contextType = searchParams.get('contextType') || (searchParams.get('seller') ? 'PREOWNED' : searchParams.get('vendor') ? 'PRODUCT' : searchParams.get('owner') ? 'RENTAL' : 'GENERAL');
    const contextId = searchParams.get('contextId') || searchParams.get('listing') || searchParams.get('product') || searchParams.get('rental');
    const targetName = searchParams.get('name');

    // Initialize socket connection
    useEffect(() => {
        const token = localStorage.getItem('edusync_token');
        if (token && !chatService.isConnected()) {
            chatService.connect(token);
        }

        return () => {
            if (conversationId) {
                chatService.leaveRoom(conversationId);
            }
        };
    }, []);

    // Initialize or load conversation
    useEffect(() => {
        const initConversation = async () => {
            setLoading(true);
            setError(null);

            try {
                let convId = conversationId;

                // If no conversation ID but we have target user, initiate chat
                if (!convId && targetUserId) {
                    const response = await chatService.initiateChat({
                        targetUserId,
                        contextType,
                        contextId,
                        title: targetName ? `Chat with ${targetName}` : null
                    });

                    if (response.success && response.conversation) {
                        convId = response.conversation.id;
                        setConversation(response.conversation);
                        setIsArchived(response.conversation.status === 'ARCHIVED');
                        // Update URL without reload
                        window.history.replaceState({}, '', `/chat/${convId}`);
                    }
                } else if (convId) {
                    // Load existing conversation
                    const response = await chatService.getConversation(convId);
                    if (response.success) {
                        setConversation(response.conversation);
                        setIsArchived(response.conversation.status === 'ARCHIVED');
                    }
                }

                // Load messages
                if (convId) {
                    const messagesRes = await chatService.getMessages(convId);
                    if (messagesRes.success) {
                        setMessages(messagesRes.messages || []);
                    }

                    // Join socket room
                    chatService.joinRoom(convId);
                }
            } catch (err) {
                console.error('Error initializing chat:', err);
                setError(err.message || 'Failed to load conversation');
            } finally {
                setLoading(false);
            }
        };

        initConversation();
    }, [conversationId, targetUserId]);

    // Socket event listeners
    useEffect(() => {
        if (!chatService.isConnected()) return;

        const handleNewMessage = (message) => {
            setMessages(prev => [...prev, message]);
            // Mark as read if from other user
            if (message.senderId !== user?.id) {
                chatService.markAsRead(conversation?.id || conversationId);
            }
        };

        const handleUserTyping = ({ userId, isTyping }) => {
            if (userId !== user?.id) {
                setOtherUserTyping(isTyping);
            }
        };

        const handleError = (error) => {
            if (error.type === 'CHAT_ARCHIVED') {
                setIsArchived(true);
                setError('This conversation is archived and read-only.');
            } else {
                setError(error.message);
            }
        };

        const handleRoomJoined = ({ status }) => {
            if (status === 'ARCHIVED') {
                setIsArchived(true);
            }
        };

        chatService.on('receive_message', handleNewMessage);
        chatService.on('user_typing', handleUserTyping);
        chatService.on('error', handleError);
        chatService.on('room_joined', handleRoomJoined);

        return () => {
            chatService.off('receive_message', handleNewMessage);
            chatService.off('user_typing', handleUserTyping);
            chatService.off('error', handleError);
            chatService.off('room_joined', handleRoomJoined);
        };
    }, [conversation, conversationId, user]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle typing indicator
    useEffect(() => {
        const convId = conversation?.id || conversationId;
        if (!convId) return;

        if (isTyping) {
            chatService.sendTyping(convId, true);
            const timeout = setTimeout(() => {
                chatService.sendTyping(convId, false);
                setIsTyping(false);
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [isTyping, conversation, conversationId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending || isArchived) return;

        const convId = conversation?.id || conversationId;
        if (!convId) return;

        setSending(true);
        setError(null);

        try {
            const sent = chatService.sendMessage(convId, newMessage.trim());
            if (sent) {
                setNewMessage('');
                setIsTyping(false);
            }
        } catch (err) {
            setError('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        if (!isTyping && e.target.value) {
            setIsTyping(true);
        }
    };

    const getOtherParticipantName = () => {
        if (targetName) return targetName;
        if (conversation?.title) return conversation.title.replace('Chat with ', '');
        return 'User';
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString();
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = formatDate(message.created_at || message.createdAt);
        if (!groups[date]) groups[date] = [];
        groups[date].push(message);
        return groups;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading conversation...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/chat')}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {getOtherParticipantName().charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {getOtherParticipantName()}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {otherUserTyping ? (
                                <span className="text-green-500">typing...</span>
                            ) : isArchived ? (
                                <span className="text-orange-500 flex items-center gap-1">
                                    <Lock size={12} /> Archived
                                </span>
                            ) : (
                                'Online'
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {conversation?.context_type && conversation.context_type !== 'GENERAL' && (
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                            {conversation.context_type}
                        </span>
                    )}
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <MoreVertical size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>

            {/* Archived Banner */}
            {isArchived && (
                <div className="px-4 py-3 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-900/30 flex items-center gap-2 text-orange-700 dark:text-orange-400">
                    <Archive size={16} />
                    <span className="text-sm font-medium">This conversation is archived and read-only.</span>
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30 flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertCircle size={16} />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-900/50">
                {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                    <div key={date}>
                        {/* Date Separator */}
                        <div className="flex items-center justify-center mb-4">
                            <span className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded-full shadow-sm">
                                {date}
                            </span>
                        </div>

                        {/* Messages for this date */}
                        {dayMessages.map((message, index) => {
                            const isOwn = (message.sender_id || message.senderId) === user?.id;
                            const isSystem = message.message_type === 'SYSTEM' || message.messageType === 'SYSTEM';

                            if (isSystem) {
                                return (
                                    <div key={message.id || index} className="flex justify-center my-2">
                                        <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded-full">
                                            {message.content}
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={message.id || index}
                                    className={`flex mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                                            isOwn
                                                ? 'bg-blue-500 text-white rounded-br-md'
                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md shadow-sm'
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                            <span className={`text-[10px] ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                                                {formatTime(message.created_at || message.createdAt)}
                                            </span>
                                            {isOwn && (
                                                message.is_read || message.isRead ? (
                                                    <CheckCheck size={12} className="text-blue-100" />
                                                ) : (
                                                    <Check size={12} className="text-blue-100" />
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {/* Typing indicator */}
                {otherUserTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        disabled={isArchived}
                    >
                        <Paperclip size={20} />
                    </button>
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder={isArchived ? "This chat is archived" : "Type a message..."}
                        disabled={isArchived}
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        disabled={isArchived}
                    >
                        <Smile size={20} />
                    </button>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending || isArchived}
                        className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatRoom;
