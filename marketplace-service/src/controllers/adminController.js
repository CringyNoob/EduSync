// src/controllers/adminController.js
// Admin statistics and management for Marketplace Service
const db = require('../config/db');

/**
 * Get admin statistics for marketplace service
 * GET /admin/stats
 */
const getAdminStats = async (req, res) => {
    try {
        // Get vendor counts by status and type
        let vendorStats = { rows: [{ 
            total_vendors: 0, active_vendors: 0, pending_vendors: 0, 
            suspended_vendors: 0, startup_vendors: 0, food_vendors: 0, new_vendors_7d: 0 
        }] };
        try {
            vendorStats = await db.query(`
                SELECT 
                    COUNT(*) as total_vendors,
                    COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_vendors,
                    COUNT(*) FILTER (WHERE status = 'PENDING_PAYMENT') as pending_payment_vendors,
                    COUNT(*) FILTER (WHERE status = 'SUSPENDED') as suspended_vendors,
                    COUNT(*) FILTER (WHERE type = 'STARTUP') as startup_vendors,
                    COUNT(*) FILTER (WHERE type = 'FOOD_VENDOR') as food_vendors,
                    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_vendors_7d
                FROM vendors
            `);
        } catch (e) {
            console.log('Vendors table query error:', e.message);
        }

        // Get product counts
        let productStats = { rows: [{ total_products: 0, available_products: 0 }] };
        try {
            productStats = await db.query(`
                SELECT 
                    COUNT(*) as total_products,
                    COUNT(*) FILTER (WHERE available = true) as available_products
                FROM products
            `);
        } catch (e) {
            console.log('Products table query error:', e.message);
        }

        // Get preowned listing counts
        let preownedStats = { rows: [{ 
            total_listings: 0, available_listings: 0, sold_listings: 0, new_listings_7d: 0 
        }] };
        try {
            preownedStats = await db.query(`
                SELECT 
                    COUNT(*) as total_listings,
                    COUNT(*) FILTER (WHERE status = 'AVAILABLE') as available_listings,
                    COUNT(*) FILTER (WHERE status = 'SOLD') as sold_listings,
                    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_listings_7d
                FROM preowned_listings
            `);
        } catch (e) {
            console.log('Preowned listings table query error:', e.message);
        }

        // Get order counts
        let orderStats = { rows: [{}] };
        try {
            orderStats = await db.query(`
                SELECT 
                    COUNT(*) as total_orders,
                    COUNT(*) FILTER (WHERE status = 'PENDING') as pending_orders,
                    COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_orders,
                    COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled_orders,
                    COALESCE(SUM(total) FILTER (WHERE status = 'COMPLETED'), 0) as total_revenue
                FROM orders
            `);
        } catch (e) {
            // Orders table might not exist
            console.log('Orders table not available');
        }

        // Get category breakdown for vendors
        const categoryStats = await db.query(`
            SELECT type as category, COUNT(*) as count
            FROM vendors
            GROUP BY type
            ORDER BY count DESC
        `);

        const vendors = vendorStats.rows[0];
        const products = productStats.rows[0];
        const preowned = preownedStats.rows[0];
        const orders = orderStats.rows[0];

        res.status(200).json({
            success: true,
            data: {
                vendors: {
                    total: parseInt(vendors.total_vendors) || 0,
                    active: parseInt(vendors.active_vendors) || 0,
                    pending: parseInt(vendors.pending_payment_vendors) || 0,
                    suspended: parseInt(vendors.suspended_vendors) || 0,
                    startups: parseInt(vendors.startup_vendors) || 0,
                    food_vendors: parseInt(vendors.food_vendors) || 0,
                    new_7d: parseInt(vendors.new_vendors_7d) || 0
                },
                products: {
                    total: parseInt(products.total_products) || 0,
                    available: parseInt(products.available_products) || 0
                },
                preowned: {
                    total: parseInt(preowned.total_listings) || 0,
                    available: parseInt(preowned.available_listings) || 0,
                    sold: parseInt(preowned.sold_listings) || 0,
                    new_7d: parseInt(preowned.new_listings_7d) || 0
                },
                orders: {
                    total: parseInt(orders.total_orders) || 0,
                    pending: parseInt(orders.pending_orders) || 0,
                    completed: parseInt(orders.completed_orders) || 0,
                    cancelled: parseInt(orders.cancelled_orders) || 0,
                    total_revenue: parseFloat(orders.total_revenue) || 0
                },
                by_category: categoryStats.rows
            }
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get all vendors for admin management
 * GET /admin/vendors
 */
const getAllVendors = async (req, res) => {
    try {
        const { status, type } = req.query;
        
        let whereConditions = [];
        const queryParams = [];
        let paramIndex = 1;

        if (status) {
            whereConditions.push(`status = $${paramIndex}`);
            queryParams.push(status.toUpperCase());
            paramIndex++;
        }

        if (type) {
            whereConditions.push(`type = $${paramIndex}`);
            queryParams.push(type.toUpperCase());
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0 
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        const result = await db.query(`
            SELECT 
                v.*,
                (SELECT COUNT(*) FROM products p WHERE p.vendor_id = v.id) as product_count
            FROM vendors v
            ${whereClause}
            ORDER BY v.created_at DESC
        `, queryParams);

        res.status(200).json({
            success: true,
            data: result.rows,
            meta: {
                total: result.rows.length
            }
        });

    } catch (error) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vendors'
        });
    }
};

/**
 * Update vendor status (approve/suspend)
 * PATCH /admin/vendors/:id/status
 */
const updateVendorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['PENDING', 'ACTIVE', 'SUSPENDED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const result = await db.query(
            'UPDATE vendors SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Vendor status updated to ${status}`,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating vendor status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update vendor status'
        });
    }
};

/**
 * Delete a vendor and all their products
 * DELETE /admin/vendors/:id
 */
const deleteVendor = async (req, res) => {
    try {
        const { id } = req.params;
        
        // First delete all products associated with the vendor
        await db.query('DELETE FROM products WHERE vendor_id = $1', [id]);
        
        // Then delete the vendor
        const result = await db.query(
            'DELETE FROM vendors WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Vendor and all associated products deleted successfully',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error deleting vendor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete vendor'
        });
    }
};

/**
 * Get products for a vendor
 * GET /admin/vendors/:id/products
 */
const getVendorProducts = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(
            'SELECT * FROM products WHERE vendor_id = $1 ORDER BY created_at DESC',
            [id]
        );
        
        res.status(200).json({
            success: true,
            data: result.rows
        });
        
    } catch (error) {
        console.error('Error fetching vendor products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products'
        });
    }
};

/**
 * Delete a product
 * DELETE /admin/products/:id
 */
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(
            'DELETE FROM products WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product'
        });
    }
};

/**
 * Get vendor analytics for admin dashboard
 * GET /admin/analytics/vendors
 */
const getVendorAnalytics = async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'ACTIVE') as active,
                COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
                COUNT(*) FILTER (WHERE status = 'SUSPENDED' OR status = 'BLOCKED' OR status = 'INACTIVE') as inactive,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_this_week
            FROM vendors
        `);
        
        const productStats = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE available = true AND quantity > 0) as in_stock,
                COUNT(*) FILTER (WHERE available = false OR quantity = 0) as out_of_stock,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_this_week
            FROM products
        `);
        
        const preownedStats = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'AVAILABLE') as available,
                COUNT(*) FILTER (WHERE status = 'SOLD') as sold,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_this_week
            FROM preowned_listings
        `);
        
        res.status(200).json({
            success: true,
            data: {
                vendors: {
                    total: parseInt(stats.rows[0].total) || 0,
                    active: parseInt(stats.rows[0].active) || 0,
                    pending: parseInt(stats.rows[0].pending) || 0,
                    inactive: parseInt(stats.rows[0].inactive) || 0,
                    newThisWeek: parseInt(stats.rows[0].new_this_week) || 0,
                    growth: 0 // Calculate if needed
                },
                products: {
                    total: parseInt(productStats.rows[0].total) || 0,
                    inStock: parseInt(productStats.rows[0].in_stock) || 0,
                    outOfStock: parseInt(productStats.rows[0].out_of_stock) || 0,
                    newThisWeek: parseInt(productStats.rows[0].new_this_week) || 0
                },
                preowned: {
                    total: parseInt(preownedStats.rows[0].total) || 0,
                    available: parseInt(preownedStats.rows[0].available) || 0,
                    sold: parseInt(preownedStats.rows[0].sold) || 0,
                    newThisWeek: parseInt(preownedStats.rows[0].new_this_week) || 0
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching vendor analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vendor analytics'
        });
    }
};

module.exports = {
    getAdminStats,
    getAllVendors,
    updateVendorStatus,
    deleteVendor,
    getVendorProducts,
    deleteProduct,
    getVendorAnalytics
};
