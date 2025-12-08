# EduSync - Complete Authentication System

A production-ready, enterprise-grade authentication system for EduSync university management platform.

## 🏗️ Project Structure

```
Edusync/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── features/         # Feature-based modules (auth)
│   │   ├── lib/              # Utilities and configurations
│   │   ├── pages/            # Page components
│   │   └── App.tsx           # Main app component
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                    # Backend Node.js application
│   ├── config/               # Database configuration
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Auth, rate limiting, etc.
│   ├── routes/               # API routes
│   ├── utils/                # JWT, email utilities
│   ├── server.js             # Express server
│   └── package.json
│
└── package.json              # Root package.json with scripts
```

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
# Install all dependencies (client + server)
npm run install:all

# Or install separately
npm run install:client
npm run install:server
```

### 2. Environment Setup

Create `.env` files:

**client/.env**
```
VITE_API_URL=http://localhost:5000
```

**server/.env**
```
# Database
DATABASE_URL=your_postgresql_connection_string

# JWT Secrets
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# Email Configuration
EMAIL_USER=dishchord3@gmail.com
EMAIL_PASSWORD=brvkreyqzmpnbxzd
EMAIL_FROM=dishchord3@gmail.com

# Server
PORT=5000
NODE_ENV=development
```

### 3. Initialize Database

```powershell
npm run init-db
```

### 4. Start Development Servers

```powershell
# Start both client and server concurrently
npm run dev

# Or start separately:
npm run dev:client    # Frontend on http://localhost:3000
npm run dev:server    # Backend on http://localhost:5000
```

## 📦 Available Scripts

### Root Level

- `npm run install:all` - Install all dependencies
- `npm run dev` - Run both client and server concurrently
- `npm run dev:client` - Run client only
- `npm run dev:server` - Run server only
- `npm run build:client` - Build client for production
- `npm run start:server` - Start production server
- `npm run init-db` - Initialize database

### Client (cd client/)

- `npm run dev` - Start Vite dev server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Server (cd server/)

- `npm run dev` - Start server with auto-reload
- `npm start` - Start production server
- `npm run init-db` - Initialize database schema

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Hook Form** + **Zod** - Form validation
- **Axios** - HTTP client

### Backend
- **Node.js** + **Express**
- **PostgreSQL** - Database (Aiven Cloud)
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting

## 🔐 Features

✅ Multi-step signup wizard (3 steps)
✅ Email verification with OTP
✅ Login with remember me
✅ Forgot password flow
✅ Reset password
✅ 2FA support for admin/moderator
✅ Role-based access control
✅ Session management
✅ Device tracking
✅ Logout from all devices
✅ Purple/Cyan gradient theme
✅ Dark mode support
✅ Fully responsive

## 🎨 Design System

- **Primary Purple**: #5B3FD9
- **Light Purple**: #A78BFA
- **Cyan Accent**: #00D4FF
- **Dark Purple**: #3B2699

## 📱 API Endpoints

### Public Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Protected Routes
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/switch-role` - Switch active role
- `GET /api/auth/sessions` - Get all active sessions
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/logout-all` - Logout all sessions
- `POST /api/auth/verify-2fa` - Verify 2FA code

## 🔒 Security Features

- bcrypt password hashing (12 rounds)
- JWT with httpOnly cookies
- Rate limiting (5 attempts per 15 min)
- XSS prevention
- CSRF protection
- University email validation (@uiu.ac.bd)
- Session management with device tracking
- Auto token refresh

## 📚 Documentation

- **README.md** - This file
- **QUICKSTART.md** - Step-by-step setup guide
- **ARCHITECTURE.md** - System architecture
- **SUMMARY.md** - Feature summary

## 🎯 Testing

1. Start both servers: `npm run dev`
2. Open http://localhost:3000
3. Test signup flow with:
   - Email: `test@uiu.ac.bd`
   - Password: `Test@1234`
   - Student ID: `0112230609`

## 🚨 Troubleshooting

### PowerShell Execution Policy Error
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Port Already in Use
- Frontend: Change port in `client/vite.config.ts`
- Backend: Change PORT in `server/.env`

### Database Connection Error
- Verify DATABASE_URL in `server/.env`
- Run `npm run init-db` to initialize schema

## 📄 License

Private - For educational purposes only

---

**EduSync - Connecting Campus, Empowering Students**

Made with ❤️ by Ahnaf Atique
