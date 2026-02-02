# 🚀 Integration Testing & Startup Guide

## Issues Fixed

### ✅ Frontend/Backend Integration Fixes

1. **MarketplaceHome.jsx** - Fixed vendor products path
   - Changed: `vendorRes.products` → `vendorRes.vendor?.products`
   - Reason: Backend returns `{vendor: {products: []}}` not `{products: []}`

2. **RentHubHome.jsx** - Fixed listings response structure
   - Changed: `response.listings` → `response.data`
   - Reason: Backend returns `{success: true, data: []}` not `{listings: []}`

3. **RentHubItemDetails.jsx** - Fixed listing response structure
   - Changed: `response.listing` → `response.data`
   - Reason: Backend returns `{success: true, data: {}}` not `{listing: {}}`

4. **MarketplaceItemDetails.jsx** - Enhanced product/preowned handling
   - Added vendor name display from API
   - Fixed fallback response structures

---

## 🗄️ Database Setup Instructions

Since you populated manually, verify these tables exist with data:

### auth_db (PostgreSQL - Aiven)
```sql
-- Check users table
SELECT COUNT(*) FROM users;
-- Should have users

-- Check profiles table  
SELECT COUNT(*) FROM profiles;
-- Should match users count
```

### market_db (PostgreSQL - Aiven)
```sql
-- Check vendors
SELECT COUNT(*), type FROM vendors GROUP BY type;
-- Should show STARTUP and FOOD_VENDOR counts

-- Check products
SELECT COUNT(*) FROM products;

-- Check preowned listings
SELECT COUNT(*) FROM preowned_listings WHERE status = 'AVAILABLE';
```

### rent_db (PostgreSQL - Aiven)
```sql
-- Check rental listings
SELECT COUNT(*), status FROM rental_listings GROUP BY status;

-- Check transactions
SELECT COUNT(*), status FROM rental_transactions GROUP BY status;
```

---

## 🚀 Start All Services

Open **6 terminals** and run these commands:

### Terminal 1: Gateway (Port 8000)
```powershell
cd C:\EduSync\EduSync\gateway
npm start
```
**Expected output:**
```
🚀 Gateway running on http://localhost:8000
```

### Terminal 2: Auth Service (Port 3001)
```powershell
cd C:\EduSync\EduSync\auth-service
npm start
```
**Expected output:**
```
🚀 Auth Service running on port 3001
✅ Database connection successful
```

### Terminal 3: Marketplace Service (Port 3002)
```powershell
cd C:\EduSync\EduSync\marketplace-service
npm start
```
**Expected output:**
```
🚀 Marketplace Service running on port 3002
✅ Marketplace DB connected successfully!
📦 Vendors API: http://localhost:3002/vendors
```

### Terminal 4: RentHub Service (Port 3003)
```powershell
cd C:\EduSync\EduSync\renthub-service
npm start
```
**Expected output:**
```
🚀 RentHub Service running on port 3003
✅ Connected to rent_db database
```

### Terminal 5: Frontend (Port 5173)
```powershell
cd C:\EduSync\EduSync\client
npm run dev
```
**Expected output:**
```
VITE v... ready in ...ms
➜  Local:   http://localhost:5173/
```

---

## 🧪 Testing Checklist

### ✅ Test Marketplace

1. **Navigate to Marketplace**
   - Go to: http://localhost:5173/marketplace
   - Should see 3 sections: Foods, Shops, Pre-Owned

2. **Test Food Vendors**
   - Click "Foods" section
   - Should load food vendors from database
   - Click on a vendor card
   - Should show vendor's products (food items)
   - Click on a product
   - Should navigate to `/marketplace/:productId`
   - Should show product details with vendor name

3. **Test Startup Vendors**
   - Click "Shops" section
   - Should load startup vendors
   - Click on a vendor
   - Should show vendor's products
   - Product cards should display properly

4. **Test Pre-Owned Listings**
   - Click "Pre-Owned" section
   - Should load all available preowned listings
   - Each card should show:
     - Title, Price, Category
     - Seller name
     - Image (if available)
   - Click on a listing
   - Should navigate to details page
   - Should show full description

### ✅ Test RentHub

1. **Navigate to RentHub**
   - Go to: http://localhost:5173/renthub
   - Should see rental listings grid

2. **Test Listings View**
   - Should see all available rentals
   - Each card shows:
     - Title, Category
     - Daily price
     - Owner name
     - Rating
   - Filter by category (Books, Electronics, etc.)
   - Search functionality should work

3. **Test Listing Details**
   - Click on any rental card
   - Should navigate to `/renthub/:listingId`
   - Should show:
     - Full description
     - Owner information
     - Daily price
     - Images
     - Rent button

4. **Test Create Listing**
   - Click "List Your Item" button
   - Fill in the form
   - Submit should work (if auth is integrated)

### ✅ Test Dashboard

1. **Navigate to Dashboard**
   - Go to: http://localhost:5173/renthub/dashboard
   - Should show user's rentals and listings

2. **Test User Rentals**
   - Should display items user is renting
   - Status should be visible (ACTIVE, PENDING, etc.)

3. **Test User Listings**
   - Should show items user has listed for rent
   - Edit/Delete buttons should be visible

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch vendors"
**Solution:**
- Check marketplace service is running on port 3002
- Check database connection in marketplace .env file
- Verify vendors table has data: `SELECT * FROM vendors;`

### Issue: "Failed to load rentals"
**Solution:**
- Check renthub service is running on port 3003
- Check database connection in renthub .env file
- Verify rental_listings table has data: `SELECT * FROM rental_listings WHERE status = 'AVAILABLE';`

### Issue: Product details not showing
**Solution:**
- Open browser console (F12)
- Check for API errors
- Verify product/listing ID exists in database
- Check if images array is properly formatted

### Issue: CORS errors
**Solution:**
- Ensure gateway is running on port 8000
- Verify gateway CORS origin matches frontend URL
- Check all services are accessible through gateway

### Issue: "Proxy Error: Could not reach..."
**Solution:**
- Verify the target service is running
- Check port numbers in gateway/server.js match service ports
- Ensure no firewall blocking ports

---

## 📊 Expected Data Flow

### Marketplace Flow
```
User clicks "Foods" 
  → Frontend calls: GET /api/market/vendors?type=FOOD_VENDOR
  → Gateway proxies to: http://localhost:3002/vendors?type=FOOD_VENDOR
  → Marketplace service queries: SELECT * FROM vendors WHERE type = 'FOOD_VENDOR'
  → Returns: {success: true, vendors: [{id, name, logo_url...}]}

User clicks vendor card
  → Frontend calls: GET /api/market/vendors/{vendorId}
  → Returns: {success: true, vendor: {id, name, products: [...]}}
  → Frontend displays products in modal/grid
```

### RentHub Flow
```
User visits /renthub
  → Frontend calls: GET /api/renthub/listings?status=AVAILABLE
  → Gateway proxies to: http://localhost:3003/listings?status=AVAILABLE
  → RentHub service queries: SELECT * FROM rental_listings WHERE status = 'AVAILABLE'
  → Returns: {success: true, count: X, data: [{id, title, daily_price...}]}
  → Frontend maps to component format and displays cards
```

---

## ✨ Success Indicators

You'll know everything is working when:

1. ✅ All 5 services start without errors
2. ✅ Frontend loads without console errors
3. ✅ Marketplace shows real vendors and products from database
4. ✅ RentHub shows real rental listings from database
5. ✅ Clicking items navigates to detail pages with data
6. ✅ Search and filters work properly
7. ✅ Images display (or fallback images show)
8. ✅ No "undefined" or "null" in UI

---

## 📝 Notes

- All passwords in mock data are hashed with bcrypt
- UUIDs are used for all primary keys
- Images are from Unsplash (may load slowly first time)
- Categories are case-sensitive (Electronics, Books, etc.)
- Status enums: AVAILABLE, RENTED, UNAVAILABLE (for rentals)
- Status enums: AVAILABLE, SOLD (for preowned)

---

## 🆘 Need Help?

If services fail to start:
1. Check if ports 3001-3003, 8000, 5173 are available
2. Run `npm install` in each service directory
3. Verify .env files have correct database credentials
4. Check database is accessible from your machine
5. Look at terminal error messages for specific issues

---

**Last Updated:** January 7, 2026
**Status:** ✅ All integration issues fixed, ready for testing
