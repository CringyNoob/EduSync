// src/controllers/preownedController.js
// Controller for Product-First Architecture (Pre-owned Listings)
const db = require('../config/db');

/**
 * Get all available pre-owned listings
 * GET /preowned or /preowned?category=ELECTRONICS
 * 
 * Logic:
 * - Only returns listings with status = 'AVAILABLE'
 * - Sorted by newest first (created_at DESC)
 * - Optional category filter
 */
async function getAllListings(req, res) {
    try {
        const { category } = req.query;

        let query;
        let params = [];

        if (category) {
            // Filter by category (show all statuses)
            query = `
                SELECT id, seller_id, seller_name, title, description, price, category, images, status, created_at
                FROM preowned_listings
                WHERE category = $1
                ORDER BY created_at DESC
            `;
            params = [category];
        } else {
            // Return all listings (including SOLD items)
            query = `
                SELECT id, seller_id, seller_name, title, description, price, category, images, status, created_at
                FROM preowned_listings
                ORDER BY created_at DESC
            `;
        }

        const result = await db.query(query, params);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            listings: result.rows
        });

    } catch (error) {
        console.error('Error in getAllListings:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch listings'
        });
    }
}

/**
 * Get single listing by ID (for Popup Modal view)
 * GET /preowned/:id
 */
async function getListingById(req, res) {
    try {
        const { id } = req.params;

        // Validate UUID format
        if (!id || id.length < 36) {
            return res.status(400).json({
                success: false,
                error: 'Invalid listing ID format'
            });
        }

        const query = `
            SELECT id, seller_id, seller_name, title, description, price, category, images, status, created_at
            FROM preowned_listings
            WHERE id = $1
        `;
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Listing not found'
            });
        }

        return res.status(200).json({
            success: true,
            listing: result.rows[0]
        });

    } catch (error) {
        console.error('Error in getListingById:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch listing details'
        });
    }
}

/**
 * Create new pre-owned listing
 * POST /preowned
 * 
 * Body: { seller_id, seller_name, title, description, price, category, images }
 * - images should be an array of image URLs
 * - status defaults to 'AVAILABLE'
 */
async function createListing(req, res) {
    try {
        const { seller_id, seller_name, title, description, price, category, images } = req.body;

        // Validate required fields
        if (!seller_id || !seller_name || !title || !price || !category) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: seller_id, seller_name, title, price, category'
            });
        }

        // Validate price is positive
        if (price <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Price must be greater than 0'
            });
        }

        // Ensure images is an array (default to empty array if not provided)
        const imageArray = Array.isArray(images) ? images : [];

        const query = `
            INSERT INTO preowned_listings (seller_id, seller_name, title, description, price, category, images, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'AVAILABLE')
            RETURNING id, seller_id, seller_name, title, description, price, category, images, status, created_at
        `;
        const params = [seller_id, seller_name, title, description || '', price, category, imageArray];

        const result = await db.query(query, params);

        return res.status(201).json({
            success: true,
            message: 'Listing created successfully',
            listing: result.rows[0]
        });

    } catch (error) {
        console.error('Error in createListing:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create listing'
        });
    }
}

/**
 * Mark listing as sold
 * PUT /preowned/:id/sold
 * 
 * Updates status from 'AVAILABLE' to 'SOLD'
 */
async function markAsSold(req, res) {
    try {
        const { id } = req.params;

        // Validate UUID format
        if (!id || id.length < 36) {
            return res.status(400).json({
                success: false,
                error: 'Invalid listing ID format'
            });
        }

        // Check if listing exists and is still available
        const checkQuery = `SELECT id, status FROM preowned_listings WHERE id = $1`;
        const checkResult = await db.query(checkQuery, [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Listing not found'
            });
        }

        if (checkResult.rows[0].status === 'SOLD') {
            return res.status(400).json({
                success: false,
                error: 'Listing is already marked as sold'
            });
        }

        // Update status to SOLD
        const updateQuery = `
            UPDATE preowned_listings
            SET status = 'SOLD'
            WHERE id = $1
            RETURNING id, seller_id, seller_name, title, status, created_at
        `;
        const result = await db.query(updateQuery, [id]);

        return res.status(200).json({
            success: true,
            message: 'Listing marked as sold',
            listing: result.rows[0]
        });

    } catch (error) {
        console.error('Error in markAsSold:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update listing'
        });
    }
}

module.exports = {
    getAllListings,
    getListingById,
    createListing,
    markAsSold
};
