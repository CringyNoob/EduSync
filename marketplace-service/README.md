# 🛒 Marketplace Service - EduSync

**Port:** 3002  
**Database:** market_db (PostgreSQL on Aiven)  
**Architecture:** Hybrid (Shop-First + Product-First)

---

## 🎯 Service Overview

The Marketplace Service handles three main areas:
1. **Startups** - Student entrepreneurship ventures
2. **Food Vendors** - Campus food shops and cafes
3. **Pre-owned Listings** - Student marketplace for used items

---

## 📋 Table of Contents

- [Features](#-features)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Setup Instructions](#-setup-instructions)
- [Authentication](#-authentication)
- [Documentation](#-documentation)

---

## ✨ Features

### Vendor Management
- ✅ **Vendor Registration** - Users can register shops (one per user)
- ✅ **Payment Workflow** - Status tracking (PENDING_PAYMENT → ACTIVE)
- ✅ **Shop Toggle** - Food vendors can open/close shops
- ✅ **Vendor Listing** - Browse startups and food vendors
- ✅ **Vendor Details** - View shop info with all products

### Product Management
- ✅ **Product Listing** - Display items by vendor
- ✅ **Stock Control** - Track product availability
- ✅ **Product Details** - Individual product lookup

### Pre-owned Marketplace
- ✅ **Create Listings** - Students can sell used items
- ✅ **Category Filter** - Browse by category
- ✅ **Mark as Sold** - Update listing status
- ✅ **User Listings** - View all listings by seller

---

## 🔌 API Endpoints

### Vendor Endpoints

#### Get Vendors by Type
```
GET /vendors?type=STARTUP
GET /vendors?type=FOOD_VENDOR
```
Returns list of vendors (Food vendors: active only)

#### Get Vendor Details
```
GET /vendors/:id
```
Returns vendor info with all products

#### Register New Vendor (NEW) 🆕
```
POST /vendors/register
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
    "name": "Shop Name",
    "description": "Description",
    "type": "STARTUP" | "FOOD_VENDOR"
}

Response (201):
{
    "success": true,
    "vendorId": "uuid",
    "message": "Vendor registered successfully. Payment pending."
}
```

**Business Rules:**
- ✅ JWT authentication required
- ✅ One shop per user
- ✅ Status starts as 'PENDING_PAYMENT'
- ✅ Shop inactive until admin approval

[📖 Full API Documentation](./VENDOR-REGISTRATION-API.md)

---

### Product Endpoints

#### Get Product by ID
```
GET /products/:id
```
Returns product details with vendor info

---

### Pre-owned Endpoints

#### Get All Listings
```
GET /preowned
GET /preowned?category=ELECTRONICS
```
Returns available listings (newest first)

#### Create Listing
```
POST /preowned
Body: { seller_id, seller_name, title, description, price, category, images }
```

#### Get Listing Details
```
GET /preowned/:id
```

#### Get User's Listings
```
GET /preowned/user/:userId
```

#### Mark as Sold
```
PUT /preowned/:id/sold
```

---

## 🗄️ Database Schema

### vendors Table
```sql
CREATE TABLE vendors (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type vendor_type NOT NULL,           -- 'STARTUP' or 'FOOD_VENDOR'
    description TEXT,
    logo_url VARCHAR(500),
    status vendor_status DEFAULT 'PENDING_PAYMENT',  -- NEW
    is_active BOOLEAN DEFAULT false,     -- UPDATED default
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Vendor Status:** `PENDING_PAYMENT`, `ACTIVE`, `SUSPENDED`, `REJECTED`

### products Table
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY,
    vendor_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### preowned_listings Table
```sql
CREATE TABLE preowned_listings (
    id UUID PRIMARY KEY,
    seller_id UUID NOT NULL,
    seller_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    images TEXT[],
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and set:
```env
# Database
DB_HOST=your-host
DB_PORT=16231
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=market_db

# Server
PORT=3002

# JWT (MUST match auth-service)
JWT_SECRET=your-secret-key
```

### 3. Setup Database

**For new installation:**
```bash
psql -h <host> -p <port> -U <user> -d market_db -f database-schema.sql
```

**For existing database (migration):**
```bash
psql -h <host> -p <port> -U <user> -d market_db -f add-vendor-status-migration.sql
```

### 4. Start Service
```bash
npm start
```

Service will run on `http://localhost:3002`

### 5. Test Endpoints
```bash
node test-vendor-registration.js
```

[📖 Detailed Setup Guide](./VENDOR-REGISTRATION-SETUP.md)

---

## 🔐 Authentication

### JWT Token Required
Protected endpoints require Bearer token:
```
Authorization: Bearer <token>
```

### Get Token
Login via auth-service:
```bash
POST http://localhost:3001/api/auth/login
Body: { "email": "user@edu", "password": "pass" }
```

### Token Payload
```json
{
    "id": "user-uuid",
    "email": "user@university.edu",
    "name": "John Doe",
    "role": "STUDENT",
    "roles": ["STUDENT"],
    "activeRole": "STUDENT"
}
```

---

## 📚 Documentation

### Available Guides

| Document | Description |
|----------|-------------|
| [VENDOR-REGISTRATION-API.md](./VENDOR-REGISTRATION-API.md) | Complete API documentation for vendor registration |
| [VENDOR-REGISTRATION-SETUP.md](./VENDOR-REGISTRATION-SETUP.md) | Step-by-step setup instructions |
| [VENDOR-REGISTRATION-IMPLEMENTATION.md](./VENDOR-REGISTRATION-IMPLEMENTATION.md) | Implementation details and architecture |
| [database-schema.sql](./database-schema.sql) | Full database schema |
| [add-vendor-status-migration.sql](./add-vendor-status-migration.sql) | Migration script for existing DBs |

---

## 🧪 Testing

### Automated Tests
```bash
node test-vendor-registration.js
```

### Manual Testing (cURL)
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@edu","password":"pass"}' | jq -r '.token')

# 2. Register vendor
curl -X POST http://localhost:3002/vendors/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Shop","type":"STARTUP"}'
```

### Thunder Client / Postman
Collections available in `thunder-tests/` directory

---

## 🏗️ Architecture

### Hybrid Approach

**Shop-First (Startups & Food Vendors)**
```
Vendor → Products
Browse shops, then see their products
```

**Product-First (Pre-owned)**
```
Listing → Seller Info
Browse products, then see seller info
```

### Service Dependencies
- **Auth Service** (Port 3001) - User authentication
- **Gateway** (Port 8000) - API routing (optional)
- **Database** - PostgreSQL on Aiven

---

## 🔄 Vendor Lifecycle

```
1. User Registration → User logs in
2. Vendor Registration → POST /vendors/register
3. Status: PENDING_PAYMENT → Admin reviews
4. Payment Verification → Admin updates status
5. Status: ACTIVE → Shop visible to users
6. Add Products → Shop operational
```

---

## 📊 Business Rules

### Vendor Registration
- ✅ One shop per user (enforced in database)
- ✅ Authentication required
- ✅ Status starts as PENDING_PAYMENT
- ✅ Shop inactive until approved

### Shop Visibility
- **Startups:** Always visible regardless of is_active
- **Food Vendors:** Only visible when is_active = true

### Product Availability
- `is_available = false` → "Out of Stock"
- Products remain in database (no deletion)

### Pre-owned Listings
- Status: AVAILABLE or SOLD
- Sellers can mark items as sold
- Images stored as array of URLs

---

## 🛠️ Technology Stack

- **Framework:** Express.js
- **Database:** PostgreSQL (Aiven Cloud)
- **Authentication:** JWT (jsonwebtoken)
- **Database Client:** pg (node-postgres)
- **Environment:** dotenv
- **CORS:** Enabled for frontend

---

## 📦 Package Dependencies

```json
{
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "express": "^5.2.1",
  "jsonwebtoken": "^9.0.2",
  "pg": "^8.16.3"
}
```

---

## 🚨 Troubleshooting

### Common Issues

**Issue:** "Invalid token"  
**Fix:** Ensure JWT_SECRET matches auth-service

**Issue:** "Column 'status' does not exist"  
**Fix:** Run migration script: `add-vendor-status-migration.sql`

**Issue:** "You already own a shop"  
**Fix:** One shop per user rule - use different account or delete existing vendor

**Issue:** "Cannot find module 'jsonwebtoken'"  
**Fix:** Run `npm install`

[📖 Full Troubleshooting Guide](./VENDOR-REGISTRATION-SETUP.md#troubleshooting)

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Admin panel for vendor approval
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Vendor analytics dashboard
- [ ] Product search and filters
- [ ] Review and rating system
- [ ] Order management
- [ ] Inventory tracking

### API Endpoints to Implement
- `PATCH /vendors/:id/status` - Update vendor status (admin)
- `PUT /vendors/:id` - Update vendor details
- `POST /vendors/:id/products` - Add product to vendor
- `GET /vendors/my-shop` - Get current user's vendor
- `DELETE /vendors/:id` - Soft delete vendor

---

## 🤝 Contributing

### Adding New Features
1. Follow existing code structure
2. Add comprehensive error handling
3. Document API endpoints
4. Write tests
5. Update README

### Code Standards
- Use async/await for database queries
- Parameterized queries (prevent SQL injection)
- Consistent error responses
- Clear comments and documentation

---

## 📞 Support

**Service Health Check:**
```
GET http://localhost:3002/
```

**Logs Location:**
```
marketplace-service/server.js
```

**Database Connection:**
```javascript
// Check src/config/db.js
```

---

## 📄 License

MIT License - EduSync Team

---

## 📝 Changelog

### v1.1.0 (Latest) - Vendor Registration Feature
- ✅ Added vendor registration endpoint
- ✅ Implemented JWT authentication middleware
- ✅ Added vendor status workflow
- ✅ One-shop-per-user enforcement
- ✅ Comprehensive documentation

### v1.0.0 - Initial Release
- ✅ Vendor listing endpoints
- ✅ Product management
- ✅ Pre-owned marketplace

---

**Marketplace Service** | EduSync Platform  
Built with ❤️ for university students

