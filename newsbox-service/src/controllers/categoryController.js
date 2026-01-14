const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { detectSchema } = require('../config/schemaDetector');

// Legacy categories for backward compatibility when categories table doesn't exist
const LEGACY_CATEGORIES = [
    { id: 'cat-accommodation', name: 'Accommodation' },
    { id: 'cat-job-posting', name: 'Job Posting' },
    { id: 'cat-lost-and-found', name: 'Lost and Found' },
    { id: 'cat-query', name: 'Query' },
    { id: 'cat-general', name: 'General' },
    { id: 'cat-campus', name: 'Campus' },
    { id: 'cat-tech', name: 'Tech' },
    { id: 'cat-events', name: 'Events' },
    { id: 'cat-emergency', name: 'Emergency' },
    { id: 'cat-academics', name: 'Academics' }
];

/**
 * Get all categories
 * GET /categories
 */
const getAllCategories = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const schema = await detectSchema();
        
        if (schema.hasCategories) {
            // Use new schema with categories table
            const query = `
                SELECT 
                    c.id,
                    c.name,
                    c.created_at,
                    COALESCE(
                        (SELECT COUNT(*) FROM posts WHERE category_id = c.id ${schema.hasStatus ? "AND status = 'APPROVED'" : ''}), 
                        0
                    )::INTEGER AS post_count
                FROM categories c
                ORDER BY c.name ASC
            `;

            const result = await client.query(query);

            res.status(200).json({
                success: true,
                message: 'Categories retrieved successfully',
                data: result.rows,
                meta: {
                    total: result.rows.length
                }
            });
        } else {
            // Fallback: Return legacy categories based on existing tags
            const tagQuery = `SELECT DISTINCT tag FROM posts WHERE tag IS NOT NULL ORDER BY tag`;
            const tagResult = await client.query(tagQuery);
            
            // Map tags to category format
            const categories = tagResult.rows.map(row => ({
                id: `cat-${row.tag.toLowerCase().replace(/_/g, '-')}`,
                name: row.tag.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
                created_at: new Date().toISOString(),
                post_count: 0
            }));
            
            // If no tags found, return default categories
            const finalCategories = categories.length > 0 ? categories : LEGACY_CATEGORIES;
            
            res.status(200).json({
                success: true,
                message: 'Categories retrieved successfully (legacy mode)',
                data: finalCategories,
                meta: {
                    total: finalCategories.length,
                    legacy: true
                }
            });
        }

    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Get a single category by ID
 * GET /categories/:id
 */
const getCategoryById = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id } = req.params;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID format'
            });
        }

        const query = `
            SELECT 
                c.id,
                c.name,
                c.created_at,
                COALESCE(
                    (SELECT COUNT(*) FROM posts WHERE category_id = c.id AND status = 'APPROVED'), 
                    0
                )::INTEGER AS post_count
            FROM categories c
            WHERE c.id = $1
        `;

        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category retrieved successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Create a new category (Admin only)
 * POST /categories
 */
const createCategory = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { name } = req.body;

        // Validation
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const trimmedName = name.trim();

        // Check name length
        if (trimmedName.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Category name must be 100 characters or less'
            });
        }

        // Check for duplicate category name
        const duplicateCheck = await client.query(
            'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)',
            [trimmedName]
        );

        if (duplicateCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'A category with this name already exists'
            });
        }

        // Generate UUID for the category
        const categoryId = uuidv4();

        // Insert category
        const insertQuery = `
            INSERT INTO categories (id, name, created_at, updated_at)
            VALUES ($1, $2, NOW(), NOW())
            RETURNING id, name, created_at, updated_at
        `;

        const result = await client.query(insertQuery, [categoryId, trimmedName]);

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: {
                ...result.rows[0],
                post_count: 0
            }
        });

    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Update a category (Admin only)
 * PUT /categories/:id
 */
const updateCategory = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id } = req.params;
        const { name } = req.body;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID format'
            });
        }

        // Validation
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const trimmedName = name.trim();

        // Check name length
        if (trimmedName.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Category name must be 100 characters or less'
            });
        }

        // Check if category exists
        const categoryCheck = await client.query(
            'SELECT id FROM categories WHERE id = $1',
            [id]
        );

        if (categoryCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check for duplicate category name (excluding current category)
        const duplicateCheck = await client.query(
            'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id != $2',
            [trimmedName, id]
        );

        if (duplicateCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'A category with this name already exists'
            });
        }

        // Update category
        const updateQuery = `
            UPDATE categories 
            SET name = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING id, name, created_at, updated_at
        `;

        const result = await client.query(updateQuery, [trimmedName, id]);

        // Get post count
        const postCountResult = await client.query(
            'SELECT COUNT(*) as count FROM posts WHERE category_id = $1 AND status = \'APPROVED\'',
            [id]
        );

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: {
                ...result.rows[0],
                post_count: parseInt(postCountResult.rows[0].count)
            }
        });

    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update category',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

/**
 * Delete a category (Admin only)
 * DELETE /categories/:id
 */
const deleteCategory = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id } = req.params;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID format'
            });
        }

        // Check if category exists
        const categoryCheck = await client.query(
            'SELECT id, name FROM categories WHERE id = $1',
            [id]
        );

        if (categoryCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if category has posts
        const postCheck = await client.query(
            'SELECT COUNT(*) as count FROM posts WHERE category_id = $1',
            [id]
        );

        if (parseInt(postCheck.rows[0].count) > 0) {
            return res.status(409).json({
                success: false,
                message: `Cannot delete category "${categoryCheck.rows[0].name}" because it has ${postCheck.rows[0].count} post(s). Please reassign or delete the posts first.`
            });
        }

        // Delete category
        await client.query('DELETE FROM categories WHERE id = $1', [id]);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete category',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
