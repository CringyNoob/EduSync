# API Gateway

Central gateway for routing requests to microservices in the EduSync platform.

## Purpose

The gateway acts as a single entry point for all client requests, routing them to the appropriate microservices.

## Features

- ✅ Request routing to microservices
- ✅ CORS configuration for frontend
- ✅ Error handling and logging
- ✅ Centralized API endpoint

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment (optional):**
   ```bash
   cp .env.example .env
   ```

3. **Start the gateway:**
   ```bash
   node server.js
   ```

   Gateway runs on: `http://localhost:8000`

## Routes

| Route | Target Service | Port |
|-------|---------------|------|
| `/api/auth/*` | Auth Service | 3001 |
| `/api/marketplace/*` | Marketplace Service | 3002 |
| `/api/forum/*` | Forum Service | 3003 |

## Health Check

```
GET http://localhost:8000/
```

Response: `Gateway is Running`

## Dependencies

- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `http-proxy-middleware` - Proxy requests to microservices
- `dotenv` - Environment variables
