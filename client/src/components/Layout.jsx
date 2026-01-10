import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Navbar from './Navbar/Navbar';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const { user } = useAuth();
    const isLoggedIn = user && user.id && !user.id.startsWith('temp-');

    return (
        <div className="min-h-screen bg-indigo-50/30 flex">
            {isLoggedIn && (
                <div className="animate-in fade-in duration-200">
                    <Sidebar />
                </div>
            )}
            <main className={`w-full transition-all duration-300 ${isLoggedIn ? 'pl-72' : ''}`}>
                <div className="container mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
