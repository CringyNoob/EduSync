const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { detectSchema } = require('../config/schemaDetector');

/**
 * Create a new post
 * POST /posts
 */
const createPost = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const schema = await detectSchema();
        const { title, description, images, category_id, tag, is_official = false } = req.body;
        
        // Get author info from authenticated user
        const author_id = req.user.userId;
        const author_name = req.user.name;

        // --- Validation ---
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, description'
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
        
        let result;
        let categoryName = null;

        if (schema.isNewSchema && category_id) {
            // New schema with categories table
            // Validate UUID format for category_id
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(category_id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category_id format'
                });
            }

            // Verify category exists
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

            // Insert with new schema (only basic columns)
            const insertQuery = `
                INSERT INTO posts (id, author_id, author_name, title, description, images, category_id, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                RETURNING id, author_id, author_name, title, description, images, category_id, created_at
            `;

            result = await client.query(insertQuery, [
                postId,
                author_id,
                author_name,
                title,
                description,
                imageArray,
                category_id
            ]);
        } else {
            // Legacy schema with tag column
            const tagValue = tag || 'GENERAL';
            
            const insertQuery = `
                INSERT INTO posts (id, author_id, author_name, title, description, images, tag, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                RETURNING id, author_id, author_name, title, description, images, tag, created_at
            `;

            result = await client.query(insertQuery, [
                postId,
                author_id,
                author_name,
                title,
                description,
                imageArray,
                tagValue
            ]);
            
            categoryName = tagValue.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        }

        const newPost = result.rows[0];
        newPost.category_name = categoryName;

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
 * GET /posts?category_id=xxx&sort=popular&status=APPROVED
 */
const getAllPosts = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const schema = await detectSchema();
        const { category_id, tag, sort = 'newest', status = 'APPROVED' } = req.query;

        let result;

        if (schema.isNewSchema) {
            // New schema with categories table
            let whereConditions = [];
            const queryParams = [];
            let paramIndex = 1;

            // Filter by category_id if provided
            if (category_id && category_id !== 'all') {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(category_id)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid category_id format'
                    });
                }
                whereConditions.push(`p.category_id = $${paramIndex}`);
                queryParams.push(category_id);
                paramIndex++;
            }

            const whereClause = whereConditions.length > 0 
                ? 'WHERE ' + whereConditions.join(' AND ')
                : '';

            // Determine sort order
            let orderClause;
            switch (sort) {
                case 'popular':
                    orderClause = 'ORDER BY vote_count DESC, p.created_at DESC';
                    break;
                case 'oldest':
                    orderClause = 'ORDER BY p.created_at ASC';
                    break;
                default:
                    orderClause = schema.hasIsPinned 
                        ? 'ORDER BY p.is_pinned DESC, p.created_at DESC'
                        : 'ORDER BY p.created_at DESC';
            }

            const query = `
                SELECT 
                    p.id,
                    p.author_id,
                    p.author_name,
                    p.title,
                    p.description,
                    p.images,
                    p.category_id,
                    c.name AS category_name,
                    ${schema.hasIsOfficial ? 'p.is_official,' : 'FALSE AS is_official,'}
                    ${schema.hasIsPinned ? 'p.is_pinned,' : 'FALSE AS is_pinned,'}
                    ${schema.hasStatus ? 'p.status,' : "'APPROVED' AS status,"}
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
                JOIN categories c ON p.category_id = c.id
                ${whereClause}
                ${orderClause}
            `;

            result = await client.query(query, queryParams);
        } else {
            // Legacy schema with tag column
            let whereConditions = [];
            const queryParams = [];
            let paramIndex = 1;

            // Filter by tag if provided (legacy)
            if (tag) {
                whereConditions.push(`p.tag = $${paramIndex}`);
                queryParams.push(tag.toUpperCase());
                paramIndex++;
            }

            const whereClause = whereConditions.length > 0 
                ? 'WHERE ' + whereConditions.join(' AND ')
                : '';

            // Determine sort order
            let orderClause;
            switch (sort) {
                case 'popular':
                    orderClause = 'ORDER BY vote_count DESC, p.created_at DESC';
                    break;
                case 'oldest':
                    orderClause = 'ORDER BY p.created_at ASC';
                    break;
                default:
                    orderClause = 'ORDER BY p.created_at DESC';
            }

            const query = `
                SELECT 
                    p.id,
                    p.author_id,
                    p.author_name,
                    p.title,
                    p.description,
                    p.images,
                    p.tag,
                    INITCAP(REPLACE(p.tag, '_', ' ')) AS category_name,
                    FALSE AS is_official,
                    FALSE AS is_pinned,
                    'APPROVED' AS status,
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

            result = await client.query(query, queryParams);
            
            // Map tag to category_id for frontend compatibility
            result.rows = result.rows.map(row => ({
                ...row,
                category_id: `cat-${row.tag.toLowerCase().replace(/_/g, '-')}`
            }));
        }

        res.status(200).json({
            success: true,
            message: 'Posts retrieved successfully',
            data: result.rows,
            meta: {
                total: result.rows.length,
                filter: {
                    category_id: category_id || tag || 'all',
                    status: status || 'APPROVED'
                },
                sort: sort,
                legacy: !schema.isNewSchema
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
        const schema = await detectSchema();
        const { id } = req.params;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid post ID format'
            });
        }

        let postResult;

        if (schema.isNewSchema) {
            // New schema query
            const postQuery = `
                SELECT 
                    p.id,
                    p.author_id,
                    p.author_name,
                    p.title,
                    p.description,
                    p.images,
                    p.category_id,
                    c.name AS category_name,
                    ${schema.hasIsOfficial ? 'p.is_official,' : 'FALSE AS is_official,'}
                    ${schema.hasIsPinned ? 'p.is_pinned,' : 'FALSE AS is_pinned,'}
                    ${schema.hasStatus ? 'p.status,' : "'APPROVED' AS status,"}
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
                JOIN categories c ON p.category_id = c.id
                WHERE p.id = $1
            `;

            postResult = await client.query(postQuery, [id]);
        } else {
            // Legacy schema query
            const postQuery = `
                SELECT 
                    p.id,
                    p.author_id,
                    p.author_name,
                    p.title,
                    p.description,
                    p.images,
                    p.tag,
                    INITCAP(REPLACE(p.tag, '_', ' ')) AS category_name,
                    FALSE AS is_official,
                    FALSE AS is_pinned,
                    'APPROVED' AS status,
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

            postResult = await client.query(postQuery, [id]);
            
            // Add category_id for frontend compatibility
            if (postResult.rows.length > 0) {
                postResult.rows[0].category_id = `cat-${postResult.rows[0].tag.toLowerCase().replace(/_/g, '-')}`;
            }
        }

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

/**
 * Update a post (Author or Admin only)
 * PUT /posts/:id
 */
const updatePost = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id } = req.params;
        const { title, description, images, category_id } = req.body;
        
        const user_id = req.user.userId;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid post ID format'
            });
        }

        // Check if post exists and get current data
        const postCheck = await client.query(
            'SELECT id, author_id FROM posts WHERE id = $1',
            [id]
        );

        if (postCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const currentPost = postCheck.rows[0];

        // Check permission: must be author
        if (currentPost.author_id !== user_id) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own posts'
            });
        }

        // Build update fields
        const updates = [];
        const values = [];
        let valueIndex = 1;

        if (title !== undefined) {
            updates.push(`title = $${valueIndex++}`);
            values.push(title);
        }
        if (description !== undefined) {
            updates.push(`description = $${valueIndex++}`);
            values.push(description);
        }
        if (images !== undefined) {
            updates.push(`images = $${valueIndex++}`);
            values.push(Array.isArray(images) ? images : []);
        }
        if (category_id !== undefined) {
            if (!uuidRegex.test(category_id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category_id format'
                });
            }
            // Verify category exists
            const categoryCheck = await client.query(
                'SELECT id FROM categories WHERE id = $1',
                [category_id]
            );
            if (categoryCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
            updates.push(`category_id = $${valueIndex++}`);
            values.push(category_id);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const updateQuery = `
            UPDATE posts 
            SET ${updates.join(', ')}
            WHERE id = $${valueIndex}
            RETURNING id, author_id, author_name, title, description, images, category_id, created_at, updated_at
        `;

        const result = await client.query(updateQuery, values);

        // Get category name
        const categoryResult = await client.query(
            'SELECT name FROM categories WHERE id = $1',
            [result.rows[0].category_id]
        );

        const updatedPost = result.rows[0];
        updatedPost.category_name = categoryResult.rows[0]?.name;

        res.status(200).json({
            success: true,
            message: 'Post updated successfully',
            data: updatedPost
        });

    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update post',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Delete a post (Author or Admin only)
 * DELETE /posts/:id
 */
const deletePost = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id } = req.params;
        
        const user_id = req.user.userId;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid post ID format'
            });
        }

        await client.query('BEGIN');

        // Check if post exists
        const postCheck = await client.query(
            'SELECT id, author_id FROM posts WHERE id = $1',
            [id]
        );

        if (postCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check permission: must be author
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
        `, [id]);

        // Delete associated comments
        await client.query('DELETE FROM comments WHERE post_id = $1', [id]);

        // Delete associated post votes
        await client.query('DELETE FROM post_votes WHERE post_id = $1', [id]);

        // Delete post
        await client.query('DELETE FROM posts WHERE id = $1', [id]);

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
};

/**
 * Get posts by status (Admin only - for moderation)
 * GET /posts/admin/pending
 */
const getPendingPosts = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const schema = await detectSchema();
        
        // No status column in current schema, return empty
        return res.status(200).json({
            success: true,
            message: 'Pending posts retrieved successfully (no moderation in current schema)',
            data: [],
            meta: {
                total: 0,
                no_moderation: true
            }
        });

    } catch (error) {
        console.error('Error fetching pending posts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending posts',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Approve or reject a post (Admin only)
 * PATCH /posts/:id/status
 */
const updatePostStatus = async (req, res) => {
    const client = await pool.connect();
    
    try {
        // Status column doesn't exist in current schema
        return res.status(400).json({
            success: false,
            message: 'Status moderation is not available in the current schema'
        });

    } catch (error) {
        console.error('Error updating post status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update post status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Toggle pin status of a post (Admin only)
 * PATCH /posts/:id/pin
 */
const togglePinPost = async (req, res) => {
    const client = await pool.connect();
    
    try {
        // Pin feature doesn't exist in current schema
        return res.status(400).json({
            success: false,
            message: 'Pin feature is not available in the current schema'
        });

    } catch (error) {
        console.error('Error toggling post pin:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle post pin',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Get all posts by a specific user
 * GET /posts/user/:userId
 */
const getPostsByUser = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const schema = await detectSchema(client);

        let query;
        if (schema.hasCategoryId) {
            query = `
                SELECT 
                    p.id,
                    p.author_id,
                    p.author_name,
                    p.title,
                    p.description,
                    p.images,
                    p.category_id,
                    c.name AS category_name,
                    ${schema.hasIsOfficial ? 'p.is_official,' : 'FALSE AS is_official,'}
                    ${schema.hasIsPinned ? 'p.is_pinned,' : 'FALSE AS is_pinned,'}
                    ${schema.hasStatus ? 'p.status,' : "'APPROVED' AS status,"}
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
                JOIN categories c ON p.category_id = c.id
                WHERE p.author_id = $1
                ORDER BY p.created_at DESC
            `;
        } else {
            query = `
                SELECT 
                    p.id,
                    p.author_id,
                    p.author_name,
                    p.title,
                    p.description,
                    p.images,
                    p.tag AS category_name,
                    FALSE AS is_official,
                    FALSE AS is_pinned,
                    'APPROVED' AS status,
                    p.created_at,
                    0 AS vote_count,
                    0 AS comment_count
                FROM posts p
                WHERE p.author_id = $1
                ORDER BY p.created_at DESC
            `;
        }

        const result = await client.query(query, [userId]);

        res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user posts',
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
    updatePost,
    deletePost,
    getPendingPosts,
    updatePostStatus,
    togglePinPost,
    getPostsByUser
};
