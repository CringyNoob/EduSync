
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    MessageSquare,
    Bell,
    MessageCircle,
    AlertCircle,
    LogOut,
    User,
    Settings,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [hoveredItem, setHoveredItem] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Use actual user data from context
    const userData = {
        name: user?.name || "User",
        email: user?.email || "",
        avatar: user?.avatarUrl || null,
        role: user?.role || "Student"
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', activeClass: 'text-primary bg-primary/5 border-primary' },
        { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace', activeClass: 'text-indigo-600 bg-indigo-50 border-indigo-600' },
        { icon: MessageSquare, label: 'Forum', path: '/forum', activeClass: 'text-blue-600 bg-blue-50 border-blue-600' },
        { icon: Bell, label: 'Notices', path: '/notices', activeClass: 'text-yellow-600 bg-yellow-50 border-yellow-600', badge: 3 },
        { icon: MessageCircle, label: 'Chat', path: '/chat', activeClass: 'text-green-600 bg-green-50 border-green-600', badge: 5 },
        { icon: AlertCircle, label: 'Issues', path: '/issues', activeClass: 'text-red-600 bg-red-50 border-red-600' },
    ];

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <aside className="fixed left-4 top-4 z-50 h-[calc(100vh-2rem)] w-[246px] transition-transform">
            {/* Sidebar Card - Floating Glass Effect */}
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] bg-white/70 backdrop-blur-3xl">
                {/* Subtle Inner Gradient for Depth */}
                <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-white/60 to-transparent z-0"></div>

                {/* Subtle Noise Texture */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 z-0"></div>
            </div>

            <div className="relative z-10 flex h-full flex-col px-5 py-6">
                {/* Logo Section */}
                <div className="mb-8 px-1">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="p-1.5 rounded-xl bg-white shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-300">
                            <img src="/logo.png" alt="EduSync" className="h-6 w-6 object-contain" />
                        </div>
                        <div>
                            <span className="block text-xl font-extrabold text-gray-900 leading-none tracking-tight">
                                EduSync
                            </span>
                            <span className="block text-[10px] text-primary font-bold tracking-widest mt-0.5">STUDENT HUB</span>
                        </div>
                    </div>
                </div>

                {/* User Profile Section - Refined */}
                <div className="mb-6">
                    <NavLink
                        to="/profile/me"
                        className="group relative block p-1.5 rounded-[1.2rem] bg-white/60 border border-white shadow-sm hover:shadow-md hover:bg-white transition-all duration-300"
                    >
                        <div className="flex items-center gap-3 p-1.5">
                            <div className="relative">
                                {userData.avatar ? (
                                    <img src={userData.avatar} alt={userData.name} className="h-9 w-9 rounded-xl object-cover ring-2 ring-white" />
                                ) : (
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-white">
                                        {getInitials(userData.name)}
                                    </div>
                                )}
                                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white ring-1 ring-gray-100"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                                    {userData.name}
                                </p>
                                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">{userData.role}</p>
                            </div>
                        </div>
                    </NavLink>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar py-2">
                    <div className="px-3 mb-2">
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest opacity-60">Main Menu</p>
                    </div>
                    {navItems.map((item, index) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onMouseEnter={() => setHoveredItem(index)}
                            onMouseLeave={() => setHoveredItem(null)}
                            className={({ isActive }) =>
                                cn(
                                    "group relative flex items-center rounded-xl px-3 py-2.5 transition-all duration-300",
                                    isActive
                                        ? `${item.activeClass} border-l-4 shadow-sm bg-opacity-100`
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon
                                        className={cn(
                                            "mr-3 h-5 w-5 transition-transform duration-300",
                                            isActive ? "scale-110" : "group-hover:scale-110"
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    <span className={cn("text-sm font-semibold", isActive ? "font-bold" : "")}>
                                        {item.label}
                                    </span>

                                    {/* Badge */}
                                    {item.badge && (
                                        <div className={cn(
                                            "ml-auto h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all",
                                            isActive
                                                ? "bg-white border-current"
                                                : "bg-gray-100 text-gray-500 border-transparent group-hover:bg-white group-hover:shadow-sm"
                                        )}>
                                            {item.badge}
                                        </div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="mt-auto pt-4 border-t border-gray-200/50 space-y-1">
                    <NavLink
                        to="/settings"
                        className={({ isActive }) => cn(
                            "flex w-full items-center rounded-xl p-2.5 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group gap-3",
                            isActive ? "bg-gray-50 text-gray-900 font-bold" : ""
                        )}
                    >
                        <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" />
                        <span className="text-sm font-semibold">Settings</span>
                    </NavLink>

                    <button
                        className="flex w-full items-center rounded-xl p-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group gap-3"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-semibold">Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
