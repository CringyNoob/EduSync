# 🏗️ EduSync System Architecture

## 🎯 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                              │
│  ┌───────────────────────────────────────────────────────┐      │
│  │                    React + TypeScript                  │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │      │
│  │  │   Pages     │  │ Components  │  │  Features   │   │      │
│  │  │ ─────────── │  │ ─────────── │  │ ─────────── │   │      │
│  │  │ • AuthPage  │  │ • Button    │  │ • Auth      │   │      │
│  │  │ • Dashboard │  │ • Input     │  │   - Login   │   │      │
│  │  │             │  │ • Card      │  │   - Signup  │   │      │
│  │  │             │  │ • Logo      │  │   - Verify  │   │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │      │
│  │                                                        │      │
│  │  ┌──────────────────────────────────────────────┐    │      │
│  │  │        State Management (Zustand)             │    │      │
│  │  │  • Auth Store  • User State  • Active Role   │    │      │
│  │  └──────────────────────────────────────────────┘    │      │
│  │                                                        │      │
│  │  ┌──────────────────────────────────────────────┐    │      │
│  │  │           HTTP Client (Axios)                 │    │      │
│  │  │  • Token Interceptors  • Auto Refresh        │    │      │
│  │  └──────────────────────────────────────────────┘    │      │
│  └───────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER SIDE                              │
│  ┌───────────────────────────────────────────────────────┐      │
│  │              Node.js + Express.js                      │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │      │
│  │  │   Routes    │  │ Controllers │  │ Middleware  │   │      │
│  │  │ ─────────── │  │ ─────────── │  │ ─────────── │   │      │
│  │  │ • /register │  │ • register  │  │ • auth      │   │      │
│  │  │ • /login    │  │ • login     │  │ • rateLimit │   │      │
│  │  │ • /verify   │  │ • verify    │  │ • error     │   │      │
│  │  │ • /reset    │  │ • reset     │  │             │   │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │      │
│  │                                                        │      │
│  │  ┌──────────────────────────────────────────────┐    │      │
│  │  │            Utilities                          │    │      │
│  │  │  • JWT Generation  • Email Service           │    │      │
│  │  └──────────────────────────────────────────────┘    │      │
│  └───────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SQL Queries
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│  ┌───────────────────────────────────────────────────────┐      │
│  │              PostgreSQL (Aiven Cloud)                  │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │      │
│  │  │   users     │  │  sessions   │  │email_verify │   │      │
│  │  │ ─────────── │  │ ─────────── │  │ ─────────── │   │      │
│  │  │ • id        │  │ • id        │  │ • id        │   │      │
│  │  │ • email     │  │ • user_id   │  │ • email     │   │      │
│  │  │ • password  │  │ • token     │  │ • otp       │   │      │
│  │  │ • roles     │  │ • device    │  │ • expires   │   │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │      │
│  └───────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SMTP
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EMAIL SERVICE                               │
│                  Gmail (Nodemailer)                              │
│               dishchord3@gmail.com                               │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Authentication Flow Diagram

```
┌─────────┐                                                ┌─────────┐
│  User   │                                                │  Email  │
└────┬────┘                                                └────┬────┘
     │                                                           │
     │ 1. Signup Form                                           │
     ├──────────────────────────────────────────────────┐      │
     │                                                    │      │
     │                                          ┌────────▼──────▼──┐
     │                                          │   Server         │
     │                                          │   • Validate     │
     │                                          │   • Hash Pass    │
     │                                          │   • Generate OTP │
     │                                          │   • Store User   │
     │                                          └────────┬─────────┘
     │                                                    │
     │                                                    │ 2. Send OTP
     │                                                    ├──────────►
     │ 3. Email Received ◄───────────────────────────────┘
     │    (Check Inbox)
     │
     │ 4. Enter OTP
     ├──────────────────────────────────────────────────┐
     │                                                    │
     │                                          ┌────────▼─────────┐
     │                                          │   Server         │
     │                                          │   • Verify OTP   │
     │                                          │   • Mark Verified│
     │                                          │   • Gen Tokens   │
     │ 5. Tokens + User ◄───────────────────────┤   • Create Sess  │
     │                                          └──────────────────┘
     │
     │ 6. Store Tokens
     │    (LocalStorage + Cookie)
     │
     │ 7. Access Dashboard
     ├──────────────────────────────────────────────────┐
     │                                                    │
     │                                          ┌────────▼─────────┐
     │                                          │   Server         │
     │                                          │   • Verify Token │
     │ 8. Protected Data ◄──────────────────────┤   • Return Data  │
     │                                          └──────────────────┘
     │
     │ 9. View Dashboard
     ▼
```

## 🔐 Token Flow

```
┌────────────────────────────────────────────────────────────────┐
│                      Token Lifecycle                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Login                                                          │
│    │                                                            │
│    ├──► Generate Access Token (15 min expiry)                  │
│    │      • Contains: userId, role                             │
│    │      • Stored: localStorage                               │
│    │                                                            │
│    └──► Generate Refresh Token (7 day expiry)                  │
│           • Contains: userId                                   │
│           • Stored: httpOnly cookie                            │
│           • Saved in DB: sessions table                        │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  API Request                                                    │
│    │                                                            │
│    ├──► Check Access Token Expiry                              │
│    │      • < 5 min left? → Refresh                            │
│    │      • Expired? → Use Refresh Token                       │
│    │      • Valid? → Continue                                  │
│    │                                                            │
│    └──► Attach Token to Request Header                         │
│           Authorization: Bearer {accessToken}                  │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Token Refresh                                                  │
│    │                                                            │
│    ├──► Client: Detect expiry                                  │
│    │                                                            │
│    ├──► Server: Verify refresh token                           │
│    │      • Check cookie                                       │
│    │      • Verify signature                                   │
│    │      • Check DB session                                   │
│    │      • Validate expiry                                    │
│    │                                                            │
│    └──► Server: Issue new access token                         │
│           • Update session last_active                         │
│           • Return new token                                   │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Logout                                                         │
│    │                                                            │
│    ├──► Clear localStorage                                     │
│    │                                                            │
│    ├──► Clear httpOnly cookie                                  │
│    │                                                            │
│    └──► Mark session inactive in DB                            │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## 📊 Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS TABLE                              │
├─────────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                                    │
│ email (VARCHAR, UNIQUE)           ─┐                            │
│ password_hash (VARCHAR)            │ Authentication             │
│ is_email_verified (BOOLEAN)        │                            │
│ two_factor_enabled (BOOLEAN)      ─┘                            │
│ first_name (VARCHAR)              ─┐                            │
│ last_name (VARCHAR)                │                            │
│ student_id (VARCHAR, UNIQUE)       │ Personal Info              │
│ phone (VARCHAR)                    │                            │
│ profile_photo (TEXT)              ─┘                            │
│ department (VARCHAR)              ─┐                            │
│ batch (VARCHAR)                    │ Academic Info              │
│ year (INTEGER)                     │                            │
│ program (VARCHAR)                 ─┘                            │
│ roles (TEXT[])                    ─┐                            │
│ active_role (VARCHAR)             ─┘ Authorization              │
│ created_at (TIMESTAMP)            ─┐                            │
│ updated_at (TIMESTAMP)             │ Metadata                   │
│ last_login_at (TIMESTAMP)         ─┘                            │
└─────────────────────────────────────────────────────────────────┘
                        │
                        │ 1:N
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SESSIONS TABLE                             │
├─────────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                                    │
│ user_id (UUID, FK → users.id)                                   │
│ refresh_token (TEXT)                                            │
│ device_info (JSONB)                                             │
│   • device: "Desktop/Mobile/Tablet"                             │
│   • browser: "Chrome/Firefox/Safari"                            │
│   • os: "Windows/macOS/Linux"                                   │
│ ip_address (VARCHAR)                                            │
│ is_active (BOOLEAN)                                             │
│ created_at (TIMESTAMP)                                          │
│ last_active (TIMESTAMP)                                         │
│ expires_at (TIMESTAMP)                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  EMAIL_VERIFICATIONS TABLE                       │
├─────────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                                    │
│ email (VARCHAR)                                                 │
│ otp (VARCHAR(6))                                                │
│ expires_at (TIMESTAMP)        // 10 minutes                     │
│ is_used (BOOLEAN)                                               │
│ created_at (TIMESTAMP)                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                PASSWORD_RESET_TOKENS TABLE                       │
├─────────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                                    │
│ user_id (UUID, FK → users.id)                                   │
│ token (VARCHAR, UNIQUE)                                         │
│ expires_at (TIMESTAMP)        // 1 hour                         │
│ is_used (BOOLEAN)                                               │
│ created_at (TIMESTAMP)                                          │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Component Hierarchy

```
App
├── BrowserRouter
│   ├── AuthProvider
│   │   ├── Routes
│   │   │   ├── Public Routes
│   │   │   │   ├── /auth/login → AuthPage
│   │   │   │   │   └── AuthLayout
│   │   │   │   │       ├── Brand Showcase (Left)
│   │   │   │   │       └── Card (Right)
│   │   │   │   │           ├── AuthToggle
│   │   │   │   │           ├── LoginForm (if login)
│   │   │   │   │           └── SignupForm (if signup)
│   │   │   │   │               ├── Step1 (Email & Password)
│   │   │   │   │               ├── Step2 (Personal Info)
│   │   │   │   │               └── Step3 (Academic Info)
│   │   │   │   ├── /auth/verify-email → EmailVerification
│   │   │   │   ├── /auth/forgot-password → ForgotPassword
│   │   │   │   └── /auth/reset-password → ResetPassword
│   │   │   │
│   │   │   └── Protected Routes
│   │   │       └── /dashboard → ProtectedRoute
│   │   │           └── Dashboard
│   │   │               ├── Logo
│   │   │               ├── Logout Button
│   │   │               └── User Info Cards
│   │   │
│   │   └── Toaster (Notifications)
│   │
│   └── RoleSelector (Modal)
│       └── Role Cards
│
└── Global Styles
```

## 🎨 Styling Architecture

```
TailwindCSS Configuration
├── Colors
│   ├── purple-primary: #5B3FD9
│   ├── purple-light: #A78BFA
│   ├── purple-dark: #3B2699
│   └── cyan-accent: #00D4FF
│
├── Animations
│   ├── float (6s infinite)
│   └── pulse-slow (3s infinite)
│
└── Extensions
    ├── Font Family (Inter)
    └── Custom Gradients
```

## 🔌 API Request Flow

```
Client Request
    │
    ├─► Axios Interceptor (Request)
    │   ├─► Add Authorization Header
    │   └─► Add CSRF Token
    │
    ├─► Express Middleware Chain
    │   ├─► Helmet (Security Headers)
    │   ├─► CORS (Origin Check)
    │   ├─► Body Parser
    │   ├─► Cookie Parser
    │   ├─► Rate Limiter
    │   ├─► Auth Middleware (if protected)
    │   └─► Route Handler
    │
    ├─► Controller Logic
    │   ├─► Validate Input
    │   ├─► Business Logic
    │   └─► Database Query
    │
    ├─► Database (PostgreSQL)
    │   ├─► Execute Query
    │   └─► Return Result
    │
    ├─► Response Formation
    │   ├─► Success/Error
    │   └─► JSON Payload
    │
    └─► Axios Interceptor (Response)
        ├─► Check Status Code
        ├─► Handle 401 (Auto Refresh)
        └─► Return Data
```

---

## 📝 Technology Decisions

### Why React?
- Component-based architecture
- Large ecosystem
- Great developer experience
- TypeScript support

### Why TypeScript?
- Type safety
- Better IDE support
- Fewer runtime errors
- Self-documenting code

### Why Zustand?
- Lightweight (1kb)
- Simple API
- No boilerplate
- React hooks based

### Why PostgreSQL?
- ACID compliant
- Excellent for relational data
- JSON support (device_info)
- Mature and stable

### Why JWT?
- Stateless authentication
- Scalable
- Industry standard
- Easy to implement

### Why TailwindCSS?
- Utility-first approach
- No CSS file bloat
- Easy theming
- Responsive by default

### Why Framer Motion?
- Declarative animations
- Spring physics
- Layout animations
- Great DX

---

This architecture ensures:
✅ Scalability
✅ Maintainability
✅ Security
✅ Performance
✅ Developer Experience
