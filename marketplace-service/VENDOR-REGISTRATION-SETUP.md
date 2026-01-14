# 🚀 Setup Instructions for Vendor Registration Feature

## Prerequisites
- Node.js installed
- PostgreSQL database (Aiven) access
- Auth service running on port 3001
- Marketplace service on port 3002

---

## Step 1: Install Dependencies

```bash
cd marketplace-service
npm install
```

**Note:** This will install the newly added `jsonwebtoken` package.

---

## Step 2: Configure Environment Variables

### Check `.env` file exists
If not, copy from example:
```bash
cp .env.example .env
```

### Verify JWT_SECRET Configuration
**CRITICAL:** The `JWT_SECRET` in marketplace-service must match auth-service.

Edit `.env` file:
```env
# Add this line (if not present)
JWT_SECRET=your-secret-key-change-in-production
```

**To get the correct JWT_SECRET:**
```bash
# Check auth-service .env
cd ../auth-service
cat .env | grep JWT_SECRET

# Copy the same value to marketplace-service .env
cd ../marketplace-service
# Update JWT_SECRET to match
```

---

## Step 3: Update Database Schema

### Option A: For New Database Installation
```bash
psql -h pg-1ea37722-aranov1107-6aeb.c.aivencloud.com \
     -p 16231 \
     -U avnadmin \
     -d market_db \
     -f database-schema.sql
```

### Option B: For Existing Database (Migration)
```bash
psql -h pg-1ea37722-aranov1107-6aeb.c.aivencloud.com \
     -p 16231 \
     -U avnadmin \
     -d market_db \
     -f add-vendor-status-migration.sql
```

**What this does:**
- Adds `vendor_status` enum type
- Adds `status` column to vendors table
- Updates existing vendors to 'ACTIVE' status
- Changes `is_active` default to `false`

---

## Step 4: Verify Database Changes

Connect to database and run:
```sql
-- Check if status column exists
\d vendors

-- Check if vendor_status enum exists
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = 'vendor_status'::regtype;

-- Expected output:
-- PENDING_PAYMENT
-- ACTIVE
-- SUSPENDED
-- REJECTED
```

---

## Step 5: Restart Marketplace Service

```bash
cd marketplace-service
npm start
```

**Or if using the workspace script:**
```bash
cd ..
.\start-all-services.ps1
```

---

## Step 6: Test the Endpoint

### Quick Test (using provided script)
```bash
cd marketplace-service
node test-vendor-registration.js
```

### Manual Test with cURL

**1. Login to get token:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john.doe@university.edu\",\"password\":\"password123\"}"
```

**2. Copy the token from response, then register vendor:**
```bash
curl -X POST http://localhost:3002/vendors/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"name\":\"Test Shop\",\"description\":\"My test shop\",\"type\":\"STARTUP\"}"
```

**Expected Success Response:**
```json
{
    "success": true,
    "vendorId": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Vendor registered successfully. Payment pending."
}
```

---

## Step 7: Verify in Database

```sql
SELECT id, owner_id, name, type, status, is_active, created_at
FROM vendors
WHERE status = 'PENDING_PAYMENT'
ORDER BY created_at DESC
LIMIT 5;
```

You should see your newly registered vendor with:
- `status = 'PENDING_PAYMENT'`
- `is_active = false`

---

## Troubleshooting

### Error: "Invalid token"
**Cause:** JWT_SECRET mismatch between services  
**Fix:** Ensure JWT_SECRET in marketplace-service matches auth-service

```bash
# Check both .env files
cat auth-service/.env | grep JWT_SECRET
cat marketplace-service/.env | grep JWT_SECRET
# They must be identical
```

### Error: "Cannot find module 'jsonwebtoken'"
**Cause:** Package not installed  
**Fix:**
```bash
cd marketplace-service
npm install jsonwebtoken
```

### Error: "column 'status' does not exist"
**Cause:** Database migration not run  
**Fix:**
```bash
psql -h <host> -p <port> -U <user> -d market_db -f add-vendor-status-migration.sql
```

### Error: "You already own a shop"
**Cause:** User already has a registered vendor  
**Fix:** This is expected behavior (one shop per user rule)
- Either use a different user account
- Or delete existing vendor from database:
```sql
DELETE FROM vendors WHERE owner_id = 'user-id-here';
```

### Error: Connection timeout
**Cause:** Database connection issue  
**Fix:** 
- Check .env database credentials
- Verify network connectivity to Aiven
- Check if database is running

### Error: "Failed to fetch vendors"
**Cause:** Database query error  
**Fix:**
- Check marketplace-service logs
- Verify database schema matches code
- Ensure database connection is working

---

## Testing Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured with JWT_SECRET
- [ ] JWT_SECRET matches auth-service
- [ ] Database migration completed
- [ ] Service restarted
- [ ] Can login via auth-service
- [ ] Can register vendor with valid token
- [ ] Returns 401 without token
- [ ] Returns 409 on second registration attempt
- [ ] Vendor appears in database with PENDING_PAYMENT status

---

## Next Steps After Setup

1. **Test all endpoints:**
   - Run `node test-vendor-registration.js`
   - Test with Thunder Client/Postman
   - Verify error handling

2. **Implement admin approval:**
   - Create endpoint to change vendor status
   - Add payment verification logic
   - Update is_active flag after approval

3. **Frontend integration:**
   - Create vendor registration form
   - Add to marketplace UI
   - Show registration status to users

4. **Add product management:**
   - Endpoint to add products to vendor
   - Product listing management
   - Inventory control

---

## File Checklist

Verify these files exist:

```
marketplace-service/
├── src/
│   ├── controllers/
│   │   └── vendorController.js          ✅ Updated with registerVendor
│   ├── middleware/
│   │   └── authMiddleware.js            ✅ NEW - JWT authentication
│   └── routes/
│       └── marketRoutes.js              ✅ Updated with /vendors/register
├── database-schema.sql                   ✅ Updated with status column
├── add-vendor-status-migration.sql      ✅ NEW - Migration script
├── test-vendor-registration.js          ✅ NEW - Test script
├── VENDOR-REGISTRATION-API.md           ✅ NEW - API documentation
├── VENDOR-REGISTRATION-IMPLEMENTATION.md ✅ NEW - Implementation summary
├── VENDOR-REGISTRATION-SETUP.md         ✅ This file
├── package.json                         ✅ Updated with jsonwebtoken
└── .env                                 ✅ Check JWT_SECRET present
```

---

## Support & Documentation

- **API Documentation:** `VENDOR-REGISTRATION-API.md`
- **Implementation Details:** `VENDOR-REGISTRATION-IMPLEMENTATION.md`
- **Database Schema:** `database-schema.sql`
- **Test Script:** `test-vendor-registration.js`

---

## Quick Start Commands

```bash
# Complete setup in one go
cd marketplace-service

# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env and set JWT_SECRET

# 3. Run migration
psql -h <host> -p <port> -U <user> -d market_db -f add-vendor-status-migration.sql

# 4. Start service
npm start

# 5. Test (in another terminal)
node test-vendor-registration.js
```

---

**Setup Complete!** ✅

The vendor registration endpoint is now ready to use at:
```
POST http://localhost:3002/vendors/register
```

