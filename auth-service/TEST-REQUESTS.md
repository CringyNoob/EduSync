# Auth Service API Test Requests

## 📋 Complete Testing Flow

Copy these JSON bodies directly into Thunder Client or Postman.

---

## 1️⃣ Send OTP (Registration)

**Method:** `POST`  
**URL:** `http://localhost:8000/api/auth/send-otp`  
**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "email": "john.doe@bscse.uiu.ac.bd",
  "type": "registration"
}
```

**Save from Response:** Copy the `hash` value!

---

## 2️⃣ Register User

**Method:** `POST`  
**URL:** `http://localhost:8000/api/auth/register`  
**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "email": "john.doe@bscse.uiu.ac.bd",
  "password": "SecurePassword123!",
  "otp": "123456",
  "hash": "PASTE_HASH_FROM_STEP_1",
  "name": "John Doe",
  "studentId": "011221001",
  "department": "CSE",
  "batch": "52"
}
```

**Alternative (with firstName/lastName):**
```json
{
  "email": "jane.smith@bscse.uiu.ac.bd",
  "password": "SecurePassword123!",
  "otp": "123456",
  "hash": "PASTE_HASH_FROM_STEP_1",
  "firstName": "Jane",
  "lastName": "Smith",
  "studentId": "011221002",
  "department": "CSE",
  "batch": "52"
}
```

**Save from Response:** Copy the `token` value!

---

## 3️⃣ Login User

**Method:** `POST`  
**URL:** `http://localhost:8000/api/auth/login`  
**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "email": "john.doe@bscse.uiu.ac.bd",
  "password": "SecurePassword123!"
}
```

**Save from Response:** Copy the `token` value!

---

## 4️⃣ Verify Token

**Method:** `GET`  
**URL:** `http://localhost:8000/api/auth/verify-token`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**No Body Required**

---

## 5️⃣ Get Own Profile

**Method:** `GET`  
**URL:** `http://localhost:8000/api/auth/profile`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**No Body Required**

---

## 6️⃣ Get Other User's Profile

**Method:** `GET`  
**URL:** `http://localhost:8000/api/auth/profile?userId=USER_UUID_HERE`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**No Body Required**

---

## 7️⃣ Update Profile

**Method:** `PUT`  
**URL:** `http://localhost:8000/api/auth/profile`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (All fields optional):**
```json
{
  "fullName": "John Updated Doe",
  "phone": "+8801712345678",
  "bio": "Senior CS student at UIU, passionate about web development and AI",
  "avatarUrl": "https://i.pravatar.cc/150?img=12",
  "emailVisible": true,
  "phoneVisible": false
}
```

**Minimal Update:**
```json
{
  "bio": "CS student at UIU"
}
```

---

## 8️⃣ Change Password

**Method:** `PUT`  
**URL:** `http://localhost:8000/api/auth/change-password`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body:**
```json
{
  "currentPassword": "SecurePassword123!",
  "newPassword": "NewSecurePassword456!"
}
```

---

## 9️⃣ Forgot Password (Request OTP)

**Method:** `POST`  
**URL:** `http://localhost:8000/api/auth/forgot-password`  
**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "email": "john.doe@bscse.uiu.ac.bd"
}
```

**Save from Response:** Copy the `hash` value!

---

## 🔟 Reset Password (With OTP)

**Method:** `POST`  
**URL:** `http://localhost:8000/api/auth/reset-password`  
**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "email": "john.doe@bscse.uiu.ac.bd",
  "otp": "123456",
  "hash": "PASTE_HASH_FROM_FORGOT_PASSWORD",
  "newPassword": "ResetSecurePassword789!"
}
```

---

## 📧 Multiple Test Users

### User 1 - CSE Student
```json
{
  "email": "alice.johnson@bscse.uiu.ac.bd",
  "password": "AlicePass123!",
  "name": "Alice Johnson",
  "studentId": "011221010",
  "department": "CSE",
  "batch": "52"
}
```

### User 2 - EEE Student
```json
{
  "email": "bob.wilson@bseee.uiu.ac.bd",
  "password": "BobPass123!",
  "name": "Bob Wilson",
  "studentId": "012221020",
  "department": "EEE",
  "batch": "52"
}
```

### User 3 - BBA Student
```json
{
  "email": "carol.davis@bba.uiu.ac.bd",
  "password": "CarolPass123!",
  "name": "Carol Davis",
  "studentId": "013221030",
  "department": "BBA",
  "batch": "52"
}
```

### User 4 - Economics Student
```json
{
  "email": "david.brown@eco.uiu.ac.bd",
  "password": "DavidPass123!",
  "name": "David Brown",
  "studentId": "014221040",
  "department": "Economics",
  "batch": "52"
}
```

---

## 🎯 Complete Testing Sequence

### Sequence 1: New User Registration Flow
1. ✅ Send OTP → Save `hash`
2. ✅ Check email for OTP
3. ✅ Register → Save `token`
4. ✅ Login → Get fresh `token`
5. ✅ Verify Token → Check token validity
6. ✅ Get Profile → View own profile

### Sequence 2: Profile Management Flow
1. ✅ Login → Get `token`
2. ✅ Get Profile → View current data
3. ✅ Update Profile → Change bio/phone
4. ✅ Get Profile → Verify changes

### Sequence 3: Password Management Flow
1. ✅ Login → Get `token`
2. ✅ Change Password → Update while logged in
3. ✅ Login → Test new password
4. ✅ Forgot Password → Request OTP → Save `hash`
5. ✅ Reset Password → Use OTP and hash
6. ✅ Login → Test reset password

---

## ⚠️ Common Mistakes to Avoid

### ❌ Wrong Email Format
```json
{
  "email": "test@gmail.com"  // ❌ Must be @uiu.ac.bd
}
```

### ✅ Correct Email Format
```json
{
  "email": "student@bscse.uiu.ac.bd"  // ✅ Valid UIU email
}
```

### ❌ Invalid Student ID
```json
{
  "studentId": "123456"  // ❌ Must start with 011-016
}
```

### ✅ Valid Student IDs
```json
{
  "studentId": "011221001"  // ✅ CSE (011)
}
{
  "studentId": "012221001"  // ✅ EEE (012)
}
{
  "studentId": "013221001"  // ✅ BBA (013)
}
```

---

## 🔐 Valid Department Codes

| Code | Department |
|------|------------|
| 011 | CSE (Computer Science & Engineering) |
| 012 | EEE (Electrical & Electronic Engineering) |
| 013 | BBA (Business Administration) |
| 014 | Economics |
| 015 | Civil Engineering |
| 016 | Pharmacy |

**Student ID Format:** `DDDYYBSSS`
- `DDD` = Department code (011-016)
- `YY` = Year (22 = 2022)
- `B` = Batch number (1-9)
- `SSS` = Serial number (001-999)

**Example:** `011221001` = CSE, 2022 admission, Batch 1, Serial 001

---

## 🧪 Rate Limit Testing

### Test OTP Rate Limit (3 per 5 minutes)
Send OTP 4 times quickly - 4th should fail:
```json
{
  "success": false,
  "error": "Too many OTP requests. Please try again in 5 minutes."
}
```

### Test Login Rate Limit (5 per 15 minutes)
Try wrong password 6 times - 6th should fail:
```json
{
  "success": false,
  "error": "Too many login attempts. Please try again after 15 minutes."
}
```

---

## 📊 Expected Success Responses

### Registration Success
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "john.doe@bscse.uiu.ac.bd",
    "role": "student",
    "isVerified": true,
    "name": "John Doe",
    "studentId": "011221001",
    "department": "CSE",
    "batch": "52"
  }
}
```

### Login Success
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "john.doe@bscse.uiu.ac.bd",
    "role": "student",
    "isVerified": true,
    "name": "John Doe",
    "studentId": "011221001",
    "department": "CSE",
    "batch": "52",
    "phone": "+8801712345678",
    "bio": "CS student at UIU",
    "avatarUrl": null,
    "createdAt": "2025-12-17T10:30:00.000Z"
  }
}
```

### Profile Update Success
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid-here",
    "email": "john.doe@bscse.uiu.ac.bd",
    "role": "student",
    "name": "John Updated Doe",
    "studentId": "011221001",
    "department": "CSE",
    "batch": "52",
    "phone": "+8801712345678",
    "bio": "Senior CS student",
    "avatarUrl": "https://example.com/avatar.jpg",
    "emailVisible": true,
    "phoneVisible": false,
    "updatedAt": "2025-12-17T11:00:00.000Z"
  }
}
```
