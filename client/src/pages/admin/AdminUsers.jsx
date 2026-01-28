import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Users, Search, Filter, MoreVertical, Shield, ShieldOff,
    Eye, Loader2, AlertCircle, CheckCircle, XCircle,
    Mail, Calendar, Building, GraduationCap, RefreshCw,
    ChevronLeft, ChevronRight, User, Ban
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Cards/Card';
import Button from '../../components/Button';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 20;
    
    // Block modal
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [blockReason, setBlockReason] = useState('');
    
    // Stats
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        blockedUsers: 0,
        newToday: 0
    });

    // Check if user is admin - support multiple role formats
    const isAdmin = (user?.roles?.includes('ADMIN') && user?.activeRole === 'ADMIN') || 
                    user?.role === 'ADMIN' || 
                    user?.role === 'Admin';
    
    // Debug logging
    useEffect(() => {
        console.log('AdminUsers - Current user:', user);
        console.log('AdminUsers - Is admin?', isAdmin);
    }, [user, isAdmin]);

    const fetchUsers = useCallback(async () => {
        if (!isAdmin) return;
        
        try {
            setLoading(true);
            setError('');
            
            const params = {
                page: currentPage,
                limit: itemsPerPage
            };
            if (roleFilter) params.role = roleFilter;
            if (statusFilter) params.status = statusFilter;
            if (searchQuery) params.search = searchQuery;
            
            const response = await adminService.getAllUsers(params);
            
            if (response.success) {
                const usersData = response.data || [];
                setUsers(usersData);
                setFilteredUsers(usersData);
                setTotalPages(Math.ceil((response.total || usersData.length || 0) / itemsPerPage));
                
                // Calculate stats from response or calculate from user data
                if (response.stats) {
                    setStats(response.stats);
                } else {
                    // Calculate stats manually if not provided
                    const totalUsers = usersData.length;
                    const activeUsers = usersData.filter(u => !u.is_blocked).length;
                    const blockedUsers = usersData.filter(u => u.is_blocked).length;
                    const today = new Date().toDateString();
                    const newToday = usersData.filter(u => new Date(u.created_at).toDateString() === today).length;
                    
                    setStats({
                        totalUsers,
                        activeUsers,
                        blockedUsers,
                        newToday
                    });
                }
            } else {
                setError(response.message || 'Failed to load users');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [isAdmin, currentPage, roleFilter, statusFilter, searchQuery]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Filter users locally when search changes
    useEffect(() => {
        if (!searchQuery) {
            setFilteredUsers(users);
            return;
        }
        
        const query = searchQuery.toLowerCase();
        const filtered = users.filter(u => 
            u.full_name?.toLowerCase().includes(query) ||
            u.email?.toLowerCase().includes(query) ||
            u.student_id?.toLowerCase().includes(query) ||
            u.department?.toLowerCase().includes(query)
        );
        setFilteredUsers(filtered);
    }, [searchQuery, users]);

    const handleBlockUser = async () => {
        if (!selectedUser) return;
        
        try {
            setActionLoading(selectedUser.id);
            const newBlockedStatus = !selectedUser.is_blocked;
            
            const response = await adminService.updateUserBlockStatus(
                selectedUser.id,
                newBlockedStatus,
                blockReason
            );
            
            if (response.success) {
                setUsers(prev => prev.map(u => 
                    u.id === selectedUser.id 
                        ? { ...u, is_blocked: newBlockedStatus }
                        : u
                ));
                setShowBlockModal(false);
                setSelectedUser(null);
                setBlockReason('');
            }
        } catch (err) {
            console.error('Error updating user block status:', err);
            setError(err.response?.data?.message || 'Failed to update user status');
        } finally {
            setActionLoading(null);
        }
    };

    const openBlockModal = (userToBlock) => {
        setSelectedUser(userToBlock);
        setBlockReason('');
        setShowBlockModal(true);
    };

    const getRoleBadge = (roles) => {
        if (!roles || roles.length === 0) return null;
        
        const roleConfig = {
            ADMIN: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Shield },
            VENDOR: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Building },
            STUDENT: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: GraduationCap }
        };
        
        return roles.map(role => {
            const config = roleConfig[role] || { color: 'bg-gray-100 text-gray-700', icon: User };
            const Icon = config.icon;
            return (
                <span key={role} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${config.color}`}>
                    <Icon size={10} />
                    {role}
                </span>
            );
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
                    <p className="text-gray-500 dark:text-gray-400">You need admin privileges to access this page.</p>
                    <Button onClick={() => navigate('/admin-dashboard')} className="mt-4">
                        Go to Admin Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Link to="/admin-dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                            <ChevronLeft className="h-5 w-5 text-gray-500" />
                        </Link>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                            <Users size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">User Management</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 ml-16">
                        Manage all platform users, view profiles, and handle user access
                    </p>
                </div>
                <Button variant="outline" onClick={fetchUsers} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <Users size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalUsers}</p>
                                <p className="text-xs text-gray-500">Total Users</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <CheckCircle size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.activeUsers}</p>
                                <p className="text-xs text-gray-500">Active Users</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <Ban size={20} className="text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.blockedUsers}</p>
                                <p className="text-xs text-gray-500">Blocked</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                <Calendar size={20} className="text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.newToday}</p>
                                <p className="text-xs text-gray-500">New Today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filters */}
            <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search by name, email, student ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-primary focus:outline-none transition-all font-medium text-gray-900 dark:text-white"
                            />
                        </div>
                        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </div>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Role</label>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:outline-none font-medium"
                                >
                                    <option value="">All Roles</option>
                                    <option value="STUDENT">Student</option>
                                    <option value="VENDOR">Vendor</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:outline-none font-medium"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* Users Table */}
            <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">No users found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Link to={`/profile/${u.id}`} className="shrink-0">
                                                    {u.avatar_url ? (
                                                        <img
                                                            src={u.avatar_url}
                                                            alt={u.full_name}
                                                            className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold">
                                                            {u.full_name?.charAt(0) || 'U'}
                                                        </div>
                                                    )}
                                                </Link>
                                                <div>
                                                    <Link 
                                                        to={`/profile/${u.id}`}
                                                        className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors"
                                                    >
                                                        {u.full_name || 'Unknown User'}
                                                    </Link>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {getRoleBadge(u.roles || ['STUDENT'])}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-600 dark:text-gray-300 font-medium">
                                                {u.department || 'Not specified'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                {formatDate(u.created_at)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.is_blocked ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                    <XCircle size={12} />
                                                    Blocked
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    <CheckCircle size={12} />
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/profile/${u.id}`}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="View Profile"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => openBlockModal(u)}
                                                    disabled={actionLoading === u.id}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        u.is_blocked
                                                            ? 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30'
                                                            : 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30'
                                                    }`}
                                                    title={u.is_blocked ? 'Unblock User' : 'Block User'}
                                                >
                                                    {actionLoading === u.id ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : u.is_blocked ? (
                                                        <ShieldOff size={18} />
                                                    ) : (
                                                        <Ban size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Block/Unblock Modal */}
            {showBlockModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            {selectedUser.is_blocked ? (
                                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                                    <ShieldOff className="h-6 w-6 text-green-600" />
                                </div>
                            ) : (
                                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                                    <Ban className="h-6 w-6 text-red-600" />
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {selectedUser.is_blocked ? 'Unblock User' : 'Block User'}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {selectedUser.full_name}
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {selectedUser.is_blocked
                                ? 'This will restore the user\'s access to the platform.'
                                : 'This will prevent the user from accessing the platform.'}
                        </p>

                        {!selectedUser.is_blocked && (
                            <div className="mb-4">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                                    Reason for blocking (optional)
                                </label>
                                <textarea
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    placeholder="Enter reason..."
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:outline-none resize-none"
                                    rows={3}
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setShowBlockModal(false);
                                    setSelectedUser(null);
                                    setBlockReason('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className={`flex-1 ${selectedUser.is_blocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                onClick={handleBlockUser}
                                disabled={actionLoading === selectedUser.id}
                            >
                                {actionLoading === selectedUser.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                {selectedUser.is_blocked ? 'Unblock' : 'Block'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
