# 🗄️ Database Population Guide

## Overview
This guide explains how to populate your three Aiven PostgreSQL databases (auth_db, market_db, rent_db) with comprehensive mock data for testing the Marketplace and RentHub features.

---

## ⚠️ CRITICAL: Population Order

Due to foreign key constraints, you **MUST** populate databases in this exact order:

1. **auth_db** (First) - Contains all users referenced by other databases
2. **market_db** (Second) - References user IDs from auth_db  
3. **rent_db** (Third) - References user IDs from auth_db

---

## 📊 User ID Mapping

The mock data uses a coordinated user ID system across all three databases:

| User ID Range | Role | Database References |
|---------------|------|---------------------|
| 1-4 | Startup Vendors | market_db (vendors table) |
| 5-9 | Food Vendors | market_db (vendors table) |
| 10-28 | Preowned Sellers | market_db (preowned_listings table) |
| 29-45 | Rental Owners | rent_db (rental_listings table) |
| 46-50 | Rental Renters | rent_db (rental_transactions table) |

---

## 🚀 Step-by-Step Population

### Prerequisites
- PostgreSQL client installed (psql)
- Connection details for your three Aiven databases
- SQL files in the correct directories

### Step 1: Connect to Auth Database
```bash
psql "postgresql://user:password@host:port/auth_db?sslmode=require"
```

### Step 2: Populate Auth Database (50 Users)
```sql
-- Run from psql prompt after connecting to auth_db
\i auth-service/populate-auth-data.sql
```

**What this creates:**
- 50 users with IDs 1-50
- All passwords are hashed using bcrypt
- Each user has complete profile information
- Email format: firstname.lastname@uiu.edu

**Verify:**
```sql
SELECT COUNT(*) FROM users;
-- Should return: 50

SELECT id, full_name, email FROM users WHERE id <= 5;
-- Should show first 5 users
```

### Step 3: Populate Marketplace Database

**Connect to market_db:**
```bash
psql "postgresql://user:password@host:port/market_db?sslmode=require"
```

**Run population script:**
```sql
\i marketplace-service/populate-marketplace-data.sql
```

**What this creates:**
- 9 vendors (4 startups + 5 food vendors)
- 30+ products across different categories
- 20+ preowned listings
- All references use valid user IDs from auth_db

**Verify:**
```sql
-- Check vendors
SELECT COUNT(*) FROM vendors;
-- Should return: 9

-- Check products
SELECT COUNT(*) FROM products;
-- Should return: 30+

-- Check preowned listings
SELECT COUNT(*) FROM preowned_listings;
-- Should return: 20+

-- Verify foreign key integrity
SELECT v.name, v.owner_id 
FROM vendors v 
LEFT JOIN users u ON v.owner_id = u.id 
WHERE u.id IS NULL;
-- Should return: 0 rows (all vendor owners exist in auth_db)
```

### Step 4: Populate RentHub Database

**Connect to rent_db:**
```bash
psql "postgresql://user:password@host:port/rent_db?sslmode=require"
```

**Run population script:**
```sql
\i renthub-service/populate-renthub-data.sql
```

**What this creates:**
- 18 rental listings across 7 categories
- 4 rental transactions (1 active, 2 completed, 1 pending)
- All owner_id values reference users 29-45 from auth_db
- All renter_id values reference users 46-50 from auth_db

**Verify:**
```sql
-- Check listings
SELECT COUNT(*) FROM rental_listings;
-- Should return: 18

-- Check transactions
SELECT COUNT(*) FROM rental_transactions;
-- Should return: 4

-- Verify foreign key integrity
SELECT rl.title, rl.owner_id 
FROM rental_listings rl 
WHERE NOT EXISTS (
  SELECT 1 FROM auth_db.users u WHERE u.id = rl.owner_id
);
-- Should return: 0 rows
```

---

## 🔍 Complete Verification

Run this comprehensive check after populating all databases:

```sql
-- Connect to auth_db
\c auth_db
SELECT 'Auth Users:' as data_type, COUNT(*) as count FROM users
UNION ALL
-- Connect to market_db
\c market_db
SELECT 'Vendors:' as data_type, COUNT(*) as count FROM vendors
UNION ALL
SELECT 'Products:' as data_type, COUNT(*) as count FROM products
UNION ALL
SELECT 'Preowned Listings:' as data_type, COUNT(*) as count FROM preowned_listings
UNION ALL
-- Connect to rent_db
\c rent_db
SELECT 'Rental Listings:' as data_type, COUNT(*) as count FROM rental_listings
UNION ALL
SELECT 'Rental Transactions:' as data_type, COUNT(*) as count FROM rental_transactions;
```

**Expected output:**
```
    data_type       | count
--------------------+-------
 Auth Users         |    50
 Vendors            |     9
 Products           |    30+
 Preowned Listings  |    20+
 Rental Listings    |    18
 Rental Transactions|     4
```

---

## 🧪 Testing Frontend Integration

After populating databases, test the frontend:

1. **Start all services:**
   ```bash
   # Auth Service
   cd auth-service
   npm start  # Port 3001
   
   # Marketplace Service
   cd marketplace-service
   npm start  # Port 3002
   
   # RentHub Service
   cd renthub-service
   npm start  # Port 3003
   
   # Gateway
   cd gateway
   npm start  # Port 8000
   
   # Frontend
   cd client
   npm run dev  # Port 5173
   ```

2. **Test Marketplace:**
   - Visit http://localhost:5173/marketplace
   - Should see 9 vendors displayed
   - Click on a vendor to see their products
   - Check preowned section for 20+ listings

3. **Test RentHub:**
   - Visit http://localhost:5173/renthub
   - Should see 18 rental listings
   - Click on a listing to see details
   - Check that daily prices and availability display correctly

---

## 🐛 Troubleshooting

### Issue: Foreign Key Violation
**Error:** `violates foreign key constraint`
**Solution:** Ensure you populated auth_db FIRST before market_db or rent_db

### Issue: User Not Found
**Error:** `owner_id does not exist in users table`
**Solution:** 
```sql
-- Check if auth users exist
\c auth_db
SELECT id, full_name FROM users WHERE id IN (1, 10, 29, 46);
-- Should return 4 rows

-- If missing, repopulate auth_db
\i auth-service/populate-auth-data.sql
```

### Issue: Duplicate Key Error
**Error:** `duplicate key value violates unique constraint`
**Solution:** Clear existing data before repopulating:
```sql
-- For marketplace
\c market_db
DELETE FROM preowned_listings;
DELETE FROM products;
DELETE FROM vendors;

-- For renthub
\c rent_db
DELETE FROM rental_transactions;
DELETE FROM rental_listings;

-- For auth
\c auth_db
DELETE FROM users WHERE id <= 50;
```

---

## 📝 Notes

- All passwords in auth_db are hashed with bcrypt (placeholder hash for testing)
- User emails follow pattern: firstname.lastname@uiu.edu
- Marketplace vendors include both startups and food vendors
- RentHub listings cover 7 categories: textbooks, electronics, sports, instruments, furniture, tools, clothing
- All UUIDs are properly formatted and unique
- Prices are realistic for a campus marketplace environment

---

## 🔄 Updating Mock Data

To add more mock data:

1. **Add users to auth_db:**
   - Edit `auth-service/populate-auth-data.sql`
   - Use next available ID (51+)
   - Follow existing email/name patterns

2. **Add marketplace items:**
   - Edit `marketplace-service/populate-marketplace-data.sql`
   - Reference existing user IDs (1-28) or new ones
   - Maintain vendor/product relationships

3. **Add rental listings:**
   - Edit `renthub-service/populate-renthub-data.sql`
   - Reference existing user IDs (29-50) or new ones
   - Keep UUIDs unique

---

## ✅ Success Checklist

- [ ] auth_db populated with 50 users
- [ ] market_db populated with 9 vendors, 30+ products, 20+ preowned listings
- [ ] rent_db populated with 18 listings, 4 transactions
- [ ] No foreign key constraint errors
- [ ] Frontend displays data from APIs correctly
- [ ] Can navigate between marketplace and renthub pages
- [ ] Item details pages load without errors

---

**Last Updated:** February 2026
**Maintained By:** EduSync Development Team
