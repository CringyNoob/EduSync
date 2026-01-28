# 🎯 ADMIN PAGES - QUICK REFERENCE CARD

## ✅ READY TO TEST - All Issues Fixed!

---

## 🚀 IMMEDIATE ACTION

```powershell
# Run this command:
.\test-admin-access.ps1
```

This will:
1. ✅ Check if all services are running
2. ✅ Offer to start services if needed
3. ✅ Open admin dashboard in browser

---

## 🔍 WHAT TO LOOK FOR

### 1. Yellow Debug Panel
**Location:** Top of Admin Dashboard page  
**Should show:**
- ✅ Has Admin Role: True/False
- ✅ Is Admin Active: True/False
- Full user JSON object
- 4 TEST BUTTONS

### 2. Test Navigation
**Click these buttons:**
1. **Test User Management** → `/admin/users`
2. **Test Vendor Management** → `/admin/vendors`
3. **Test News Manager** → `/admin/newsManager`
4. **Test Analytics** → `/admin/analytics`

### 3. Check Browser Console
**Open Console:** Press `F12` → Console tab  
**Look for:**
```
AdminUsers - User object: {id: ..., roles: [...], activeRole: "ADMIN"}
AdminUsers - isAdmin: true
```

---

## 🎯 SUCCESS INDICATORS

✅ Debug panel shows "Is Admin Active: ✅"  
✅ All 4 test buttons navigate successfully  
✅ Pages load data (users, vendors, posts, stats)  
✅ No "Access Denied" errors  
✅ Console shows debug logs from each page  

---

## ❌ IF YOU SEE "ACCESS DENIED"

### Option 1: Switch to Admin Mode
1. Go to `/admin-dashboard`
2. Find "Switch to Admin Mode" button
3. Verify with OTP
4. Refresh page

### Option 2: Check Token
```javascript
// In browser console:
const token = localStorage.getItem('edusync_token');
const user = JSON.parse(atob(token.split('.')[1]));
console.log('Roles:', user.roles);
console.log('Active Role:', user.activeRole);
```

**Expected:**
```javascript
Roles: ['STUDENT', 'ADMIN']
Active Role: 'ADMIN'
```

### Option 3: Check Backend
```powershell
# Test auth service
curl http://localhost:8000/api/auth/admin/users -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📍 ADMIN PAGE URLS

| Page | URL | Purpose |
|------|-----|---------|
| **Dashboard** | `/admin-dashboard` | Main landing + debug panel |
| **Users** | `/admin/users` | User management |
| **Vendors** | `/admin/vendors` | Vendor approval/management |
| **News** | `/admin/newsManager` | Content moderation |
| **Analytics** | `/admin/analytics` | Platform statistics |

---

## 🗂️ NAVIGATION LOCATIONS

### Sidebar (When in Admin Mode)
1. Overview → `/admin-dashboard`
2. Users → `/admin/users`
3. Vendors → `/admin/vendors`
4. News Manager → `/admin/newsManager`
5. Analytics → `/admin/analytics`
6. Approvals → `/admin/approvals` (placeholder)
7. Reports → `/admin/reports` (placeholder)

### Profile Switcher (Top of Sidebar)
- Click profile section
- Select "Admin" profile
- Navigates to `/admin-dashboard`

---

## 🔧 TROUBLESHOOTING COMMANDS

### Check Services
```powershell
# All services
Test-NetConnection -ComputerName localhost -Port 3001  # Auth
Test-NetConnection -ComputerName localhost -Port 3002  # Marketplace
Test-NetConnection -ComputerName localhost -Port 3004  # NewsBox
Test-NetConnection -ComputerName localhost -Port 8000  # Gateway
Test-NetConnection -ComputerName localhost -Port 5173  # Frontend
```

### Start Services
```powershell
.\start-all-services.ps1
```

### Stop Services
```powershell
.\stop-all-services.ps1
```

### Check User Token
```javascript
// Browser console:
localStorage.getItem('edusync_token')
```

### Clear Cache
```
Ctrl + Shift + Delete → Clear cached images
Ctrl + Shift + R → Hard reload
```

---

## 📚 DOCUMENTATION FILES

| File | Purpose |
|------|---------|
| `ADMIN-ACCESS-GUIDE.md` | Comprehensive troubleshooting (182 lines) |
| `ADMIN-ACCESS-FIXES.md` | Technical details of fixes (185 lines) |
| `ADMIN-SYSTEM-STATUS.md` | Implementation status (complete) |
| `test-admin-access.ps1` | Quick start script (this one!) |

---

## 🎨 WHAT EACH PAGE DOES

### 👥 Users Page (`/admin/users`)
- View all users in table format
- Search by name/email/student ID
- Filter by role (Student/Vendor/Admin)
- Block/Unblock users
- View user profiles

### 🏪 Vendors Page (`/admin/vendors`)
- View all vendor applications
- Filter by status (Pending/Active/Rejected)
- Approve/Reject applications
- View vendor products
- Delete vendors

### 📰 News Manager (`/admin/newsManager`)
- Post platform-wide announcements
- Delete inappropriate posts
- Delete spam comments
- Moderate content

### 📊 Analytics (`/admin/analytics`)
- Total users count
- Active vendors count
- Total transactions
- Platform revenue
- Charts and graphs

---

## 🔒 SECURITY NOTES

- All endpoints require JWT authentication
- Admin middleware validates activeRole === 'ADMIN'
- Flexible role detection supports legacy formats
- Token expires after 7 days
- Auto-logout on invalid token

---

## ⚠️ IMPORTANT REMINDERS

1. **Remove debug panel** after testing is complete  
   File: `AdminDashboard.jsx` lines ~387-413

2. **Remove console.log** statements in production  
   Files: All 4 admin pages (AdminUsers, AdminVendors, etc.)

3. **Check database** has test data populated  
   See: `DATABASE-POPULATION-GUIDE.md`

4. **Test on Chrome** for best console debugging experience

5. **Services must start** in correct order:  
   Auth → Marketplace/NewsBox → Gateway → Frontend

---

## 💡 QUICK TIPS

- **Can't access pages?** → Switch to Admin mode first
- **Debug panel not showing?** → Hard reload (Ctrl+Shift+R)
- **API errors?** → Check if all services are running
- **No data showing?** → Populate database with mock data
- **Console errors?** → Check gateway logs for proxy issues

---

## 🎉 YOU'RE READY!

Run `.\test-admin-access.ps1` and start testing!

For detailed help, see `ADMIN-ACCESS-GUIDE.md`

---

**Created:** January 2025  
**Status:** ✅ All fixes applied, ready for testing  
**Services:** Auth, Marketplace, NewsBox, Gateway, Frontend  
**Pages:** 4 admin pages + 1 dashboard with debug panel
