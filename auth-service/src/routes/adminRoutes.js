// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin middleware - checks if user has ADMIN role and is in ADMIN mode
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    
    if (!req.user.roles?.includes('ADMIN') || req.user.activeRole !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }
    
    next();
};

/**
 * GET /admin/users
 * Get all users with pagination and filters
 * Query: page, limit, search, role, status
 */
router.get('/users', authMiddleware, adminMiddleware, adminController.getAllUsers);

/**
 * GET /admin/users/:id
 * Get user details by ID
 */
router.get('/users/:id', authMiddleware, adminMiddleware, adminController.getUserById);

/**
 * PUT /admin/users/:id/block
 * Update user block status
 * Body: { blocked: boolean, reason?: string }
 */
router.put('/users/:id/block', authMiddleware, adminMiddleware, adminController.updateUserBlockStatus);

/**
 * GET /admin/analytics/users
 * Get user analytics for admin dashboard
 * Query: timeRange (7d, 30d, 90d, all)
 */
router.get('/analytics/users', authMiddleware, adminMiddleware, adminController.getUserAnalytics);

module.exports = router;
