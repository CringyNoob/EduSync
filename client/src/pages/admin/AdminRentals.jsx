import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import Button from '../../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Cards/Card';
import {
    Home, ChevronLeft, Search, Filter, Eye, Trash2, AlertCircle,
    Loader2, Package, CheckCircle, XCircle, Clock, TrendingUp
} from 'lucide-react';

export default function AdminRentals() {
    const { user } = useAuth();
    const [rentals, setRentals] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedRental, setSelectedRental] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const isAdmin = user?.roles?.includes('ADMIN') && user?.activeRole === 'ADMIN';

    const categories = [
        'Books', 'Electronics', 'Sports Equipment', 'Musical Instruments',
        'Furniture', 'Tools', 'Clothing', 'Other'
    ];

    const fetchStats = useCallback(async () => {
        try {
            const response = await adminService.getRentalStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Error fetching rental stats:', err);
        }
    }, []);

    const fetchRentals = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            
            const params = {
                page: currentPage,
                limit: 15
            };

            if (searchTerm) params.search = searchTerm;
            if (statusFilter) params.status = statusFilter;
            if (categoryFilter) params.category = categoryFilter;

            const response = await adminService.getAllRentals(params);
            
            if (response.success) {
                setRentals(response.data || []);
                setTotalPages(response.totalPages || 1);
            }
        } catch (err) {
            console.error('Error fetching rentals:', err);
            setError('Failed to load rental listings');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, statusFilter, categoryFilter]);

    useEffect(() => {
        if (isAdmin) {
            fetchStats();
            fetchRentals();
        }
    }, [isAdmin, fetchStats, fetchRentals]);

    const handleDelete = async () => {
        if (!selectedRental) return;

        try {
            setDeleting(true);
            await adminService.deleteRental(selectedRental.id);
            
            setShowDeleteModal(false);
            setSelectedRental(null);
            fetchRentals();
            fetchStats();
        } catch (err) {
            console.error('Error deleting rental:', err);
            setError('Failed to delete rental listing');
        } finally {
            setDeleting(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchRentals();
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            AVAILABLE: { color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle },
            RENTED: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', icon: Clock },
            UNAVAILABLE: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400', icon: XCircle }
        };
        
        const config = statusConfig[status] || statusConfig.UNAVAILABLE;
        const Icon = config.icon;
        
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${config.color}`}>
                <Icon size={12} />
                {status}
            </span>
        );
    };

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
                    <p className="text-gray-500 dark:text-gray-400">You need admin privileges to access this page.</p>
                </div>
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
                            <Home size={24} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">RentHub Management</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 ml-16">
                        Manage all rental listings and transactions
                    </p>
                </div>
                <Button variant="outline" onClick={fetchRentals} disabled={loading}>
                    <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Package size={20} className="text-blue-600" />
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.listings?.total || 0}</p>
                            <p className="text-xs text-gray-500">Total Listings</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <CheckCircle size={20} className="text-green-600" />
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.listings?.available || 0}</p>
                            <p className="text-xs text-gray-500">Available</p>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Clock size={20} className="text-blue-600" />
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.listings?.rented || 0}</p>
                            <p className="text-xs text-gray-500">Rented</p>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingUp size={20} className="text-orange-600" />
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.transactions?.active || 0}</p>
                            <p className="text-xs text-gray-500">Active Rentals</p>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <CheckCircle size={20} className="text-green-600" />
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.transactions?.completed || 0}</p>
                            <p className="text-xs text-gray-500">Completed</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Search and Filters */}
            <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                <CardContent className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by title or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:outline-none"
                            />
                        </div>
                        
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="RENTED">Rented</option>
                            <option value="UNAVAILABLE">Unavailable</option>
                        </select>

                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:outline-none"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <Button type="submit" disabled={loading}>
                            <Filter size={18} />
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
            )}

            {/* Rentals Table */}
            <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>All Rental Listings ({rentals.length})</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && !rentals.length ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : rentals.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">No rental listings found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200 dark:border-gray-700">
                                    <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <th className="pb-3 px-2">Title</th>
                                        <th className="pb-3 px-2">Category</th>
                                        <th className="pb-3 px-2">Daily Price</th>
                                        <th className="pb-3 px-2">Status</th>
                                        <th className="pb-3 px-2">Owner</th>
                                        <th className="pb-3 px-2">Rentals</th>
                                        <th className="pb-3 px-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {rentals.map((rental) => (
                                        <tr key={rental.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="py-4 px-2">
                                                <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                                    {rental.title}
                                                </p>
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {rental.category}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className="font-bold text-primary">
                                                    ৳{rental.daily_price}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2">
                                                {getStatusBadge(rental.status)}
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {rental.owner_id?.substring(0, 8)}...
                                                </span>
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {rental.rental_count || 0}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRental(rental);
                                                            setShowDetailModal(true);
                                                        }}
                                                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} className="text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRental(rental);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} className="text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1 || loading}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || loading}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail Modal */}
            {showDetailModal && selectedRental && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rental Details</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Title</label>
                                <p className="text-gray-900 dark:text-white font-medium">{selectedRental.title}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Description</label>
                                <p className="text-gray-900 dark:text-white">{selectedRental.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Category</label>
                                    <p className="text-gray-900 dark:text-white">{selectedRental.category}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Daily Price</label>
                                    <p className="text-gray-900 dark:text-white font-bold">৳{selectedRental.daily_price}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Status</label>
                                    <div className="mt-1">{getStatusBadge(selectedRental.status)}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Owner ID</label>
                                    <p className="text-gray-900 dark:text-white text-xs">{selectedRental.owner_id}</p>
                                </div>
                            </div>
                            {selectedRental.images && selectedRental.images.length > 0 && (
                                <div>
                                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Images</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {selectedRental.images.map((img, idx) => (
                                            <img key={idx} src={img} alt={`Rental ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedRental && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Rental</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete "{selectedRental.title}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedRental(null);
                                }}
                                disabled={deleting}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
