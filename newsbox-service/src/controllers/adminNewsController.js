// src/controllers/adminNewsController.js
// Admin-specific controllers for NewsBox service
const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { detectSchema } = require('../config/schemaDetector');

/**
 * Get all posts for admin management
 * GET /admin/posts
 */
const getAllPostsAdmin = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const schema = await detectSchema();
        const { page = 1, limit = 20, search, category } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        let query = 'SELECT p.*, ';
        if (schema.isNewSchema) {
            query += 'c.name as category_name ';
        } else {
            query += 'p.tag as category_name ';
        }
        
        query += 'FROM posts p ';
        if (schema.isNewSchema) {
            query += 'LEFT JOIN categories c ON p.category_id = c.id ';
        }
        
        const conditions = [];
        const params = [];
        let paramIndex = 1;
        
        if (search) {
            conditions.push(`(p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.author_name ILIKE $${paramIndex})`);
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        if (category && schema.isNewSchema) {
            conditions.push(`c.name = $${paramIndex}`);
            params.push(category);
            paramIndex++;
        }
        
        if (conditions.length > 0) {
            query += 'WHERE ' + conditions.join(' AND ') + ' ';
        }
        
        // Count total
        const countQuery = query.replace(/SELECT p\.\*.*FROM/, 'SELECT COUNT(*) as total FROM');
        const countResult = await client.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);
        
        // Get posts with pagination
        query += `ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), offset);
        
        const result = await client.query(query, params);
        
        // Get comment counts for each post
        const postIds = result.rows.map(p => p.id);
        let commentCounts = {};
        
        if (postIds.length > 0) {
            const commentQuery = await client.query(`
                SELECT post_id, COUNT(*) as count 
                FROM comments 
                WHERE post_id = ANY($1)
                GROUP BY post_id
            `, [postIds]);
            
            commentQuery.rows.forEach(row => {
                commentCounts[row.post_id] = parseInt(row.count);
            });
        }
        
        // Get like counts (assuming there's a votes or likes mechanism)
        let likeCounts = {};
        try {
            const likeQuery = await client.query(`
                SELECT post_id, COUNT(*) as count 
                FROM votes 
                WHERE post_id = ANY($1) AND vote_type = 'UP'
                GROUP BY post_id
            `, [postIds]);
            
            likeQuery.rows.forEach(row => {
                likeCounts[row.post_id] = parseInt(row.count);
            });
        } catch (e) {
            // Votes table might not exist
        }
        
        const postsWithCounts = result.rows.map(post => ({
            ...post,
            comments_count: commentCounts[post.id] || 0,
            likes_count: likeCounts[post.id] || post.upvote_count || 0,
            category: post.category_name || post.tag || 'General'
        }));
        
        // Get stats
        const statsQuery = await client.query(`
            SELECT 
                COUNT(*) as total_posts,
                COUNT(*) FILTER (WHERE author_name = 'EduSync Admin') as total_announcements,
                COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as posts_today
            FROM posts
        `);
        
        const commentStatsQuery = await client.query('SELECT COUNT(*) as total FROM comments');
        
        res.status(200).json({
            success: true,
            data: postsWithCounts,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            stats: {
                totalPosts: parseInt(statsQuery.rows[0].total_posts) || 0,
                totalAnnouncements: parseInt(statsQuery.rows[0].total_announcements) || 0,
                totalComments: parseInt(commentStatsQuery.rows[0].total) || 0,
                postsToday: parseInt(statsQuery.rows[0].posts_today) || 0
            }
        });
        
    } catch (error) {
        console.error('Error fetching posts for admin:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch posts',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Create an announcement (Admin only)
 * POST /admin/announcements
 */
const createAnnouncement = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const schema = await detectSchema();
        const { title, description, images, category_id } = req.body;
        
        // Validation
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required'
            });
        }
        
        // Admin info
        const author_id = req.user.userId;
        const author_name = 'EduSync Admin';
        
        // Handle images (same as regular posts)
        const imageArray = Array.isArray(images) ? images : (images ? [images] : []);
        if (imageArray.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 10 images allowed per post'
            });
        }
        
        const postId = uuidv4();
        let result;
        let categoryName = null;
        
        if (schema.isNewSchema && category_id) {
            // Validate category exists
            const categoryCheck = await client.query(
                'SELECT id, name FROM categories WHERE id = $1',
                [category_id]
            );
            
            if (categoryCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
            
            categoryName = categoryCheck.rows[0].name;
            
            // Insert with new schema
            result = await client.query(`
                INSERT INTO posts (id, author_id, author_name, title, description, images, category_id, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                RETURNING *
            `, [postId, author_id, author_name, title, description, imageArray, category_id]);
        } else {
            // Legacy schema - use tag = 'Announcement'
            result = await client.query(`
                INSERT INTO posts (id, author_id, author_name, title, description, images, tag, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                RETURNING *
            `, [postId, author_id, author_name, title, description, imageArray, 'ANNOUNCEMENT']);
            
            categoryName = 'Announcement';
        }
        
        const newPost = result.rows[0];
        newPost.category_name = categoryName;
        
        res.status(201).json({
            success: true,
            message: 'Announcement posted successfully',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create announcement',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Delete a post (Admin only)
 * DELETE /admin/posts/:id
 */
const deletePostAdmin = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id } = req.params;
        
        // Delete comments first
        await client.query('DELETE FROM comments WHERE post_id = $1', [id]);
        
        // Delete votes if table exists
        try {
            await client.query('DELETE FROM votes WHERE post_id = $1', [id]);
        } catch (e) {
            // Votes table might not exist
        }
        
        // Delete the post
        const result = await client.query(
            'DELETE FROM posts WHERE id = $1 RETURNING id, title',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Post deleted successfully',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete post',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Get comments for a post (Admin view)
 * GET /admin/posts/:postId/comments
 */
const getPostCommentsAdmin = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { postId } = req.params;
        
        const result = await client.query(`
            SELECT * FROM comments 
            WHERE post_id = $1 
            ORDER BY created_at DESC
        `, [postId]);
        
        res.status(200).json({
            success: true,
            data: result.rows
        });
        
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch comments'
        });
    } finally {
        client.release();
    }
};

/**
 * Delete a comment (Admin only)
 * DELETE /admin/comments/:id
 */
const deleteCommentAdmin = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id } = req.params;
        
        // Delete votes for this comment if table exists
        try {
            await client.query('DELETE FROM votes WHERE comment_id = $1', [id]);
        } catch (e) {
            // Votes table might not exist
        }
        
        const result = await client.query(
            'DELETE FROM comments WHERE id = $1 RETURNING id, content',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully',
            data: result.rows[0]
        });
        
    } catch (error) {
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

/**
 * Get news analytics for admin
 * GET /admin/analytics/news
 */
const getNewsAnalytics = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const postStats = await client.query(`
            SELECT 
                COUNT(*) as total_posts,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as posts_this_week,
                COUNT(*) FILTER (WHERE author_name = 'EduSync Admin') as announcements
            FROM posts
        `);
        
        const commentStats = await client.query(`
            SELECT 
                COUNT(*) as total_comments,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as comments_this_week
            FROM comments
        `);
        
        res.status(200).json({
            success: true,
            data: {
                totalPosts: parseInt(postStats.rows[0].total_posts) || 0,
                postsThisWeek: parseInt(postStats.rows[0].posts_this_week) || 0,
                announcements: parseInt(postStats.rows[0].announcements) || 0,
                totalComments: parseInt(commentStats.rows[0].total_comments) || 0,
                commentsThisWeek: parseInt(commentStats.rows[0].comments_this_week) || 0
            }
        });
        
    } catch (error) {
        console.error('Error fetching news analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch news analytics'
        });
    } finally {
        client.release();
    }
};

module.exports = {
    getAllPostsAdmin,
    createAnnouncement,
    deletePostAdmin,
    getPostCommentsAdmin,
    deleteCommentAdmin,
    getNewsAnalytics
};
