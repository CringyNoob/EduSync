import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Store, Search, Filter, MoreVertical, Shield, ShieldOff,
    Eye, Loader2, AlertCircle, CheckCircle, XCircle,
    Trash2, Package, RefreshCw, ChevronLeft, ChevronRight,
    User, Ban, PauseCircle, PlayCircle, Star, Coffee, Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Cards/Card';
import Button from '../../components/Button';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const AdminVendors = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [vendors, setVendors] = useState([]);
    const [filteredVendors, setFilteredVendors] = useState([]);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 20;
    
    // Modals
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showProductsModal, setShowProductsModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [vendorProducts, setVendorProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusReason, setStatusReason] = useState('');
    
    // Stats
    const [stats, setStats] = useState({
        totalVendors: 0,
        activeVendors: 0,
        inactiveVendors: 0,
        blockedVendors: 0
    });

    // Check if user is admin - support multiple role formats
    const isAdmin = (user?.roles?.includes('ADMIN') && user?.activeRole === 'ADMIN') || 
                    user?.role === 'ADMIN' || 
                    user?.role === 'Admin';
    
    // Debug logging
    useEffect(() => {
        console.log('AdminVendors - Current user:', user);
        console.log('AdminVendors - Is admin?', isAdmin);
    }, [user, isAdmin]);

    const fetchVendors = useCallback(async () => {
        if (!isAdmin) return;
        
        try {
            setLoading(true);
            setError('');
            
            const params = {
                page: currentPage,
                limit: itemsPerPage
            };
            if (typeFilter) params.type = typeFilter;
            if (statusFilter) params.status = statusFilter;
            if (searchQuery) params.search = searchQuery;
            
            const response = await adminService.getAllVendors(params);
            
            if (response.success) {
                const vendorsData = response.data || [];
                setVendors(vendorsData);
                setFilteredVendors(vendorsData);
                setTotalPages(Math.ceil((response.total || vendorsData.length || 0) / itemsPerPage));
                
                // Calculate stats from response or manually from vendor data
                if (response.stats) {
                    setStats(response.stats);
                } else {
                    // Calculate stats manually
                    const totalVendors = vendorsData.length;
                    const activeVendors = vendorsData.filter(v => v.status === 'ACTIVE' || v.status === 'APPROVED').length;
                    const inactiveVendors = vendorsData.filter(v => v.status === 'INACTIVE' || v.status === 'PENDING').length;
                    const blockedVendors = vendorsData.filter(v => v.status === 'BLOCKED' || v.status === 'REJECTED').length;
                    
                    setStats({
                        totalVendors,
                        activeVendors,
                        inactiveVendors,
                        blockedVendors
                    });
                }
            } else {
                setError(response.message || 'Failed to load vendors');
            }
        } catch (err) {
            console.error('Error fetching vendors:', err);
            setError(err.response?.data?.message || 'Failed to load vendors');
        } finally {
            setLoading(false);
        }
    }, [isAdmin, currentPage, typeFilter, statusFilter, searchQuery]);

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    // Local search filter
    useEffect(() => {
        if (!searchQuery) {
            setFilteredVendors(vendors);
            return;
        }
        
        const query = searchQuery.toLowerCase();
        const filtered = vendors.filter(v => 
            v.name?.toLowerCase().includes(query) ||
            v.owner_name?.toLowerCase().includes(query) ||
            v.description?.toLowerCase().includes(query)
        );
        setFilteredVendors(filtered);
    }, [searchQuery, vendors]);

    const fetchVendorProducts = async (vendorId) => {
        try {
            setProductsLoading(true);
            const response = await adminService.getVendorProducts(vendorId);
            if (response.success) {
                setVendorProducts(response.data || []);
            }
        } catch (err) {
            console.error('Error fetching vendor products:', err);
            setError('Failed to load vendor products');
        } finally {
            setProductsLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedVendor || !newStatus) return;
        
        try {
            setActionLoading(selectedVendor.id);
            
            const response = await adminService.updateVendorStatus(
                selectedVendor.id,
                newStatus,
                statusReason
            );
            
            if (response.success) {
                setVendors(prev => prev.map(v => 
                    v.id === selectedVendor.id 
                        ? { ...v, status: newStatus }
                        : v
                ));
                setShowStatusModal(false);
                setSelectedVendor(null);
                setNewStatus('');
                setStatusReason('');
            }
        } catch (err) {
            console.error('Error updating vendor status:', err);
            setError(err.response?.data?.message || 'Failed to update vendor status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteVendor = async () => {
        if (!selectedVendor) return;
        
        try {
            setActionLoading(selectedVendor.id);
            
            const response = await adminService.deleteVendor(selectedVendor.id);
            
            if (response.success) {
                setVendors(prev => prev.filter(v => v.id !== selectedVendor.id));
                setShowDeleteModal(false);
                setSelectedVendor(null);
            }
        } catch (err) {
            console.error('Error deleting vendor:', err);
            setError(err.response?.data?.message || 'Failed to delete vendor');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            setActionLoading(productId);
            
            const response = await adminService.deleteProduct(productId);
            
            if (response.success) {
                setVendorProducts(prev => prev.filter(p => p.id !== productId));
            }
        } catch (err) {
            console.error('Error deleting product:', err);
            setError(err.response?.data?.message || 'Failed to delete product');
        } finally {
            setActionLoading(null);
        }
    };

    const openStatusModal = (vendor, status) => {
        setSelectedVendor(vendor);
        setNewStatus(status);
        setStatusReason('');
        setShowStatusModal(true);
    };

    const openProductsModal = async (vendor) => {
        setSelectedVendor(vendor);
        setShowProductsModal(true);
        await fetchVendorProducts(vendor.id);
    };

    const getTypeBadge = (type) => {
        const typeConfig = {
            FOOD_VENDOR: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: Coffee, label: 'Food' },
            STARTUP: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Briefcase, label: 'Startup' }
        };
        
        const config = typeConfig[type] || { color: 'bg-gray-100 text-gray-700', icon: Store, label: type };
        const Icon = config.icon;
        
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${config.color}`}>
                <Icon size={10} />
                {config.label}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            ACTIVE: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
            INACTIVE: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: PauseCircle },
            BLOCKED: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Ban }
        };
        
        const config = statusConfig[status] || statusConfig.INACTIVE;
        const Icon = config.icon;
        
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${config.color}`}>
                <Icon size={12} />
                {status}
            </span>
        );
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

    if (loading && vendors.length === 0) {
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
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                            <Store size={24} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Vendor Management</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 ml-16">
                        Manage vendors, their products, and shop status
                    </p>
                </div>
                <Button variant="outline" onClick={fetchVendors} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                <Store size={20} className="text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalVendors}</p>
                                <p className="text-xs text-gray-500">Total Vendors</p>
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
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.activeVendors}</p>
                                <p className="text-xs text-gray-500">Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                                <PauseCircle size={20} className="text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.inactiveVendors}</p>
                                <p className="text-xs text-gray-500">Inactive</p>
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
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.blockedVendors}</p>
                                <p className="text-xs text-gray-500">Blocked</p>
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
                                placeholder="Search by vendor name, owner..."
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
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Type</label>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:outline-none font-medium"
                                >
                                    <option value="">All Types</option>
                                    <option value="FOOD_VENDOR">Food Vendor</option>
                                    <option value="STARTUP">Startup</option>
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
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="BLOCKED">Blocked</option>
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

            {/* Vendors Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVendors.length === 0 ? (
                    <div className="col-span-full text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <Store className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No vendors found</p>
                    </div>
                ) : (
                    filteredVendors.map((vendor) => (
                        <Card key={vendor.id} className="border-gray-100 dark:border-gray-700 dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
                            {/* Cover Image */}
                            <div className="h-24 bg-gradient-to-r from-purple-500 to-blue-500 relative">
                                {vendor.cover_url && (
                                    <img src={vendor.cover_url} alt="" className="w-full h-full object-cover" />
                                )}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    {getTypeBadge(vendor.type)}
                                </div>
                            </div>
                            
                            <CardContent className="p-4 pt-0 -mt-8">
                                {/* Logo */}
                                <Link to={`/vendors/${vendor.id}`} className="block">
                                    <div className="w-16 h-16 rounded-xl bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-800 overflow-hidden shadow-lg mb-3">
                                        {vendor.logo_url ? (
                                            <img src={vendor.logo_url} alt={vendor.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                                                {vendor.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Info */}
                                <div className="mb-4">
                                    <Link to={`/vendors/${vendor.id}`} className="font-bold text-gray-900 dark:text-white hover:text-primary transition-colors">
                                        {vendor.name}
                                    </Link>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                        Owner: {vendor.owner_name || 'Unknown'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {getStatusBadge(vendor.status || 'ACTIVE')}
                                        <div className="flex items-center gap-1 text-yellow-500 text-sm">
                                            <Star size={14} fill="currentColor" />
                                            <span className="font-medium">{vendor.rating || '0.0'}</span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {vendor.product_count || 0} products
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate(`/vendors/${vendor.id}`)}
                                        className="flex-1"
                                    >
                                        <Eye size={16} className="mr-1" />
                                        View
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openProductsModal(vendor)}
                                        className="flex-1"
                                    >
                                        <Package size={16} className="mr-1" />
                                        Products
                                    </Button>
                                    <div className="relative group">
                                        <Button variant="ghost" size="sm" className="px-2">
                                            <MoreVertical size={16} />
                                        </Button>
                                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                            {vendor.status !== 'ACTIVE' && (
                                                <button
                                                    onClick={() => openStatusModal(vendor, 'ACTIVE')}
                                                    className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                                >
                                                    <PlayCircle size={16} />
                                                    Set Active
                                                </button>
                                            )}
                                            {vendor.status !== 'INACTIVE' && (
                                                <button
                                                    onClick={() => openStatusModal(vendor, 'INACTIVE')}
                                                    className="w-full px-4 py-2 text-left text-sm text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                                >
                                                    <PauseCircle size={16} />
                                                    Set Inactive
                                                </button>
                                            )}
                                            {vendor.status !== 'BLOCKED' && (
                                                <button
                                                    onClick={() => openStatusModal(vendor, 'BLOCKED')}
                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                                >
                                                    <Ban size={16} />
                                                    Block Vendor
                                                </button>
                                            )}
                                            <hr className="my-1 border-gray-100 dark:border-gray-700" />
                                            <button
                                                onClick={() => {
                                                    setSelectedVendor(vendor);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                            >
                                                <Trash2 size={16} />
                                                Delete Vendor
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}

            {/* Status Update Modal */}
            {showStatusModal && selectedVendor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Update Vendor Status
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Change <strong>{selectedVendor.name}</strong> status to <strong>{newStatus}</strong>?
                        </p>

                        <div className="mb-4">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                                Reason (optional)
                            </label>
                            <textarea
                                value={statusReason}
                                onChange={(e) => setStatusReason(e.target.value)}
                                placeholder="Enter reason for status change..."
                                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:outline-none resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setShowStatusModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleStatusUpdate}
                                disabled={actionLoading === selectedVendor.id}
                            >
                                {actionLoading === selectedVendor.id && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedVendor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Vendor</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedVendor.name}</p>
                            </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            This action cannot be undone. All products and data associated with this vendor will be permanently deleted.
                        </p>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                onClick={handleDeleteVendor}
                                disabled={actionLoading === selectedVendor.id}
                            >
                                {actionLoading === selectedVendor.id && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Modal */}
            {showProductsModal && selectedVendor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {selectedVendor.name}'s Products
                                    </h3>
                                    <p className="text-sm text-gray-500">{vendorProducts.length} products</p>
                                </div>
                                <button
                                    onClick={() => setShowProductsModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {productsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : vendorProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No products found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {vendorProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 shrink-0">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 dark:text-white truncate">{product.name}</h4>
                                                <p className="text-sm text-gray-500 truncate">{product.category}</p>
                                                <p className="text-sm font-bold text-primary">৳{product.price}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                disabled={actionLoading === product.id}
                                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                title="Delete Product"
                                            >
                                                {actionLoading === product.id ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={18} />
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVendors;
