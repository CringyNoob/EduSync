# Issue Reporting Service

## Overview
A dedicated microservice for reporting and tracking campus issues at EduSync.

## Port
- **Default:** 3007
- **Gateway Route:** `/api/issues`

## Features
- Report campus issues (maintenance, IT, cleaning, safety)
- Voting system on approved issues
- Admin moderation (approve/reject/resolve)
- Priority levels (Low, Normal, High, Urgent)
- Issue tracking and statistics

## API Endpoints

### Public/User Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/info` | API information |
| GET | `/issues` | Get all issues (filtered by role) |
| GET | `/issues/:id` | Get issue by ID |
| POST | `/issues` | Report a new issue (Auth required) |
| POST | `/issues/:id/vote` | Vote on an issue (Auth required) |
| GET | `/issues/my-reports` | Get user's reported issues |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/issues/:id/status` | Update issue status |
| GET | `/issues/:id/voters` | Get voters for an issue |
| DELETE | `/issues/:id` | Delete an issue |
| GET | `/admin/stats` | Get admin statistics |

## Issue Statuses
- **PENDING:** Newly reported, awaiting admin review
- **APPROVED:** Visible to all users, can receive votes
- **REJECTED:** Not approved by admin
- **RESOLVED:** Issue has been fixed/resolved

## Categories
- Maintenance
- IT/Network
- Cleaning
- Safety
- Other

## Priority Levels
- Low
- Normal (default)
- High
- Urgent

## Setup

1. Copy `.env.example` to `.env` and configure
2. Run database schema: `database-schema.sql`
3. Install dependencies: `npm install`
4. Start service: `npm start`

## Environment Variables
```
PORT=3007
DB_HOST=your-aiven-host
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_NAME=issue_db
JWT_SECRET=your-jwt-secret
```
