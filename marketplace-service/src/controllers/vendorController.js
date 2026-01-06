// src/controllers/vendorController.js
// Controller for Shop-First Architecture (Startups & Food Vendors)
const db = require('../config/db');

/**
 * Get all vendors by type (STARTUP or FOOD_VENDOR)
 * GET /vendors?type=STARTUP or /vendors?type=FOOD_VENDOR
 * 
 * Business Logic:
 * - Returns ALL vendors regardless of is_active status
 * - Frontend displays unavailable banner for is_active = false
 */
async function getVendors(req, res) {
    try {
        const { type } = req.query;

        // Validate type parameter
        if (!type || !['STARTUP', 'FOOD_VENDOR'].includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or missing type parameter. Must be STARTUP or FOOD_VENDOR.'
            });
        }

        // Return all vendors regardless of is_active status
        const query = `
            SELECT id, owner_id, name, type, description, logo_url, is_active, created_at
            FROM vendors
            WHERE type = $1
            ORDER BY name ASC
        `;
        const params = [type];

        const result = await db.query(query, params);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            vendors: result.rows
        });

    } catch (error) {
        console.error('Error in getVendors:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch vendors'
        });
    }
}

/**
 * Get vendor by ID with all their products
 * GET /vendors/:id
 * 
 * Returns: Vendor details + array of products
 * Important: Products include is_available field for "Out of Stock" UI logic
 */
async function getVendorById(req, res) {
    try {
        const { id } = req.params;

        // Validate UUID format (basic check)
        if (!id || id.length < 36) {
            return res.status(400).json({
                success: false,
                error: 'Invalid vendor ID format'
            });
        }

        // Get vendor details
        const vendorQuery = `
            SELECT id, owner_id, name, type, description, logo_url, is_active, created_at
            FROM vendors
            WHERE id = $1
        `;
        const vendorResult = await db.query(vendorQuery, [id]);

        // Check if vendor exists
        if (vendorResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }

        const vendor = vendorResult.rows[0];

        // Get vendor's products
        // IMPORTANT: Include is_available for frontend to show "Out of Stock" or disable buy button
        const productsQuery = `
            SELECT id, vendor_id, name, description, price, image_url, is_available, created_at
            FROM products
            WHERE vendor_id = $1
            ORDER BY name ASC
        `;
        const productsResult = await db.query(productsQuery, [id]);

        // Combine vendor with products
        return res.status(200).json({
            success: true,
            vendor: {
                ...vendor,
                products: productsResult.rows
            }
        });

    } catch (error) {
        console.error('Error in getVendorById:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch vendor details'
        });
    }
}

module.exports = {
    getVendors,
    getVendorById
};
