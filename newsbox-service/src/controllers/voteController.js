const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Valid vote types
const VALID_VOTE_TYPES = ['UP', 'DOWN'];

/**
 * Vote on a post (upvote/downvote with toggle logic)
 * POST /posts/:id/vote
 * 
 * Logic:
 * 1. If vote exists with SAME type -> Remove vote (toggle off)
 * 2. If vote exists with DIFFERENT type -> Update vote (flip)
 * 3. If no vote exists -> Insert new vote
 */
const votePost = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id: post_id } = req.params;
        const { vote_type } = req.body;
        
        // Get user ID from authenticated user
        const user_id = req.user.userId;

        // --- Validation ---
        if (!vote_type) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: vote_type'
            });
        }

        const normalizedVoteType = vote_type.toUpperCase();
        if (!VALID_VOTE_TYPES.includes(normalizedVoteType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid vote_type. Must be UP or DOWN'
            });
        }

        // Validate UUID formats
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(post_id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid UUID format for post_id'
            });
        }

        // Start transaction
        await client.query('BEGIN');

        // Check if post exists
        const postCheck = await client.query('SELECT id FROM posts WHERE id = $1', [post_id]);
        if (postCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check for existing vote
        const existingVoteQuery = `
            SELECT id, vote_type FROM post_votes 
            WHERE user_id = $1 AND post_id = $2
        `;
        const existingVote = await client.query(existingVoteQuery, [user_id, post_id]);

        let action;

        if (existingVote.rows.length > 0) {
            const currentVote = existingVote.rows[0];
            
            if (currentVote.vote_type === normalizedVoteType) {
                // SAME vote type -> Toggle OFF (remove vote)
                await client.query(
                    'DELETE FROM post_votes WHERE id = $1',
                    [currentVote.id]
                );
                action = 'removed';
            } else {
                // DIFFERENT vote type -> Flip the vote
                await client.query(
                    'UPDATE post_votes SET vote_type = $1 WHERE id = $2',
                    [normalizedVoteType, currentVote.id]
                );
                action = 'flipped';
            }
        } else {
            // No existing vote -> Insert new vote
            const voteId = uuidv4();
            await client.query(
                `INSERT INTO post_votes (id, user_id, post_id, vote_type) 
                 VALUES ($1, $2, $3, $4)`,
                [voteId, user_id, post_id, normalizedVoteType]
            );
            action = 'added';
        }

        // Calculate new vote count
        const voteCountQuery = `
            SELECT COALESCE(
                SUM(CASE WHEN vote_type = 'UP' THEN 1 ELSE -1 END), 
                0
            )::INTEGER AS vote_count
            FROM post_votes 
            WHERE post_id = $1
        `;
        const voteCountResult = await client.query(voteCountQuery, [post_id]);
        const newVoteCount = voteCountResult.rows[0].vote_count;

        // Commit transaction
        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: `Vote ${action} successfully`,
            data: {
                post_id,
                user_id,
                action,
                vote_type: action === 'removed' ? null : normalizedVoteType,
                vote_count: newVoteCount
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error voting on post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process vote',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Vote on a comment (upvote/downvote with toggle logic)
 * POST /comments/:id/vote
 * 
 * Same logic as votePost but for comments
 */
const voteComment = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id: comment_id } = req.params;
        const { vote_type } = req.body;
        
        // Get user ID from authenticated user
        const user_id = req.user.userId;

        // --- Validation ---
        if (!vote_type) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: vote_type'
            });
        }

        const normalizedVoteType = vote_type.toUpperCase();
        if (!VALID_VOTE_TYPES.includes(normalizedVoteType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid vote_type. Must be UP or DOWN'
            });
        }

        // Validate UUID formats
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(comment_id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid UUID format for comment_id'
            });
        }

        // Start transaction
        await client.query('BEGIN');

        // Check if comment exists
        const commentCheck = await client.query('SELECT id FROM comments WHERE id = $1', [comment_id]);
        if (commentCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check for existing vote
        const existingVoteQuery = `
            SELECT id, vote_type FROM comment_votes 
            WHERE user_id = $1 AND comment_id = $2
        `;
        const existingVote = await client.query(existingVoteQuery, [user_id, comment_id]);

        let action;

        if (existingVote.rows.length > 0) {
            const currentVote = existingVote.rows[0];
            
            if (currentVote.vote_type === normalizedVoteType) {
                // SAME vote type -> Toggle OFF (remove vote)
                await client.query(
                    'DELETE FROM comment_votes WHERE id = $1',
                    [currentVote.id]
                );
                action = 'removed';
            } else {
                // DIFFERENT vote type -> Flip the vote
                await client.query(
                    'UPDATE comment_votes SET vote_type = $1 WHERE id = $2',
                    [normalizedVoteType, currentVote.id]
                );
                action = 'flipped';
            }
        } else {
            // No existing vote -> Insert new vote
            const voteId = uuidv4();
            await client.query(
                `INSERT INTO comment_votes (id, user_id, comment_id, vote_type) 
                 VALUES ($1, $2, $3, $4)`,
                [voteId, user_id, comment_id, normalizedVoteType]
            );
            action = 'added';
        }

        // Calculate new vote count
        const voteCountQuery = `
            SELECT COALESCE(
                SUM(CASE WHEN vote_type = 'UP' THEN 1 ELSE -1 END), 
                0
            )::INTEGER AS vote_count
            FROM comment_votes 
            WHERE comment_id = $1
        `;
        const voteCountResult = await client.query(voteCountQuery, [comment_id]);
        const newVoteCount = voteCountResult.rows[0].vote_count;

        // Commit transaction
        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: `Vote ${action} successfully`,
            data: {
                comment_id,
                user_id,
                action,
                vote_type: action === 'removed' ? null : normalizedVoteType,
                vote_count: newVoteCount
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error voting on comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process vote',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Get user's vote status for a post
 * GET /posts/:id/vote-status?user_id=xxx
 */
const getPostVoteStatus = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id: post_id } = req.params;
        
        // Get user ID from authenticated user
        const user_id = req.user.userId;

        const query = `
            SELECT vote_type FROM post_votes 
            WHERE user_id = $1 AND post_id = $2
        `;
        const result = await client.query(query, [user_id, post_id]);

        res.status(200).json({
            success: true,
            data: {
                post_id,
                user_id,
                vote_type: result.rows.length > 0 ? result.rows[0].vote_type : null
            }
        });

    } catch (error) {
        console.error('Error getting vote status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get vote status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

module.exports = {
    votePost,
    voteComment,
    getPostVoteStatus
};
