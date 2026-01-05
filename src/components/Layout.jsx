import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Navbar from './Navbar/Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-indigo-50/30 flex">
            <Sidebar />
            <main className="pl-64 w-full">
                <div className="container mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
