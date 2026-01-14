// src/routes/marketRoutes.js
// API Routes for Marketplace Service
const express = require('express');
const router = express.Router();

// Import controllers
const vendorController = require('../controllers/vendorController');
const productController = require('../controllers/productController');
const preownedController = require('../controllers/preownedController');

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
 * GET /vendors/:id
 * Get vendor details with all their products
 */
router.get('/vendors/:id', vendorController.getVendorById);

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
