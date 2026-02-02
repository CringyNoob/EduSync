const express = require('express');
const router = express.Router();
const {
  getAllRentalListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  createRentalTransaction,
  getUserRentals,
  getUserListings,
  completeRentalTransaction,
  getAdminAllListings,
  adminDeleteListing,
  getAdminStats
} = require('../controllers/rentalController');

// =====================================================
// RENTAL LISTING ROUTES
// =====================================================

// Get all rental listings (with optional filters)
router.get('/listings', getAllRentalListings);

// Get single rental listing by ID
router.get('/listings/:id', getListingById);

// Create new rental listing
router.post('/listings', createListing);

// Update rental listing
router.put('/listings/:id', updateListing);

// Delete rental listing
router.delete('/listings/:id', deleteListing);

// Get user's listings (as owner)
router.get('/user/:user_id/listings', getUserListings);

// =====================================================
// RENTAL TRANSACTION ROUTES
// =====================================================

// Create rental transaction (rent an item)
router.post('/transactions', createRentalTransaction);

// Get user's rental transactions (as renter)
router.get('/user/:user_id/rentals', getUserRentals);

// Complete rental transaction
router.put('/transactions/:id/complete', completeRentalTransaction);

// =====================================================
// ADMIN ROUTES
// =====================================================

// Get admin statistics
router.get('/admin/stats', getAdminStats);

// Get all listings for admin (with pagination and filters)
router.get('/admin/listings', getAdminAllListings);

// Delete any listing (admin only)
router.delete('/admin/listings/:id', adminDeleteListing);

module.exports = router;
