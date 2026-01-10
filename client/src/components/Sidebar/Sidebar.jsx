
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
    Store,
    Shield,
    Sparkles,
    Repeat,
    TrendingUp,
    Newspaper,
    Package
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user, logout, switchRole } = useAuth();
    const navigate = useNavigate();
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Use context user data defaulting to mock if partial info
    const userData = {
        name: user?.name || "Alex Johnson",
        email: user?.email || "alex@university.edu",
        avatar: null, // Will show initials if no avatar
        role: user?.role || "Student"
    };

    // Dynamic Navigation Items based on Role
    const getNavItems = (role) => {
        switch (role) {
            case 'Vendor':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/vendor-dashboard', activeClass: 'text-pink-600 bg-pink-50 border-pink-600' },
                    { icon: Store, label: 'My Shop', path: '/vendor/shop', activeClass: 'text-rose-600 bg-rose-50 border-rose-600' },
                    { icon: ShoppingBag, label: 'Orders', path: '/vendor/orders', activeClass: 'text-orange-600 bg-orange-50 border-orange-600', badge: 12 },
                    { icon: Package, label: 'Products', path: '/vendor/products', activeClass: 'text-amber-600 bg-amber-50 border-amber-600' },
                    { icon: TrendingUp, label: 'Analytics', path: '/vendor/analytics', activeClass: 'text-green-600 bg-green-50 border-green-600' },
                ];
            case 'Admin':
                return [
                    { icon: LayoutDashboard, label: 'Overview', path: '/admin-dashboard', activeClass: 'text-red-600 bg-red-50 border-red-600' },
                    { icon: Newspaper, label: 'News Manager', path: '/newsbox/manage', activeClass: 'text-blue-600 bg-blue-50 border-blue-600' },
                    { icon: User, label: 'Users', path: '/admin/users', activeClass: 'text-blue-600 bg-blue-50 border-blue-600' },
                    { icon: Shield, label: 'Approvals', path: '/admin/approvals', activeClass: 'text-purple-600 bg-purple-50 border-purple-600', badge: 5 },
                    { icon: AlertCircle, label: 'Reports', path: '/admin/reports', activeClass: 'text-orange-600 bg-orange-50 border-orange-600' },
                ];
            case 'Student':
            default:
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', activeClass: 'text-primary bg-primary/5 border-primary' },
                    { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace', activeClass: 'text-indigo-600 bg-indigo-50 border-indigo-600' },
                    { icon: Newspaper, label: 'NewsBox', path: '/newsbox', activeClass: 'text-blue-600 bg-blue-50 border-blue-600' },
                    { icon: Bell, label: 'Notices', path: '/notices', activeClass: 'text-yellow-600 bg-yellow-50 border-yellow-600', badge: 3 },
                    { icon: Repeat, label: 'RentHub', path: '/renthub', activeClass: 'text-emerald-600 bg-emerald-50 border-emerald-600' },
                    { icon: MessageCircle, label: 'Chat', path: '/chat', activeClass: 'text-green-600 bg-green-50 border-green-600', badge: 5 },
                    { icon: AlertCircle, label: 'Issues', path: '/issues', activeClass: 'text-red-600 bg-red-50 border-red-600' },
                ];
        }
    };

    const navItems = getNavItems(userData.role);

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

                {/* User Profile & Switcher - Inline Accordion */}
                <div className="mb-2 relative group/profile">
                    <button
                        onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                        className="w-full text-left p-1.5 rounded-[1.2rem] bg-white/60 border border-white shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 group-hover/profile:ring-2 ring-primary/10"
                    >
                        <div className="flex items-center gap-3 p-1.5">
                            <div className="relative">
                                {userData.avatar ? (
                                    <img src={userData.avatar} alt={userData.name} className="h-9 w-9 rounded-xl object-cover ring-2 ring-white" />
                                ) : (
                                    <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${userData.role === 'Admin' ? 'from-red-500 to-orange-600' :
                                        userData.role === 'Vendor' ? 'from-pink-500 to-rose-600' :
                                            'from-indigo-600 to-violet-600'
                                        } flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-white`}>
                                        {getInitials(userData.name)}
                                    </div>
                                )}
                                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {userData.name}
                                </p>
                                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                                    {userData.role}
                                    <span className="text-gray-300">|</span>
                                    <span className="text-primary hover:underline flex items-center gap-0.5">Switch <Repeat size={8} /></span>
                                </div>
                            </div>
                            <ChevronRight size={14} className={`text-gray-400 transition-transform duration-300 ${isSwitcherOpen ? 'rotate-90' : ''}`} />
                        </div>
                    </button>

                    {/* Inline Menu */}
                    {isSwitcherOpen && (
                        <div className="mt-2 w-full bg-white/50 rounded-2xl border border-white/50 overflow-hidden animate-in slide-in-from-top-2 fade-in">
                            <div className="p-1.5 space-y-1">
                                <div className="px-3 py-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 mb-1">
                                    Select Workspace
                                </div>
                                {[
                                    { role: 'Student', icon: User, path: '/dashboard', color: 'text-indigo-600 bg-indigo-50' },
                                    { role: 'Vendor', icon: Store, path: '/vendor-dashboard', color: 'text-pink-600 bg-pink-50' },
                                    { role: 'Admin', icon: Shield, path: '/admin-dashboard', color: 'text-red-600 bg-red-50' }
                                ].map((profile) => (
                                    <button
                                        key={profile.role}
                                        onClick={() => {
                                            if (switchRole) switchRole(profile.role);
                                            navigate(profile.path);
                                            setIsSwitcherOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${userData.role === profile.role
                                            ? 'bg-white shadow-sm ring-1 ring-gray-100 text-gray-900'
                                            : 'hover:bg-white/60 text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className={`h-6 w-6 rounded-lg flex items-center justify-center ${profile.color}`}>
                                            <profile.icon size={12} />
                                        </div>
                                        <span className="flex-1 text-left">{profile.role}</span>
                                        {userData.role === profile.role && <div className="h-1.5 w-1.5 rounded-full bg-green-500" />}
                                    </button>
                                ))}
                                <NavLink to="/profile/me" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-white hover:text-primary transition-all mt-1">
                                    <Settings size={12} /> Account Settings
                                </NavLink>
                            </div>
                        </div>
                    )}
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
