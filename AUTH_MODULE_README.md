# EduSync - User Authentication & Profile Management Module

## Overview
This branch (`Ahnaf/UserAuth`) contains the complete authentication system and user profile management functionality for EduSync.

## Features Implemented

### 🔐 Authentication System
- **Email Verification with OTP**
  - University email validation (@bscse.uiu.ac.bd, etc.)
  - 6-digit OTP sent via email (Nodemailer)
  - Inline OTP verification in signup flow
  - Auto-advance between OTP input fields
  - Resend OTP functionality with rate limiting

- **Multi-Step Registration**
  - Step 1: Email verification with password reveal after OTP
  - Step 2: Personal information (name, student ID, phone)
  - Step 3: Academic information (department, batch, trimester)
  - Form state persistence across page refreshes
  - Validation using Zod schema

- **Login System**
  - Email/password authentication
  - JWT access tokens + HTTP-only refresh tokens
  - Session management in PostgreSQL
  - Remember me functionality
  - 2FA support (foundation implemented)

- **Password Management**
  - Forgot password with email token
  - Secure password reset
  - Password strength requirements (min 8 characters)

### 👤 User Profile Management
- **Profile Display**
  - Student ID, email, department, batch, current trimester
  - Profile photo with upload & compression
  - Bio section with character limit (500 chars)
  - Visual gradient cards for each info section

- **Editable Fields**
  - Phone number (inline edit)
  - Bio (textarea with save/cancel)
  - Profile photo (camera icon, auto-compress to 800x800, 70% quality)

- **Privacy Settings**
  - Toggle email visibility (visible to others or hidden)
  - Toggle phone visibility (visible to others or hidden)
  - Visual indicators (👁️ Visible / 🔒 Hidden)

### 🎨 UI/UX Features
- **Dark Theme**
  - Darker purple/cyan gradient design
  - Glassmorphism effects with backdrop blur
  - Smooth animations with Framer Motion
  - Responsive design (mobile-first)

- **Accessibility**
  - Keyboard navigation support
  - ARIA labels
  - Focus management
  - Error state indicators

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** (dev server & build tool)
- **React Router DOM** (navigation)
- **Tailwind CSS** (styling)
- **Framer Motion** (animations)
- **React Hook Form** + **Zod** (form validation)
- **Axios** (HTTP client)
- **React Hot Toast** (notifications)
- **Zustand** (state management - auth store)

### Backend
- **Node.js** + **Express**
- **PostgreSQL** (database)
- **bcrypt** (password hashing)
- **JWT** (access & refresh tokens)
- **Nodemailer** (email service)
- **Helmet** (security headers)
- **CORS** (cross-origin configuration)
- **Rate limiting** (login attempt protection)

## Database Schema

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  student_id VARCHAR(50) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  department VARCHAR(100),
  batch VARCHAR(20),
  semester VARCHAR(20),  -- Current trimester (Spring/Summer/Fall)
  profile_photo TEXT,     -- Base64 or URL
  bio TEXT,
  email_visible BOOLEAN DEFAULT TRUE,
  phone_visible BOOLEAN DEFAULT TRUE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  role user_role DEFAULT 'student',
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Sessions Table
```sql
sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  refresh_token VARCHAR(500) UNIQUE,
  device_info JSONB,
  ip_address VARCHAR(45),
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  last_active TIMESTAMP
)
```

### Email Verifications Table
```sql
email_verifications (
  id UUID PRIMARY KEY,
  email VARCHAR(255),
  otp VARCHAR(6),
  expires_at TIMESTAMP,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/refresh-token` - Refresh access token

### Profile
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile (phone, bio, photo, privacy settings)

## Environment Variables

### Server (.env)
```env
DATABASE_URL=postgres://user:password@host:port/database
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
EMAIL_FROM=EduSync <your-email@gmail.com>
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## File Structure
```
├── client/
│   ├── src/
│   │   ├── features/auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SignupForm.tsx
│   │   │   │   ├── SignupStep1.tsx (Email + OTP)
│   │   │   │   ├── SignupStep2.tsx (Personal info)
│   │   │   │   ├── SignupStep3.tsx (Academic info)
│   │   │   │   ├── EmailVerification.tsx
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   └── ResetPassword.tsx
│   │   │   ├── context/
│   │   │   │   └── AuthContext.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   ├── pages/
│   │   │   ├── AuthPage.tsx
│   │   │   └── Profile.tsx (User profile management)
│   │   ├── components/
│   │   │   ├── ui/ (Button, Input, Logo, etc.)
│   │   │   └── layouts/
│   │   │       └── ProtectedRoute.tsx
│   │   └── lib/
│   │       ├── tokenManager.ts
│   │       └── sessionManager.ts
│   └── ...
├── server/
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── routes/
│   │   └── auth.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── errorHandler.js
│   ├── config/
│   │   ├── database.js
│   │   └── initDatabase.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── email.js
│   ├── migrations/
│   │   └── *.sql
│   └── server.js
└── README.md
```

## Security Features
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT access tokens (15 min expiry)
- ✅ HTTP-only refresh tokens (7 days)
- ✅ CSRF protection via SameSite cookies
- ✅ Rate limiting on login attempts
- ✅ Email domain validation
- ✅ Student ID format validation
- ✅ Helmet security headers
- ✅ Input sanitization via Zod
- ✅ SQL injection prevention (parameterized queries)

## Integration Notes for Team

### Adding Profile to Main Dashboard
1. Import the Profile component:
   ```tsx
   import Profile from '@/pages/Profile';
   ```

2. Add it to your settings/account menu:
   ```tsx
   <Route path="/settings/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
   ```

3. Access user data from auth context:
   ```tsx
   import { useAuth } from '@/features/auth/hooks/useAuth';
   
   const { user, logout, updateProfile } = useAuth();
   ```

### Available User Fields
```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId: string;
  department: string;
  batch: string;
  semester: string;  // "Spring" | "Summer" | "Fall"
  phone?: string;
  profilePhoto?: string;
  bio?: string;
  emailVisible: boolean;
  phoneVisible: boolean;
  roles: string[];
  activeRole: string;
  isEmailVerified: boolean;
}
```

## Running the Application

### Development
```bash
# Install dependencies
npm install

# Run both client and server
npm run dev

# Or separately:
npm run dev:server  # Backend on :5000
npm run dev:client  # Frontend on :3000
```

### Database Setup
```bash
# Run migrations
cd server
node scripts/run-migration.js
```

## Known Limitations & Future Enhancements
- [ ] File upload endpoint for profile photos (currently base64)
- [ ] Social auth (Google, Facebook)
- [ ] Email template improvements
- [ ] Profile photo cropping tool
- [ ] Account deletion
- [ ] Export user data (GDPR)

## Testing Credentials
Use any valid university email format for testing:
- Email: `yourname@bscse.uiu.ac.bd` (or other dept codes: 011-016)
- Student ID: Format `011XXXXXXX` (first 3 digits = dept code)

## Contact
**Developer:** Ahnaf  
**Branch:** Ahnaf/UserAuth  
**Module:** User Authentication & Profile Management

---

**Note to Team:** This module is production-ready for integration. The Profile page is designed to be embedded in your settings/account section. All auth logic is handled via the `AuthContext`, so you can access user state anywhere in the app using the `useAuth()` hook.
