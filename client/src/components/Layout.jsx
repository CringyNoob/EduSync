import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Navbar from './Navbar/Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <Navbar />
            <main className="pl-64 pt-20">
                <div className="container mx-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
