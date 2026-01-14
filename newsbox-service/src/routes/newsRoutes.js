const express = require('express');
const router = express.Router();

// Import middleware
const { authMiddleware, optionalAuthMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Import controllers
const { 
    createPost, 
    getAllPosts, 
    getPostById, 
    updatePost,
    deletePost,
    getPendingPosts,
    updatePostStatus,
    togglePinPost,
    getPostsByUser
} = require('../controllers/postController');
const { votePost, voteComment, getPostVoteStatus } = require('../controllers/voteController');
const { addComment, getCommentsByPost, deleteComment } = require('../controllers/commentController');
const { 
    getAllCategories, 
    getCategoryById, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} = require('../controllers/categoryController');

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
        version: '2.0.0',
        description: 'Community Feed with Posts, Comments, Voting, and Dynamic Categories',
        endpoints: {
            categories: {
                'GET /categories': 'Get all categories',
                'GET /categories/:id': 'Get category by ID',
                'POST /categories': 'Create a category (Admin only)',
                'PUT /categories/:id': 'Update a category (Admin only)',
                'DELETE /categories/:id': 'Delete a category (Admin only)'
            },
            posts: {
                'POST /posts': 'Create a new post',
                'GET /posts': 'Get all posts (query: category_id, sort, status)',
                'GET /posts/:id': 'Get post by ID with comments',
                'PUT /posts/:id': 'Update a post (author/admin only)',
                'DELETE /posts/:id': 'Delete a post (author/admin only)',
                'GET /posts/admin/pending': 'Get pending posts (Admin only)',
                'PATCH /posts/:id/status': 'Update post status (Admin only)',
                'PATCH /posts/:id/pin': 'Toggle pin status (Admin only)'
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

// ==================== CATEGORY ROUTES ====================

// Get all categories (PUBLIC)
// GET /categories
router.get('/categories', getAllCategories);

// Get a single category by ID (PUBLIC)
// GET /categories/:id
router.get('/categories/:id', getCategoryById);

// Create a new category (ADMIN ONLY)
// POST /categories
// Headers: Authorization: Bearer <token>
// Body: { name }
router.post('/categories', authMiddleware, adminMiddleware, createCategory);

// Update a category (ADMIN ONLY)
// PUT /categories/:id
// Headers: Authorization: Bearer <token>
// Body: { name }
router.put('/categories/:id', authMiddleware, adminMiddleware, updateCategory);

// Delete a category (ADMIN ONLY)
// DELETE /categories/:id
// Headers: Authorization: Bearer <token>
router.delete('/categories/:id', authMiddleware, adminMiddleware, deleteCategory);

// ==================== POST ROUTES ====================

// Create a new post (PROTECTED - requires authentication)
// POST /posts
// Headers: Authorization: Bearer <token>
// Body: { title, description, images[], category_id, is_official? }
router.post('/posts', authMiddleware, createPost);

// Get all posts with optional filtering and sorting (PUBLIC)
// GET /posts?category_id=xxx&sort=popular&status=APPROVED
router.get('/posts', getAllPosts);

// Get all posts by a specific user (PUBLIC)
// GET /posts/user/:userId
router.get('/posts/user/:userId', getPostsByUser);

// Get pending posts for moderation (ADMIN ONLY)
// GET /posts/admin/pending
router.get('/posts/admin/pending', authMiddleware, adminMiddleware, getPendingPosts);

// Get a single post by ID (includes comments) (PUBLIC)
// GET /posts/:id
router.get('/posts/:id', getPostById);

// Update a post (PROTECTED - author or admin only)
// PUT /posts/:id
// Headers: Authorization: Bearer <token>
// Body: { title?, description?, images?, category_id?, is_pinned?, status? }
router.put('/posts/:id', authMiddleware, updatePost);

// Delete a post (PROTECTED - author or admin only)
// DELETE /posts/:id
// Headers: Authorization: Bearer <token>
router.delete('/posts/:id', authMiddleware, deletePost);

// Update post status (ADMIN ONLY)
// PATCH /posts/:id/status
// Headers: Authorization: Bearer <token>
// Body: { status: 'PENDING' | 'APPROVED' | 'REJECTED' }
router.patch('/posts/:id/status', authMiddleware, adminMiddleware, updatePostStatus);

// Toggle pin status (ADMIN ONLY)
// PATCH /posts/:id/pin
// Headers: Authorization: Bearer <token>
router.patch('/posts/:id/pin', authMiddleware, adminMiddleware, togglePinPost);

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
