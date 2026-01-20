<<<<<<< HEAD
import React from 'react';
import { Search, MoreVertical } from 'lucide-react';
import Input from '../../components/Form/Input';

const ChatList = () => {
    const chats = [
        { id: 1, name: "Study Group A", lastMessage: "See you at the library!", time: "10:30 AM", unread: 2, avatar: "bg-blue-200" },
        { id: 2, name: "John Doe", lastMessage: "Can you share the notes?", time: "Yesterday", unread: 0, avatar: "bg-green-200" },
        { id: 3, name: "Project Team", lastMessage: "Meeting rescheduled to 5 PM", time: "Yesterday", unread: 5, avatar: "bg-purple-200" },
    ];

    return (
        <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Input placeholder="Search chats..." className="pl-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map((chat) => (
                        <div key={chat.id} className="flex items-center gap-3 p-4 hover:bg-white dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">
                            <div className={`h-10 w-10 rounded-full ${chat.avatar} flex items-center justify-center text-sm font-bold text-gray-700`}>
                                {chat.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{chat.name}</h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{chat.time}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{chat.lastMessage}</p>
                            </div>
                            {chat.unread > 0 && (
                                <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-medium">
=======
import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Send, Phone, Video, Info, Smile, Paperclip } from 'lucide-react';
import Input from '../../components/Form/Input';
import socketService from '../../services/socketService';
import chatService from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const ChatList = () => {
    const { user } = useAuth();
    const location = useLocation(); // Import useLocation
    const [activeChat, setActiveChat] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState({}); // { chatId: [messages] }
    const [chats, setChats] = useState([]);
    const messagesEndRef = useRef(null);

    // Initial Data Load
    useEffect(() => {
        const loadRooms = async () => {
            const rooms = await chatService.getRooms();
            // Add some UI props that might be missing from DB
            const enhancedRooms = rooms.map(r => ({
                ...r,
                avatar: r.type === 'public' ? 'bg-indigo-300' : 'bg-blue-200',
                lastMessage: 'Tap to start chatting',
                time: '',
                unread: 0
            }));

            // Check if we navigated here with a specific chat in mind
            const targetChat = location.state?.targetChat;
            if (targetChat) {
                // If it's a new chat not in list, add it
                const exists = enhancedRooms.find(r => r.id === targetChat.id);
                if (!exists) {
                    enhancedRooms.unshift({
                        ...targetChat,
                        avatar: 'bg-green-200',
                        lastMessage: 'New Chat',
                        time: 'Now',
                        unread: 0
                    });
                }
                setActiveChat(targetChat);
            }

            setChats(enhancedRooms);
        };
        loadRooms();

        socketService.connect();

        // Listen for incoming messages
        socketService.onReceiveMessage((data) => {
            setMessages(prev => {
                const roomMessages = prev[data.roomId] || [];
                // Prevent duplicates if using optimistic UI + socket echo
                if (roomMessages.some(m => m.time === data.time && m.text === data.message && m.senderName === data.sender)) {
                    return prev;
                }
                return {
                    ...prev,
                    [data.roomId]: [...roomMessages, {
                        ...data,
                        text: data.message,
                        senderName: data.sender
                    }]
                };
            });

            // Update last message in sidebar
            setChats(prevChats => prevChats.map(c =>
                c.id === data.roomId
                    ? { ...c, lastMessage: data.message, time: data.time || 'Now' }
                    : c
            ));
        });

        return () => {
            socketService.disconnect();
        };
    }, []);

    // Load History when Chat Selected
    useEffect(() => {
        if (!activeChat) return;

        const loadHistory = async () => {
            // Only load if empty to save calls (or could implement proper pagination)
            if (!messages[activeChat.id] || messages[activeChat.id].length === 0) {
                const history = await chatService.getHistory(activeChat.id);
                setMessages(prev => ({ ...prev, [activeChat.id]: history }));
            }
        };
        loadHistory();

        socketService.joinRoom(activeChat.id);
    }, [activeChat]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeChat]);

    const handleChatSelect = (chat) => {
        setActiveChat(chat);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeChat) return;

        const newMessage = {
            roomId: activeChat.id,
            text: messageInput,
            senderId: user?.id || 'guest',
            senderName: user?.name || 'Guest',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        // UI Optimistic Update
        setMessages(prev => ({
            ...prev,
            [activeChat.id]: [...(prev[activeChat.id] || []), newMessage]
        }));

        // Update sidebar
        setChats(prevChats => prevChats.map(c =>
            c.id === activeChat.id
                ? { ...c, lastMessage: newMessage.text, time: newMessage.time }
                : c
        ));

        // Send via Socket
        socketService.sendMessage(activeChat.id, {
            sender: user?.name || 'Guest',
            message: messageInput,
            senderId: user?.id,
            time: newMessage.time
        });

        setMessageInput('');
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] mt-6 overflow-hidden rounded-3xl border border-white/60 dark:border-gray-700 bg-white/80 dark:bg-gray-800/90 backdrop-blur-2xl shadow-xl transition-all duration-300">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 flex flex-col backdrop-blur-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Messages</h2>
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                            <MoreVertical size={18} className="text-gray-600 dark:text-gray-300" />
                        </div>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            placeholder="Search chats..."
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border-none shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => handleChatSelect(chat)}
                            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${activeChat?.id === chat.id ? 'bg-white dark:bg-gray-800 shadow-lg shadow-primary/5 ring-1 ring-primary/10' : 'hover:bg-white/60 dark:hover:bg-gray-800/60'}`}
                        >
                            <div className={`relative h-12 w-12 rounded-full ${chat.avatar} flex items-center justify-center text-base font-bold text-gray-700 shadow-inner`}>
                                {chat.name ? chat.name.charAt(0) : 'C'}
                                {chat.unread > 0 && <div className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`font-bold truncate ${activeChat?.id === chat.id ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>{chat.name}</h3>
                                    <span className="text-xs text-xs font-semibold text-gray-400">{chat.time}</span>
                                </div>
                                <p className={`text-sm truncate ${activeChat?.id === chat.id ? 'text-gray-600 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>{chat.lastMessage}</p>
                            </div>
                            {chat.unread > 0 && (
                                <div className="h-6 min-w-[1.5rem] px-1.5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
                                    {chat.unread}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

<<<<<<< HEAD
            {/* Chat Window Placeholder */}
            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 text-center p-8">
                <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                    <MoreVertical className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a conversation</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">Choose a chat from the list to start messaging your classmates or groups.</p>
            </div>
=======
            {/* Chat Window */}
            {activeChat ? (
                <div className="flex-1 flex flex-col bg-white/30 dark:bg-gray-900/30 relative">
                    {/* Header */}
                    <div className="h-20 px-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white/80 dark:bg-gray-800/90 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full ${activeChat.avatar} flex items-center justify-center text-sm font-bold text-gray-700`}>
                                {activeChat.name ? activeChat.name.charAt(0) : 'C'}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{activeChat.name}</h3>
                                <p className="text-xs text-green-500 font-semibold flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"><Phone size={20} /></button>
                            <button className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"><Video size={20} /></button>
                            <button className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"><Info size={20} /></button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50 dark:bg-gray-900/50">
                        {messages[activeChat.id]?.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Send className="text-primary w-8 h-8 ml-1" />
                                </div>
                                <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
                            </div>
                        )}

                        {messages[activeChat.id]?.map((msg, idx) => {
                            const isMe = msg.senderId === user?.id || msg.isMe;
                            return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                        <div
                                            className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${isMe
                                                ? 'bg-gradient-to-br from-primary to-primary-hover text-white rounded-tr-none'
                                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
                                                }`}
                                        >
                                            {msg.text || msg.message}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium">
                                            {isMe ? 'You' : msg.senderName} • {msg.time}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 m-4 mt-0 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg flex items-center gap-3">
                        <button className="p-2 text-gray-400 hover:text-primary transition-colors"><Paperclip size={20} /></button>

                        <form onSubmit={handleSendMessage} className="flex-1">
                            <input
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Type your message..."
                                className="w-full bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder:text-gray-400 text-sm font-medium"
                            />
                        </form>

                        <button className="p-2 text-gray-400 hover:text-primary transition-colors"><Smile size={20} /></button>
                        <button
                            onClick={handleSendMessage}
                            disabled={!messageInput.trim()}
                            className="p-3 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                /* Placeholder State */
                <div className="flex-1 flex flex-col items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-center p-8">
                    <div className="relative mb-6 group">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative h-24 w-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-xl border border-white/50">
                            <MoreVertical className="h-10 w-10 text-primary opacity-50" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select a conversation</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8 leading-relaxed">Choose a chat from the sidebar to start messaging your study groups or classmates in real-time.</p>

                    <button className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm text-primary shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                        Start New Chat
                    </button>
                </div>
            )}
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
        </div>
    );
};

export default ChatList;
