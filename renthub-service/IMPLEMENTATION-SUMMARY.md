# EduSync RentHub Service - Implementation Summary

## Overview

The RentHub service has been successfully created following the same architecture pattern as the marketplace-service. It enables students to rent and lend items on a per-day basis with complete transaction tracking.

## Architecture

### Service Structure
```
renthub-service/
├── server.js                    # Express server (Port 3003)
├── package.json                 # Dependencies
├── .env                         # Environment configuration
├── .env.example                 # Environment template
├── database-schema.sql          # PostgreSQL schema
├── README.md                    # Service documentation
├── TESTING-GUIDE.md            # API testing guide
└── src/
    ├── config/
    │   └── db.js               # Database connection pool
    ├── controllers/
    │   └── rentalController.js # Business logic & CRUD operations
    └── routes/
        └── rentalRoutes.js     # API route definitions
```

## Database Schema (rent_db)

### Tables

#### 1. rental_listings
Stores items available for rent with the following key features:
- UUID primary keys
- Owner information (ID, name, email)
- Item details (title, description, category, images array)
- Daily pricing with CHECK constraint (price > 0)
- Availability dates with validation (end >= start)
- Status enum: AVAILABLE, RENTED, UNAVAILABLE
- Timestamps for created_at and updated_at

**Columns**:
- `id` (UUID, PK)
- `owner_id` (UUID, NOT NULL)
- `owner_name` (VARCHAR 255, NOT NULL)
- `owner_email` (VARCHAR 255, NOT NULL)
- `title` (VARCHAR 255, NOT NULL)
- `description` (TEXT)
- `daily_price` (DECIMAL 10,2, NOT NULL, CHECK > 0)
- `category` (ENUM, DEFAULT 'Other')
- `images` (TEXT[], DEFAULT {})
- `availability_start` (DATE, NOT NULL)
- `availability_end` (DATE, NOT NULL)
- `status` (ENUM, DEFAULT 'AVAILABLE')
- `created_at` (TIMESTAMP, DEFAULT NOW)
- `updated_at` (TIMESTAMP, DEFAULT NOW)

#### 2. rental_transactions
Tracks all rental bookings with automatic pricing calculation:
- Links to rental_listings via foreign key with CASCADE delete
- Renter information
- Rental period (start/end dates)
- Auto-calculated duration and total price
- Transaction status tracking
- Completion timestamp

**Columns**:
- `id` (UUID, PK)
- `listing_id` (UUID, FK → rental_listings, NOT NULL)
- `renter_id` (UUID, NOT NULL)
- `renter_name` (VARCHAR 255, NOT NULL)
- `renter_email` (VARCHAR 255, NOT NULL)
- `start_date` (DATE, NOT NULL)
- `end_date` (DATE, NOT NULL)
- `duration_days` (INTEGER, NOT NULL, CHECK > 0)
- `daily_price` (DECIMAL 10,2, NOT NULL)
- `total_price` (DECIMAL 10,2, NOT NULL)
- `status` (ENUM, DEFAULT 'PENDING')
- `created_at` (TIMESTAMP, DEFAULT NOW)
- `updated_at` (TIMESTAMP, DEFAULT NOW)
- `completed_at` (TIMESTAMP)

### Enums

**rental_status**: AVAILABLE | RENTED | UNAVAILABLE

**transaction_status**: PENDING | ACTIVE | COMPLETED | CANCELLED

**rental_category**: Electronics | Books | Furniture | Sports Equipment | Musical Instruments | Tools | Clothing | Other

### Indexes

Performance indexes on:
- owner_id, status, category, created_at (rental_listings)
- listing_id, renter_id, status, dates, created_at (rental_transactions)
- Compound index on availability_start, availability_end
- Compound index on start_date, end_date

## API Endpoints

### Rental Listings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/listings` | Get all listings (filter by category, status) |
| GET | `/listings/:id` | Get single listing details |
| POST | `/listings` | Create new rental listing |
| PUT | `/listings/:id` | Update listing |
| DELETE | `/listings/:id` | Delete listing |
| GET | `/user/:user_id/listings` | Get user's listings (as owner) |

### Rental Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transactions` | Create rental (rent an item) |
| GET | `/user/:user_id/rentals` | Get user's rentals (as renter) |
| PUT | `/transactions/:id/complete` | Complete rental transaction |

## Key Features

### 1. Conflict Prevention
The system automatically checks for overlapping rental dates to prevent double-booking:
```sql
WHERE (
  (start_date <= $2 AND end_date >= $2) OR
  (start_date <= $3 AND end_date >= $3) OR
  (start_date >= $2 AND end_date <= $3)
)
```

### 2. Automatic Price Calculation
When creating a rental transaction:
1. Calculates duration: `Math.ceil((end_date - start_date) / (1000*60*60*24)) + 1`
2. Calculates total: `duration_days × daily_price`
3. Validates dates are within availability period
4. Checks for existing rental conflicts

### 3. Availability Validation
- Ensures requested dates fall within listing's availability_start and availability_end
- Returns 400 error if dates are outside availability period

### 4. Status Management
- Listing status automatically changes to RENTED when transaction is created
- Returns to AVAILABLE when transaction is completed
- Prevents new rentals while status is RENTED or UNAVAILABLE

### 5. Dynamic Querying
- Optional category filtering
- Status filtering (default: AVAILABLE)
- ORDER BY created_at DESC for newest listings first

## Integration

### Gateway Configuration
Added to [gateway/server.js](gateway/server.js):
```javascript
app.use('/api/renthub', createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: { '^/api/renthub': '/' }
}));
```

**Frontend Access**: `http://localhost:8000/api/renthub/*`

### Frontend Service
Created [client/src/services/renthubService.js](client/src/services/renthubService.js) with methods:
- `getAllListings(params)`
- `getListingById(id)`
- `createListing(data)`
- `updateListing(id, data)`
- `deleteListing(id)`
- `getUserListings(userId)`
- `createTransaction(data)`
- `getUserRentals(userId)`
- `completeTransaction(transactionId)`

All methods use the centralized Axios instance from `utils/api.js` with JWT token handling.

### Docker Compose
Updated [docker-compose.yml](docker-compose.yml) to include renthub-service on port 3003.

## Environment Variables

```env
# Database
DB_HOST=pg-1ea37722-aranov1107-6aeb.c.aivencloud.com
DB_PORT=16231
DB_USER=avnadmin
DB_PASSWORD=AVNS_8oHRLpTCVcvFWMRj6sh
DB_NAME=rent_db

# Server
PORT=3003
NODE_ENV=development
```

## Setup Instructions

### 1. Create Database
```bash
# Connect to PostgreSQL
psql -h <host> -p <port> -U <user> -d defaultdb

# Create database
CREATE DATABASE rent_db;

# Run schema
\c rent_db
\i database-schema.sql
```

Or run directly:
```bash
psql -h <host> -p <port> -U <user> -d rent_db -f database-schema.sql
```

### 2. Install Dependencies
```bash
cd renthub-service
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Start Service
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 5. Verify
```bash
# Health check
curl http://localhost:3003/health

# Expected response:
{
  "status": "OK",
  "service": "RentHub Service",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Usage Example

### Complete Rental Flow

#### 1. Create Listing (Owner)
```javascript
POST /api/renthub/listings
{
  "owner_id": "550e8400-e29b-41d4-a716-446655440000",
  "owner_name": "Alice Rahman",
  "owner_email": "alice@uiu.ac.bd",
  "title": "Canon EOS 90D DSLR Camera",
  "description": "Professional camera with 18-135mm lens. Perfect for photography projects.",
  "daily_price": 500.00,
  "category": "Electronics",
  "images": ["url1.jpg", "url2.jpg"],
  "availability_start": "2024-06-01",
  "availability_end": "2024-12-31"
}
```

#### 2. Browse Listings
```javascript
GET /api/renthub/listings?category=Electronics&status=AVAILABLE
```

#### 3. Rent Item (Renter)
```javascript
POST /api/renthub/transactions
{
  "listing_id": "550e8400-e29b-41d4-a716-446655440000",
  "renter_id": "660e8400-e29b-41d4-a716-446655440001",
  "renter_name": "Bob Ahmed",
  "renter_email": "bob@uiu.ac.bd",
  "start_date": "2024-06-15",
  "end_date": "2024-06-20"
}

// System calculates:
// - duration_days: 6
// - total_price: 6 × 500 = 3000 BDT
// - Updates listing status to RENTED
```

#### 4. View Dashboard
```javascript
// Owner's listings
GET /api/renthub/user/550e8400-e29b-41d4-a716-446655440000/listings

// Renter's rentals
GET /api/renthub/user/660e8400-e29b-41d4-a716-446655440001/rentals
```

#### 5. Complete Rental
```javascript
PUT /api/renthub/transactions/{transaction_id}/complete

// System:
// - Sets status to COMPLETED
// - Records completion timestamp
// - Changes listing status back to AVAILABLE
```

## Error Handling

### Validation Errors (400)
- Missing required fields
- Invalid price (≤ 0)
- Invalid dates (end < start)
- Dates outside availability period
- Conflicting rental dates

### Not Found Errors (404)
- Listing doesn't exist
- Transaction doesn't exist

### Server Errors (500)
- Database connection issues
- Query execution failures

### Response Format

**Success**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10  // For array responses
}
```

**Error**:
```json
{
  "success": false,
  "error": "Error message description"
}
```

## Testing

See [TESTING-GUIDE.md](renthub-service/TESTING-GUIDE.md) for comprehensive testing instructions including:
- Sample requests for all endpoints
- Expected responses
- Error scenario testing
- Complete workflow examples

## Dependencies

```json
{
  "express": "^4.18.2",      // Web framework
  "cors": "^2.8.5",          // Cross-origin support
  "pg": "^8.11.3",           // PostgreSQL client
  "dotenv": "^16.3.1"        // Environment variables
}
```

**Dev Dependencies**:
```json
{
  "nodemon": "^3.0.1"        // Auto-reload in development
}
```

## Comparison with Marketplace Service

| Feature | Marketplace | RentHub |
|---------|-------------|---------|
| Port | 3002 | 3003 |
| Database | market_db | rent_db |
| Main Table | preowned_listings | rental_listings |
| Transaction Table | ❌ | rental_transactions |
| Pricing | One-time price | Daily price × duration |
| Status | AVAILABLE/SOLD | AVAILABLE/RENTED/UNAVAILABLE |
| Date Tracking | created_at only | availability dates + rental dates |
| Conflict Check | ❌ | ✅ Prevents double-booking |

## Security Considerations

1. **JWT Authentication**: Should be added via middleware (currently not implemented, relies on gateway/auth-service)
2. **Owner Verification**: Controllers should verify owner_id matches authenticated user
3. **Input Sanitization**: Add validation middleware for SQL injection prevention
4. **Rate Limiting**: Consider adding rate limiting for API endpoints
5. **Image Upload**: Implement secure image upload/storage (currently accepts URLs)

## Future Enhancements

1. **Payment Integration**: Add payment processing for rental fees
2. **Rating System**: Allow renters to rate items and owners
3. **Deposit Handling**: Implement security deposit management
4. **Late Fees**: Calculate and apply late return fees
5. **Notifications**: Email/SMS notifications for bookings and returns
6. **Calendar View**: Visual availability calendar
7. **Search**: Full-text search for items
8. **Image Upload**: Direct image upload to cloud storage (S3, Cloudinary)
9. **Reviews**: Add review system for listings
10. **Insurance**: Optional insurance for high-value items

## Notes

- UUIDs are used for all IDs to ensure uniqueness across distributed systems
- All prices stored as DECIMAL(10,2) for precise monetary calculations
- Timestamps use PostgreSQL's CURRENT_TIMESTAMP for consistency
- Foreign key constraints ensure referential integrity
- CASCADE delete removes transactions when listing is deleted
- Array type used for images allows multiple photos per listing

## Support

For issues or questions:
1. Check [TESTING-GUIDE.md](renthub-service/TESTING-GUIDE.md)
2. Review [README.md](renthub-service/README.md)
3. Examine [database-schema.sql](renthub-service/database-schema.sql) for schema details
4. Test endpoints using provided examples
