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
    GraduationCap,
    User,
    Settings,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [hoveredItem, setHoveredItem] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Mock user data - Replace with actual user data from context
    const userData = {
        name: "Alex Johnson",
        email: "alex@university.edu",
        avatar: null, // Will show initials if no avatar
        role: "Student"
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', color: 'from-custom-celadon to-custom-taupe-grey/60' },
        { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace', color: 'from-custom-soft-apricot to-orange-300' },
        { icon: MessageSquare, label: 'Forum', path: '/forum', color: 'from-custom-cotton-candy to-pink-300' },
        { icon: Bell, label: 'Notices', path: '/notices', color: 'from-custom-beige to-yellow-200', badge: 3 },
        { icon: MessageCircle, label: 'Chat', path: '/chat', color: 'from-custom-celadon to-green-300', badge: 5 },
        { icon: AlertCircle, label: 'Issues', path: '/issues', color: 'from-custom-cotton-candy to-red-300' },
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
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 transition-transform">
            {/* Sidebar Background with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-custom-beige/30 via-white to-custom-beige/30"></div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-custom-celadon/40 to-custom-soft-apricot/40 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-0 w-20 h-20 bg-gradient-to-tr from-custom-cotton-candy/30 to-custom-taupe-grey/20 rounded-full blur-2xl"></div>

            <div className="relative flex h-full flex-col px-3 py-4">
                {/* Logo Section - Compact */}
                <div className="mb-4">
                    <div className="flex items-center p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-md shadow-custom-taupe-grey/5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-custom-celadon to-custom-taupe-grey text-white shadow-md shadow-custom-taupe-grey/20">
                            <GraduationCap size={20} strokeWidth={2.5} />
                        </div>
                        <div className="ml-2.5 flex-1">
                            <span className="block text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-custom-taupe-grey to-custom-cotton-candy">
                                EduSync
                            </span>
                            <span className="block text-[10px] text-gray-500 font-medium leading-tight">Campus Hub</span>
                        </div>
                    </div>
                </div>

                {/* User Profile Section - Compact */}
                <div className="mb-4">
                    <NavLink
                        to="/profile/me"
                        className="group block p-2.5 rounded-xl bg-gradient-to-br from-custom-celadon/10 to-custom-soft-apricot/10 border border-custom-celadon/20 hover:border-custom-celadon/40 hover:shadow-md hover:shadow-custom-celadon/10 transition-all duration-300"
                    >
                        <div className="flex items-center">
                            <div className="relative">
                                {userData.avatar ? (
                                    <img src={userData.avatar} alt={userData.name} className="h-9 w-9 rounded-lg object-cover" />
                                ) : (
                                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-custom-celadon to-custom-taupe-grey flex items-center justify-center text-white font-bold text-xs shadow-md">
                                        {getInitials(userData.name)}
                                    </div>
                                )}
                                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-custom-celadon border-2 border-white"></div>
                            </div>
                            <div className="ml-2.5 flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate group-hover:text-custom-taupe-grey transition-colors">
                                    {userData.name}
                                </p>
                                <p className="text-[10px] text-gray-500 truncate leading-tight">{userData.role}</p>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-custom-taupe-grey group-hover:translate-x-1 transition-all" />
                        </div>
                    </NavLink>
                </div>

                {/* Navigation Items - Compact */}
                <nav className="flex-1 space-y-1">
                    <div className="mb-1.5 px-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="h-2.5 w-2.5" />
                            Navigation
                        </p>
                    </div>
                    {navItems.map((item, index) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onMouseEnter={() => setHoveredItem(index)}
                            onMouseLeave={() => setHoveredItem(null)}
                            className={({ isActive }) =>
                                cn(
                                    "group relative flex items-center rounded-lg p-2 transition-all duration-300",
                                    isActive
                                        ? "bg-white shadow-md shadow-custom-taupe-grey/10 border border-custom-beige"
                                        : "hover:bg-white/60 hover:shadow-sm border border-transparent"
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Active Indicator */}
                                    {isActive && (
                                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-gradient-to-b ${item.color}`}></div>
                                    )}

                                    {/* Icon Container */}
                                    <div className={cn(
                                        "relative flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-300",
                                        isActive
                                            ? `bg-gradient-to-br ${item.color} shadow-md`
                                            : "bg-gray-100 group-hover:bg-custom-beige/30"
                                    )}>
                                        <item.icon
                                            className={cn(
                                                "h-4 w-4 transition-all duration-300",
                                                isActive ? "text-white" : "text-gray-600 group-hover:text-gray-900"
                                            )}
                                            strokeWidth={isActive ? 2.5 : 2}
                                        />

                                        {/* Badge */}
                                        {item.badge && (
                                            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-custom-cotton-candy border-2 border-white flex items-center justify-center">
                                                <span className="text-[9px] font-bold text-white">{item.badge}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Label */}
                                    <span className={cn(
                                        "ml-2.5 text-sm font-semibold transition-colors duration-300",
                                        isActive ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"
                                    )}>
                                        {item.label}
                                    </span>

                                    {/* Hover Arrow */}
                                    <ChevronRight
                                        className={cn(
                                            "ml-auto h-3.5 w-3.5 transition-all duration-300",
                                            isActive ? "text-custom-taupe-grey opacity-100" : "text-gray-400 opacity-0 group-hover:opacity-100",
                                            hoveredItem === index && "translate-x-1"
                                        )}
                                    />
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Section - Compact */}
                <div className="mt-auto space-y-1 pt-3 border-t border-gray-200/50">
                    {/* Settings Button */}
                    <button
                        onClick={() => navigate('/settings')}
                        className="flex w-full items-center rounded-lg p-2 text-gray-600 hover:bg-white/60 hover:text-gray-900 hover:shadow-sm transition-all duration-300 group"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                            <Settings className="h-4 w-4" />
                        </div>
                        <span className="ml-2.5 text-sm font-semibold">Settings</span>
                    </button>

                    {/* Logout Button */}
                    <button
                        className="flex w-full items-center rounded-lg p-2 text-gray-600 hover:bg-custom-cotton-candy/10 hover:text-custom-cotton-candy hover:shadow-sm transition-all duration-300 group"
                        onClick={handleLogout}
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-custom-cotton-candy/20 transition-colors">
                            <LogOut className="h-4 w-4" />
                        </div>
                        <span className="ml-2.5 text-sm font-semibold">Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
