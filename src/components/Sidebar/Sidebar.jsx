import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    MessageSquare,
    Bell,
    MessageCircle,
    AlertCircle,
    LogOut,
    GraduationCap,
    User
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace' },
        { icon: MessageSquare, label: 'Forum', path: '/forum' },
        { icon: Bell, label: 'Notices', path: '/notices' },
        { icon: MessageCircle, label: 'Chat', path: '/chat' },
        { icon: AlertCircle, label: 'Issues', path: '/issues' },
        { icon: User, label: 'My Profile', path: '/profile/me' },
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white transition-transform">
            <div className="flex h-full flex-col px-3 py-4">
                <div className="mb-8 flex items-center pl-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-purple-dark text-white shadow-lg shadow-brand-purple/20">
                        <GraduationCap size={24} />
                    </div>
                    <span className="ml-3 self-center whitespace-nowrap text-xl font-bold text-gray-900">
                        EduSync
                    </span>
                </div>

                <ul className="space-y-1 font-medium flex-1">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center rounded-xl p-3 text-gray-600 hover:bg-gray-50 group transition-all duration-200",
                                        isActive && "bg-brand-purple/10 text-brand-purple font-semibold"
                                    )
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon className={cn("h-5 w-5 flex-shrink-0 transition duration-200 text-gray-400 group-hover:text-gray-600", isActive && "text-brand-purple")} />
                                        <span className="ml-3">{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="mt-auto border-t border-gray-100 pt-4">
                    <button
                        className="flex w-full items-center rounded-xl p-3 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0 transition duration-75" />
                        <span className="ml-3 font-medium">Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
