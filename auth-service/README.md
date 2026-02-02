# Auth Service - Stateless OTP with Cryptographic Hash

A Node.js authentication service using **stateless OTP verification** via cryptographic hashing (HMAC SHA256). No Redis or OTP database table required.

## Features

✅ **Stateless OTP** - No database storage for OTPs  
✅ **Email 2FA** - Verify users via UIU email (@uiu.ac.bd)  
✅ **Cryptographic Security** - HMAC SHA256 hash verification  
✅ **5-minute OTP Expiry** - Automatic time-based expiration  
✅ **bcrypt Password Hashing** - Secure password storage  
✅ **PostgreSQL** - User data storage on Aiven  

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Aiven)
- **Email**: Nodemailer (Gmail)
- **Security**: crypto (HMAC SHA256), bcrypt

---

## Project Structure

```
auth-service/
├── src/
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection
│   ├── controllers/
│   │   └── authController.js     # Business logic (sendOtp, register, login)
│   ├── routes/
│   │   └── authRoutes.js         # API endpoints
│   └── utils/
│       ├── otpService.js         # OTP generation & verification (STATELESS)
│       └── emailService.js       # Email sending (Nodemailer)
├── .env                          # Environment variables
├── server.js                     # Express server setup
├── database-schema.sql           # PostgreSQL schema
└── package.json
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update `.env` file:

```env
# Database (from Aiven Console)
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=16231
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_NAME=auth_db

# Server
PORT=3001
JWT_SECRET=your-jwt-secret

# OTP Secret (use a strong 64-character random value in production)
OTP_SECRET=4f9c1d8a7b3e2c6d9f0a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
```

### 3. Setup Gmail App Password

1. Enable **2-Step Verification** on your Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an **App Password** for "Mail"
4. Copy the 16-character password to `EMAIL_PASSWORD` in `.env`

### 4. Create Database Table

Run `database-schema.sql` in Aiven PostgreSQL console:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    batch VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Start Server

```bash
node server.js
```

Server runs on: `http://localhost:3001`

---

## API Endpoints

### 1. **Send OTP**

**POST** `/api/auth/send-otp`

Send OTP to user's UIU email for registration.

**Request Body:**
```json
{
  "email": "student@uiu.ac.bd"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "hash": "a1b2c3d4e5f6...1234567890.1702123456789"
}
```

**Important:** 
- The `hash` contains the cryptographic signature + expiry timestamp
- Frontend must **store this hash** to verify OTP later
- OTP is sent to email, NOT returned in API response

---

### 2. **Register User**

**POST** `/api/auth/register`

Register new user after OTP verification.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "student@uiu.ac.bd",
  "password": "SecurePass123",
  "department": "CSE",
  "batch": "2021",
  "otp": "123456",
  "hash": "a1b2c3d4e5f6...1234567890.1702123456789"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "student@uiu.ac.bd",
    "department": "CSE",
    "batch": "2021",
    "created_at": "2025-12-10T10:30:00.000Z"
  }
}
```

**Response (OTP Invalid/Expired):**
```json
{
  "success": false,
  "error": "Invalid or expired OTP. Please request a new one."
}
```

---

### 3. **Login**

**POST** `/api/auth/login`

Login existing user with email and password.

**Request Body:**
```json
{
  "email": "student@uiu.ac.bd",
  "password": "SecurePass123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "student@uiu.ac.bd",
    "department": "CSE",
    "batch": "2021"
  }
}
```

---

## How Stateless OTP Works

### **Traditional Approach (Database/Redis)**
```
1. Generate OTP → Store in DB/Redis with email + expiry
2. User enters OTP → Query DB to verify
3. Delete OTP from DB after verification
❌ Requires database/cache storage
```

### **Our Stateless Approach (Cryptographic Hash)**
```
1. Generate OTP + Create HMAC hash of (email + OTP + expiry)
2. Send hash to frontend, OTP to email
3. User enters OTP → Verify by recalculating hash
✅ No database storage needed!
```

### **OTP Generation Flow:**

```javascript
// Step 1: Generate random 6-digit OTP
otp = "123456"

// Step 2: Set expiry (5 minutes from now)
expiry = Date.now() + 5*60*1000  // e.g., 1702123456789

// Step 3: Create data string
data = "student@uiu.ac.bd.123456.1702123456789"

// Step 4: Create HMAC SHA256 hash using secret key
hash = HMAC_SHA256(data, OTP_SECRET)
// Result: "a1b2c3d4e5f6..."

// Step 5: Return to frontend
return {
  otp: "123456",              // Send to email
  hash: "a1b2c3d4e5f6...1702123456789"  // Send to frontend
}
```

### **OTP Verification Flow:**

```javascript
// Frontend sends: email, otp, hash

// Step 1: Split hash to get expiry
[hashValue, expiry] = hash.split('.')

// Step 2: Check if expired
if (Date.now() > expiry) {
  return false  // Expired
}

// Step 3: Recreate the HMAC hash
data = "student@uiu.ac.bd.123456.1702123456789"
calculatedHash = HMAC_SHA256(data, OTP_SECRET)

// Step 4: Compare hashes
return calculatedHash === hashValue
```

**Security Benefits:**
- ✅ **No DB storage** - OTP never saved anywhere
- ✅ **Tamper-proof** - Hash validates integrity
- ✅ **Time-limited** - Expiry embedded in hash
- ✅ **Secret-based** - Requires OTP_SECRET to forge

---

## Frontend Integration Example

### Step 1: Request OTP
```javascript
const response = await fetch('http://localhost:3001/api/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'student@uiu.ac.bd' })
});

const data = await response.json();
// Store hash in state/localStorage
localStorage.setItem('otpHash', data.hash);
```

### Step 2: Register with OTP
```javascript
const hash = localStorage.getItem('otpHash');

const response = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'student@uiu.ac.bd',
    password: 'SecurePass123',
    department: 'CSE',
    batch: '2021',
    otp: '123456',  // User input
    hash: hash      // From Step 1
  })
});
```

---

## Testing with Postman/Thunder Client

### Test 1: Health Check
```
GET http://localhost:3001/health
```

### Test 2: Send OTP
```
POST http://localhost:3001/api/auth/send-otp
Content-Type: application/json

{
  "email": "your-email@uiu.ac.bd"
}
```

### Test 3: Register (after receiving OTP in email)
```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "your-email@uiu.ac.bd",
  "password": "Test123",
  "department": "CSE",
  "batch": "2021",
  "otp": "123456",
  "hash": "<hash-from-send-otp-response>"
}
```

---

## Security Considerations

1. **Change OTP_SECRET in Production**
   - Use a strong, random secret key
   - Never commit it to Git

2. **HTTPS Only**
   - Always use HTTPS in production
   - Hashes can be intercepted over HTTP

3. **Rate Limiting**
   - Add rate limiting to prevent OTP spam
   - Limit to 3 OTP requests per email per hour

4. **Email Validation**
   - Only @uiu.ac.bd emails allowed
   - Prevents unauthorized registrations

5. **Password Requirements**
   - Enforce strong passwords (min 8 chars, uppercase, numbers)
   - Consider adding password strength validation

---

## Troubleshooting

### Email not sending?
1. Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
2. Verify Gmail App Password is correct
3. Check server logs for email errors

### OTP always invalid?
1. Ensure `OTP_SECRET` is the same during generation and verification
2. Check if OTP expired (5-minute window)
3. Verify hash is passed correctly from frontend

### Database connection failed?
1. Check Aiven credentials in `.env`
2. Ensure `users` table exists
3. Test connection: `GET http://localhost:3001/health`

---

## Future Enhancements

- [ ] JWT token generation for login
- [ ] Refresh token mechanism
- [ ] Password reset with OTP
- [ ] Account lockout after failed attempts
- [ ] Email verification status in DB
- [ ] Rate limiting middleware

---

## License

MIT

---

## Author

EduSync Team - UIU
