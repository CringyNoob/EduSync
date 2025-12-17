# 🎯 Testing URLs Reference

## ⚠️ IMPORTANT: Which URL to Use?

### Use GATEWAY for all API testing:
```
http://localhost:8000
```

### Direct service URLs (for debugging only):
- Auth Service: `http://localhost:3001`
- Gateway: `http://localhost:8000`

---

## 📋 Thunder Client Testing URLs

### ✅ CORRECT - Via Gateway (Use These!)

| Test | Method | URL |
|------|--------|-----|
| Gateway Health | GET | `http://localhost:8000/` |
| Auth Info | GET | `http://localhost:8000/api/auth` |
| Send OTP | POST | `http://localhost:8000/api/auth/send-otp` |
| Register | POST | `http://localhost:8000/api/auth/register` |
| Login | POST | `http://localhost:8000/api/auth/login` |
| Get Profile | GET | `http://localhost:8000/api/auth/profile` |
| Update Profile | PUT | `http://localhost:8000/api/auth/profile` |
| Change Password | PUT | `http://localhost:8000/api/auth/change-password` |
| Forgot Password | POST | `http://localhost:8000/api/auth/forgot-password` |
| Reset Password | POST | `http://localhost:8000/api/auth/reset-password` |

### ❌ WRONG - Direct to Auth Service (Don't use for testing)

| URL | Why Wrong? |
|-----|------------|
| `http://localhost:3001/` | Bypasses gateway, not how frontend will call it |
| `http://localhost:3001/api/auth/login` | No gateway layer, missing proxy benefits |

---

## 🔍 Quick Test Commands

### Test Gateway is Running:
```bash
curl http://localhost:8000/
# Should return: "Gateway is Running"
```

### Test Auth Service Info:
```bash
curl http://localhost:8000/api/auth
# Should return: JSON with service info and endpoints
```

### Test Send OTP:
```bash
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"student@bscse.uiu.ac.bd","type":"registration"}'
```

---

## 🚀 Service Status Check

Both must be running:
- ✅ Terminal 1: Auth Service on port **3001**
- ✅ Terminal 2: Gateway on port **8000**

### How to Check:
```powershell
# Check what's running on ports
netstat -ano | findstr "3001"
netstat -ano | findstr "8000"
```

---

## 💡 Thunder Client Setup

1. **Open Thunder Client** (Lightning icon in sidebar)
2. **New Request**
3. **URL:** `http://localhost:8000/api/auth`
4. **Method:** GET
5. **Send** ✨

Expected Response:
```json
{
  "service": "EduSync Auth Service",
  "version": "1.0.0",
  "status": "running",
  "endpoints": { ... }
}
```

---

## 🎓 Remember:

- 🌐 **Frontend** → Gateway (8000) → Auth Service (3001)
- 🧪 **Testing** → Gateway (8000) → Auth Service (3001)
- ✅ **Always use port 8000** for testing!
