# API Testing Guide

## Quick Start

1. **Start the server:**
   ```bash
   node server.js
   ```

2. **Update .env with your email credentials:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

3. **Test the endpoints below**

---

## Test Endpoints

### 1. Health Check
```http
GET http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Database is connected!",
  "db_time": "2025-12-10T10:30:00.000Z"
}
```

---

### 2. Send OTP
```http
POST http://localhost:3001/api/auth/send-otp
Content-Type: application/json

{
  "email": "student@uiu.ac.bd"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "hash": "653c857a551724fd70be7dae0cce33af930c8c7f543d239b7abb74e50a26c03b.1765307474109"
}
```

**IMPORTANT:** Copy the `hash` value for the next step!

---

### 3. Register User
```http
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "student@uiu.ac.bd",
  "password": "SecurePass123",
  "department": "CSE",
  "batch": "2021",
  "otp": "256797",
  "hash": "653c857a551724fd70be7dae0cce33af930c8c7f543d239b7abb74e50a26c03b.1765307474109"
}
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "student@uiu.ac.bd",
    "department": "CSE",
    "batch": "2021",
    "created_at": "2025-12-10T10:30:00.000Z"
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
  "email": "student@uiu.ac.bd",
  "password": "SecurePass123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "student@uiu.ac.bd",
    "department": "CSE",
    "batch": "2021"
  }
}
```

---

## Error Scenarios

### Invalid Email Domain
```http
POST http://localhost:3001/api/auth/send-otp
Content-Type: application/json

{
  "email": "test@gmail.com"
}
```

**Response:**
```json
{
  "success": false,
  "error": "Only UIU email addresses (@uiu.ac.bd) are allowed"
}
```

### Expired OTP
Wait 5+ minutes after receiving OTP, then try to register.

**Response:**
```json
{
  "success": false,
  "error": "Invalid or expired OTP. Please request a new one."
}
```

### Duplicate Email
Try to register with the same email twice.

**Response:**
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

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
