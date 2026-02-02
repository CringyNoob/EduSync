import api from '../utils/api';

/**
 * Issue Service - All issue reporting related API calls
 */
const issueService = {
    /**
     * Get all issues (filtered by role on backend)
     * @param {Object} params - Query parameters
     * @returns {Promise} Response with issues list
     */
    getIssues: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/issues/issues${queryString ? `?${queryString}` : ''}`);
        return response.data;
    },

    /**
     * Get a single issue by ID
     * @param {string} id - Issue ID
     * @returns {Promise} Response with issue details
     */
    getIssueById: async (id) => {
        const response = await api.get(`/issues/issues/${id}`);
        return response.data;
    },

    /**
     * Create a new issue report
     * @param {Object} issueData - Issue data
     * @returns {Promise} Response with created issue
     */
    createIssue: async (issueData) => {
        const response = await api.post('/issues/issues', issueData);
        return response.data;
    },

    /**
     * Vote on an issue
     * @param {string} id - Issue ID
     * @param {string} voteType - 'UP' or 'DOWN'
     * @returns {Promise} Response with updated vote counts
     */
    voteIssue: async (id, voteType) => {
        const response = await api.post(`/issues/issues/${id}/vote`, { voteType });
        return response.data;
    },

    /**
     * Get current user's reported issues
     * @returns {Promise} Response with user's issues
     */
    getMyIssues: async () => {
        const response = await api.get('/issues/issues/my-reports');
        return response.data;
    },

    /**
     * Update issue status (Admin only)
     * @param {string} id - Issue ID
     * @param {string} status - New status
     * @param {string} adminNotes - Optional admin notes
     * @returns {Promise} Response with updated issue
     */
    updateIssueStatus: async (id, status, adminNotes) => {
        const response = await api.patch(`/issues/issues/${id}/status`, { 
            status, 
            admin_notes: adminNotes 
        });
        return response.data;
    },

    /**
     * Get voters for an issue (Admin only)
     * @param {string} id - Issue ID
     * @returns {Promise} Response with voters list
     */
    getVoters: async (id) => {
        const response = await api.get(`/issues/issues/${id}/voters`);
        return response.data;
    },

    /**
     * Delete an issue (Admin only)
     * @param {string} id - Issue ID
     * @returns {Promise} Response with deletion confirmation
     */
    deleteIssue: async (id) => {
        const response = await api.delete(`/issues/issues/${id}`);
        return response.data;
    },

    /**
     * Get admin statistics
     * @returns {Promise} Response with issue statistics
     */
    getAdminStats: async () => {
        const response = await api.get('/issues/admin/stats');
        return response.data;
    },
};

export default issueService;
