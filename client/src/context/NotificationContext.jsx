import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'system',
            title: 'System Maintenance',
            message: 'Scheduled maintenance aimed at improving performance from 2 AM to 4 AM.',
            time: '2 hours ago',
            read: false,
            priority: 'high'
        },
        {
            id: 2,
            type: 'order',
            title: 'Order Shipped',
            message: 'Your order #12345 has been shipped and is on its way.',
            time: '5 hours ago',
            read: false,
            priority: 'normal'
        },
        {
            id: 3,
            type: 'message',
            title: 'New Message from Sarah',
            message: 'Hey, is the calculus book still available?',
            time: '1 day ago',
            read: true,
            priority: 'normal'
        },
        {
            id: 4,
            type: 'event',
            title: 'Exam Reminder',
            message: 'Calculus Final Exam is tomorrow at 9:00 AM in Room 304.',
            time: '1 day ago',
            read: true,
            priority: 'urgent'
        },
        {
            id: 5,
            type: 'system',
            title: 'Welcome to EduSync',
            message: 'Thanks for joining! Complete your profile to get started.',
            time: '2 days ago',
            read: true,
            priority: 'normal'
        }
    ]);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
