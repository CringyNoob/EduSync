# Admin Pages Access Guide

## Problem: Cannot Access Admin Pages

### Quick Troubleshooting Steps:

1. **Check if you have ADMIN role:**
   - Open browser console (F12)
   - Type: `localStorage.getItem('edusync_user')`
   - Check if `roles` array contains 'ADMIN'
   - Check if `activeRole` is 'ADMIN'

2. **Make sure you're logged in as admin:**
   - The user must have 'ADMIN' in their roles array
   - They must switch to ADMIN mode from dashboard
   - Check AdminDashboard for "Switch to Admin" option

3. **Check backend API connectivity:**
   - Open Network tab in browser DevTools
   - Try accessing any admin page
   - Look for failed API requests
   - Common issues:
     - 401 Unauthorized: Token issue or not logged in
     - 403 Forbidden: Not in admin mode
     - 500 Server Error: Backend service not running

## Admin Pages URLs:

- **/admin/users** - User Management
- **/admin/vendors** - Vendor Management  
- **/admin/newsManager** - News & Announcements
- **/admin/analytics** - Platform Analytics

## Navigation:

### From Admin Dashboard:
1. Go to `/admin-dashboard`
2. Click on any Quick Action button:
   - Manage Users
   - Manage Vendors
   - News Manager
   - View Analytics

### Direct URL Access:
Just type the URL in browser: `http://localhost:5173/admin/users`

## How to Switch to Admin Mode:

1. **Login** with an admin account
2. Go to **Admin Dashboard** (`/admin-dashboard`)
3. If not in admin mode, you'll see an **OTP modal**
4. Click "Send OTP" - check your email
5. Enter the 6-digit OTP code
6. Submit to switch to ADMIN role

## Backend Requirements:

All these services must be running:
- **Auth Service**: Port 3001
- **Marketplace Service**: Port 3002
- **NewsBox Service**: Port 3004
- **Gateway**: Port 8000
- **Frontend**: Port 5173

Start all services:
```powershell
.\start-all-services.ps1
```

## Testing with Mock User:

If you want to quickly test admin functionality:

1. **Modify AuthContext.jsx** temporarily (line 60):
```javascript
return {
    id: '00000001-0000-0000-0000-000000000001',
    name: 'Admin Test',
    email: 'admin@uiu.ac.bd',
    role: 'ADMIN',
    roles: ['ADMIN', 'STUDENT'],
    activeRole: 'ADMIN'
};
```

2. Clear localStorage and refresh:
```javascript
localStorage.clear();
location.reload();
```

## Common Issues:

### Issue 1: "Access Denied" Screen
**Cause**: Not in ADMIN mode
**Solution**: Switch to admin role via OTP verification

### Issue 2: Pages Load But No Data
**Cause**: Backend services not running or API failing
**Solution**: 
- Check all services are running
- Check browser console for API errors
- Verify token in localStorage: `localStorage.getItem('edusync_token')`

### Issue 3: OTP Modal Keeps Showing
**Cause**: User doesn't have ADMIN role in database
**Solution**: 
- Check database: `SELECT roles FROM users WHERE email = 'your@email.com'`
- Update roles: `UPDATE users SET roles = ARRAY['ADMIN', 'STUDENT'] WHERE email = 'your@email.com'`

### Issue 4: Stuck on Admin Dashboard
**Cause**: Navigation not working
**Solution**: 
- Use direct URLs: `/admin/users`, `/admin/vendors`, etc.
- Check browser console for router errors
- Try hard refresh: Ctrl+Shift+R

## Debug Commands (Browser Console):

```javascript
// Check current user
console.log(JSON.parse(localStorage.getItem('edusync_user')));

// Check token
console.log(localStorage.getItem('edusync_token'));

// Manually set admin role (for testing only)
const user = JSON.parse(localStorage.getItem('edusync_user'));
user.roles = ['ADMIN', 'STUDENT'];
user.activeRole = 'ADMIN';
user.role = 'ADMIN';
localStorage.setItem('edusync_user', JSON.stringify(user));
location.reload();

// Test API endpoint
fetch('/api/auth/admin/users', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('edusync_token')}`
  }
}).then(r => r.json()).then(console.log);
```

## Expected Behavior:

When everything is working correctly:
1. Navigate to `/admin/users`
2. See "User Management" header with back button
3. See stats cards (Total, Active, Blocked, New Today)
4. See search bar and filters
5. See table with user data
6. Can click on usernames to view profiles
7. Can block/unblock users

If you see "Access Denied" with shield icon:
- You're not in ADMIN mode
- Need to switch role from Admin Dashboard

If you see loading spinner forever:
- Backend API not responding
- Check services are running
- Check browser console for errors
