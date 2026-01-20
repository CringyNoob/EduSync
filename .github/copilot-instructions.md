# EduSync AI Development Guide

## Architecture Overview

**EduSync** is a microservices-based campus ecosystem with a React frontend and Node.js backend services communicating through an API Gateway.

### Service Structure
- **Gateway** (Port 8000): Routes `/api/auth`, `/api/market`, `/api/renthub`, `/api/notices` to respective services
- **auth-service** (Port 3001): JWT authentication, user management, OTP-based registration
- **marketplace-service** (Port 3002): Hybrid shop-first (vendors) + product-first (preowned) architecture
- **renthub-service** (Port 3003): Rental listings and transactions
- **notices-service** (Port 3005): Scrapes UIU notices from uiu.ac.bd/notice/ (no database, in-memory cache)
- **client** (Port 5173): Vite + React SPA with React Router

All services use **PostgreSQL (Aiven)** with separate databases (`auth_db`, `market_db`, `rent_db`), except notices-service which uses in-memory caching.

## Critical Development Workflows

### Starting Services
Use PowerShell scripts in project root (NOT individual `npm start`):
```powershell
.\start-all-services.ps1  # Starts all 5 services in separate terminals
.\stop-all-services.ps1   # Kills all service ports
```
Services must start in dependency order: auth → marketplace/renthub → gateway → client.

### Database Population
**CRITICAL ORDER** (see [DATABASE-POPULATION-GUIDE.md](../DATABASE-POPULATION-GUIDE.md)):
1. Populate `auth_db` first (50 users with UUIDs 00000001-...-000000050)
2. Then `market_db` (references auth user IDs)
3. Finally `rent_db` (references auth user IDs)

User IDs are **UUIDs**, not integers. Use [UUID-MIGRATION-NOTES.md](../UUID-MIGRATION-NOTES.md) for ID mapping.

## Project-Specific Conventions

### API Response Patterns
Backend services use **inconsistent response structures** (documented fix in [INTEGRATION-TESTING-GUIDE.md](../INTEGRATION-TESTING-GUIDE.md)):
- **Marketplace vendors**: `{vendor: {products: []}}`
- **RentHub listings**: `{success: true, data: []}`
- **Auth**: `{success: true, user: {}, token: ""}`

Always check actual response shape in service controllers before assuming structure.

### Authentication Flow
1. JWT tokens stored in `localStorage` as `edusync_token`
2. Frontend extracts user from JWT via `getUserFromToken()` in [client/src/utils/jwtDecode.js](../client/src/utils/jwtDecode.js)
3. Backend middleware validates `Bearer <token>` in `Authorization` header
4. Token payload: `{id, email, role}` (note: uses `id` not `userId`)

### Frontend State Management
- **AuthContext**: User state with token-based auto-refresh
- **CartContext**: Marketplace cart (localStorage persistence)
- **ThemeContext**: Light/dark mode toggle
- **NotificationContext**: Toast notifications

No global state library (Redux/Zustand) - use React Context only.

### Routing Architecture
- **Gateway rewrites paths**: `/api/auth/login` → auth-service `/auth/login`
- **Client API calls**: Always use `/api/` prefix (proxied through gateway)
- **Service routes**: Mount at `/` root (gateway adds prefixes)

Example: Client calls `axios.post('/api/auth/login')` → Gateway → `http://localhost:3001/auth/login`

### Marketplace Dual Architecture
**Shop-First** (Vendors): Browse by shop → see their products
- Vendors (Startups, Food) have nested products
- Routes: `/vendors`, `/vendors/:id`

**Product-First** (Preowned): Browse all listings directly
- No shop concept, direct item listings
- Routes: `/preowned`, `/preowned/:id`

Controllers in [marketplace-service/src/controllers/](../marketplace-service/src/controllers/) are split: `vendorController.js`, `productController.js`, `preownedController.js`.

## Integration Points

### Cross-Service Communication
Services are **stateless** and don't call each other directly. All orchestration happens in:
1. **Gateway** (routing only, no business logic)
2. **Frontend** (fetches from multiple services, merges data)

User data lives in `auth_db` but is referenced by UUID in `market_db` and `rent_db`. No joins across databases.

### External Dependencies
- **PostgreSQL (Aiven)**: Cloud-hosted, connection strings in `.env` files
- **Nodemailer**: OTP emails in auth-service (check [auth-service/src/utils/emailService.js](../auth-service/src/utils/emailService.js))
- **bcrypt**: Password hashing (10 rounds)
- **jsonwebtoken**: JWT signing (7-day expiry)

### File Upload Patterns
Images stored as **base64 strings** directly in PostgreSQL (no S3/CDN):
- `express.json({limit: '10mb'})` in auth-service
- `express.json({limit: '50mb'})` in marketplace-service

This is a current limitation documented in service `server.js` files.

## Testing & Debugging

### API Testing
Each service has a `thunder-tests/` folder with ThunderClient collections. Import into VS Code ThunderClient extension.

Quick health checks:
- `http://localhost:3001/health` (auth)
- `http://localhost:3002/` (marketplace)
- `http://localhost:3003/health` (renthub)
- `http://localhost:8000/` (gateway)

### Common Issues
1. **Port conflicts**: Run `npx kill-port 3001 3002 3003 8000 5173` before starting
2. **Foreign key violations**: Populate databases in correct order (auth → market → rent)
3. **CORS errors**: Gateway must start after backend services
4. **401 Unauthorized**: Check token in localStorage and Bearer format in requests

## Key Files Reference
- [start-all-services.ps1](../start-all-services.ps1) - Service startup script
- [DATABASE-POPULATION-GUIDE.md](../DATABASE-POPULATION-GUIDE.md) - Database setup steps
- [INTEGRATION-TESTING-GUIDE.md](../INTEGRATION-TESTING-GUIDE.md) - Known API inconsistencies
- [UUID-MIGRATION-NOTES.md](../UUID-MIGRATION-NOTES.md) - User ID mapping for foreign keys
- [gateway/server.js](../gateway/server.js) - Proxy routing configuration
- [client/src/services/](../client/src/services/) - Frontend API service modules
