import React, { useState } from 'react';
import {
    Bell, MessageSquare, ShoppingBag,
    Calendar, AlertCircle, Check, Trash2,
    MoreHorizontal, Filter
} from 'lucide-react';
import Button from '../../components/Button';

import { useNotifications } from '../../context/NotificationContext';

const NotificationsPage = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const [filter, setFilter] = useState('all'); // all, unread, system, orders

    const getIcon = (type) => {
        switch (type) {
            case 'message': return MessageSquare;
            case 'order': return ShoppingBag;
            case 'event': return Calendar;
            case 'system': return AlertCircle;
            default: return Bell;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'message': return 'text-blue-600 bg-blue-100';
            case 'order': return 'text-purple-600 bg-purple-100';
            case 'event': return 'text-orange-600 bg-orange-100';
            case 'system': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        return n.type === filter;
    });

    return (
        <div className="min-h-screen p-4 md:p-6 font-sans animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="px-3 py-1 rounded-full bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-500/30">
                                {unreadCount} new
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Stay updated with your latest activities.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={markAllAsRead}
                        className="text-gray-500 hover:text-gray-900 font-bold"
                    >
                        Mark all as read
                    </Button>
                    <div className="h-4 w-px bg-gray-200"></div>
                    <Button variant="outline" size="icon" className="rounded-xl">
                        <MoreHorizontal className="h-5 w-5 text-gray-500" />
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex overflow-x-auto pb-4 gap-2 mb-4 no-scrollbar">
                {[
                    { id: 'all', label: 'All' },
                    { id: 'unread', label: 'Unread' },
                    { id: 'system', label: 'System' },
                    { id: 'order', label: 'Orders' },
                    { id: 'message', label: 'Messages' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${filter === tab.id
                            ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 hover:border-gray-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 border-dashed">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">No notifications found</h3>
                        <p className="text-gray-400">You're all caught up!</p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => {
                        const Icon = getIcon(notification.type);
                        const colorClass = getColor(notification.type);

                        return (
                            <div
                                key={notification.id}
                                className={`group relative p-5 rounded-2xl border transition-all duration-300 hover:shadow-md ${notification.read
                                    ? 'bg-white border-gray-100 opacity-60 hover:opacity-100'
                                    : 'bg-white border-indigo-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`shrink-0 p-3 rounded-xl ${colorClass}`}>
                                        <Icon size={20} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className="flex items-start justify-between gap-4 mb-1">
                                            <h3 className={`text-base font-bold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                {notification.title}
                                            </h3>
                                            <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                                                {notification.time}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed mb-3">
                                            {notification.message}
                                        </p>

                                        {/* Actions */}
                                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                                >
                                                    <Check size={14} /> Mark as read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Unread Indicator */}
                                    {!notification.read && (
                                        <div className="absolute top-1/2 right-4 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-indigo-50"></div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
