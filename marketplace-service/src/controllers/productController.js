// src/controllers/productController.js
// Controller for individual Product lookups (Startup/Food Vendor items)
const db = require('../config/db');

/**
 * Get single product by ID with vendor information
 * GET /products/:id
 * 
 * Returns: Product details + Vendor name and type
 * Use case: Popup modal showing product details and who sells it
 */
async function getProductById(req, res) {
    try {
        const { id } = req.params;

        // Validate UUID format (basic check)
        if (!id || id.length < 36) {
            return res.status(400).json({
                success: false,
                error: 'Invalid product ID format'
            });
        }

        // Query product with vendor details via JOIN
        const query = `
            SELECT 
                p.id,
                p.vendor_id,
                p.name,
                p.description,
                p.price,
                p.image_url,
                p.is_available,
                p.created_at,
                v.name AS vendor_name,
                v.type AS vendor_type,
                v.logo_url AS vendor_logo,
                v.is_active AS vendor_is_active
            FROM products p
            JOIN vendors v ON p.vendor_id = v.id
            WHERE p.id = $1
        `;
        
        const result = await db.query(query, [id]);

        // Check if product exists
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        const row = result.rows[0];

        // Structure response with nested vendor object
        const product = {
            id: row.id,
            vendor_id: row.vendor_id,
            name: row.name,
            description: row.description,
            price: row.price,
            image_url: row.image_url,
            is_available: row.is_available,
            created_at: row.created_at,
            vendor: {
                name: row.vendor_name,
                type: row.vendor_type,
                logo_url: row.vendor_logo,
                is_active: row.vendor_is_active
            }
        };

        return res.status(200).json({
            success: true,
            product: product
        });

    } catch (error) {
        console.error('Error in getProductById:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch product details'
        });
    }
}

module.exports = {
    getProductById
};
