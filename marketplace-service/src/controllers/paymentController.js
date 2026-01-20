const SSLCommerzPayment = require('sslcommerz-lts');
const { v4: uuidv4 } = require('uuid');
const { Client } = require('pg');
const db = require('../config/db');

// SSLCommerz credentials from environment
const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
const is_live = false; // Set to true for production

// Backend base URL (through gateway)
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:8000';

// Frontend URLs
const FRONTEND_SUCCESS_URL = 'http://localhost:5173/vendor-dashboard?payment=success';
const FRONTEND_FAILURE_URL = 'http://localhost:5173/vendor/payment';

/**
 * Initialize payment for vendor registration
 * POST /payment/init
 */
const initPayment = async (req, res) => {
    const { vendorId, amount } = req.body;

    if (!vendorId || !amount) {
        return res.status(400).json({
            success: false,
            message: 'vendorId and amount are required'
        });
    }

    const client = await db.pool.connect();

    try {
        // Get vendor details (only from vendors table - no JOIN with users)
        const vendorResult = await client.query(
            `SELECT * FROM vendors WHERE id = $1`,
            [vendorId]
        );

        if (vendorResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        const vendor = vendorResult.rows[0];

        // Generate unique transaction ID
        const tran_id = `VENDOR_${vendorId}_${uuidv4()}`;

        // Insert pending transaction record
        await client.query(
            `INSERT INTO payment_transactions 
             (id, vendor_id, tran_id, amount, status, payment_method, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
            [uuidv4(), vendorId, tran_id, amount, 'PENDING', 'SSLCOMMERZ']
        );

        // SSLCommerz payment data
        const data = {
            total_amount: amount,
            currency: 'BDT',
            tran_id: tran_id,
            success_url: `${BACKEND_BASE_URL}/api/market/payment/success`,
            fail_url: `${BACKEND_BASE_URL}/api/market/payment/fail`,
            cancel_url: `${BACKEND_BASE_URL}/api/market/payment/cancel`,
            ipn_url: `${BACKEND_BASE_URL}/api/market/payment/ipn`,
            shipping_method: 'NO',
            product_name: 'Vendor Registration Fee',
            product_category: 'Service',
            product_profile: 'general',
            cus_name: vendor.name || 'Customer',
            cus_email: vendor.contact_email || 'customer@example.com',
            cus_add1: vendor.business_address || 'N/A',
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: vendor.contact_phone || '01700000000',
            ship_name: 'N/A',
            ship_add1: 'N/A',
            ship_city: 'N/A',
            ship_state: 'N/A',
            ship_postcode: '0000',
            ship_country: 'Bangladesh',
            value_a: vendorId, // Store vendorId for callback
            value_b: vendor.owner_id // Store owner_id for role update
        };

        // Initialize SSLCommerz
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        const apiResponse = await sslcz.init(data);

        if (apiResponse?.GatewayPageURL) {
            // Update transaction with session key if available
            if (apiResponse.sessionkey) {
                await client.query(
                    `UPDATE payment_transactions 
                     SET session_key = $1, updated_at = NOW() 
                     WHERE tran_id = $2`,
                    [apiResponse.sessionkey, tran_id]
                );
            }

            return res.status(200).json({
                success: true,
                message: 'Payment initialized successfully',
                url: apiResponse.GatewayPageURL,
                tran_id: tran_id
            });
        } else {
            // Update transaction status to failed
            await client.query(
                `UPDATE payment_transactions 
                 SET status = $1, updated_at = NOW() 
                 WHERE tran_id = $2`,
                ['INIT_FAILED', tran_id]
            );

            return res.status(500).json({
                success: false,
                message: 'Failed to initialize payment gateway',
                error: apiResponse
            });
        }
    } catch (error) {
        console.error('Payment initialization error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    } finally {
        client.release();
    }
};

/**
 * Payment success callback from SSLCommerz
 * POST /payment/success
 */
const paymentSuccess = async (req, res) => {
    const { 
        tran_id, 
        val_id, 
        amount, 
        card_type, 
        store_amount, 
        bank_tran_id,
        status,
        value_a: vendorId,
        value_b: ownerId
    } = req.body;

    console.log('Payment success callback received:', { tran_id, val_id, status, vendorId, ownerId });

    const client = await db.pool.connect();

    try {
        // Validate the payment with SSLCommerz
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        const validationResponse = await sslcz.validate({ val_id });

        console.log('Validation response:', validationResponse);

        if (validationResponse.status === 'VALID' || validationResponse.status === 'VALIDATED') {
            await client.query('BEGIN');

            // Update payment transaction in market_db
            await client.query(
                `UPDATE payment_transactions 
                 SET status = $1, 
                     val_id = $2, 
                     bank_tran_id = $3, 
                     card_type = $4, 
                     store_amount = $5,
                     validated_at = NOW(),
                     updated_at = NOW(),
                     gateway_response = $6
                 WHERE tran_id = $7`,
                [
                    'VALIDATED',
                    val_id,
                    bank_tran_id,
                    card_type,
                    store_amount,
                    JSON.stringify(validationResponse),
                    tran_id
                ]
            );

            // Update vendor status in market_db
            await client.query(
                `UPDATE vendors 
                 SET is_active = true, 
                     status = 'ACTIVE', 
                     is_verified_merchant = true,
                     updated_at = NOW()
                 WHERE id = $1`,
                [vendorId]
            );

            await client.query('COMMIT');

            console.log(`Payment validated and vendor ${vendorId} activated successfully`);

            // Redirect to frontend success page
            return res.redirect(FRONTEND_SUCCESS_URL);
        } else {
            // Payment validation failed
            await client.query(
                `UPDATE payment_transactions 
                 SET status = $1, 
                     gateway_response = $2,
                     updated_at = NOW()
                 WHERE tran_id = $3`,
                ['VALIDATION_FAILED', JSON.stringify(validationResponse), tran_id]
            );

            console.log('Payment validation failed:', validationResponse);

            return res.redirect(`${FRONTEND_FAILURE_URL}?status=failed&vendorId=${vendorId}&reason=validation_failed`);
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Payment success handler error:', error);
        return res.redirect(`${FRONTEND_FAILURE_URL}?status=failed&vendorId=${vendorId}&reason=server_error`);
    } finally {
        client.release();
    }
};

/**
 * Payment failure callback from SSLCommerz
 * POST /payment/fail
 */
const paymentFail = async (req, res) => {
    const { 
        tran_id, 
        error,
        value_a: vendorId 
    } = req.body;

    console.log('Payment failure callback received:', { tran_id, error, vendorId });

    const client = await db.pool.connect();

    try {
        // Update transaction status to FAILED
        await client.query(
            `UPDATE payment_transactions 
             SET status = $1, 
                 gateway_response = $2,
                 updated_at = NOW()
             WHERE tran_id = $3`,
            ['FAILED', JSON.stringify(req.body), tran_id]
        );

        console.log(`Payment failed for transaction: ${tran_id}`);

        // Redirect to frontend failure page with vendorId for retry
        return res.redirect(`${FRONTEND_FAILURE_URL}?status=failed&vendorId=${vendorId}&reason=payment_failed`);
    } catch (err) {
        console.error('Payment failure handler error:', err);
        return res.redirect(`${FRONTEND_FAILURE_URL}?status=failed&vendorId=${vendorId}&reason=server_error`);
    } finally {
        client.release();
    }
};

/**
 * Payment cancel callback from SSLCommerz
 * POST /payment/cancel
 */
const paymentCancel = async (req, res) => {
    const { 
        tran_id,
        value_a: vendorId 
    } = req.body;

    console.log('Payment cancel callback received:', { tran_id, vendorId });

    const client = await db.pool.connect();

    try {
        // Update transaction status to CANCELLED
        await client.query(
            `UPDATE payment_transactions 
             SET status = $1, 
                 gateway_response = $2,
                 updated_at = NOW()
             WHERE tran_id = $3`,
            ['CANCELLED', JSON.stringify(req.body), tran_id]
        );

        console.log(`Payment cancelled for transaction: ${tran_id}`);

        // Redirect to frontend failure page
        return res.redirect(`${FRONTEND_FAILURE_URL}?status=cancelled&vendorId=${vendorId}`);
    } catch (error) {
        console.error('Payment cancel handler error:', error);
        return res.redirect(`${FRONTEND_FAILURE_URL}?status=cancelled&vendorId=${vendorId}`);
    } finally {
        client.release();
    }
};

/**
 * IPN (Instant Payment Notification) handler
 * POST /payment/ipn
 */
const paymentIPN = async (req, res) => {
    const { tran_id, val_id, status } = req.body;

    console.log('IPN received:', { tran_id, val_id, status });

    // IPN is for server-to-server notification
    // Process similar to success but don't redirect
    const client = await db.pool.connect();

    try {
        if (status === 'VALID') {
            const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
            const validationResponse = await sslcz.validate({ val_id });

            if (validationResponse.status === 'VALID' || validationResponse.status === 'VALIDATED') {
                // Get transaction details
                const txnResult = await client.query(
                    `SELECT * FROM payment_transactions WHERE tran_id = $1`,
                    [tran_id]
                );

                if (txnResult.rows.length > 0) {
                    const txn = txnResult.rows[0];

                    // Only process if not already validated
                    if (txn.status !== 'VALIDATED') {
                        await client.query('BEGIN');

                        await client.query(
                            `UPDATE payment_transactions 
                             SET status = 'VALIDATED', 
                                 val_id = $1,
                                 validated_at = NOW(),
                                 updated_at = NOW()
                             WHERE tran_id = $2`,
                            [val_id, tran_id]
                        );

                        await client.query(
                            `UPDATE vendors 
                             SET is_active = true, 
                                 status = 'ACTIVE', 
                                 is_verified_merchant = true,
                                 updated_at = NOW()
                             WHERE id = $1`,
                            [txn.vendor_id]
                        );

                        await client.query('COMMIT');
                    }
                }
            }
        }

        return res.status(200).json({ message: 'IPN received' });
    } catch (error) {
        console.error('IPN handler error:', error);
        return res.status(500).json({ message: 'IPN processing failed' });
    } finally {
        client.release();
    }
};

/**
 * Get payment status
 * GET /payment/status/:tranId
 */
const getPaymentStatus = async (req, res) => {
    const { tranId } = req.params;

    const client = await db.pool.connect();

    try {
        const result = await client.query(
            `SELECT pt.*, v.business_name 
             FROM payment_transactions pt
             LEFT JOIN vendors v ON pt.vendor_id = v.id
             WHERE pt.tran_id = $1`,
            [tranId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        return res.status(200).json({
            success: true,
            transaction: result.rows[0]
        });
    } catch (error) {
        console.error('Get payment status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    } finally {
        client.release();
    }
};

/**
 * Get payment history for a vendor
 * GET /payment/history/:vendorId
 */
const getPaymentHistory = async (req, res) => {
    const { vendorId } = req.params;

    const client = await db.pool.connect();

    try {
        const result = await client.query(
            `SELECT * FROM payment_transactions 
             WHERE vendor_id = $1 
             ORDER BY created_at DESC`,
            [vendorId]
        );

        return res.status(200).json({
            success: true,
            transactions: result.rows
        });
    } catch (error) {
        console.error('Get payment history error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    } finally {
        client.release();
    }
};

module.exports = {
    initPayment,
    paymentSuccess,
    paymentFail,
    paymentCancel,
    paymentIPN,
    getPaymentStatus,
    getPaymentHistory
};
