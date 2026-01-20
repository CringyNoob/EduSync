// notices-service/src/routes/noticesRoutes.js
// API Routes for Notices Service

const express = require('express');
const router = express.Router();
const { getNoticesCache, getLatestNotices, refreshNotices } = require('../scraper/noticeScraper');

/**
 * GET /notices
 * Get all cached notices (from last 3 months)
 * Query params: ?limit=10 (optional)
 */
router.get('/notices', (req, res) => {
    try {
        const cache = getNoticesCache();
        const limit = parseInt(req.query.limit) || null;
        
        let notices = cache.notices;
        if (limit && limit > 0) {
            notices = notices.slice(0, limit);
        }
        
        res.json({
            success: true,
            count: notices.length,
            totalAvailable: cache.notices.length,
            lastScraped: cache.lastScraped,
            data: notices
        });
    } catch (error) {
        console.error('Error fetching notices:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch notices',
            message: error.message
        });
    }
});

/**
 * GET /notices/latest
 * Get latest 5 notices (for dashboard Attention section)
 */
router.get('/notices/latest', (req, res) => {
    try {
        const count = parseInt(req.query.count) || 5;
        const latestNotices = getLatestNotices(count);
        
        res.json({
            success: true,
            count: latestNotices.length,
            data: latestNotices
        });
    } catch (error) {
        console.error('Error fetching latest notices:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch latest notices',
            message: error.message
        });
    }
});

/**
 * POST /notices/refresh
 * Force re-scrape notices from UIU website
 */
router.post('/notices/refresh', async (req, res) => {
    try {
        console.log('Manual refresh requested...');
        const notices = await refreshNotices();
        
        res.json({
            success: true,
            message: 'Notices refreshed successfully',
            count: notices.length,
            data: notices
        });
    } catch (error) {
        console.error('Error refreshing notices:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to refresh notices',
            message: error.message
        });
    }
});

/**
 * GET /notices/:id
 * Get a specific notice by ID
 */
router.get('/notices/:id', (req, res) => {
    try {
        const cache = getNoticesCache();
        const notice = cache.notices.find(n => n.id === req.params.id);
        
        if (!notice) {
            return res.status(404).json({
                success: false,
                error: 'Notice not found'
            });
        }
        
        res.json({
            success: true,
            data: notice
        });
    } catch (error) {
        console.error('Error fetching notice:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch notice',
            message: error.message
        });
    }
});

module.exports = router;
