# Testing Auth Service via Gateway

## Step 1: Start Both Services

### Terminal 1 - Start Auth Service
```bash
cd C:\EduSync\EduSync\auth-service
npm start
```
**Expected:** Server running on port 3001

### Terminal 2 - Start Gateway
```bash
cd C:\EduSync\EduSync\gateway
npm start
```
**Expected:** Gateway running on port 8000

---

## Step 2: Import Thunder Client Collection

1. Open Thunder Client in VS Code (Click the Thunder icon in sidebar)
2. Click "Collections" tab
3. Click the menu (⋮) → "Import"
4. Navigate to: `C:\EduSync\EduSync\gateway\thunder-tests\thunderclient.json`
5. Collection "EduSync Auth Service via Gateway" should appear

---

## Step 3: Test the Flow

### ✅ Test 1: Gateway Health Check
**Request:** `GET http://localhost:8000/`
**Expected Response:**
```
Gateway is Running
```

### ✅ Test 2: Auth Service Info
**Request:** `GET http://localhost:8000/api/auth`
**Expected Response:**
```json
{
  "service": "EduSync Auth Service",
  "version": "1.0.0",
  "status": "running",
  "endpoints": { ... }
}
```

### ✅ Test 3: Send OTP
**Request:** `POST http://localhost:8000/api/auth/send-otp`
**Body:**
```json
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
  "hash": "1734... (save this!)",
  "email": "student@bscse.uiu.ac.bd"
}
```

**⚠️ IMPORTANT:** 
- Check your email for the 6-digit OTP
- Copy the `hash` value - you'll need it for registration

### ✅ Test 4: Register User
**Request:** `POST http://localhost:8000/api/auth/register`
**Body:**
```json
{
  "email": "student@bscse.uiu.ac.bd",
  "password": "SecurePass123!",
  "otp": "123456",  // ← Use OTP from email
  "hash": "PASTE_HASH_FROM_STEP_3",  // ← Paste hash here
  "name": "John Doe",
  "studentId": "011221001",
  "department": "CSE",
  "batch": "52"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGc... (save this!)",
  "user": {
    "id": "uuid...",
    "email": "student@bscse.uiu.ac.bd",
    "role": "student",
    "name": "John Doe"
  }
}
```

**⚠️ IMPORTANT:** Copy the `token` - you'll need it for protected routes

### ✅ Test 5: Login User
**Request:** `POST http://localhost:8000/api/auth/login`
**Body:**
```json
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
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### ✅ Test 6: Get Profile (Protected)
**Request:** `GET http://localhost:8000/api/auth/profile`
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "student@bscse.uiu.ac.bd",
    "name": "John Doe",
    "studentId": "011221001",
    ...
  }
}
```

---

## Quick Thunder Client Tips

### Setting Variables
1. In Thunder Client, click "Env" tab
2. Create new environment "Gateway Local"
3. Add variables:
```json
{
  "gateway_url": "http://localhost:8000",
  "auth_token": "paste_token_after_login"
}
```
4. Use in requests: `{{gateway_url}}/api/auth/login`

### Using the Token
After login, copy the token and:
1. Go to request "6. Get Profile"
2. In Headers, replace `PASTE_TOKEN_FROM_LOGIN` with your actual token
3. Click Send

---

## Testing Checklist

- [ ] Auth service running (port 3001)
- [ ] Gateway running (port 8000)
- [ ] Gateway health check works
- [ ] Auth service info endpoint works
- [ ] Can send OTP
- [ ] Can register user
- [ ] Can login user
- [ ] Can access protected routes with token

---

## Common Issues

### ❌ "Proxy Error: Could not reach Auth Service"
**Solution:** Make sure auth service is running on port 3001

### ❌ "Invalid or expired OTP"
**Solution:** 
- OTP expires in 10 minutes
- Request a new OTP
- Make sure you copied the correct hash

### ❌ "Token expired. Please login again"
**Solution:** 
- Tokens expire after 24 hours
- Login again to get a new token

### ❌ "Rate limit exceeded"
**Solution:** 
- Wait for the rate limit window to expire
- Rate limits reset automatically
