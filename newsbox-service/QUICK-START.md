# 📰 NewsBox Service - Quick Start Guide

## 🎯 Overview

The **NewsBox Service** is a complete community feed system with posts, comments, and voting functionality. It runs on **Port 3004** and integrates seamlessly with your EduSync microservices architecture.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd newsbox-service
npm install
```

### 2. Setup Database

#### Create Database in Aiven Console
1. Go to your Aiven PostgreSQL console
2. Create a new database named: `newsbox_db`
3. Note down the connection credentials

#### Run Database Schema
```bash
# Connect to your Aiven PostgreSQL
psql -h pg-1ea37722-aranov1107-6aeb.c.aivencloud.com -p 16231 -U avnadmin -d newsbox_db

# Run the schema file
\i database-schema.sql

# (Optional) Populate sample data
\i populate-newsbox-data.sql
```

Or using direct command:
```bash
psql -h <your-host> -p 16231 -U avnadmin -d newsbox_db -f database-schema.sql
psql -h <your-host> -p 16231 -U avnadmin -d newsbox_db -f populate-newsbox-data.sql
```

### 3. Configure Environment

The `.env` file is already configured. Update if needed:

```env
DB_HOST=pg-1ea37722-aranov1107-6aeb.c.aivencloud.com
DB_PORT=16231
DB_USER=avnadmin
DB_PASSWORD=AVNS_8oHRLpTCVcvFWMRj6sh
DB_NAME=newsbox_db
PORT=3004
NODE_ENV=development
CORS_ORIGIN=*
```

### 4. Start the Service

**Option A: Standalone**
```bash
npm start
```

**Option B: With All Services**
```bash
# From EduSync root directory
.\start-all-services.ps1
```

---

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:3004/health
```

### Via Gateway (Recommended)
```bash
# All requests through gateway are prefixed with /api/newsbox
curl http://localhost:8000/api/newsbox/health
```

---

## 📝 API Endpoints

### Posts

#### Create Post
```bash
POST http://localhost:8000/api/newsbox/posts
Content-Type: application/json

{
  "author_id": "11111111-1111-1111-1111-111111111111",
  "author_name": "John Doe",
  "title": "Looking for a Study Partner",
  "description": "Need someone to study with for finals. CS major preferred.",
  "images": ["https://example.com/image1.jpg"],
  "tag": "QUERY"
}
```

#### Get All Posts
```bash
# All posts (newest first)
GET http://localhost:8000/api/newsbox/posts

# Filter by tag
GET http://localhost:8000/api/newsbox/posts?tag=ACCOMMODATION

# Sort by popularity
GET http://localhost:8000/api/newsbox/posts?sort=popular

# Filter + Sort
GET http://localhost:8000/api/newsbox/posts?tag=JOB_POSTING&sort=popular
```

#### Get Single Post
```bash
GET http://localhost:8000/api/newsbox/posts/{post_id}
```

#### Delete Post
```bash
DELETE http://localhost:8000/api/newsbox/posts/{post_id}
Content-Type: application/json

{
  "user_id": "11111111-1111-1111-1111-111111111111"
}
```

### Comments

#### Add Comment
```bash
POST http://localhost:8000/api/newsbox/posts/{post_id}/comments
Content-Type: application/json

{
  "author_id": "22222222-2222-2222-2222-222222222222",
  "author_name": "Jane Smith",
  "content": "Great post! I'm interested in joining."
}
```

#### Get Comments
```bash
GET http://localhost:8000/api/newsbox/posts/{post_id}/comments
```

#### Delete Comment
```bash
DELETE http://localhost:8000/api/newsbox/comments/{comment_id}
Content-Type: application/json

{
  "user_id": "22222222-2222-2222-2222-222222222222"
}
```

### Voting

#### Vote on Post
```bash
POST http://localhost:8000/api/newsbox/posts/{post_id}/vote
Content-Type: application/json

{
  "user_id": "33333333-3333-3333-3333-333333333333",
  "vote_type": "UP"
}
```

**Vote Logic:**
- Same vote type → **Remove vote** (toggle off)
- Different vote type → **Flip vote** (UP ↔ DOWN)
- No existing vote → **Add new vote**

#### Vote on Comment
```bash
POST http://localhost:8000/api/newsbox/comments/{comment_id}/vote
Content-Type: application/json

{
  "user_id": "33333333-3333-3333-3333-333333333333",
  "vote_type": "DOWN"
}
```

#### Check Vote Status
```bash
GET http://localhost:8000/api/newsbox/posts/{post_id}/vote-status?user_id={uuid}
```

---

## 🏷️ Valid Post Tags

- `QUERY` - Questions and inquiries
- `ACCOMMODATION` - Housing and roommate posts
- `JOB_POSTING` - Job opportunities
- `LOST_AND_FOUND` - Lost and found items
- `GENERAL` - General announcements

---

## 🔍 Sample User IDs (from populate script)

Use these UUIDs for testing:

```
User 1 (Alice):   11111111-1111-1111-1111-111111111111
User 2 (Bob):     22222222-2222-2222-2222-222222222222
User 3 (Charlie): 33333333-3333-3333-3333-333333333333
User 4 (Diana):   44444444-4444-4444-4444-444444444444
```

---

## 🎨 Frontend Integration

### Example: Fetch Posts in React

```javascript
// Fetch all posts
const fetchPosts = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/newsbox/posts');
    const data = await response.json();
    console.log(data.data); // Array of posts
  } catch (error) {
    console.error('Error:', error);
  }
};

// Create a post
const createPost = async (postData) => {
  try {
    const response = await fetch('http://localhost:8000/api/newsbox/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Vote on a post
const voteOnPost = async (postId, userId, voteType) => {
  try {
    const response = await fetch(`http://localhost:8000/api/newsbox/posts/${postId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, vote_type: voteType })
    });
    const data = await response.json();
    console.log('New vote count:', data.data.vote_count);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 📊 Database Tables

### posts
- `id` (UUID, PK)
- `author_id` (UUID)
- `author_name` (VARCHAR)
- `title` (VARCHAR)
- `description` (TEXT)
- `images` (TEXT[])
- `tag` (ENUM)
- `created_at` (TIMESTAMP)

### comments
- `id` (UUID, PK)
- `post_id` (UUID, FK)
- `author_id` (UUID)
- `author_name` (VARCHAR)
- `content` (TEXT)
- `created_at` (TIMESTAMP)

### post_votes
- `id` (UUID, PK)
- `user_id` (UUID)
- `post_id` (UUID, FK)
- `vote_type` (VARCHAR: 'UP'/'DOWN')
- Constraint: UNIQUE(user_id, post_id)

### comment_votes
- `id` (UUID, PK)
- `user_id` (UUID)
- `comment_id` (UUID, FK)
- `vote_type` (VARCHAR: 'UP'/'DOWN')
- Constraint: UNIQUE(user_id, comment_id)

---

## 🛠️ Troubleshooting

### Service won't start
```bash
# Check if port 3004 is already in use
npx kill-port 3004

# Check database connection
npm start
# Look for "✅ Connected to PostgreSQL database" message
```

### Database connection failed
1. Verify Aiven credentials in `.env`
2. Ensure `newsbox_db` database exists
3. Check SSL certificate (Aiven requires SSL)
4. Verify firewall allows connection to Aiven

### Gateway not proxying requests
```bash
# Restart gateway
cd gateway
node server.js

# Check gateway logs for "→ Proxying to NewsBox Service"
```

---

## 📡 Service URLs

| Service | Port | Direct URL | Gateway URL |
|---------|------|------------|-------------|
| NewsBox Service | 3004 | `http://localhost:3004` | `http://localhost:8000/api/newsbox` |
| Auth Service | 3001 | `http://localhost:3001` | `http://localhost:8000/api/auth` |
| Marketplace | 3002 | `http://localhost:3002` | `http://localhost:8000/api/market` |
| RentHub | 3003 | `http://localhost:3003` | `http://localhost:8000/api/renthub` |
| Gateway | 8000 | `http://localhost:8000` | - |
| Client | 5173 | `http://localhost:5173` | - |

---

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Database `newsbox_db` created in Aiven
- [ ] Schema applied (`database-schema.sql`)
- [ ] Sample data loaded (optional)
- [ ] `.env` file configured
- [ ] Service starts without errors
- [ ] Health endpoint responds: `GET /health`
- [ ] Gateway proxy works: `GET /api/newsbox/health`
- [ ] Can create posts
- [ ] Can vote on posts
- [ ] Can add comments

---

## 🎉 You're Ready!

The NewsBox service is now fully integrated with your EduSync ecosystem. Access it via:

- **Direct**: `http://localhost:3004`
- **Gateway**: `http://localhost:8000/api/newsbox`

Happy coding! 🚀
