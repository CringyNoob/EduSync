# RentHub Service Testing Guide

## Setup Database

Before testing, you need to create the `rent_db` database and run the schema:

```bash
# Connect to your PostgreSQL instance
psql -h pg-1ea37722-aranov1107-6aeb.c.aivencloud.com -p 16231 -U avnadmin -d defaultdb

# Create the database
CREATE DATABASE rent_db;

# Exit and reconnect to the new database
\c rent_db

# Run the schema file
\i database-schema.sql
```

Or run it directly:
```bash
psql -h pg-1ea37722-aranov1107-6aeb.c.aivencloud.com -p 16231 -U avnadmin -d rent_db -f database-schema.sql
```

## Start the Service

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The service will start on `http://localhost:3003`

## Testing Endpoints

### 1. Health Check

```bash
GET http://localhost:3003/health
```

### 2. Create Rental Listing

```bash
POST http://localhost:3003/listings
Content-Type: application/json

{
  "owner_id": "550e8400-e29b-41d4-a716-446655440000",
  "owner_name": "John Doe",
  "owner_email": "john.doe@uiu.ac.bd",
  "title": "Canon DSLR Camera with 50mm Lens",
  "description": "Professional grade camera perfect for photography projects. Includes camera body, 50mm lens, battery, and charger.",
  "daily_price": 500.00,
  "category": "Electronics",
  "images": [
    "https://example.com/camera1.jpg",
    "https://example.com/camera2.jpg"
  ],
  "availability_start": "2024-06-01",
  "availability_end": "2024-12-31"
}
```

### 3. Get All Rental Listings

```bash
# Get all available listings
GET http://localhost:3003/listings

# Filter by category
GET http://localhost:3003/listings?category=Electronics

# Filter by status
GET http://localhost:3003/listings?status=AVAILABLE
```

### 4. Get Single Listing

```bash
GET http://localhost:3003/listings/{listing_id}
```

### 5. Update Rental Listing

```bash
PUT http://localhost:3003/listings/{listing_id}
Content-Type: application/json

{
  "title": "Updated Title",
  "daily_price": 600.00,
  "status": "UNAVAILABLE"
}
```

### 6. Delete Rental Listing

```bash
DELETE http://localhost:3003/listings/{listing_id}
```

### 7. Create Rental Transaction (Rent an Item)

```bash
POST http://localhost:3003/transactions
Content-Type: application/json

{
  "listing_id": "550e8400-e29b-41d4-a716-446655440000",
  "renter_id": "660e8400-e29b-41d4-a716-446655440001",
  "renter_name": "Jane Smith",
  "renter_email": "jane.smith@uiu.ac.bd",
  "start_date": "2024-06-15",
  "end_date": "2024-06-20"
}
```

**Note**: The system will automatically:
- Calculate duration (6 days)
- Calculate total price (6 × daily_price)
- Check for date conflicts
- Verify availability period
- Update listing status to RENTED

### 8. Get User's Listings (As Owner)

```bash
GET http://localhost:3003/user/{user_id}/listings
```

### 9. Get User's Rentals (As Renter)

```bash
GET http://localhost:3003/user/{user_id}/rentals
```

### 10. Complete Rental Transaction

```bash
PUT http://localhost:3003/transactions/{transaction_id}/complete
```

This will:
- Mark transaction as COMPLETED
- Set completed_at timestamp
- Change listing status back to AVAILABLE

## Testing Through Gateway

When the gateway is running on port 8000, you can access the RentHub service through:

```bash
# All endpoints prefixed with /api/renthub
GET http://localhost:8000/api/renthub/listings
POST http://localhost:8000/api/renthub/listings
POST http://localhost:8000/api/renthub/transactions
# etc...
```

## Sample Test Workflow

### Complete Rental Flow

1. **Create a listing**:
```json
POST /listings
{
  "owner_id": "user-123",
  "owner_name": "Alice",
  "owner_email": "alice@uiu.ac.bd",
  "title": "Guitar",
  "description": "Acoustic guitar in good condition",
  "daily_price": 200.00,
  "category": "Musical Instruments",
  "availability_start": "2024-06-01",
  "availability_end": "2024-12-31"
}
```

2. **Browse listings**:
```bash
GET /listings
```

3. **Rent the item**:
```json
POST /transactions
{
  "listing_id": "<listing_id_from_step_1>",
  "renter_id": "user-456",
  "renter_name": "Bob",
  "renter_email": "bob@uiu.ac.bd",
  "start_date": "2024-06-10",
  "end_date": "2024-06-12"
}
```

4. **Check renter's rentals**:
```bash
GET /user/user-456/rentals
```

5. **Check owner's listings**:
```bash
GET /user/user-123/listings
```

6. **Complete the rental**:
```bash
PUT /transactions/<transaction_id>/complete
```

7. **Verify listing is available again**:
```bash
GET /listings/<listing_id>
# Status should be "AVAILABLE"
```

## Expected Responses

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Error Scenarios to Test

1. **Double Booking**: Try to rent the same item for overlapping dates
2. **Invalid Dates**: End date before start date
3. **Outside Availability**: Request dates outside availability period
4. **Negative Price**: Try to create listing with negative daily_price
5. **Missing Fields**: Omit required fields in requests

## Categories

Test with these category values:
- Electronics
- Books
- Furniture
- Sports Equipment
- Musical Instruments
- Tools
- Clothing
- Other

## Status Values

**Listing Status**:
- AVAILABLE
- RENTED
- UNAVAILABLE

**Transaction Status**:
- PENDING
- ACTIVE
- COMPLETED
- CANCELLED
