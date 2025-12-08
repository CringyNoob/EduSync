# Quick Integration Guide for Team Members

## How to Use the Auth Module in Your Code

### 1. Access User Data Anywhere
```tsx
import { useAuth } from '@/features/auth/hooks/useAuth';

function YourComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <p>Student ID: {user?.studentId}</p>
      <p>Department: {user?.department}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 2. Add Profile to Your Dashboard/Settings

**Option A: As a Settings Page**
```tsx
// In your router
import Profile from '@/pages/Profile';

<Route path="/settings/profile" element={
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
} />
```

**Option B: As a Modal/Sidebar**
```tsx
import Profile from '@/pages/Profile';

function YourDashboard() {
  const [showProfile, setShowProfile] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowProfile(true)}>My Profile</button>
      {showProfile && (
        <Modal onClose={() => setShowProfile(false)}>
          <Profile />
        </Modal>
      )}
    </>
  );
}
```

### 3. Protect Your Routes
```tsx
import ProtectedRoute from '@/components/layouts/ProtectedRoute';

<Route path="/your-page" element={
  <ProtectedRoute>
    <YourComponent />
  </ProtectedRoute>
} />
```

### 4. Check If User Is Logged In
```tsx
const { isAuthenticated, user } = useAuth();

if (!isAuthenticated) {
  return <div>Please log in</div>;
}

// User is logged in, show content
return <div>Hello {user.firstName}!</div>;
```

### 5. Update User Profile Programmatically
```tsx
const { updateProfile, isLoading } = useAuth();

const handleUpdate = async () => {
  await updateProfile({
    bio: "New bio text",
    phone: "+1234567890",
    semester: "Fall"
  });
};
```

### 6. Show User Avatar
```tsx
const { user } = useAuth();

<img 
  src={user?.profilePhoto || '/default-avatar.png'} 
  alt={`${user?.firstName} ${user?.lastName}`}
  className="w-10 h-10 rounded-full"
/>
```

## Available User Fields

```typescript
user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId: string;
  department: string;
  batch: string;
  semester: "Spring" | "Summer" | "Fall";
  phone?: string;
  profilePhoto?: string;  // Base64 or URL
  bio?: string;
  emailVisible: boolean;
  phoneVisible: boolean;
  roles: string[];
  activeRole: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}
```

## Available Auth Functions

```typescript
const {
  // State
  user,                    // User object or null
  token,                   // JWT access token
  isAuthenticated,         // Boolean
  isLoading,              // Boolean
  activeRole,             // Current role
  
  // Actions
  login,                  // (email, password) => Promise
  signup,                 // (userData) => Promise
  logout,                 // () => void
  verifyEmail,            // (email, otp) => Promise
  updateProfile,          // (data) => Promise
  switchRole,             // (role) => Promise
  refreshToken,           // () => Promise
} = useAuth();
```

## Common Patterns

### Conditional Rendering Based on Auth
```tsx
const { isAuthenticated, user } = useAuth();

{isAuthenticated ? (
  <UserMenu user={user} />
) : (
  <Link to="/auth/login">Login</Link>
)}
```

### Loading States
```tsx
const { isLoading } = useAuth();

if (isLoading) {
  return <Spinner />;
}
```

### Role-Based Access
```tsx
const { user } = useAuth();

{user?.activeRole === 'admin' && (
  <AdminPanel />
)}

{user?.roles.includes('vendor') && (
  <VendorDashboard />
)}
```

### Logout with Confirmation
```tsx
const { logout } = useAuth();

const handleLogout = () => {
  if (confirm('Are you sure you want to logout?')) {
    logout();
  }
};
```

## Don't Modify These Files

Leave these auth-related files as-is:
- `client/src/features/auth/**/*` - Auth components and logic
- `client/src/pages/Profile.tsx` - Profile management
- `server/controllers/auth.controller.js` - Auth endpoints
- `server/routes/auth.routes.js` - Auth routes
- `server/middleware/auth.middleware.js` - Auth middleware

## You Can Customize

Feel free to modify:
- Colors/styling in Profile.tsx (Tailwind classes)
- Add more fields to the profile form
- Extend the user model (add to DB + backend)
- Add new protected routes
- Create role-specific dashboards

## Need Help?

Contact Ahnaf for:
- Auth-related bugs
- Profile integration issues
- Adding new auth features
- Database schema changes
- Security concerns

---

Happy coding! 🚀
