# Marketplace Service - API Testing Guide

## 🚀 Quick Start

### 1. Start the Service
```bash
cd c:\EduSync\EduSync\marketplace-service
npm start
```

### 2. Verify Service is Running
Open: http://localhost:3002

---

## 🧪 Testing Methods

### Option 1: Thunder Client (Recommended)
1. Open VS Code Thunder Client extension
2. Import collection: `thunder-tests/thunderclient.json`
3. Click "Send" on each request

### Option 2: PowerShell Script
```powershell
cd c:\EduSync\EduSync\marketplace-service
.\test-marketplace-apis.ps1
```

### Option 3: Manual cURL Commands
See commands below ↓

---

## 📋 API Endpoints & Test Commands

### 🏥 Health Check
```bash
curl http://localhost:3002/
```

---

### 🏪 VENDOR APIs

#### Get All Startups
```bash
curl http://localhost:3002/vendors?type=STARTUP
```

#### Get All Food Vendors
```bash
curl http://localhost:3002/vendors?type=FOOD_VENDOR
```

#### Get Vendor by ID
```bash
curl http://localhost:3002/vendors/1
```

---

### 📦 PRODUCT APIs

#### Get Product by ID
```bash
curl http://localhost:3002/products/1
```

---

### 🔄 PRE-OWNED APIs

#### Get All Pre-Owned Listings
```bash
curl http://localhost:3002/preowned
```

#### Get Pre-Owned by Category
```bash
curl http://localhost:3002/preowned?category=ELECTRONICS
curl http://localhost:3002/preowned?category=TEXTBOOKS
curl http://localhost:3002/preowned?category=FURNITURE
```

#### Create New Pre-Owned Listing
```bash
curl -X POST http://localhost:3002/preowned \
  -H "Content-Type: application/json" \
  -d '{
    "seller_id": 1,
    "seller_name": "John Doe",
    "title": "Used Calculus Textbook",
    "description": "Great condition, minimal highlighting",
    "price": 45.00,
    "category": "TEXTBOOKS",
    "images": ["https://example.com/book.jpg"]
  }'
```

#### Get Pre-Owned by ID
```bash
curl http://localhost:3002/preowned/1
```

#### Mark Pre-Owned as Sold
```bash
curl -X PUT http://localhost:3002/preowned/1/sold
```

---

## 🔍 Expected Response Formats

### Vendor Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tech Hub",
      "type": "STARTUP",
      "products": [...]
    }
  ]
}
```

### Pre-Owned Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Calculus Textbook",
      "price": 45.00,
      "category": "TEXTBOOKS",
      "status": "AVAILABLE"
    }
  ]
}
```

---

## ❌ Common Issues

### Service Not Running
```bash
# Check if running
netstat -an | findstr :3002

# Start service
cd c:\EduSync\EduSync\marketplace-service
npm start
```

### Database Connection Error
- Check PostgreSQL is running
- Verify connection in `.env` file
- Test with: `node -e "require('./src/config/db')"`

### 404 Errors
- Verify route exists in `src/routes/marketRoutes.js`
- Check URL spelling
- Ensure no trailing slashes

---

## 🎯 Quick Smoke Test (Copy & Paste)

**PowerShell:**
```powershell
# Test all endpoints at once
$base = "http://localhost:3002"
Invoke-RestMethod "$base/"
Invoke-RestMethod "$base/vendors?type=STARTUP"
Invoke-RestMethod "$base/preowned"
```

**Bash/Git Bash:**
```bash
# Test all endpoints at once
curl http://localhost:3002/
curl http://localhost:3002/vendors?type=STARTUP
curl http://localhost:3002/preowned
```

---

## 📊 Testing Checklist

- [ ] Service starts without errors
- [ ] Health check returns 200 OK
- [ ] Can fetch vendors (startups)
- [ ] Can fetch vendors (food vendors)
- [ ] Can get single vendor details
- [ ] Can get single product details
- [ ] Can fetch all pre-owned listings
- [ ] Can filter pre-owned by category
- [ ] Can create new pre-owned listing
- [ ] Can mark listing as sold

---

## 🐛 Debugging Tips

1. **Check Logs**: Watch terminal where service is running
2. **Database Issues**: Verify tables exist with database-schema.sql
3. **Port Conflicts**: Change PORT in .env if 3002 is busy
4. **CORS Errors**: Should be enabled by default in server.js

---

## 🔗 Related Files
- Routes: [src/routes/marketRoutes.js](src/routes/marketRoutes.js)
- Server: [server.js](server.js)
- Controllers: [src/controllers/](src/controllers/)
- Database Schema: [database-schema.sql](database-schema.sql)
