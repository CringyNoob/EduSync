import api from '../utils/api';

/**
 * NewsBox Service - All newsbox related API calls
 */
const newsboxService = {
    // ==================== CATEGORIES ====================

    /**
     * Get all categories
     * @returns {Promise} Response with categories array
     */
    getCategories: async () => {
        const response = await api.get('/newsbox/categories');
        return response.data;
    },

    /**
     * Get a single category by ID
     * @param {string} id - Category UUID
     * @returns {Promise} Response with category data
     */
    getCategoryById: async (id) => {
        const response = await api.get(`/newsbox/categories/${id}`);
        return response.data;
    },

    /**
     * Create a new category (Admin only)
     * @param {string} name - Category name
     * @returns {Promise} Response with created category
     */
    createCategory: async (name) => {
        const response = await api.post('/newsbox/categories', { name });
        return response.data;
    },

    /**
     * Update a category (Admin only)
     * @param {string} id - Category UUID
     * @param {string} name - New category name
     * @returns {Promise} Response with updated category
     */
    updateCategory: async (id, name) => {
        const response = await api.put(`/newsbox/categories/${id}`, { name });
        return response.data;
    },

    /**
     * Delete a category (Admin only)
     * @param {string} id - Category UUID
     * @returns {Promise} Response with success message
     */
    deleteCategory: async (id) => {
        const response = await api.delete(`/newsbox/categories/${id}`);
        return response.data;
    },

    // ==================== POSTS ====================

    /**
     * Get all posts with optional filtering
     * @param {Object} params - Query parameters
     * @param {string} [params.category_id] - Filter by category UUID
     * @param {string} [params.sort] - Sort order: 'newest', 'popular', 'oldest'
     * @param {string} [params.status] - Filter by status: 'PENDING', 'APPROVED', 'REJECTED'
     * @returns {Promise} Response with posts array
     */
    getPosts: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.category_id) queryParams.append('category_id', params.category_id);
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.status) queryParams.append('status', params.status);
        
        const queryString = queryParams.toString();
        const url = `/newsbox/posts${queryString ? `?${queryString}` : ''}`;
        const response = await api.get(url);
        return response.data;
    },

    /**
     * Get a single post by ID (includes comments)
     * @param {string} id - Post UUID
     * @returns {Promise} Response with post data and comments
     */
    getPostById: async (id) => {
        const response = await api.get(`/newsbox/posts/${id}`);
        return response.data;
    },

    /**
     * Create a new post
     * @param {Object} postData - Post data
     * @param {string} postData.title - Post title
     * @param {string} postData.description - Post content/description
     * @param {string} postData.category_id - Category UUID
     * @param {string[]} [postData.images] - Array of image URLs
     * @param {boolean} [postData.is_official] - Mark as official (Admin only)
     * @returns {Promise} Response with created post
     */
    createPost: async (postData) => {
        const response = await api.post('/newsbox/posts', postData);
        return response.data;
    },

    /**
     * Update a post
     * @param {string} id - Post UUID
     * @param {Object} postData - Fields to update
     * @returns {Promise} Response with updated post
     */
    updatePost: async (id, postData) => {
        const response = await api.put(`/newsbox/posts/${id}`, postData);
        return response.data;
    },

    /**
     * Delete a post
     * @param {string} id - Post UUID
     * @returns {Promise} Response with success message
     */
    deletePost: async (id) => {
        const response = await api.delete(`/newsbox/posts/${id}`);
        return response.data;
    },

    /**
     * Get all posts by a specific user
     * @param {string} userId - User UUID
     * @returns {Promise} Response with posts array
     */
    getPostsByUser: async (userId) => {
        const response = await api.get(`/newsbox/posts/user/${userId}`);
        return response.data;
    },

    // ==================== ADMIN POST MANAGEMENT ====================

    /**
     * Get pending posts for moderation (Admin only)
     * @returns {Promise} Response with pending posts array
     */
    getPendingPosts: async () => {
        const response = await api.get('/newsbox/posts/admin/pending');
        return response.data;
    },

    /**
     * Update post status (Admin only)
     * @param {string} id - Post UUID
     * @param {string} status - New status: 'PENDING', 'APPROVED', 'REJECTED'
     * @returns {Promise} Response with updated post
     */
    updatePostStatus: async (id, status) => {
        const response = await api.patch(`/newsbox/posts/${id}/status`, { status });
        return response.data;
    },

    /**
     * Toggle pin status of a post (Admin only)
     * @param {string} id - Post UUID
     * @returns {Promise} Response with updated post
     */
    togglePinPost: async (id) => {
        const response = await api.patch(`/newsbox/posts/${id}/pin`);
        return response.data;
    },

    // ==================== VOTING ====================

    /**
     * Vote on a post
     * @param {string} postId - Post UUID
     * @param {string} voteType - Vote type: 'UP' or 'DOWN'
     * @returns {Promise} Response with vote result
     */
    votePost: async (postId, voteType) => {
        const response = await api.post(`/newsbox/posts/${postId}/vote`, { vote_type: voteType });
        return response.data;
    },

    /**
     * Get user's vote status for a post
     * @param {string} postId - Post UUID
     * @returns {Promise} Response with vote status
     */
    getPostVoteStatus: async (postId) => {
        const response = await api.get(`/newsbox/posts/${postId}/vote-status`);
        return response.data;
    },

    /**
     * Vote on a comment
     * @param {string} commentId - Comment UUID
     * @param {string} voteType - Vote type: 'UP' or 'DOWN'
     * @returns {Promise} Response with vote result
     */
    voteComment: async (commentId, voteType) => {
        const response = await api.post(`/newsbox/comments/${commentId}/vote`, { vote_type: voteType });
        return response.data;
    },

    // ==================== COMMENTS ====================

    /**
     * Add a comment to a post
     * @param {string} postId - Post UUID
     * @param {string} content - Comment content
     * @returns {Promise} Response with created comment
     */
    addComment: async (postId, content) => {
        const response = await api.post(`/newsbox/posts/${postId}/comments`, { content });
        return response.data;
    },

    /**
     * Get all comments for a post
     * @param {string} postId - Post UUID
     * @returns {Promise} Response with comments array
     */
    getComments: async (postId) => {
        const response = await api.get(`/newsbox/posts/${postId}/comments`);
        return response.data;
    },

    /**
     * Delete a comment
     * @param {string} commentId - Comment UUID
     * @returns {Promise} Response with success message
     */
    deleteComment: async (commentId) => {
        const response = await api.delete(`/newsbox/comments/${commentId}`);
        return response.data;
    },

    // ==================== UTILITY ====================

    /**
     * Get newsbox service health status
     * @returns {Promise} Response with health status
     */
    getHealth: async () => {
        const response = await api.get('/newsbox/health');
        return response.data;
    },

    /**
     * Get newsbox service info
     * @returns {Promise} Response with service info and endpoints
     */
    getInfo: async () => {
        const response = await api.get('/newsbox/info');
        return response.data;
    }
};

export default newsboxService;
