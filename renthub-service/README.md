# RentHub Service

Rental marketplace service for student items - enabling users to rent out and rent items on a per-day basis.

## Features

- **Rental Listings**: Users can create listings for items they want to rent out
- **Per-Day Pricing**: Set daily rental rates for items
- **Availability Management**: Define start and end dates for item availability
- **Rental Transactions**: Track all rental bookings with duration and pricing
- **Conflict Prevention**: Automatic checking to prevent double-booking
- **User Dashboard**: View items you're renting out and items you've rented

## Database Schema

### Tables

1. **rental_listings**: Stores items available for rent
   - Owner information (ID, name, email)
   - Item details (title, description, category, images)
   - Pricing (daily_price)
   - Availability (start/end dates)
   - Status (AVAILABLE, RENTED, UNAVAILABLE)

2. **rental_transactions**: Tracks rental bookings
   - Renter information (ID, name, email)
   - Rental period (start/end dates, duration)
   - Pricing (daily rate, total price)
   - Status (PENDING, ACTIVE, COMPLETED, CANCELLED)

## API Endpoints

### Rental Listings

- `GET /listings` - Get all available rental listings (filter by category, status)
- `GET /listings/:id` - Get single rental listing details
- `POST /listings` - Create new rental listing
- `PUT /listings/:id` - Update rental listing
- `DELETE /listings/:id` - Delete rental listing
- `GET /user/:user_id/listings` - Get user's listings (as owner)

### Rental Transactions

- `POST /transactions` - Create rental transaction (rent an item)
- `GET /user/:user_id/rentals` - Get user's rentals (as renter)
- `PUT /transactions/:id/complete` - Complete rental transaction

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Create database:
```bash
# Connect to PostgreSQL and run:
CREATE DATABASE rent_db;
```

4. Run database schema:
```bash
psql -h <host> -U <user> -d rent_db -f database-schema.sql
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name (rent_db)
- `PORT`: Service port (default: 3003)
- `NODE_ENV`: Environment (development/production)

## Categories

- Electronics
- Books
- Furniture
- Sports Equipment
- Musical Instruments
- Tools
- Clothing
- Other

## Usage Example

### Create Rental Listing

```javascript
POST /listings
{
  "owner_id": "uuid",
  "owner_name": "John Doe",
  "owner_email": "john@example.uiu.ac.bd",
  "title": "Canon DSLR Camera",
  "description": "Professional camera with lens",
  "daily_price": 500.00,
  "category": "Electronics",
  "images": ["url1", "url2"],
  "availability_start": "2024-01-01",
  "availability_end": "2024-12-31"
}
```

### Rent an Item

```javascript
POST /transactions
{
  "listing_id": "uuid",
  "renter_id": "uuid",
  "renter_name": "Jane Smith",
  "renter_email": "jane@example.uiu.ac.bd",
  "start_date": "2024-06-01",
  "end_date": "2024-06-05"
}
```

The system will:
- Calculate duration (5 days)
- Calculate total price (5 × 500 = 2500 BDT)
- Check for conflicts
- Create transaction and update listing status

## License

ISC
