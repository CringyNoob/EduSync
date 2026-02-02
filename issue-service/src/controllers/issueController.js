// src/controllers/issueController.js
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new issue report
 * POST /issues
 */
const createIssue = async (req, res) => {
    try {
        const { title, location, category, priority, description, image_url } = req.body;
        const reporter_id = req.user.userId;

        // Validation
        if (!title || !location) {
            return res.status(400).json({
                success: false,
                message: 'Title and location are required'
            });
        }

        // Validate category
        const validCategories = ['Maintenance', 'IT/Network', 'Cleaning', 'Safety', 'Other'];
        const issueCategory = validCategories.includes(category) ? category : 'Other';

        // Validate priority
        const validPriorities = ['Low', 'Normal', 'High', 'Urgent'];
        const issuePriority = validPriorities.includes(priority) ? priority : 'Normal';

        const issueId = uuidv4();

        const result = await db.query(
            `INSERT INTO issues (id, reporter_id, title, location, category, priority, description, image_url, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING')
             RETURNING *`,
            [issueId, reporter_id, title, location, issueCategory, issuePriority, description || null, image_url || null]
        );

        const newIssue = result.rows[0];

        res.status(201).json({
            success: true,
            message: 'Issue reported successfully. It will be reviewed by an admin.',
            data: newIssue
        });

    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create issue',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get all issues
 * GET /issues
 * - Admin: Returns ALL issues (including PENDING, REJECTED)
 * - Student/Public: Returns only APPROVED or RESOLVED issues
 */
const getIssues = async (req, res) => {
    try {
        const { status, category, priority, sort = 'newest' } = req.query;
        const isAdmin = req.user?.activeRole === 'ADMIN';

        let whereConditions = [];
        const queryParams = [];
        let paramIndex = 1;

        // Non-admin users can only see APPROVED or RESOLVED issues
        if (!isAdmin) {
            whereConditions.push(`status IN ('APPROVED', 'RESOLVED')`);
        } else if (status) {
            // Admin can filter by specific status
            whereConditions.push(`status = $${paramIndex}`);
            queryParams.push(status.toUpperCase());
            paramIndex++;
        }

        // Filter by category
        if (category) {
            whereConditions.push(`category = $${paramIndex}`);
            queryParams.push(category);
            paramIndex++;
        }

        // Filter by priority
        if (priority) {
            whereConditions.push(`priority = $${paramIndex}`);
            queryParams.push(priority);
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0 
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        // Determine sort order
        let orderClause;
        switch (sort) {
            case 'popular':
                orderClause = 'ORDER BY upvotes DESC, created_at DESC';
                break;
            case 'oldest':
                orderClause = 'ORDER BY created_at ASC';
                break;
            case 'priority':
                orderClause = `ORDER BY CASE priority 
                    WHEN 'Urgent' THEN 1 
                    WHEN 'High' THEN 2 
                    WHEN 'Normal' THEN 3 
                    WHEN 'Low' THEN 4 
                    END, created_at DESC`;
                break;
            default:
                orderClause = 'ORDER BY created_at DESC';
        }

        // If user is logged in, include their vote status for each issue
        let query;
        if (req.user) {
            query = `
                SELECT 
                    i.*,
                    (i.upvotes - i.downvotes) as net_votes,
                    v.vote_type as user_vote
                FROM issues i
                LEFT JOIN votes v ON i.id = v.issue_id AND v.user_id = $${paramIndex}
                ${whereClause}
                ${orderClause}
            `;
            queryParams.push(req.user.userId);
        } else {
            query = `
                SELECT 
                    i.*,
                    (i.upvotes - i.downvotes) as net_votes
                FROM issues i
                ${whereClause}
                ${orderClause}
            `;
        }

        const result = await db.query(query, queryParams);

        res.status(200).json({
            success: true,
            message: 'Issues retrieved successfully',
            data: result.rows,
            meta: {
                total: result.rows.length,
                isAdmin: isAdmin
            }
        });

    } catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch issues',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get a single issue by ID
 * GET /issues/:id
 */
const getIssueById = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user?.activeRole === 'ADMIN';

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid issue ID format'
            });
        }

        const result = await db.query(
            `SELECT *, (upvotes - downvotes) as net_votes FROM issues WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        const issue = result.rows[0];

        // Non-admin users can only see APPROVED or RESOLVED issues
        if (!isAdmin && !['APPROVED', 'RESOLVED'].includes(issue.status)) {
            return res.status(403).json({
                success: false,
                message: 'This issue is not publicly available'
            });
        }

        // Get user's vote status if logged in
        let userVote = null;
        if (req.user) {
            const voteResult = await db.query(
                'SELECT vote_type FROM votes WHERE issue_id = $1 AND user_id = $2',
                [id, req.user.userId]
            );
            userVote = voteResult.rows[0]?.vote_type || null;
        }

        res.status(200).json({
            success: true,
            data: {
                ...issue,
                user_vote: userVote
            }
        });

    } catch (error) {
        console.error('Error fetching issue:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch issue',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Vote on an issue
 * POST /issues/:id/vote
 * Body: { voteType: 'UP' | 'DOWN' }
 * - Only APPROVED issues can be voted on
 * - PENDING and RESOLVED issues cannot be voted on
 */
const voteIssue = async (req, res) => {
    const client = await db.connect();
    
    try {
        const { id } = req.params;
        const { voteType } = req.body;
        const userId = req.user.userId;

        // Validate vote type
        if (!['UP', 'DOWN'].includes(voteType)) {
            return res.status(400).json({
                success: false,
                message: 'Vote type must be UP or DOWN'
            });
        }

        await client.query('BEGIN');

        // Check if issue exists and is APPROVED
        const issueResult = await client.query(
            'SELECT id, status, upvotes, downvotes FROM issues WHERE id = $1',
            [id]
        );

        if (issueResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        const issue = issueResult.rows[0];

        // Only APPROVED issues can be voted on
        if (issue.status !== 'APPROVED') {
            await client.query('ROLLBACK');
            return res.status(403).json({
                success: false,
                message: `Cannot vote on ${issue.status.toLowerCase()} issues. Only approved issues can receive votes.`
            });
        }

        // Check for existing vote
        const existingVote = await client.query(
            'SELECT id, vote_type FROM votes WHERE issue_id = $1 AND user_id = $2',
            [id, userId]
        );

        let responseMessage;
        let newUpvotes = issue.upvotes;
        let newDownvotes = issue.downvotes;

        if (existingVote.rows.length > 0) {
            const currentVote = existingVote.rows[0];
            
            if (currentVote.vote_type === voteType) {
                // Same vote - remove it (toggle off)
                await client.query(
                    'DELETE FROM votes WHERE id = $1',
                    [currentVote.id]
                );
                
                if (voteType === 'UP') {
                    newUpvotes--;
                } else {
                    newDownvotes--;
                }
                responseMessage = 'Vote removed';
            } else {
                // Different vote - change it
                await client.query(
                    'UPDATE votes SET vote_type = $1 WHERE id = $2',
                    [voteType, currentVote.id]
                );
                
                if (voteType === 'UP') {
                    newUpvotes++;
                    newDownvotes--;
                } else {
                    newUpvotes--;
                    newDownvotes++;
                }
                responseMessage = 'Vote changed';
            }
        } else {
            // New vote
            await client.query(
                'INSERT INTO votes (id, issue_id, user_id, vote_type) VALUES ($1, $2, $3, $4)',
                [uuidv4(), id, userId, voteType]
            );
            
            if (voteType === 'UP') {
                newUpvotes++;
            } else {
                newDownvotes++;
            }
            responseMessage = 'Vote recorded';
        }

        // Update issue vote counts
        await client.query(
            'UPDATE issues SET upvotes = $1, downvotes = $2 WHERE id = $3',
            [newUpvotes, newDownvotes, id]
        );

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: responseMessage,
            data: {
                upvotes: newUpvotes,
                downvotes: newDownvotes,
                net_votes: newUpvotes - newDownvotes
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error voting on issue:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to vote on issue',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Update issue status (Admin Only)
 * PATCH /issues/:id/status
 * Body: { status: 'APPROVED' | 'REJECTED' | 'RESOLVED', admin_notes?: string }
 */
const updateIssueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body;

        // Validate status
        const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'RESOLVED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Build update query
        let updateFields = ['status = $1', 'updated_at = NOW()'];
        let queryParams = [status];
        let paramIndex = 2;

        if (admin_notes !== undefined) {
            updateFields.push(`admin_notes = $${paramIndex}`);
            queryParams.push(admin_notes);
            paramIndex++;
        }

        // Set resolved_at if status is RESOLVED
        if (status === 'RESOLVED') {
            updateFields.push('resolved_at = NOW()');
        }

        queryParams.push(id);

        const result = await db.query(
            `UPDATE issues 
             SET ${updateFields.join(', ')}
             WHERE id = $${paramIndex}
             RETURNING *`,
            queryParams
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Issue status updated to ${status}`,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating issue status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update issue status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get voters for an issue (Admin Only)
 * GET /issues/:id/voters
 */
const getVoters = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if issue exists
        const issueResult = await db.query(
            'SELECT id, title FROM issues WHERE id = $1',
            [id]
        );

        if (issueResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        // Get all voters
        const votersResult = await db.query(
            `SELECT 
                v.user_id,
                v.vote_type,
                v.created_at
             FROM votes v
             WHERE v.issue_id = $1
             ORDER BY v.created_at DESC`,
            [id]
        );

        const upvoters = votersResult.rows.filter(v => v.vote_type === 'UP');
        const downvoters = votersResult.rows.filter(v => v.vote_type === 'DOWN');

        res.status(200).json({
            success: true,
            data: {
                issue_id: id,
                issue_title: issueResult.rows[0].title,
                total_upvotes: upvoters.length,
                total_downvotes: downvoters.length,
                upvoters: upvoters.map(v => ({ user_id: v.user_id, voted_at: v.created_at })),
                downvoters: downvoters.map(v => ({ user_id: v.user_id, voted_at: v.created_at }))
            }
        });

    } catch (error) {
        console.error('Error fetching voters:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch voters',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete an issue (Admin Only)
 * DELETE /issues/:id
 */
const deleteIssue = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM issues WHERE id = $1 RETURNING id, title',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Issue deleted successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error deleting issue:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete issue',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get user's reported issues
 * GET /issues/my-reports
 */
const getMyIssues = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await db.query(
            `SELECT *, (upvotes - downvotes) as net_votes 
             FROM issues 
             WHERE reporter_id = $1 
             ORDER BY created_at DESC`,
            [userId]
        );

        res.status(200).json({
            success: true,
            data: result.rows,
            meta: {
                total: result.rows.length
            }
        });

    } catch (error) {
        console.error('Error fetching user issues:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your issues',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get admin statistics
 * GET /admin/stats
 */
const getAdminStats = async (req, res) => {
    try {
        // Get issue counts by status
        const statusCounts = await db.query(`
            SELECT 
                COUNT(*) FILTER (WHERE status = 'PENDING') as pending_issues,
                COUNT(*) FILTER (WHERE status = 'APPROVED') as approved_issues,
                COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected_issues,
                COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved_issues,
                COUNT(*) as total_issues
            FROM issues
        `);

        // Get category breakdown
        const categoryCounts = await db.query(`
            SELECT category, COUNT(*) as count
            FROM issues
            GROUP BY category
            ORDER BY count DESC
        `);

        // Get priority breakdown
        const priorityCounts = await db.query(`
            SELECT priority, COUNT(*) as count
            FROM issues
            WHERE status IN ('PENDING', 'APPROVED')
            GROUP BY priority
            ORDER BY CASE priority 
                WHEN 'Urgent' THEN 1 
                WHEN 'High' THEN 2 
                WHEN 'Normal' THEN 3 
                WHEN 'Low' THEN 4 
            END
        `);

        // Get recent issues count (last 7 days)
        const recentIssues = await db.query(`
            SELECT COUNT(*) as count
            FROM issues
            WHERE created_at >= NOW() - INTERVAL '7 days'
        `);

        const stats = statusCounts.rows[0];

        res.status(200).json({
            success: true,
            data: {
                pending_issues: parseInt(stats.pending_issues) || 0,
                approved_issues: parseInt(stats.approved_issues) || 0,
                rejected_issues: parseInt(stats.rejected_issues) || 0,
                resolved_issues: parseInt(stats.resolved_issues) || 0,
                total_issues: parseInt(stats.total_issues) || 0,
                recent_issues_7d: parseInt(recentIssues.rows[0]?.count) || 0,
                by_category: categoryCounts.rows,
                by_priority: priorityCounts.rows
            }
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    createIssue,
    getIssues,
    getIssueById,
    voteIssue,
    updateIssueStatus,
    getVoters,
    deleteIssue,
    getMyIssues,
    getAdminStats
};
