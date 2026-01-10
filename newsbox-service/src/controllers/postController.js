const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Valid tags for posts
const VALID_TAGS = ['QUERY', 'ACCOMMODATION', 'JOB_POSTING', 'LOST_AND_FOUND', 'GENERAL'];

/**
 * Create a new post
 * POST /posts
 */
const createPost = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { title, description, images, tag } = req.body;
        
        // Get author info from authenticated user
        const author_id = req.user.userId;
        const author_name = req.user.name;

        // --- Validation ---
        if (!title || !description || !tag) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, description, tag'
            });
        }

        // Validate tag
        const normalizedTag = tag.toUpperCase();
        if (!VALID_TAGS.includes(normalizedTag)) {
            return res.status(400).json({
                success: false,
                message: `Invalid tag. Must be one of: ${VALID_TAGS.join(', ')}`
            });
        }

        // Validate images array (if provided)
        const imageArray = Array.isArray(images) ? images : [];
        if (imageArray.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 10 images allowed per post'
            });
        }

        // Generate UUID for the post
        const postId = uuidv4();

        // --- Insert Post ---
        const insertQuery = `
            INSERT INTO posts (id, author_id, author_name, title, description, images, tag, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            RETURNING id, author_id, author_name, title, description, images, tag, created_at
        `;

        const result = await client.query(insertQuery, [
            postId,
            author_id,
            author_name,
            title,
            description,
            imageArray,
            normalizedTag
        ]);

        const newPost = result.rows[0];

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: {
                ...newPost,
                vote_count: 0,
                comment_count: 0
            }
        });

    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create post',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Get all posts with optional filtering and sorting
 * GET /posts?tag=QUERY&sort=popular
 */
const getAllPosts = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { tag, sort = 'newest' } = req.query;

        // Build dynamic query
        let whereClause = '';
        const queryParams = [];

        // Filter by tag if provided
        if (tag) {
            const normalizedTag = tag.toUpperCase();
            if (!VALID_TAGS.includes(normalizedTag)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid tag. Must be one of: ${VALID_TAGS.join(', ')}`
                });
            }
            whereClause = 'WHERE p.tag = $1';
            queryParams.push(normalizedTag);
        }

        // Determine sort order
        let orderClause;
        if (sort === 'popular') {
            orderClause = 'ORDER BY vote_count DESC, p.created_at DESC';
        } else {
            // Default: newest first
            orderClause = 'ORDER BY p.created_at DESC';
        }

        // Query with vote_count and comment_count calculations
        const query = `
            SELECT 
                p.id,
                p.author_id,
                p.author_name,
                p.title,
                p.description,
                p.images,
                p.tag,
                p.created_at,
                COALESCE(
                    (SELECT SUM(CASE WHEN vote_type = 'UP' THEN 1 ELSE -1 END) 
                     FROM post_votes WHERE post_id = p.id), 
                    0
                )::INTEGER AS vote_count,
                COALESCE(
                    (SELECT COUNT(*) FROM comments WHERE post_id = p.id), 
                    0
                )::INTEGER AS comment_count
            FROM posts p
            ${whereClause}
            ${orderClause}
        `;

        const result = await client.query(query, queryParams);

        res.status(200).json({
            success: true,
            message: 'Posts retrieved successfully',
            data: result.rows,
            meta: {
                total: result.rows.length,
                filter: tag || 'all',
                sort: sort
            }
        });

    } catch (error) {
        console.error('Error fetching posts:', error);
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
 * Get a single post by ID with comments
 * GET /posts/:id
 */
const getPostById = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id } = req.params;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid post ID format'
            });
        }

        // Get post with vote_count and comment_count
        const postQuery = `
            SELECT 
                p.id,
                p.author_id,
                p.author_name,
                p.title,
                p.description,
                p.images,
                p.tag,
                p.created_at,
                COALESCE(
                    (SELECT SUM(CASE WHEN vote_type = 'UP' THEN 1 ELSE -1 END) 
                     FROM post_votes WHERE post_id = p.id), 
                    0
                )::INTEGER AS vote_count,
                COALESCE(
                    (SELECT COUNT(*) FROM comments WHERE post_id = p.id), 
                    0
                )::INTEGER AS comment_count
            FROM posts p
            WHERE p.id = $1
        `;

        const postResult = await client.query(postQuery, [id]);

        if (postResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Get comments for this post with their vote counts
        const commentsQuery = `
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

        const commentsResult = await client.query(commentsQuery, [id]);

        const post = postResult.rows[0];
        post.comments = commentsResult.rows;

        res.status(200).json({
            success: true,
            message: 'Post retrieved successfully',
            data: post
        });

    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch post',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    VALID_TAGS
};
