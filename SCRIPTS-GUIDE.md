# 🚀 EduSync Services - Quick Start Guide

## First Time Setup (Run Once)

### 1️⃣ Install All Dependencies
```powershell
.\setup-all-services.ps1
```
This will install `node_modules` for all services (takes 2-3 minutes).

### 2️⃣ Configure Databases
- Create databases in Aiven console
- Run schema files for each service
- See individual service README files

### 3️⃣ Configure Environment Variables
Ensure `.env` files exist in:
- `auth-service/.env`
- `marketplace-service/.env`
- `renthub-service/.env`
- `newsbox-service/.env`

---

## Daily Development (Run Every Time)

### ▶️ Start All Services
```powershell
.\start-all-services.ps1
```
Opens 6 terminal windows (fast startup ~5 seconds).

### ⏹️ Stop All Services
```powershell
.\stop-all-services.ps1
```
Kills all running services.

---

## When to Re-run Setup

Run `.\setup-all-services.ps1` again when:
- ✅ You pull new code with updated dependencies
- ✅ package.json files change
- ✅ You get "module not found" errors
- ✅ After git clone on a new machine

**DO NOT** run setup before every start - it's slow and unnecessary!

---

## Service URLs

| Service | Port | URL |
|---------|------|-----|
| Auth Service | 3001 | http://localhost:3001 |
| Marketplace | 3002 | http://localhost:3002 |
| RentHub | 3003 | http://localhost:3003 |
| NewsBox | 3004 | http://localhost:3004 |
| Gateway | 8000 | http://localhost:8000 |
| React Client | 5173 | http://localhost:5173 |

---

## Troubleshooting

### Port Already in Use
```powershell
.\stop-all-services.ps1
# Then restart
.\start-all-services.ps1
```

### Module Not Found
```powershell
.\setup-all-services.ps1
```

### Database Connection Failed
Check `.env` files in each service directory.

---

## Script Files Overview

| Script | Purpose | When to Run |
|--------|---------|-------------|
| `setup-all-services.ps1` | Install dependencies | Once / When deps change |
| `start-all-services.ps1` | Start all services | Every dev session |
| `stop-all-services.ps1` | Stop all services | When done working |

---

## Recommended Workflow

```powershell
# Day 1 (Initial setup)
.\setup-all-services.ps1
# Configure databases and .env files
.\start-all-services.ps1

# Day 2+ (Regular development)
.\start-all-services.ps1
# Work on your code...
.\stop-all-services.ps1
```

---

Happy Coding! 🎉
