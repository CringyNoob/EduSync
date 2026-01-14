import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import Button from '../Button';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user } = useAuth();

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
