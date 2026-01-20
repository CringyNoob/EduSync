// src/controllers/vendorController.js
// Controller for Shop-First Architecture (Startups & Food Vendors)
const db = require('../config/db');
const axios = require('axios');

/**
 * Get all vendors by type (STARTUP or FOOD_VENDOR)
 * GET /vendors?type=STARTUP or /vendors?type=FOOD_VENDOR
 * 
 * Business Logic:
 * - STARTUP: Returns all startups regardless of is_active status
 * - FOOD_VENDOR: Only returns vendors where is_active = true (Shop is Open)
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

        let query;
        let params;

        if (type === 'FOOD_VENDOR') {
            // Food vendors: Only return ACTIVE shops (is_active = true means "Shop is Open")
            query = `
                SELECT id, owner_id, name, type, description, logo_url, is_active, created_at
                FROM vendors
                WHERE type = $1 AND is_active = true
                ORDER BY name ASC
            `;
            params = [type];
        } else {
            // Startups: Return all regardless of is_active status
            query = `
                SELECT id, owner_id, name, type, description, logo_url, is_active, created_at
                FROM vendors
                WHERE type = $1
                ORDER BY name ASC
            `;
            params = [type];
        }

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

/**
 * Register a new vendor (Shop registration)
 * POST /vendors/register
 * 
 * Business Logic:
 * - One shop per user rule: Check if user already owns a vendor
 * - New vendors start with status = 'PENDING_PAYMENT'
 * - New vendors start with is_active = false
 * - Returns vendorId on successful registration
 * 
 * Required: req.user.id (from auth middleware)
 * Body: { name, description, type }
 */
async function registerVendor(req, res) {
    try {
        const { 
            name, 
            description, 
            type, 
            logoUrl, 
            businessAddress, 
            contactEmail, 
            contactPhone 
        } = req.body;
        const ownerId = req.user?.id;

        // Validate required fields
        if (!ownerId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required. User ID not found.'
            });
        }

        if (!name || !type) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name and type are required.'
            });
        }

        if (!businessAddress || !contactEmail || !contactPhone || !description) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: businessAddress, contactEmail, contactPhone, and description are required.'
            });
        }

        // Validate vendor type
        if (!['STARTUP', 'FOOD_VENDOR'].includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid vendor type. Must be STARTUP or FOOD_VENDOR.'
            });
        }

        // Check if user already owns a vendor (One shop per user rule)
        const existingVendorQuery = `
            SELECT id FROM vendors WHERE owner_id = $1 LIMIT 1
        `;
        const existingVendor = await db.query(existingVendorQuery, [ownerId]);

        if (existingVendor.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'You already own a shop. Only one shop per user is allowed.'
            });
        }

        // Insert new vendor with all fields
        const insertQuery = `
            INSERT INTO vendors (
                owner_id, name, type, description, logo_url, 
                business_address, contact_email, contact_phone,
                status, is_active, is_verified_merchant
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING_PAYMENT', false, false)
            RETURNING id
        `;
        const insertResult = await db.query(insertQuery, [
            ownerId,
            name,
            type,
            description,
            logoUrl || null,
            businessAddress,
            contactEmail,
            contactPhone
        ]);

        const newVendorId = insertResult.rows[0].id;

        // Call auth-service to add VENDOR role to user
        try {
            const authToken = req.headers.authorization; // Forward the JWT token
            const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
            
            // Auth service routes are mounted at root level, not /api/auth
            const addRoleUrl = `${authServiceUrl}/add-vendor-role`;
            console.log('🔄 Calling auth-service to add VENDOR role:', addRoleUrl);
            console.log('🔑 Token present:', !!authToken);
            
            const authResponse = await axios.post(
                addRoleUrl,
                {},
                {
                    headers: {
                        'Authorization': authToken,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (authResponse.data.success) {
                console.log('✅ VENDOR role added successfully:', authResponse.data);
            } else {
                console.warn('⚠️ Unexpected response from auth-service:', authResponse.data);
            }
        } catch (authError) {
            console.error('❌ Error calling auth-service to add VENDOR role:', authError.message);
            if (authError.response) {
                console.error('Response status:', authError.response.status);
                console.error('Response data:', authError.response.data);
            }
            // Continue - vendor is created even if role update fails
        }

        return res.status(201).json({
            success: true,
            vendorId: newVendorId,
            message: 'Vendor registered successfully. Payment pending.'
        });

    } catch (error) {
        console.error('Error in registerVendor:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to register vendor'
        });
    }
}

module.exports = {
    getVendors,
    getVendorById,
    registerVendor
};
