# EduSync

EduSync is an enterprise-grade, microservices-driven digital ecosystem designed to streamline university campus life. It centralizes student marketplace transactions, peer-to-peer rentals, community discussions, campus issue reporting, real-time messaging, official notice scraping, and administrative governance into a single cohesive platform.

---

## Features

### 🔐 Authentication & Role-Based Access Control (RBAC)
- **Stateless OTP Verification**: Cryptographic HMAC-SHA256 email OTP verification for `@*.uiu.ac.bd` domain addresses without persistent database storage for OTP tokens.
- **Multi-Role System**: Granular support for `STUDENT`, `VENDOR`, and `ADMIN` roles with dynamic role switching and OTP verification for administrative elevation.
- **Security**: Password hashing via `bcrypt`, JSON Web Token (JWT) session management, and role-protected API endpoints.

### 🛒 Marketplace & Vendor Ecosystem
- **Hybrid Commerce Architecture**: Shop-first discovery for student startups and campus food vendors alongside product-first discovery for student pre-owned listings.
- **Pre-Owned Classifieds**: Item listing with categories (Textbooks, Electronics, etc.), multi-image support, and status tracking (`AVAILABLE`, `SOLD`).
- **Vendor Onboarding & Payment**: Vendor shop registration workflow (`PENDING_PAYMENT` → `ACTIVE`) integrated with SSLCommerz payment sandbox.
- **Order & Analytics Tracking**: Comprehensive merchant performance metrics and transaction logs.

### 🏠 RentHub (Peer-to-Peer Campus Rentals)
- **Student Rentals**: List personal items (laptops, calculators, lab gear) for daily rent.
- **Conflict-Aware Booking Engine**: Date validation preventing overlapping reservation intervals.
- **Rental Lifecycle Management**: Automated status transitions (`AVAILABLE` → `RENTED` → `COMPLETED`) with dynamic progress tracking and expense summaries.

### 📰 NewsBox (Community Forum & Feed)
- **Categorized Feed**: Tagged community discussions across `QUERY`, `ACCOMMODATION`, `JOB_POSTING`, `LOST_AND_FOUND`, and `GENERAL`.
- **Engagement Engine**: Threaded comments and an upvote/downvote system with toggle logic.
- **Content Moderation**: Author-level and admin-level deletion and moderation controls.

### 📋 Notices Scraper
- **Automated Web Scraping**: Real-time extraction of official university announcements and academic circulars from the university portal using `cheerio` and `axios`.

### 💬 Real-Time Chat Service
- **Context-Aware Conversations**: Real-time chat threads bound to specific entities (`PRODUCT`, `ORDER`, `RENTAL`, `PREOWNED`, `GENERAL`).
- **WebSocket Streaming**: Bi-directional event communication via `Socket.io` supporting typing indicators, delivery status, and online presence tracking.
- **Deal Archival**: Automatic transition of conversation channels to read-only mode upon transaction completion.

### 🚨 Campus Issue Reporting & Tracking
- **Civic Issue Logging**: Submit campus maintenance, IT, safety, and hygiene issues with priority tagging (`Low`, `Normal`, `High`, `Urgent`).
- **Community Upvoting & Admin Resolution**: Student voting on approved issues and administrative resolution workflows (`PENDING` → `APPROVED` → `RESOLVED`).

### 🛡️ Centralized Admin Management Dashboard
- **Platform Analytics**: High-level telemetry covering active users, vendor volumes, transaction aggregates, and resolved issues.
- **Moderation Tools**: User management (block/unblock), vendor verification/suspension, and sitewide announcement broadcasting.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router v7, Lucide React, Three.js / React Three Fiber, React Quill, Axios, Socket.io Client |
| **API Gateway** | Node.js, Express, `http-proxy-middleware`, CORS |
| **Microservices Backend** | Node.js, Express, Socket.io, Cheerio, Nodemailer, `sslcommerz-lts`, `pg` (node-postgres), `jsonwebtoken`, `bcrypt` |
| **Databases** | PostgreSQL (Aiven Cloud Managed Clusters for isolated service databases: `auth_db`, `market_db`, `rent_db`, `newsbox_db`, `chat_db`, `issue_db`) |
| **DevOps & Containerization** | Docker, Docker Compose, PowerShell Automation Tooling |

---

## Architecture & Service Topology

```
                         +-----------------------------------+
                         |      React Client (Port 5173)     |
                         +-----------------+-----------------+
                                           |
                                           v
                         +-----------------+-----------------+
                         |    API Gateway (Port 8000)        |
                         +-----------------+-----------------+
                                           |
     +------------+------------+-----------+-----------+------------+------------+
     |            |            |           |           |            |            |
     v            v            v           v           v            v            v
+---------+  +---------+  +---------+ +---------+ +---------+  +---------+  +---------+
|  Auth   |  | Market  |  | RentHub | | NewsBox | | Notices |  |  Chat   |  | Issues  |
| Service |  | Service |  | Service | | Service | | Service |  | Service |  | Service |
|  :3001  |  |  :3002  |  |  :3003  | |  :3004  | |  :3005  |  |  :3006  |  |  :3007  |
+----+----+  +----+----+  +----+----+ +----+----+ +----+----+  +----+----+  +----+----+
     |            |            |           |           |            |            |
     v            v            v           v           |            v            v
 [auth_db]   [market_db]   [rent_db]  [newsbox_db]     |        [chat_db]   [issue_db]
                                                       v
                                            (Scrapes UIU Portal)
```

---

## Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: Cloud instance (e.g., Aiven) or local PostgreSQL instance (`v14+`)
- **Git**
- **PowerShell** (Windows) or **Bash** (Linux/macOS)
- **Gmail Account with App Password** (for OTP email dispatch)

---

## Getting Started / Installation

### 1. Clone the Repository
```bash
git clone https://github.com/CringyNoob/EduSync.git
cd EduSync
```

### 2. Environment Configuration
Create a master `.env` file or configure individual service `.env` files based on `.env.example`:

```bash
cp .env.example .env
```

Ensure each service directory contains a properly configured `.env` file with database credentials, matching `JWT_SECRET`, and email provider settings:

```env
# Shared Database Configuration (Aiven / PostgreSQL)
DB_HOST=your-database-host.aivencloud.com
DB_PORT=16231
DB_USER=avnadmin
DB_PASSWORD=your-database-password

# Common Security
JWT_SECRET=super-secret-shared-jwt-token-key

# Email Service (Auth OTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password

# Payment Gateway (SSLCommerz Sandbox)
SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASSWORD=your-store-password
```

### 3. Database Initialization
Execute the schema SQL files inside each respective database (`auth_db`, `market_db`, `rent_db`, `newsbox_db`, `chat_db`, `issue_db`):

```bash
# Example via psql
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d auth_db -f auth-service/database-schema.sql
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d market_db -f marketplace-service/database-schema.sql
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d rent_db -f renthub-service/database-schema.sql
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d newsbox_db -f newsbox-service/database-schema.sql
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d chat_db -f chat-service/database-schema.sql
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d issue_db -f issue-service/database-schema.sql
```

### 4. Install Dependencies
Install dependencies across the client, gateway, and all backend microservices:

```powershell
# Automated PowerShell setup script
.\setup-all-services.ps1
```

*Or manually in each directory:*
```bash
npm install --prefix gateway
npm install --prefix client
npm install --prefix auth-service
npm install --prefix marketplace-service
npm install --prefix renthub-service
npm install --prefix newsbox-service
npm install --prefix notices-service
npm install --prefix chat-service
npm install --prefix issue-service
```

---

## Running the Application

### Option A: Using PowerShell Automation (Recommended for Local Dev)
```powershell
# Launch all microservices, API Gateway, and Vite Client in parallel windows
.\start-all-services.ps1

# To terminate all running service processes
.\stop-all-services.ps1
```

### Option B: Using Docker Compose
```bash
docker-compose up --build
```

### Option C: Manual Execution

```bash
# Terminal 1 - API Gateway
cd gateway && npm start

# Terminal 2 - Auth Service
cd auth-service && npm start

# Terminal 3 - Marketplace Service
cd marketplace-service && npm start

# Terminal 4 - RentHub Service
cd renthub-service && npm start

# Terminal 5 - NewsBox Service
cd newsbox-service && npm start

# Terminal 6 - Notices Service
cd notices-service && npm start

# Terminal 7 - Chat Service
cd chat-service && npm start

# Terminal 8 - Issue Service
cd issue-service && npm start

# Terminal 9 - React Frontend Client
cd client && npm run dev
```

---

## Service Endpoints & Routing

All frontend network requests should target the API Gateway on port `8000`:

| Service | Target Port | Gateway Route Prefix | Description |
|---|---|---|---|
| **API Gateway** | `8000` | `/` | Reverse proxy and central logging entrypoint |
| **Auth Service** | `3001` | `/api/auth` | Authentication, OTP verification, RBAC profiles |
| **Marketplace Service** | `3002` | `/api/market` | Vendors, products, pre-owned items, checkout |
| **RentHub Service** | `3003` | `/api/renthub` | Peer-to-peer item listings and bookings |
| **NewsBox Service** | `3004` | `/api/newsbox` | Community feed, posts, comments, voting |
| **Notices Service** | `3005` | `/api/notices` | Scraped university academic notices |
| **Chat Service** | `3006` | `/api/chat` | Contextual messaging and Socket.io signaling |
| **Issue Service** | `3007` | `/api/issues` | Campus issue ticketing and resolution pipeline |
| **React Client** | `5173` | — | Single Page Application (SPA) web frontend |

---

## Usage & API Examples

### 1. Request Registration OTP
```bash
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "student@bscse.uiu.ac.bd"}'
```

### 2. User Authentication
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@bscse.uiu.ac.bd", "password": "Password123"}'
```

### 3. Fetch Pre-Owned Marketplace Listings
```bash
curl -X GET "http://localhost:8000/api/market/preowned?category=ELECTRONICS"
```

### 4. Create a Rental Booking
```bash
curl -X POST http://localhost:8000/api/renthub/transactions \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "listing_id": "8f2d59e0-8271-47eb-b8ec-f232ce55b34a",
    "start_date": "2026-09-01",
    "end_date": "2026-09-05"
  }'
```

### 5. WebSocket Chat Connection
```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3006", {
  auth: { token: localStorage.getItem("edusync_token") }
});

socket.emit("join_room", { conversationId: "c381ef19-7fa4-469b-9ee9-43c2b8c9d192" });

socket.on("receive_message", (message) => {
  console.log("Incoming message:", message);
});
```

---

## Project Structure

```
EduSync/
├── auth-service/             # Authentication & user profile microservice (Port 3001)
│   ├── src/                  # Controllers, routes, auth middleware, OTP engine
│   └── database-schema.sql   # User schema and migration scripts
├── marketplace-service/      # Startups, food vendors & pre-owned marketplace (Port 3002)
│   ├── src/                  # Vendor management, product catalogs, payment handlers
│   └── database-schema.sql   # Marketplace tables and indexes
├── renthub-service/          # Peer-to-peer item rentals microservice (Port 3003)
│   ├── src/                  # Listing controllers, booking validation, transactions
│   └── database-schema.sql   # Rental listings and transaction tables
├── newsbox-service/          # University community forum & feed service (Port 3004)
│   ├── src/                  # Feed controllers, comment threads, vote calculations
│   └── database-schema.sql   # Post and vote relation schemas
├── notices-service/          # Real-time web scraper for university notices (Port 3005)
│   └── server.js             # Cheerio scraping logic for official portal
├── chat-service/             # Real-time context-based chat microservice (Port 3006)
│   ├── src/                  # Socket handlers, conversation archival, message history
│   └── database-schema.sql   # Conversation and message store schemas
├── issue-service/            # Campus issue logging and tracking microservice (Port 3007)
│   ├── src/                  # Issue reporting, priority tagging, moderation
│   └── database-schema.sql   # Issue ticketing and voting schemas
├── gateway/                  # Central reverse proxy API gateway (Port 8000)
│   └── server.js             # http-proxy-middleware routing and request logging
├── client/                   # React + Vite frontend application (Port 5173)
│   ├── src/
│   │   ├── components/       # Common UI elements (Navbar, Sidebar, Modals, 3D Canvas)
│   │   ├── context/          # AuthContext and ThemeContext state managers
│   │   ├── pages/            # View components (Auth, Dashboard, Market, Rentals, Admin)
│   │   ├── router/           # React Router route registry
│   │   └── services/         # Axios-based API client layer
│   └── vite.config.js        # Vite build and bundling configuration
├── docker-compose.yml        # Multi-container orchestration descriptor
├── setup-all-services.ps1    # Automated environment setup script
├── start-all-services.ps1    # Unified service launcher script
└── stop-all-services.ps1     # Process termination script
```

---

## Testing

### Automated & Unit Testing
Individual services include standalone test suites and validation scripts:

```powershell
# Test Auth OTP generation and verification
node auth-service/test-otp.js

# Test Vendor registration workflow
node marketplace-service/test-vendor-registration.js

# Test Notice Scraper connectivity
node notices-service/test-scrape.js

# Test Chat service WebSocket connection
.\chat-service\test-service.ps1

# Test Marketplace APIs
.\marketplace-service\test-marketplace-apis.ps1

# Verify Admin RBAC and dashboard access
.\test-admin-access.ps1
```

### API Testing Collections
Preconfigured API request collections for **Thunder Client** and **Postman** are provided in:
- `gateway/thunder-tests/`
- `marketplace-service/thunder-tests/`
- `newsbox-service/thunder-tests/`

---

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/campus-service`).
3. Commit your changes (`git commit -m "feat: add campus service module"`).
4. Push to the branch (`git push origin feature/campus-service`).
5. Open a Pull Request.

---

## License

This project is licensed under the [MIT License](LICENSE).
