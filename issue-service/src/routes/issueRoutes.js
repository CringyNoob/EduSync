// src/routes/issueRoutes.js
const express = require('express');
const router = express.Router();

// Import middleware
const { authMiddleware, optionalAuthMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Import controllers
const {
    createIssue,
    getIssues,
    getIssueById,
    voteIssue,
    updateIssueStatus,
    getVoters,
    deleteIssue,
    getMyIssues,
    getAdminStats
} = require('../controllers/issueController');

// ==================== HEALTH CHECK ====================
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        service: 'issue-service',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// ==================== INFO ENDPOINT ====================
router.get('/info', (req, res) => {
    res.status(200).json({
        success: true,
        service: 'Issue Reporting Service',
        version: '1.0.0',
        description: 'Campus Issue Reporting and Tracking System',
        endpoints: {
            issues: {
                'POST /issues': 'Report a new issue (Auth required)',
                'GET /issues': 'Get all issues (filtered by role)',
                'GET /issues/:id': 'Get issue by ID',
                'POST /issues/:id/vote': 'Vote on an issue (Auth required)',
                'GET /issues/my-reports': 'Get current user\'s reported issues'
            },
            admin: {
                'PATCH /issues/:id/status': 'Update issue status (Admin only)',
                'GET /issues/:id/voters': 'Get voters for an issue (Admin only)',
                'DELETE /issues/:id': 'Delete an issue (Admin only)',
                'GET /admin/stats': 'Get admin statistics (Admin only)'
            }
        }
    });
});

// ==================== PUBLIC/USER ROUTES ====================

// Get all issues (filtered based on user role)
// GET /issues?status=APPROVED&category=Maintenance&priority=High&sort=popular
router.get('/issues', optionalAuthMiddleware, getIssues);

// Get current user's reported issues
// GET /issues/my-reports
router.get('/issues/my-reports', authMiddleware, getMyIssues);

// Get a single issue by ID
// GET /issues/:id
router.get('/issues/:id', optionalAuthMiddleware, getIssueById);

// Create a new issue report (Auth required)
// POST /issues
// Body: { title, location, category, priority, description, image_url }
router.post('/issues', authMiddleware, createIssue);

// Vote on an issue (Auth required)
// POST /issues/:id/vote
// Body: { voteType: 'UP' | 'DOWN' }
router.post('/issues/:id/vote', authMiddleware, voteIssue);

// ==================== ADMIN ROUTES ====================

// Get admin statistics
// GET /admin/stats
router.get('/admin/stats', authMiddleware, adminMiddleware, getAdminStats);

// Update issue status (Admin only)
// PATCH /issues/:id/status
// Body: { status: 'APPROVED' | 'REJECTED' | 'RESOLVED', admin_notes?: string }
router.patch('/issues/:id/status', authMiddleware, adminMiddleware, updateIssueStatus);

// Get voters for an issue (Admin only)
// GET /issues/:id/voters
router.get('/issues/:id/voters', authMiddleware, adminMiddleware, getVoters);

// Delete an issue (Admin only)
// DELETE /issues/:id
router.delete('/issues/:id', authMiddleware, adminMiddleware, deleteIssue);

module.exports = router;
