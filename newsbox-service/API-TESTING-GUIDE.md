# NewsBox Service - API Testing Guide

## 🔥 Quick Start with Thunder Client

### Prerequisites
- Thunder Client extension installed in VS Code
- All services running (`start-all-services.ps1`)
- Valid JWT token from auth-service

### Your JWT Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMWEwYTE4LTAxNWYtNDdiZi04YmU0LWFiYzY1YzBlMjcyMiIsIm5hbWUiOiJXYWxpIFVsbGFoIEtoYW4iLCJlbWFpbCI6Im1raGFuMjIzNzU0QGJzY3NlLnVpdS5hYy5iZCIsImRlcGFydG1lbnQiOiJDb21wdXRlciBTY2llbmNlICYgRW5naW5lZXJpbmciLCJiYXRjaCI6IkZhbGwgLSAyMDIyIiwiaWF0IjoxNzY3OTc2NDE2LCJleHAiOjE3NjgwNjI4MTZ9.IkEHrjrkWtzBR3U_Ugtv-nTMafa8AVq0LfAeQ1ItQ54
```

**Token Details:**
- User ID: `7c1a0a18-015f-47bf-8be4-abc65c0e2722`
- Name: `Wali Ullah Khan`
- Email: `mkhan223754@bscse.uiu.ac.bd`
- Department: `Computer Science & Engineering`
- Batch: `Fall - 2022`
- Expires: January 10, 2026

### Setup Thunder Client (Free Version - Manual)

Since you're using the free version, you'll create requests manually. Follow this guide:

#### 📍 Step-by-Step Request Setup

**Common Settings for All Requests:**
- Gateway Base URL: `http://localhost:8000/api/newsbox`
- Your Token (copy this): 
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMWEwYTE4LTAxNWYtNDdiZi04YmU0LWFiYzY1YzBlMjcyMiIsIm5hbWUiOiJXYWxpIFVsbGFoIEtoYW4iLCJlbWFpbCI6Im1raGFuMjIzNzU0QGJzY3NlLnVpdS5hYy5iZCIsImRlcGFydG1lbnQiOiJDb21wdXRlciBTY2llbmNlICYgRW5naW5lZXJpbmciLCJiYXRjaCI6IkZhbGwgLSAyMDIyIiwiaWF0IjoxNzY3OTc2NDE2LCJleHAiOjE3NjgwNjI4MTZ9.IkEHrjrkWtzBR3U_Ugtv-nTMafa8AVq0LfAeQ1ItQ54
  ```

---

### 🗺️ Manual Testing Guide (Thunder Client Free Version)

#### Request 1: Health Check ✅ (No Auth)
1. Click "New Request" in Thunder Client
2. Set **Method**: `GET`
3. Set **URL**: `http://localhost:8000/api/newsbox/health`
4. Click **Send**
5. ✅ Should see `"status": "UP"`

---

#### Request 2: Create ACCOMMODATION Post 📝 (Auth Required)
1. Click "New Request"
2. Set **Method**: `POST`
3. Set **URL**: `http://localhost:8000/api/newsbox/posts`
4. Go to **Headers** tab:
   - Click "Add Header"
   - Name: `Content-Type`
   - Value: `application/json`
   - Click "Add Header" again
   - Name: `Authorization`
   - Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMWEwYTE4LTAxNWYtNDdiZi04YmU0LWFiYzY1YzBlMjcyMiIsIm5hbWUiOiJXYWxpIFVsbGFoIEtoYW4iLCJlbWFpbCI6Im1raGFuMjIzNzU0QGJzY3NlLnVpdS5hYy5iZCIsImRlcGFydG1lbnQiOiJDb21wdXRlciBTY2llbmNlICYgRW5naW5lZXJpbmciLCJiYXRjaCI6IkZhbGwgLSAyMDIyIiwiaWF0IjoxNzY3OTc2NDE2LCJleHAiOjE3NjgwNjI4MTZ9.IkEHrjrkWtzBR3U_Ugtv-nTMafa8AVq0LfAeQ1ItQ54`
5. Go to **Body** tab:
   - Select "JSON" format
   - Paste this:
   ```json
   {
     "title": "Looking for a Roommate - Spring 2026",
     "description": "I have a 2-bedroom apartment near campus. Rent is $600/month including utilities. Looking for a quiet, tidy roommate who respects study hours.",
     "images": ["https://example.com/apt1.jpg"],
     "tag": "ACCOMMODATION"
   }
   ```
6. Click **Send**
7. ✅ Copy the `"id"` from response (you'll need it for later tests)

---

#### Request 3: Create QUERY Post 📝 (Auth Required)
1. Click "New Request"
2. Set **Method**: `POST`
3. Set **URL**: `http://localhost:8000/api/newsbox/posts`
4. Add **Headers** (same as Request 2):
   - `Content-Type: application/json`
   - `Authorization: Bearer <your-token>`
5. **Body** (JSON):
   ```json
   {
     "title": "Best study spots on campus?",
     "description": "Looking for quiet places to study with good wifi and comfortable seating. Any recommendations?",
     "images": [],
     "tag": "QUERY"
   }
   ```
6. Click **Send**

---

#### Request 4: Create JOB_POSTING Post 📝 (Auth Required)
1. Click "New Request"
2. Set **Method**: `POST`
3. Set **URL**: `http://localhost:8000/api/newsbox/posts`
4. Add **Headers**:
   - `Content-Type: application/json`
   - `Authorization: Bearer <your-token>`
5. **Body** (JSON):
   ```json
   {
     "title": "Hiring: Part-time React Developer",
     "description": "Looking for a React developer with TypeScript experience. $25/hour, 10-15 hours/week. Flexible schedule. Contact me if interested!",
     "images": [],
     "tag": "JOB_POSTING"
   }
   ```
6. Click **Send**

---

#### Request 5: Get All Posts 📋 (No Auth)
1. Click "New Request"
2. Set **Method**: `GET`
3. Set **URL**: `http://localhost:8000/api/newsbox/posts`
4. Click **Send**
5. ✅ Should see all 3 posts you created

---

#### Request 6: Filter by ACCOMMODATION Tag 🔍 (No Auth)
1. Click "New Request"
2. Set **Method**: `GET`
3. Set **URL**: `http://localhost:8000/api/newsbox/posts?tag=ACCOMMODATION`
4. Click **Send**
5. ✅ Should see only ACCOMMODATION posts

---

#### Request 7: Sort by Popular 📊 (No Auth)
1. Click "New Request"
2. Set **Method**: `GET`
3. Set **URL**: `http://localhost:8000/api/newsbox/posts?sort=popular`
4. Click **Send**

---

#### Request 8: Get Single Post 📄 (No Auth)
1. Click "New Request"
2. Set **Method**: `GET`
3. Set **URL**: `http://localhost:8000/api/newsbox/posts/{POST_ID}`
   - Replace `{POST_ID}` with the UUID you copied from Request 2
4. Click **Send**

---

#### Request 9: Add Comment 💬 (Auth Required)
1. Click "New Request"
2. Set **Method**: `POST`
3. Set **URL**: `http://localhost:8000/api/newsbox/posts/{POST_ID}/comments`
   - Replace `{POST_ID}` with your post UUID
4. Add **Headers**:
   - `Content-Type: application/json`
   - `Authorization: Bearer <your-token>`
5. **Body** (JSON):
   ```json
   {
     "content": "This sounds perfect! Can I get more details about the location and amenities?"
   }
   ```
6. Click **Send**
7. ✅ Copy the comment `"id"` from response

---

#### Request 10: Get Comments 💬 (No Auth)
1. Click "New Request"
2. Set **Method**: `GET`
3. Set **URL**: `http://localhost:8000/api/newsbox/posts/{POST_ID}/comments`
   - Replace `{POST_ID}` with your post UUID
4. Click **Send**

---

#### Request 11: Upvote Post 👍 (Auth Required)
1. Click "New Request"
2. Set **Method**: `POST`
3. Set **URL**: `http://localhost:8000/api/newsbox/posts/{POST_ID}/vote`
   - Replace `{POST_ID}` with your post UUID
4. Add **Headers**:
   - `Content-Type: application/json`
   - `Authorization: Bearer <your-token>`
5. **Body** (JSON):
   ```json
   {
     "vote_type": "UP"
   }
   ```
6. Click **Send**
7. ✅ Should see upvotes: 1

---

#### Request 12: Toggle Vote (Send Same Request Again) 🔄 (Auth Required)
1. Use the **same request** as Request 11
2. Click **Send** again
3. ✅ Should see upvotes: 0 (vote removed)

---

#### Request 13: Upvote Again → Then Downvote (Flip) 🔃 (Auth Required)
1. Send Request 11 again (upvote)
2. Then create new request:
   - Method: `POST`
   - URL: `http://localhost:8000/api/newsbox/posts/{POST_ID}/vote`
   - Headers: Same as before
   - Body:
   ```json
   {
     "vote_type": "DOWN"
   }
   ```
3. Click **Send**
4. ✅ Should see downvotes: 1, upvotes: 0 (vote flipped)

---

#### Request 14: Check Vote Status 🔍 (Auth Required)
1. Click "New Request"
2. Set **Method**: `GET`
3. Set **URL**: `http://localhost:8000/api/newsbox/posts/{POST_ID}/vote-status`
   - Replace `{POST_ID}` with your post UUID
4. Add **Headers**:
   - `Authorization: Bearer <your-token>`
5. Click **Send**
6. ✅ Should see `"user_vote": "DOWN"`

---

#### Request 15: Vote on Comment 💬👍 (Auth Required)
1. Click "New Request"
2. Set **Method**: `POST`
3. Set **URL**: `http://localhost:8000/api/newsbox/comments/{COMMENT_ID}/vote`
   - Replace `{COMMENT_ID}` with comment UUID from Request 9
4. Add **Headers**:
   - `Content-Type: application/json`
   - `Authorization: Bearer <your-token>`
5. **Body** (JSON):
   ```json
   {
     "vote_type": "UP"
   }
   ```
6. Click **Send**

---

#### Request 16: Delete Comment 🗑️ (Auth Required - Your Comment Only)
1. Click "New Request"
2. Set **Method**: `DELETE`
3. Set **URL**: `http://localhost:8000/api/newsbox/comments/{COMMENT_ID}`
   - Replace `{COMMENT_ID}` with your comment UUID
4. Add **Headers**:
   - `Authorization: Bearer <your-token>`
5. Click **Send**
6. ✅ Should see "Comment deleted successfully"

---

#### Request 17: Delete Post 🗑️ (Auth Required - Your Post Only)
1. Click "New Request"
2. Set **Method**: `DELETE`
3. Set **URL**: `http://localhost:8000/api/newsbox/posts/{POST_ID}`
   - Replace `{POST_ID}` with your post UUID
4. Add **Headers**:
   - `Authorization: Bearer <your-token>`
5. Click **Send**
6. ✅ Should see "Post deleted successfully"
7. ✅ All comments and votes also deleted (cascade)

---

## 📋 API Endpoints Overview

### Base URLs
- **Direct Service**: `http://localhost:3004`
- **Via Gateway** (Recommended): `http://localhost:8000/api/newsbox`

All Thunder Client requests use the Gateway route.

---

## 🔐 Authentication

### Protected Routes (Require JWT Token)
All write operations require authentication via Bearer token:
- `POST /posts` - Create post
- `POST /posts/:postId/comments` - Add comment
- `POST /posts/:postId/vote` - Vote on post
- `POST /comments/:commentId/vote` - Vote on comment
- `DELETE /posts/:postId` - Delete post (author only)
- `DELETE /comments/:commentId` - Delete comment (author only)
- `GET /posts/:postId/vote-status` - Check user's vote

### Public Routes (No Auth Required)
- `GET /health` - Service health check
- `GET /info` - API information
- `GET /posts` - List all posts
- `GET /posts?tag=<TAG>` - Filter by tag
- `GET /posts?sort=popular` - Sort by popularity
- `GET /posts/:postId` - Get single post
- `GET /posts/:postId/comments` - Get comments

### How Authentication Works
1. **Token in Header**: `Authorization: Bearer <your-token>`
2. **User Info Extraction**: Middleware extracts `id`, `name`, `email`, `department`, `batch` from token
3. **Automatic Fields**: `author_id` and `author_name` are populated from token, NOT from request body
4. **Security**: Users can only delete their own posts/comments

---

## 🧪 Testing Workflow

### 1. Health Check
**Request**: Health Check (GET)
```
GET http://localhost:8000/api/newsbox/health
```
**Expected Response**:
```json
{
  "status": "UP",
  "service": "newsbox-service",
  "timestamp": "2026-01-09T12:00:00.000Z"
}
```

---

### 2. Create Posts

#### ACCOMMODATION Post
**Request**: Create Post - ACCOMMODATION
```
POST http://localhost:8000/api/newsbox/posts
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "title": "Looking for a Roommate - Spring 2026",
  "description": "I have a 2-bedroom apartment near campus. Rent is $600/month including utilities. Looking for a quiet, tidy roommate who respects study hours.",
  "images": ["https://example.com/apt1.jpg", "https://example.com/apt2.jpg"],
  "tag": "ACCOMMODATION"
}
```

**Expected Response**:
```json
{
  "message": "Post created successfully",
  "post": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Looking for a Roommate - Spring 2026",
    "description": "...",
    "images": ["..."],
    "tag": "ACCOMMODATION",
    "author_id": "7c1a0a18-015f-47bf-8be4-abc65c0e2722",
    "author_name": "Wali Ullah Khan",
    "upvotes": 0,
    "downvotes": 0,
    "created_at": "2026-01-09T12:00:00.000Z"
  }
}
```

#### QUERY Post
**Request**: Create Post - QUERY
```json
{
  "title": "Best study spots on campus?",
  "description": "Looking for quiet places to study with good wifi and comfortable seating. Any recommendations?",
  "images": [],
  "tag": "QUERY"
}
```

#### JOB_POSTING Post
**Request**: Create Post - JOB_POSTING
```json
{
  "title": "Hiring: Part-time React Developer",
  "description": "Looking for a React developer with TypeScript experience. $25/hour, 10-15 hours/week. Flexible schedule. Contact me if interested!",
  "images": [],
  "tag": "JOB_POSTING"
}
```

**Valid Tags**: `ACCOMMODATION`, `QUERY`, `JOB_POSTING`, `GENERAL`
```


---

### 3. Read Posts

#### Get All Posts
**Request**: Get All Posts
```
GET http://localhost:8000/api/newsbox/posts
```

#### Filter by Tag
**Request**: Get Posts - Filter by ACCOMMODATION
```
GET http://localhost:8000/api/newsbox/posts?tag=ACCOMMODATION
```

#### Sort by Popularity
**Request**: Get Posts - Sort by Popular
```
GET http://localhost:8000/api/newsbox/posts?sort=popular
```
Sorts by net votes (upvotes - downvotes)

#### Get Single Post
**Request**: Get Single Post by ID
```
GET http://localhost:8000/api/newsbox/posts/{POST_ID}
```
Replace `{POST_ID}` with actual UUID from previous responses.

---

### 4. Comments

#### Add Comment
**Request**: Add Comment to Post
```
POST http://localhost:8000/api/newsbox/posts/{POST_ID}/comments
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "content": "This sounds perfect! Can I get more details about the location and amenities?"
}
```

**Expected Response**:
```json
{
  "message": "Comment added successfully",
  "comment": {
    "id": "660e8400-e29b-41d4-a716-446655440011",
    "post_id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "This sounds perfect! Can I get more details...",
    "author_id": "7c1a0a18-015f-47bf-8be4-abc65c0e2722",
    "author_name": "Wali Ullah Khan",
    "upvotes": 0,
    "downvotes": 0,
    "created_at": "2026-01-09T12:05:00.000Z"
  }
}
```

#### Get Comments
**Request**: Get Comments for Post
```
GET http://localhost:8000/api/newsbox/posts/{POST_ID}/comments
```

---

### 5. Voting System

#### Vote on Post
**Request**: Upvote Post / Downvote Post
```
POST http://localhost:8000/api/newsbox/posts/{POST_ID}/vote
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "vote_type": "UP"
}
```
- `"vote_type"` must be `"UP"` or `"DOWN"`

**Vote Logic**:
- First vote: Adds your vote
- Same vote again: **Removes** your vote (toggle off)
- Different vote: **Changes** your vote (flip)

**Examples**:
1. User upvotes → upvotes: 1
2. User upvotes again → upvotes: 0 (removed)
3. User upvotes → then downvotes → upvotes: 0, downvotes: 1 (flipped)

#### Check Vote Status
**Request**: Get Vote Status
```
GET http://localhost:8000/api/newsbox/posts/{POST_ID}/vote-status
Authorization: Bearer <your-token>
```

**Response**:
```json
{
  "user_vote": "UP",
  "post_id": "550e8400-e29b-41d4-a716-446655440000"
}
```
- `user_vote`: `"UP"`, `"DOWN"`, or `null` (no vote)

#### Vote on Comment
**Request**: Vote on Comment
```
POST http://localhost:8000/api/newsbox/comments/{COMMENT_ID}/vote
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "vote_type": "UP"
}
```
Same toggle/flip logic as post votes.
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "post_id": "post-uuid",
    "user_id": "YOUR_USER_ID",
    "vote_type": "DOWN"
  }
}
```

#### Test 13: Vote on a Comment
```bash
curl -X POST http://localhost:8000/api/newsbox/comments/{comment_id}/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "vote_type": "UP"
  }'
```

---
---

### 6. Delete Operations

#### Delete Comment
**Request**: Delete Comment
```
DELETE http://localhost:8000/api/newsbox/comments/{COMMENT_ID}
Authorization: Bearer <your-token>
```

**Authorization**: Only the comment author can delete.

**Expected Response**:
```json
{
  "message": "Comment deleted successfully"
}
```

#### Delete Post
**Request**: Delete Post
```
DELETE http://localhost:8000/api/newsbox/posts/{POST_ID}
Authorization: Bearer <your-token>
```

**Authorization**: Only the post author can delete.

**Cascade Behavior**: Deleting a post automatically deletes:
- All comments on the post
- All votes on the post
- All votes on the comments

---

## 🚨 Error Responses

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```
**Fix**: Add `Authorization: Bearer <token>` header

### 403 Forbidden
```json
{
  "error": "You can only delete your own comments"
}
```
**Fix**: Only delete content you created

### 404 Not Found
```json
{
  "error": "Post not found"
}
```
**Fix**: Use valid UUID from GET /posts response

### 400 Bad Request
```json
{
  "error": "Missing required fields: title, description, tag"
}
```
**Fix**: Include all required fields in request body

### 500 Internal Server Error
```json
{
  "error": "Database error message"
}
```
**Fix**: Check service logs and database connection

---

## 📝 Testing Checklist

- [ ] Health check returns 200 OK
- [ ] Create post with ACCOMMODATION tag
- [ ] Create post with QUERY tag
- [ ] Create post with JOB_POSTING tag
- [ ] Get all posts returns all 3
- [ ] Filter by ACCOMMODATION returns only 1
- [ ] Add comment to post
- [ ] Get comments shows new comment
- [ ] Upvote post (check upvotes: 1)
- [ ] Upvote post again (check upvotes: 0, toggle off)
- [ ] Downvote post (check downvotes: 1, upvotes: 0, flip)
- [ ] Check vote status returns "DOWN"
- [ ] Vote on comment
- [ ] Sort by popular shows correct order
- [ ] Delete own comment (success)
- [ ] Try to delete another user's comment (403 error)
- [ ] Delete post cascades to comments and votes
- [ ] Try accessing protected route without token (401 error)

---

## 🔄 Integration with Frontend

### Fetching Posts
```javascript
const response = await fetch('http://localhost:8000/api/newsbox/posts?tag=ACCOMMODATION&sort=popular');
const posts = await response.json();
```

### Creating Post (with Auth)
```javascript
const token = localStorage.getItem('token'); // From auth-service

const response = await fetch('http://localhost:8000/api/newsbox/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My Post Title',
    description: 'Post content here',
    images: [],
    tag: 'GENERAL'
  })
});

const result = await response.json();
```

### Voting
```javascript
const response = await fetch(`http://localhost:8000/api/newsbox/posts/${postId}/vote`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    vote_type: 'UP' // or 'DOWN'
  })
});
```

---

## 🐛 Troubleshooting

### Token Expired
If you get `"error": "Token expired"`, get a new token:
```bash
# Login via auth-service
POST http://localhost:8000/api/auth/login
{
  "email": "mkhan223754@bscse.uiu.ac.bd",
  "password": "your-password"
}

# Copy new token from response
```

### Service Not Running
```bash
# Check if newsbox-service is running
netstat -ano | findstr :3004

# Start all services
.\start-all-services.ps1
```

### Database Connection Error
```bash
# Check PostgreSQL container
docker ps | findstr postgres

# Check newsbox-service logs
cd newsbox-service
npm run dev
# Look for connection errors
```

### CORS Errors (Frontend)
Ensure gateway is proxying correctly:
- Gateway: `http://localhost:8000/api/newsbox`
- NOT: `http://localhost:3004` (direct service call blocked by CORS)

---

## 📚 Additional Resources

- [Database Schema](database-schema.sql)
- [Sample Data](populate-newsbox-data.sql)
- [Gateway Configuration](../gateway/server.js)
- [Service Documentation](README.md)

---

## 🎯 Key Features to Highlight

1. **Toggle/Flip Voting**: No separate "remove vote" endpoint needed
2. **JWT-Based Identity**: Author info comes from token, not client input
3. **Cascade Delete**: Posts deletion cleans up all related data
4. **Tag Filtering**: Easy content categorization
5. **Popularity Sorting**: Community-driven content ranking
6. **Gateway Integration**: Single entry point for all API calls

---

**Happy Testing! 🚀**

---

## 🔧 PowerShell Testing Script

Save this as `test-newsbox-api.ps1`:

```powershell
Write-Host "🧪 Testing NewsBox Service API" -ForegroundColor Cyan

$baseUrl = "http://localhost:8000/api/newsbox"

# Test 1: Health Check
Write-Host "`n✅ Test 1: Health Check" -ForegroundColor Green
Invoke-RestMethod -Uri "$baseUrl/health" -Method Get | ConvertTo-Json

# Test 2: Create Post
Write-Host "`n✅ Test 2: Create Post" -ForegroundColor Green
$post = @{
    author_id = "11111111-1111-1111-1111-111111111111"
    author_name = "Test User"
    title = "PowerShell Test Post"
    description = "This post was created via PowerShell"
    images = @()
    tag = "GENERAL"
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "$baseUrl/posts" -Method Post -Body $post -ContentType "application/json"
$postId = $result.data.id
$result | ConvertTo-Json

# Test 3: Get All Posts
Write-Host "`n✅ Test 3: Get All Posts" -ForegroundColor Green
Invoke-RestMethod -Uri "$baseUrl/posts" -Method Get | ConvertTo-Json -Depth 5

# Test 4: Vote on Post
Write-Host "`n✅ Test 4: Vote on Post" -ForegroundColor Green
$vote = @{
    user_id = "22222222-2222-2222-2222-222222222222"
    vote_type = "UP"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/posts/$postId/vote" -Method Post -Body $vote -ContentType "application/json" | ConvertTo-Json

Write-Host "`n✨ All tests completed!" -ForegroundColor Cyan
```

Run with:
```bash
.\test-newsbox-api.ps1
```

---

## 🎉 Success Indicators

✅ **Service is working if:**
- Health endpoint returns `status: healthy`
- Can create posts and get unique UUIDs
- Vote count increases/decreases correctly
- Comments appear under posts
- Filters and sorting work as expected
- Errors return proper status codes and messages

---

Happy Testing! 🚀
