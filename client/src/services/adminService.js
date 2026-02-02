import api from '../utils/api';

/**
 * Admin Service - All admin-related API calls
 */
const adminService = {
    // ==================== USER MANAGEMENT ====================
    
    /**
     * Get all users (Admin only)
     * @param {Object} params - Query parameters (page, limit, search, role, status)
     * @returns {Promise} Response with users list
     */
    getAllUsers: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/auth/admin/users${queryString ? `?${queryString}` : ''}`);
        return response.data;
    },

    /**
     * Get user by ID (Admin only)
     * @param {string} userId - User ID
     * @returns {Promise} Response with user details
     */
    getUserById: async (userId) => {
        const response = await api.get(`/auth/admin/users/${userId}`);
        return response.data;
    },

    /**
     * Block/Unblock a user (Admin only)
     * @param {string} userId - User ID
     * @param {boolean} blocked - Block status
     * @param {string} reason - Reason for blocking
     * @returns {Promise} Response with updated user
     */
    updateUserBlockStatus: async (userId, blocked, reason = '') => {
        const response = await api.put(`/auth/admin/users/${userId}/block`, { 
            blocked, 
            reason 
        });
        return response.data;
    },

    /**
     * Get user statistics (Admin only)
     * @returns {Promise} Response with user stats
     */
    getUserStats: async () => {
        const response = await api.get('/auth/admin/stats');
        return response.data;
    },

    // ==================== VENDOR MANAGEMENT ====================
    
    /**
     * Get all vendors (Admin only)
     * @param {Object} params - Query parameters (page, limit, search, type, status)
     * @returns {Promise} Response with vendors list
     */
    getAllVendors: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/market/admin/vendors${queryString ? `?${queryString}` : ''}`);
        return response.data;
    },

    /**
     * Get vendor by ID with products (Admin only)
     * @param {string} vendorId - Vendor ID
     * @returns {Promise} Response with vendor details
     */
    getVendorById: async (vendorId) => {
        const response = await api.get(`/market/admin/vendors/${vendorId}`);
        return response.data;
    },

    /**
     * Update vendor status (Admin only)
     * @param {string} vendorId - Vendor ID
     * @param {string} status - New status (ACTIVE, INACTIVE, BLOCKED)
     * @param {string} reason - Reason for status change
     * @returns {Promise} Response with updated vendor
     */
    updateVendorStatus: async (vendorId, status, reason = '') => {
        const response = await api.patch(`/market/admin/vendors/${vendorId}/status`, { 
            status, 
            reason 
        });
        return response.data;
    },

    /**
     * Delete a vendor (Admin only)
     * @param {string} vendorId - Vendor ID
     * @returns {Promise} Response with deletion confirmation
     */
    deleteVendor: async (vendorId) => {
        const response = await api.delete(`/market/admin/vendors/${vendorId}`);
        return response.data;
    },

    /**
     * Get vendor's products (Admin only)
     * @param {string} vendorId - Vendor ID
     * @returns {Promise} Response with vendor's products
     */
    getVendorProducts: async (vendorId) => {
        const response = await api.get(`/market/admin/vendors/${vendorId}/products`);
        return response.data;
    },

    /**
     * Delete a product (Admin only)
     * @param {string} productId - Product ID
     * @returns {Promise} Response with deletion confirmation
     */
    deleteProduct: async (productId) => {
        const response = await api.delete(`/market/admin/products/${productId}`);
        return response.data;
    },

    /**
     * Get vendor statistics (Admin only)
     * @returns {Promise} Response with vendor stats
     */
    getVendorStats: async () => {
        const response = await api.get('/market/admin/stats');
        return response.data;
    },

    // ==================== NEWS MANAGEMENT ====================
    
    /**
     * Get all posts (Admin only)
     * @param {Object} params - Query parameters (page, limit, search, category)
     * @returns {Promise} Response with posts list
     */
    getAllPosts: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/newsbox/admin/posts${queryString ? `?${queryString}` : ''}`);
        return response.data;
    },

    /**
     * Get all categories (for announcement creation)
     * @returns {Promise} Response with categories list
     */
    getCategories: async () => {
        const response = await api.get('/newsbox/categories');
        return response.data;
    },

    /**
     * Create an announcement (Admin only)
     * @param {Object} postData - Announcement data (title, description, category_id, images)
     * @returns {Promise} Response with created post
     */
    createAnnouncement: async (postData) => {
        const response = await api.post('/newsbox/admin/announcements', postData);
        return response.data;
    },

    /**
     * Delete a post (Admin only)
     * @param {string} postId - Post ID
     * @returns {Promise} Response with deletion confirmation
     */
    deletePost: async (postId) => {
        const response = await api.delete(`/newsbox/admin/posts/${postId}`);
        return response.data;
    },

    /**
     * Get comments for a post (Admin only)
     * @param {string} postId - Post ID
     * @returns {Promise} Response with comments list
     */
    getPostComments: async (postId) => {
        const response = await api.get(`/newsbox/admin/posts/${postId}/comments`);
        return response.data;
    },

    /**
     * Delete a comment (Admin only)
     * @param {string} commentId - Comment ID
     * @returns {Promise} Response with deletion confirmation
     */
    deleteComment: async (commentId) => {
        const response = await api.delete(`/newsbox/admin/comments/${commentId}`);
        return response.data;
    },

    /**
     * Get news statistics (Admin only)
     * @returns {Promise} Response with news stats
     */
    getNewsStats: async () => {
        const response = await api.get('/newsbox/admin/stats');
        return response.data;
    },

    // ==================== PLATFORM ANALYTICS ====================
    
    /**
     * Get platform-wide analytics (Admin only)
     * @param {Object} params - Query parameters (period: 'day', 'week', 'month', 'year')
     * @returns {Promise} Response with analytics data
     */
    getPlatformAnalytics: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/auth/admin/analytics${queryString ? `?${queryString}` : ''}`);
        return response.data;
    },

    /**
     * Get issue statistics (Admin only)
     * @returns {Promise} Response with issue stats
     */
    getIssueStats: async () => {
        const response = await api.get('/issues/admin/stats');
        return response.data;
    },

    /**
     * Get RentHub statistics (Admin only)
     * @returns {Promise} Response with rental stats
     */
    getRentalStats: async () => {
        const response = await api.get('/renthub/admin/stats');
        return response.data;
    },

    // ==================== RENTHUB MANAGEMENT ====================
    
    /**
     * Get all rental listings (Admin only)
     * @param {Object} params - Query parameters (page, limit, search, category, status)
     * @returns {Promise} Response with rental listings
     */
    getAllRentals: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/renthub/admin/listings${queryString ? `?${queryString}` : ''}`);
        return response.data;
    },

    /**
     * Delete a rental listing (Admin only)
     * @param {string} listingId - Listing ID
     * @returns {Promise} Response with deletion confirmation
     */
    deleteRental: async (listingId) => {
        const response = await api.delete(`/renthub/admin/listings/${listingId}`);
        return response.data;
    },

    // ==================== ACTIVITY LOGS ====================
    
    /**
     * Get all activity logs with pagination (Admin only)
     * @param {Object} params - Query parameters (page, limit)
     * @returns {Promise} Response with activity logs
     */
    getActivityLogs: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/auth/admin/activities${queryString ? `?${queryString}` : ''}`);
        return response.data;
    },

    /**
     * Get recent 5 activities (Admin only)
     * @returns {Promise} Response with recent activities
     */
    getRecentActivities: async () => {
        const response = await api.get('/auth/admin/activities/recent');
        return response.data;
    },
};

export default adminService;
