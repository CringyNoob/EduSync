import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, MessageCircle } from 'lucide-react';
import Button from '../Button';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';

const Navbar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread count on mount
    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (!user) return;
            
            try {
                const token = localStorage.getItem('edusync_token');
                if (token && !chatService.isConnected()) {
                    chatService.connect(token);
                }
                
                const response = await chatService.getMyConversations('ACTIVE');
                if (response.success && response.conversations) {
                    const total = response.conversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0);
                    setUnreadCount(total);
                }
            } catch (err) {
                console.error('Error fetching unread count:', err);
            }
        };

        fetchUnreadCount();
        // Refresh every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Listen for new messages to update count
    useEffect(() => {
        if (!user || !chatService.isConnected()) return;

        const handleNewMessage = () => {
            setUnreadCount(prev => prev + 1);
        };

        chatService.on('new_message', handleNewMessage);
        return () => chatService.off('new_message', handleNewMessage);
    }, [user]);

    // Get user initials for avatar fallback
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <nav className="fixed top-0 z-30 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-64 transition-all duration-300">
            <div className="flex items-center justify-between px-6 py-3">
                <div className="flex w-96 items-center">
                    <div className="relative w-full">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 pl-10 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 dark:placeholder-gray-400"
                            placeholder="Search..."
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Messages Icon */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="relative hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                        onClick={() => navigate('/chat')}
                    >
                        <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        {unreadCount > 0 && (
                            <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-white">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            </span>
                        )}
                    </Button>

                    <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
                    </Button>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Student</p>
                        </div>
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600 ring-2 ring-white dark:ring-gray-700">
                            <User className="h-full w-full p-2 text-gray-400 dark:text-gray-300" />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
