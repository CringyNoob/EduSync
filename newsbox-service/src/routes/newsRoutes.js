const express = require('express');
const router = express.Router();

// Import middleware
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');

// Import controllers
const { createPost, getAllPosts, getPostById, VALID_TAGS } = require('../controllers/postController');
const { votePost, voteComment, getPostVoteStatus } = require('../controllers/voteController');
const { addComment, getCommentsByPost, deleteComment } = require('../controllers/commentController');

// ==================== HEALTH CHECK ====================
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        service: 'newsbox-service',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// ==================== INFO ENDPOINT ====================
router.get('/info', (req, res) => {
    res.status(200).json({
        success: true,
        service: 'NewsBox Service',
        version: '1.0.0',
        description: 'Community Feed with Posts, Comments, and Voting',
        validTags: VALID_TAGS,
        endpoints: {
            posts: {
                'POST /posts': 'Create a new post',
                'GET /posts': 'Get all posts (query: tag, sort)',
                'GET /posts/:id': 'Get post by ID with comments',
                'DELETE /posts/:id': 'Delete a post (author only)'
            },
            voting: {
                'POST /posts/:id/vote': 'Vote on a post (UP/DOWN, toggle logic)',
                'GET /posts/:id/vote-status': 'Get user vote status for a post',
                'POST /comments/:id/vote': 'Vote on a comment (UP/DOWN, toggle logic)'
            },
            comments: {
                'POST /posts/:id/comments': 'Add a comment to a post',
                'GET /posts/:id/comments': 'Get all comments for a post',
                'DELETE /comments/:id': 'Delete a comment (author only)'
            }
        }
    });
});

// ==================== POST ROUTES ====================

// Create a new post (PROTECTED - requires authentication)
// POST /posts
// Headers: Authorization: Bearer <token>
// Body: { title, description, images[], tag }
router.post('/posts', authMiddleware, createPost);

// Get all posts with optional filtering and sorting (PUBLIC)
// GET /posts?tag=QUERY&sort=popular
router.get('/posts', getAllPosts);

// Get a single post by ID (includes comments) (PUBLIC)
// GET /posts/:id
router.get('/posts/:id', getPostById);

// Delete a post (PROTECTED - author only)
// DELETE /posts/:id
// Headers: Authorization: Bearer <token>
router.delete('/posts/:id', authMiddleware, async (req, res) => {
    const { pool } = require('../config/db');
    const client = await pool.connect();
    
    try {
        const { id: post_id } = req.params;
        
        // Get user ID from authenticated user
        const user_id = req.user.userId;

        // Start transaction
        await client.query('BEGIN');

        // Check if post exists and user is author
        const postCheck = await client.query(
            'SELECT id, author_id FROM posts WHERE id = $1',
            [post_id]
        );

        if (postCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        if (postCheck.rows[0].author_id !== user_id) {
            await client.query('ROLLBACK');
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own posts'
            });
        }

        // Delete associated comment votes
        await client.query(`
            DELETE FROM comment_votes 
            WHERE comment_id IN (SELECT id FROM comments WHERE post_id = $1)
        `, [post_id]);

        // Delete associated comments
        await client.query('DELETE FROM comments WHERE post_id = $1', [post_id]);

        // Delete associated post votes
        await client.query('DELETE FROM post_votes WHERE post_id = $1', [post_id]);

        // Delete post
        await client.query('DELETE FROM posts WHERE id = $1', [post_id]);

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Post deleted successfully'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete post',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
});

// ==================== VOTING ROUTES ====================

// Vote on a post (PROTECTED)
// POST /posts/:id/vote
// Headers: Authorization: Bearer <token>
// Body: { vote_type: 'UP' | 'DOWN' }
router.post('/posts/:id/vote', authMiddleware, votePost);

// Get user's vote status for a post (PROTECTED)
// GET /posts/:id/vote-status
// Headers: Authorization: Bearer <token>
router.get('/posts/:id/vote-status', authMiddleware, getPostVoteStatus);

// Vote on a comment (PROTECTED)
// POST /comments/:id/vote
// Headers: Authorization: Bearer <token>
// Body: { vote_type: 'UP' | 'DOWN' }
router.post('/comments/:id/vote', authMiddleware, voteComment);

// ==================== COMMENT ROUTES ====================

// Add a comment to a post (PROTECTED)
// POST /posts/:id/comments
// Headers: Authorization: Bearer <token>
// Body: { content }
router.post('/posts/:id/comments', authMiddleware, addComment);

// Get all comments for a post (PUBLIC)
// GET /posts/:id/comments
router.get('/posts/:id/comments', getCommentsByPost);

// Delete a comment (PROTECTED - author only)
// DELETE /comments/:id
// Headers: Authorization: Bearer <token>
router.delete('/comments/:id', authMiddleware, deleteComment);

module.exports = router;
