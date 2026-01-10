const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Add a comment to a post
 * POST /posts/:id/comments
 */
const addComment = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id: post_id } = req.params;
        const { content } = req.body;
        
        // Get author info from authenticated user
        const author_id = req.user.userId;
        const author_name = req.user.name;

        // --- Validation ---
        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: content'
            });
        }

        // Validate content length
        if (content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment content cannot be empty'
            });
        }

        if (content.length > 2000) {
            return res.status(400).json({
                success: false,
                message: 'Comment content exceeds maximum length of 2000 characters'
            });
        }

        // Validate UUID formats
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(post_id) || !uuidRegex.test(author_id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid UUID format for post_id or author_id'
            });
        }

        // Check if post exists
        const postCheck = await client.query('SELECT id FROM posts WHERE id = $1', [post_id]);
        if (postCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Generate UUID for comment
        const commentId = uuidv4();

        // Insert comment
        const insertQuery = `
            INSERT INTO comments (id, post_id, author_id, author_name, content, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id, post_id, author_id, author_name, content, created_at
        `;

        const result = await client.query(insertQuery, [
            commentId,
            post_id,
            author_id,
            author_name,
            content.trim()
        ]);

        const newComment = result.rows[0];

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: {
                ...newComment,
                vote_count: 0
            }
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add comment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Get all comments for a post
 * GET /posts/:id/comments
 */
const getCommentsByPost = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id: post_id } = req.params;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(post_id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid post ID format'
            });
        }

        // Check if post exists
        const postCheck = await client.query('SELECT id FROM posts WHERE id = $1', [post_id]);
        if (postCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Get comments with vote counts
        const query = `
            SELECT 
                c.id,
                c.post_id,
                c.author_id,
                c.author_name,
                c.content,
                c.created_at,
                COALESCE(
                    (SELECT SUM(CASE WHEN vote_type = 'UP' THEN 1 ELSE -1 END) 
                     FROM comment_votes WHERE comment_id = c.id), 
                    0
                )::INTEGER AS vote_count
            FROM comments c
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
        `;

        const result = await client.query(query, [post_id]);

        res.status(200).json({
            success: true,
            message: 'Comments retrieved successfully',
            data: result.rows,
            meta: {
                post_id,
                total: result.rows.length
            }
        });

    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch comments',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Delete a comment (only by author)
 * DELETE /comments/:id
 */
const deleteComment = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id: comment_id } = req.params;
        
        // Get user ID from authenticated user
        const user_id = req.user.userId;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(comment_id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid UUID format'
            });
        }

        // Start transaction
        await client.query('BEGIN');

        // Check if comment exists and user is author
        const commentCheck = await client.query(
            'SELECT id, author_id FROM comments WHERE id = $1',
            [comment_id]
        );

        if (commentCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        if (commentCheck.rows[0].author_id !== user_id) {
            await client.query('ROLLBACK');
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own comments'
            });
        }

        // Delete associated votes first
        await client.query('DELETE FROM comment_votes WHERE comment_id = $1', [comment_id]);

        // Delete comment
        await client.query('DELETE FROM comments WHERE id = $1', [comment_id]);

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete comment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

module.exports = {
    addComment,
    getCommentsByPost,
    deleteComment
};
