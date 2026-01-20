# Payment Integration Setup Guide

## Overview
The marketplace-service now includes a complete SSLCommerz payment integration for vendor registration fees.

## Database Setup

### Step 1: Run the Migration SQL
Execute the following SQL file in your Aiven PostgreSQL console for `market_db`:

```bash
# File: marketplace-service/add-payment-tables.sql
```

This will create:
- `payment_transactions` table
- `payment_status` enum type
- `vendor_payment_status` view
- Additional columns in `vendors` table for merchant verification
- Automatic timestamp triggers

### Step 2: Verify Tables Created
```sql
-- Check if payment_transactions table exists
SELECT * FROM payment_transactions LIMIT 1;

-- Check vendor payment status view
SELECT * FROM vendor_payment_status LIMIT 5;
```

## SSLCommerz Setup

### Step 1: Get Test Credentials
1. Visit: https://developer.sslcommerz.com/registration/
2. Sign up for a **Sandbox Account** (Free for testing)
3. After registration, you'll receive:
   - Store ID
   - Store Password
   - API credentials

### Step 2: Configure Environment Variables
Update `marketplace-service/.env`:

```env
# SSLCommerz Configuration (Sandbox)
SSLCOMMERZ_STORE_ID=your_store_id_from_sslcommerz
SSLCOMMERZ_STORE_PASSWORD=your_store_password_from_sslcommerz

# Auth Database URL (for role updates)
AUTH_DB_URL=postgresql://avnadmin:AVNS_8oHRLpTCVcvFWMRj6sh@pg-1ea37722-aranov1107-6aeb.c.aivencloud.com:16231/auth_db

# Backend Base URL (through gateway)
BACKEND_BASE_URL=http://localhost:8000
```

### Step 3: Install Dependencies
```bash
cd marketplace-service
npm install sslcommerz-lts uuid
```

## API Endpoints

### 1. Initialize Payment
**POST** `/api/market/payment/init`

Request body:
```json
{
  "vendorId": "uuid-of-vendor",
  "amount": 500
}
```

Response:
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "url": "https://sandbox.sslcommerz.com/gwprocess/v4/...",
  "tran_id": "VENDOR_uuid_transaction-id"
}
```

### 2. Payment Callbacks (Handled by SSLCommerz)
- **POST** `/api/market/payment/success` - Called on successful payment
- **POST** `/api/market/payment/fail` - Called on failed payment
- **POST** `/api/market/payment/cancel` - Called when user cancels
- **POST** `/api/market/payment/ipn` - Server-to-server notification

### 3. Get Payment Status
**GET** `/api/market/payment/status/:tranId`

Response:
```json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "vendor_id": "uuid",
    "tran_id": "VENDOR_...",
    "amount": "500.00",
    "status": "VALIDATED",
    "created_at": "2026-01-20T...",
    "validated_at": "2026-01-20T..."
  }
}
```

### 4. Get Payment History
**GET** `/api/market/payment/history/:vendorId`

Response:
```json
{
  "success": true,
  "transactions": [
    {
      "id": "uuid",
      "tran_id": "VENDOR_...",
      "amount": "500.00",
      "status": "VALIDATED",
      "created_at": "2026-01-20T..."
    }
  ]
}
```

## Payment Flow

### Frontend Integration
1. User registers as vendor (creates entry in `vendors` table with status `PENDING_PAYMENT`)
2. Frontend calls `/api/market/payment/init` with vendorId and amount
3. Backend returns SSLCommerz gateway URL
4. Frontend redirects user to the gateway URL
5. User completes payment on SSLCommerz
6. SSLCommerz redirects back to backend callback URLs
7. Backend validates payment and:
   - Updates `payment_transactions` status to `VALIDATED`
   - Updates vendor status to `ACTIVE`
   - Adds `VENDOR` role to user in `auth_db`
   - Redirects user to success page

### Payment Status Flow
```
PENDING → VALIDATED (Success)
        → VALIDATION_FAILED (Invalid payment)
        → FAILED (Payment failed)
        → CANCELLED (User cancelled)
        → INIT_FAILED (Gateway initialization failed)
```

## Testing with Sandbox

### Test Card Details (Provided by SSLCommerz)
When testing in sandbox mode, use these test cards:

**Successful Transaction:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

**Failed Transaction:**
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVV: Any 3 digits

### Test URLs
- Success: `http://localhost:5173/dashboard?payment=success`
- Failure: `http://localhost:5173/vendor/payment?status=failed&vendorId={id}`

## Security Considerations

### Production Checklist
- [ ] Change `is_live` to `true` in `paymentController.js`
- [ ] Use production SSLCommerz credentials
- [ ] Enable HTTPS for all callback URLs
- [ ] Add rate limiting to payment init endpoint
- [ ] Enable transaction logging
- [ ] Add webhook signature verification
- [ ] Use environment-based callback URLs

### Callback URL Security
The callback URLs are server-to-server (SSLCommerz → Backend), not exposed to users. This prevents:
- Payment manipulation
- Status spoofing
- Direct access to success pages

## Troubleshooting

### Issue: "Failed to initialize payment gateway"
**Solution:** 
- Check SSLCommerz credentials in `.env`
- Verify store is active in SSLCommerz dashboard
- Check network connectivity

### Issue: "User role not updated in auth_db"
**Solution:**
- Verify `AUTH_DB_URL` is correct
- Check auth_db connection permissions
- Check logs for SQL errors

### Issue: "Payment validated but vendor still pending"
**Solution:**
- Check `payment_transactions` table for status
- Verify transaction exists and is linked to correct vendor
- Check for SQL transaction rollbacks in logs

### Issue: "Redirect to frontend fails"
**Solution:**
- Verify `BACKEND_BASE_URL` is correct
- Check frontend is running on port 5173
- Ensure CORS is configured properly

## Monitoring

### Check Payment Statistics
```sql
-- Count transactions by status
SELECT status, COUNT(*) as count
FROM payment_transactions
GROUP BY status;

-- Recent successful payments
SELECT v.name, pt.amount, pt.validated_at
FROM vendor_payment_status vps
JOIN vendors v ON vps.vendor_id = v.id
JOIN payment_transactions pt ON vps.transaction_id = pt.id
WHERE pt.status = 'VALIDATED'
ORDER BY pt.validated_at DESC
LIMIT 10;

-- Failed payments needing attention
SELECT v.name, pt.tran_id, pt.status, pt.gateway_response
FROM payment_transactions pt
JOIN vendors v ON pt.vendor_id = v.id
WHERE pt.status IN ('FAILED', 'VALIDATION_FAILED')
ORDER BY pt.created_at DESC;
```

## Next Steps
1. Run the SQL migration to create payment tables
2. Get SSLCommerz sandbox credentials
3. Update `.env` with credentials
4. Install npm packages
5. Test payment flow with sandbox
6. Monitor payment transactions
7. Set up production credentials when ready to go live

## Support
- SSLCommerz Documentation: https://developer.sslcommerz.com/
- SSLCommerz Support: support@sslcommerz.com
- Sandbox Dashboard: https://sandbox.sslcommerz.com/manage/
