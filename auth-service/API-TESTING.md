# Auth Service - API Testing Guide

## Quick Start

1. **Run the database schema first:**
   ```sql
   -- Execute database-schema.sql in your PostgreSQL database
   ```

2. **Update .env with your credentials:**
   ```env
   DB_HOST=your-db-host
   DB_PORT=16231
   DB_USER=avnadmin
   DB_PASSWORD=your-password
   DB_NAME=auth_db
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   OTP_SECRET=your-otp-secret-key-min-32-chars
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

3. **Start the server:**
   ```bash
   npm start
   # or
   node server.js
   ```

4. **Test the endpoints below using Postman, Thunder Client, or cURL**

---

## Base URL
```
http://localhost:3001
```

---

## 🔓 PUBLIC ENDPOINTS (No Auth Required)

### 1. Health Check
```http
GET http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Database is connected!",
  "db_time": "2025-12-17T10:30:00.000Z"
}
```

---

### 2. Send OTP (Registration)
```http
POST http://localhost:3001/api/auth/send-otp
Content-Type: application/json

{
  "email": "student@bscse.uiu.ac.bd",
  "type": "registration"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "hash": "1734444123456.a1b2c3d4e5f6789...",
  "email": "student@bscse.uiu.ac.bd"
}
```

**⚠️ IMPORTANT:** Save the `hash` value - you'll need it for registration!

---

### 3. Register User
```http
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "student@bscse.uiu.ac.bd",
  "password": "SecurePass123!",
  "otp": "123456",
  "hash": "1734444123456.a1b2c3d4e5f6789...",
  "name": "John Doe",
  "studentId": "011221001",
  "department": "CSE",
  "batch": "52"
}
```

**Alternative (firstName/lastName):**
```json
{
  "email": "student@bscse.uiu.ac.bd",
  "password": "SecurePass123!",
  "otp": "123456",
  "hash": "1734444123456.a1b2c3d4e5f6789...",
  "firstName": "John",
  "lastName": "Doe",
  "studentId": "011221001",
  "department": "CSE",
  "batch": "52"
}
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "student@bscse.uiu.ac.bd",
    "role": "student",
    "isVerified": true,
    "name": "John Doe",
    "studentId": "011221001",
    "department": "CSE",
    "batch": "52"
  }
}
```

**Expected Response (Invalid OTP):**
```json
{
  "success": false,
  "error": "Invalid or expired OTP. Please request a new one."
}
```

---

### 4. Login
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "student@bscse.uiu.ac.bd",
  "password": "SecurePass123!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "student@bscse.uiu.ac.bd",
    "role": "student",
    "isVerified": true,
    "name": "John Doe",
    "studentId": "011221001",
    "department": "CSE",
    "batch": "52",
    "phone": null,
    "bio": null,
    "avatarUrl": null,
    "createdAt": "2025-12-17T10:30:00.000Z"
  }
}
```

**⚠️ IMPORTANT:** Save the `token` - you'll need it for protected endpoints!

---

### 5. Forgot Password
```http
POST http://localhost:3001/api/auth/forgot-password
Content-Type: application/json

{
  "email": "student@bscse.uiu.ac.bd"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "hash": "1734444123456.a1b2c3d4e5f6789...",
  "email": "student@bscse.uiu.ac.bd"
}
```

---

### 6. Reset Password
```http
POST http://localhost:3001/api/auth/reset-password
Content-Type: application/json

{
  "email": "student@bscse.uiu.ac.bd",
  "otp": "123456",
  "hash": "1734444123456.a1b2c3d4e5f6789...",
  "newPassword": "NewSecurePass456!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password."
}
```

---

## 🔐 PROTECTED ENDPOINTS (Auth Required)

For all protected endpoints, add this header:
```
Authorization: Bearer <your-jwt-token>
```

---

### 7. Verify Token
```http
GET http://localhost:3001/api/auth/verify-token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response:**
```json
{
  "success": true,
  "valid": true,
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "student@bscse.uiu.ac.bd",
    "role": "student",
    "isVerified": true,
    "name": "John Doe",
    "avatarUrl": null
  }
}
```

---

### 8. Get Profile (Own)
```http
GET http://localhost:3001/api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "student@bscse.uiu.ac.bd",
    "role": "student",
    "isVerified": true,
    "name": "John Doe",
    "studentId": "011221001",
    "department": "CSE",
    "batch": "52",
    "phone": "+880123456789",
    "bio": "CS student at UIU",
    "avatarUrl": null,
    "emailVisible": true,
    "phoneVisible": false,
    "createdAt": "2025-12-17T10:30:00.000Z"
  }
}
```

---

### 9. Get Profile (Other User)
```http
GET http://localhost:3001/api/auth/profile?userId=other-user-uuid
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note:** Only shows email/phone if the user has set them as visible!

---

### 10. Update Profile
```http
PUT http://localhost:3001/api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "fullName": "John Updated Doe",
  "phone": "+880123456789",
  "bio": "Senior CS student at UIU, passionate about web development",
  "avatarUrl": "https://example.com/avatar.jpg",
  "emailVisible": true,
  "phoneVisible": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "student@bscse.uiu.ac.bd",
    "role": "student",
    "name": "John Updated Doe",
    "studentId": "011221001",
    "department": "CSE",
    "batch": "52",
    "phone": "+880123456789",
    "bio": "Senior CS student at UIU, passionate about web development",
    "avatarUrl": "https://example.com/avatar.jpg",
    "emailVisible": true,
    "phoneVisible": true,
    "updatedAt": "2025-12-17T11:00:00.000Z"
  }
}
```

---

### 11. Change Password
```http
PUT http://localhost:3001/api/auth/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "currentPassword": "SecurePass123!",
  "newPassword": "EvenMoreSecure456!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## ❌ Error Scenarios

### Invalid Email Domain
```json
{
  "success": false,
  "error": "Only UIU email addresses (e.g., student@bscse.uiu.ac.bd) are allowed"
}
```

### Invalid Student ID
```json
{
  "success": false,
  "error": "Invalid student ID format. Department code must be 011-016."
}
```

### Expired OTP (after 10 minutes)
```json
{
  "success": false,
  "error": "Invalid or expired OTP. Please request a new one."
}
```

### Duplicate Email
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

### Invalid Token
```json
{
  "success": false,
  "error": "Invalid token."
}
```

### Expired Token
```json
{
  "success": false,
  "error": "Token expired. Please login again."
}
```

### Missing Token
```json
{
  "success": false,
  "error": "Access denied. No token provided."
}
```

---

## 📋 Student ID Format

| Department Code | Department |
|----------------|------------|
| 011 | CSE |
| 012 | EEE |
| 013 | BBA |
| 014 | Economics |
| 015 | Civil |
| 016 | Pharmacy |

**Format:** `DDDYYBSSS`
- DDD = Department code (011-016)
- YY = Year (21, 22, 23, etc.)
- B = Batch number (1-9)
- SSS = Serial number (001-999)

**Example:** `011221001` = CSE, 2022, Batch 1, Serial 001

---

## Using Thunder Client (VS Code Extension)

1. Install **Thunder Client** extension in VS Code
2. Create a new collection: "Auth Service"
3. Add requests for each endpoint above
4. Save the `hash` from send-otp response as an environment variable
5. Use `{{hash}}` in the register request

---

## Using cURL

### Send OTP:
```bash
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"student@uiu.ac.bd"}'
```

### Register:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"student@uiu.ac.bd",
    "password":"SecurePass123",
    "department":"CSE",
    "batch":"2021",
    "otp":"256797",
    "hash":"your-hash-here"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"student@uiu.ac.bd",
    "password":"SecurePass123"
  }'
```
