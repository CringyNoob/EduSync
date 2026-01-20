const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Initialize payment - requires authentication
// POST /payment/init
router.post('/init', paymentController.initPayment);

// SSLCommerz callback routes (no auth required - called by SSLCommerz)
// POST /payment/success
router.post('/success', paymentController.paymentSuccess);

// POST /payment/fail
router.post('/fail', paymentController.paymentFail);

// POST /payment/cancel
router.post('/cancel', paymentController.paymentCancel);

// POST /payment/ipn (Instant Payment Notification)
router.post('/ipn', paymentController.paymentIPN);

// Get payment status
// GET /payment/status/:tranId
router.get('/status/:tranId', paymentController.getPaymentStatus);

// Get payment history for a vendor
// GET /payment/history/:vendorId
router.get('/history/:vendorId', paymentController.getPaymentHistory);

module.exports = router;
