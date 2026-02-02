// src/controllers/adminController.js
const db = require('../config/db');

/**
 * Get all users with pagination and filters
 * GET /admin/users
 */
async function getAllUsers(req, res) {
    try {
        const { page = 1, limit = 20, search, role, status } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        let query = `
            SELECT 
                u.id, u.email, u.roles, u.active_role, u.is_verified, u.is_blocked, 
                u.created_at, u.updated_at,
                p.full_name, p.student_id, p.department, p.batch, p.phone, p.avatar_url, p.bio
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;
        
        if (search) {
            query += ` AND (p.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR p.student_id ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        if (role) {
            query += ` AND $${paramIndex} = ANY(u.roles)`;
            params.push(role);
            paramIndex++;
        }
        
        if (status === 'blocked') {
            query += ` AND u.is_blocked = true`;
        } else if (status === 'active') {
            query += ` AND (u.is_blocked = false OR u.is_blocked IS NULL)`;
        }
        
        // Get total count
        const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) FROM');
        const countResult = await db.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);
        
        // Add pagination
        query += ` ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), offset);
        
        const result = await db.query(query, params);
        
        return res.status(200).json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
        
    } catch (error) {
        console.error('❌ Error in getAllUsers:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
}

/**
 * Get user details by ID
 * GET /admin/users/:id
 */
async function getUserById(req, res) {
    try {
        const { id } = req.params;
        
        const result = await db.query(`
            SELECT 
                u.id, u.email, u.roles, u.active_role, u.is_verified, u.is_blocked,
                u.block_reason, u.blocked_at, u.blocked_by, u.created_at, u.updated_at,
                p.full_name, p.student_id, p.department, p.batch, p.phone, p.avatar_url, p.bio,
                p.email_visible, p.phone_visible
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('❌ Error in getUserById:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch user'
        });
    }
}

/**
 * Update user block status
 * PUT /admin/users/:id/block
 * Body: { blocked: boolean, reason?: string }
 */
async function updateUserBlockStatus(req, res) {
    try {
        const { id } = req.params;
        const { blocked, reason } = req.body;
        const adminId = req.user.id;
        
        // Check if user exists
        const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [id]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Update block status
        if (blocked) {
            await db.query(`
                UPDATE users 
                SET is_blocked = true, block_reason = $2, blocked_at = NOW(), blocked_by = $3, updated_at = NOW()
                WHERE id = $1
            `, [id, reason || 'Blocked by admin', adminId]);
        } else {
            await db.query(`
                UPDATE users 
                SET is_blocked = false, block_reason = NULL, blocked_at = NULL, blocked_by = NULL, updated_at = NOW()
                WHERE id = $1
            `, [id]);
        }
        
        return res.status(200).json({
            success: true,
            message: blocked ? 'User blocked successfully' : 'User unblocked successfully'
        });
        
    } catch (error) {
        console.error('❌ Error in updateUserBlockStatus:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update user status'
        });
    }
}

/**
 * Get admin analytics for users
 * GET /admin/analytics/users
 */
async function getUserAnalytics(req, res) {
    try {
        const { timeRange = '7d' } = req.query;
        
        let interval = '7 days';
        if (timeRange === '30d') interval = '30 days';
        else if (timeRange === '90d') interval = '90 days';
        else if (timeRange === 'all') interval = '1000 years';
        
        const stats = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE is_blocked = false OR is_blocked IS NULL) as active,
                COUNT(*) FILTER (WHERE is_blocked = true) as blocked,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_this_week,
                COUNT(*) FILTER (WHERE is_verified = true) as verified
            FROM users
        `);
        
        // Growth calculation
        const previousPeriod = await db.query(`
            SELECT COUNT(*) as count
            FROM users
            WHERE created_at < NOW() - INTERVAL '${interval}'
            AND created_at >= NOW() - INTERVAL '${interval}' * 2
        `);
        
        const currentPeriod = await db.query(`
            SELECT COUNT(*) as count
            FROM users
            WHERE created_at >= NOW() - INTERVAL '${interval}'
        `);
        
        const prevCount = parseInt(previousPeriod.rows[0].count) || 1;
        const currCount = parseInt(currentPeriod.rows[0].count) || 0;
        const growth = Math.round(((currCount - prevCount) / prevCount) * 100);
        
        return res.status(200).json({
            success: true,
            data: {
                total: parseInt(stats.rows[0].total) || 0,
                active: parseInt(stats.rows[0].active) || 0,
                blocked: parseInt(stats.rows[0].blocked) || 0,
                newThisWeek: parseInt(stats.rows[0].new_this_week) || 0,
                verified: parseInt(stats.rows[0].verified) || 0,
                growth
            }
        });
        
    } catch (error) {
        console.error('❌ Error in getUserAnalytics:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch user analytics'
        });
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    updateUserBlockStatus,
    getUserAnalytics
};
