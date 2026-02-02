# Vendor Registration API Documentation

## Endpoint: Register New Vendor

**URL:** `POST /vendors/register`  
**Service:** Marketplace Service (Port 3002)  
**Authentication:** Required (Bearer token)

### Purpose
Allows authenticated users to register a new vendor shop (Startup or Food Vendor). Each user can only own one shop.

---

## Request

### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | String | ✅ Yes | Name of the vendor/shop |
| `description` | String | ❌ No | Description of the vendor/shop |
| `type` | String | ✅ Yes | Either `'STARTUP'` or `'FOOD_VENDOR'` |

### Example Request
```json
{
    "name": "UIU Tech Hub",
    "description": "Student-led technology innovation center",
    "type": "STARTUP"
}
```

---

## Response

### Success Response (201 Created)
```json
{
    "success": true,
    "vendorId": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Vendor registered successfully. Payment pending."
}
```

### Error Responses

#### 400 Bad Request - Missing Fields
```json
{
    "success": false,
    "error": "Missing required fields: name and type are required."
}
```

#### 400 Bad Request - Invalid Type
```json
{
    "success": false,
    "error": "Invalid vendor type. Must be STARTUP or FOOD_VENDOR."
}
```

#### 401 Unauthorized - No Token
```json
{
    "success": false,
    "message": "Access denied. No token provided."
}
```

#### 401 Unauthorized - Invalid Token
```json
{
    "success": false,
    "message": "Invalid token."
}
```

#### 409 Conflict - User Already Owns a Shop
```json
{
    "success": false,
    "error": "You already own a shop. Only one shop per user is allowed."
}
```

#### 500 Internal Server Error
```json
{
    "success": false,
    "error": "Failed to register vendor"
}
```

---

## Business Logic

### Registration Flow
1. **Authentication Check**: Validates JWT token and extracts user ID
2. **Input Validation**: Checks for required fields (name, type)
3. **Type Validation**: Ensures type is either 'STARTUP' or 'FOOD_VENDOR'
4. **One-Shop-Per-User Rule**: Queries database to check if user already owns a vendor
5. **Vendor Creation**: Inserts new vendor with:
   - `owner_id`: From authenticated user
   - `status`: 'PENDING_PAYMENT' (awaiting payment verification)
   - `is_active`: false (shop not yet active)
6. **Return Response**: Returns newly created vendor UUID

### Vendor Status Lifecycle
1. **PENDING_PAYMENT** (Initial state after registration)
2. **ACTIVE** (After payment verification - requires admin approval)
3. **SUSPENDED** (Temporarily disabled by admin)
4. **REJECTED** (Registration rejected by admin)

### Shop Activation
- New vendors start with `is_active = false`
- For **Food Vendors**: `is_active` controls shop visibility (true = Shop Open, false = Shop Closed)
- For **Startups**: `is_active` indicates operational status
- Admin must activate shop after payment verification

---

## Database Schema

### vendors Table
```sql
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type vendor_type NOT NULL, -- 'STARTUP' or 'FOOD_VENDOR'
    description TEXT,
    logo_url VARCHAR(500),
    status vendor_status DEFAULT 'PENDING_PAYMENT',
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Testing

### Using cURL
```bash
# 1. Login first to get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@university.edu","password":"password123"}'

# 2. Register vendor (replace <TOKEN> with actual JWT)
curl -X POST http://localhost:3002/vendors/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Campus Tech Hub",
    "description": "Innovation space for student projects",
    "type": "STARTUP"
  }'
```

### Using Thunder Client / Postman
1. **Login Request**
   - Method: POST
   - URL: `http://localhost:3001/api/auth/login`
   - Body: `{"email":"user@university.edu","password":"password123"}`
   - Save the `token` from response

2. **Register Vendor Request**
   - Method: POST
   - URL: `http://localhost:3002/vendors/register`
   - Headers: `Authorization: Bearer <token>`
   - Body: `{"name":"My Shop","description":"Description","type":"STARTUP"}`

### Using Test Script
```bash
cd marketplace-service
node test-vendor-registration.js
```

---

## Integration with Gateway

If using API Gateway (Port 8000), the endpoint becomes:
```
POST http://localhost:8000/api/marketplace/vendors/register
```

Gateway will forward requests to marketplace-service with proper routing.

---

## Security Notes

1. **JWT Validation**: Token must be valid and not expired
2. **User Ownership**: vendor.owner_id automatically set from authenticated user
3. **One Shop Rule**: Database enforces one vendor per user
4. **Status Control**: Admin endpoints needed for status changes (PENDING_PAYMENT → ACTIVE)
5. **Input Sanitization**: All inputs validated before database insertion

---

## Next Steps After Registration

After successful vendor registration:
1. User receives `vendorId` in response
2. User should be redirected to payment page
3. Admin verifies payment and updates status to 'ACTIVE'
4. Vendor can then add products to their shop
5. Shop becomes visible to customers

---

## Related Endpoints

- `GET /vendors?type=STARTUP` - Get all startups
- `GET /vendors?type=FOOD_VENDOR` - Get all food vendors (active only)
- `GET /vendors/:id` - Get vendor details with products
- `POST /products` - Add product to vendor (requires separate implementation)

---

## Support

For issues or questions:
- Check service logs: `marketplace-service/server.js`
- Verify database connection: Check `.env` file
- Test authentication: Use auth-service endpoints first
- Database errors: Check PostgreSQL connection and schema

