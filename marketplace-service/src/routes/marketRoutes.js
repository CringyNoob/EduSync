// src/routes/marketRoutes.js
// API Routes for Marketplace Service
const express = require('express');
const router = express.Router();

// Import controllers
const vendorController = require('../controllers/vendorController');
const productController = require('../controllers/productController');
const preownedController = require('../controllers/preownedController');
const vendorManagementController = require('../controllers/vendorManagementController');

// Import middleware
const authMiddleware = require('../middleware/authMiddleware');

// ========================================
// VENDOR ROUTES (Shop-First Architecture)
// For Startups & Food Vendors
// ========================================

/**
 * GET /vendors
 * Get all vendors by type
 * Query: ?type=STARTUP or ?type=FOOD_VENDOR
 */
router.get('/vendors', vendorController.getVendors);

/**
 * GET /vendors/my-shop
 * Get the vendor owned by the current user (requires authentication)
 */
router.get('/vendors/my-shop', authMiddleware, vendorManagementController.getMyVendor);

/**
 * PUT /vendors/my-shop
 * Update vendor profile (requires authentication)
 */
router.put('/vendors/my-shop', authMiddleware, vendorManagementController.updateMyVendor);

/**
 * GET /vendors/my-shop/products
 * Get all products for the current user's vendor (requires authentication)
 */
router.get('/vendors/my-shop/products', authMiddleware, vendorManagementController.getMyProducts);

/**
 * POST /vendors/my-shop/products
 * Create a new product for the vendor (requires authentication)
 */
router.post('/vendors/my-shop/products', authMiddleware, vendorManagementController.createProduct);

/**
 * PUT /vendors/my-shop/products/:productId
 * Update a product (requires authentication)
 */
router.put('/vendors/my-shop/products/:productId', authMiddleware, vendorManagementController.updateProduct);

/**
 * DELETE /vendors/my-shop/products/:productId
 * Delete a product (requires authentication)
 */
router.delete('/vendors/my-shop/products/:productId', authMiddleware, vendorManagementController.deleteProduct);

/**
 * GET /vendors/my-shop/orders
 * Get all orders for the vendor (requires authentication)
 * Query: ?status=PENDING,PREPARING,READY,COMPLETED,CANCELLED
 */
router.get('/vendors/my-shop/orders', authMiddleware, vendorManagementController.getMyOrders);

/**
 * PUT /vendors/my-shop/orders/:orderId/status
 * Update order status (requires authentication)
 * Body: { status: 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED' }
 */
router.put('/vendors/my-shop/orders/:orderId/status', authMiddleware, vendorManagementController.updateOrderStatus);

/**
 * GET /vendors/my-shop/analytics
 * Get vendor analytics (requires authentication)
 * Query: ?range=THIS_WEEK|THIS_MONTH|ALL_TIME
 */
router.get('/vendors/my-shop/analytics', authMiddleware, vendorManagementController.getMyAnalytics);

// ========================================
// CATEGORY ROUTES (Dynamic Categories per Vendor)
// ========================================

/**
 * GET /vendors/my-shop/categories
 * Get all categories for the vendor (requires authentication)
 */
router.get('/vendors/my-shop/categories', authMiddleware, vendorManagementController.getMyCategories);

/**
 * POST /vendors/my-shop/categories
 * Create a new category (requires authentication)
 * Body: { name, icon?, color? }
 */
router.post('/vendors/my-shop/categories', authMiddleware, vendorManagementController.createCategory);

/**
 * PUT /vendors/my-shop/categories/:categoryId
 * Update a category (requires authentication)
 * Body: { name?, icon?, color?, display_order? }
 */
router.put('/vendors/my-shop/categories/:categoryId', authMiddleware, vendorManagementController.updateCategory);

/**
 * DELETE /vendors/my-shop/categories/:categoryId
 * Delete a category (requires authentication)
 */
router.delete('/vendors/my-shop/categories/:categoryId', authMiddleware, vendorManagementController.deleteCategory);

/**
 * GET /vendors/:id
 * Get vendor details with all their products
 */
router.get('/vendors/:id', vendorController.getVendorById);

/**
 * POST /vendors/:id/increment-views
 * Increment vendor profile views (public endpoint for marketplace visits)
 */
router.post('/vendors/:id/increment-views', vendorController.incrementVendorViews);

/**
 * POST /vendors/register
 * Register a new vendor (requires authentication)
 * Body: { name, description, type }
 */
router.post('/vendors/register', authMiddleware, vendorController.registerVendor);

// ========================================
// PRODUCT ROUTES (Individual Item Lookup)
// For Startup/Food Vendor products
// ========================================

/**
 * GET /products/:id
 * Get single product with vendor info (for popup modal)
 */
router.get('/products/:id', productController.getProductById);

// ========================================
// PREOWNED ROUTES (Product-First Architecture)
// For Pre-owned Listings
// ========================================

/**
 * GET /preowned
 * Get all available listings (newest first)
 * Optional Query: ?category=ELECTRONICS
 */
router.get('/preowned', preownedController.getAllListings);

/**
 * POST /preowned
 * Create new pre-owned listing
 * Body: { seller_id, seller_name, title, description, price, category, images }
 */
router.post('/preowned', preownedController.createListing);

/**
 * GET /preowned/:id
 * Get single listing details (for Popup Modal)
 */
router.get('/preowned/:id', preownedController.getListingById);

/**
 * GET /preowned/user/:userId
 * Get all pre-owned listings by a specific user
 */
router.get('/preowned/user/:userId', preownedController.getListingsByUser);

/**
 * PUT /preowned/:id/sold
 * Mark listing as sold
 */
router.put('/preowned/:id/sold', preownedController.markAsSold);

module.exports = router;
