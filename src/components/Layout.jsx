import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Navbar from './Navbar/Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-custom-beige/40 via-white to-custom-celadon/20">
            <Sidebar />
            <Navbar />
            <main className="pl-64 pt-16">
                <div className="container mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
