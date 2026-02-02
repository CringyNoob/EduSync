# NewsBox Service - Thunder Client Manual Setup Guide

## 🎯 For Thunder Client Free Version Users

Since the free version doesn't support importing collections, follow this step-by-step guide to manually create each request.

---

## 🔧 Before You Start

### Your JWT Token (Copy This!)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMWEwYTE4LTAxNWYtNDdiZi04YmU0LWFiYzY1YzBlMjcyMiIsIm5hbWUiOiJXYWxpIFVsbGFoIEtoYW4iLCJlbWFpbCI6Im1raGFuMjIzNzU0QGJzY3NlLnVpdS5hYy5iZCIsImRlcGFydG1lbnQiOiJDb21wdXRlciBTY2llbmNlICYgRW5naW5lZXJpbmciLCJiYXRjaCI6IkZhbGwgLSAyMDIyIiwiaWF0IjoxNzY3OTc2NDE2LCJleHAiOjE3NjgwNjI4MTZ9.IkEHrjrkWtzBR3U_Ugtv-nTMafa8AVq0LfAeQ1ItQ54
```

### Token Details
- **User**: Wali Ullah Khan
- **User ID**: 7c1a0a18-015f-47bf-8be4-abc65c0e2722
- **Expires**: January 10, 2026

### Gateway Base URL
```
http://localhost:8000/api/newsbox
```

---

## 📋 15 Requests to Create (In Order)

### ✅ Request 1: Health Check
**Purpose**: Test if service is running

1. Open Thunder Client → Click **New Request**
2. Set Method: **GET**
3. Set URL: `http://localhost:8000/api/newsbox/health`
4. Click **Send**

✅ **Expected**: `"status": "UP"`

---

### 📝 Request 2: Create ACCOMMODATION Post
**Purpose**: Create your first post

1. New Request → Method: **POST**
2. URL: `http://localhost:8000/api/newsbox/posts`
3. **Headers** tab:
   - Add: `Content-Type` = `application/json`
   - Add: `Authorization` = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMWEwYTE4LTAxNWYtNDdiZi04YmU0LWFiYzY1YzBlMjcyMiIsIm5hbWUiOiJXYWxpIFVsbGFoIEtoYW4iLCJlbWFpbCI6Im1raGFuMjIzNzU0QGJzY3NlLnVpdS5hYy5iZCIsImRlcGFydG1lbnQiOiJDb21wdXRlciBTY2llbmNlICYgRW5naW5lZXJpbmciLCJiYXRjaCI6IkZhbGwgLSAyMDIyIiwiaWF0IjoxNzY3OTc2NDE2LCJleHAiOjE3NjgwNjI4MTZ9.IkEHrjrkWtzBR3U_Ugtv-nTMafa8AVq0LfAeQ1ItQ54`
4. **Body** tab → Select **JSON**:
```json
{
  "title": "Looking for a Roommate - Spring 2026",
  "description": "I have a 2-bedroom apartment near campus. Rent is $600/month including utilities. Looking for a quiet, tidy roommate.",
  "images": ["https://example.com/apt1.jpg"],
  "tag": "ACCOMMODATION"
}
```
5. Click **Send**

✅ **Expected**: Post created  
📌 **COPY THE POST ID** from response! (e.g., `"id": "550e8400-..."`)

---

### 📝 Request 3: Create QUERY Post
**Purpose**: Ask a question

1. New Request → Method: **POST**
2. URL: `http://localhost:8000/api/newsbox/posts`
3. **Headers** (same as Request 2):
   - `Content-Type: application/json`
   - `Authorization: Bearer <your-token>`
4. **Body** (JSON):
```json
{
  "title": "Best study spots on campus?",
  "description": "Looking for quiet places with good wifi. Any recommendations?",
  "images": [],
  "tag": "QUERY"
}
```
5. Click **Send**

---

### 📝 Request 4: Create JOB_POSTING Post
**Purpose**: Post a job

1. New Request → Method: **POST**
2. URL: `http://localhost:8000/api/newsbox/posts`
3. **Headers**: Same as before
4. **Body** (JSON):
```json
{
  "title": "Hiring: Part-time React Developer",
  "description": "$25/hour, 10-15 hours/week. TypeScript experience needed.",
  "images": [],
  "tag": "JOB_POSTING"
}
```
5. Click **Send**

---

### 📋 Request 5: Get All Posts
**Purpose**: See all your posts

1. New Request → Method: **GET**
2. URL: `http://localhost:8000/api/newsbox/posts`
3. No headers needed
4. Click **Send**

✅ **Expected**: Array with 3 posts

---

### 🔍 Request 6: Filter by ACCOMMODATION
**Purpose**: Test tag filtering

1. New Request → Method: **GET**
2. URL: `http://localhost:8000/api/newsbox/posts?tag=ACCOMMODATION`
3. Click **Send**

✅ **Expected**: Only 1 post (the roommate post)

---

### 📊 Request 7: Sort by Popular
**Purpose**: Test popularity sorting

1. New Request → Method: **GET**
2. URL: `http://localhost:8000/api/newsbox/posts?sort=popular`
3. Click **Send**

---

### 📄 Request 8: Get Single Post
**Purpose**: Get post details

1. New Request → Method: **GET**
2. URL: `http://localhost:8000/api/newsbox/posts/{POST_ID}`
   - **Replace `{POST_ID}`** with the UUID you copied from Request 2
3. Click **Send**

---

### 💬 Request 9: Add Comment
**Purpose**: Comment on a post

1. New Request → Method: **POST**
2. URL: `http://localhost:8000/api/newsbox/posts/{POST_ID}/comments`
   - Replace `{POST_ID}` with your post UUID
3. **Headers**:
   - `Content-Type: application/json`
   - `Authorization: Bearer <your-token>`
4. **Body** (JSON):
```json
{
  "content": "This sounds perfect! Can I get more details?"
}
```
5. Click **Send**

✅ **Expected**: Comment created  
📌 **COPY THE COMMENT ID** from response!

---

### 💬 Request 10: Get Comments
**Purpose**: View all comments on a post

1. New Request → Method: **GET**
2. URL: `http://localhost:8000/api/newsbox/posts/{POST_ID}/comments`
3. Click **Send**

---

### 👍 Request 11: Upvote Post
**Purpose**: Test voting

1. New Request → Method: **POST**
2. URL: `http://localhost:8000/api/newsbox/posts/{POST_ID}/vote`
3. **Headers**:
   - `Content-Type: application/json`
   - `Authorization: Bearer <your-token>`
4. **Body** (JSON):
```json
{
  "vote_type": "UP"
}
```
5. Click **Send**

✅ **Expected**: `"upvotes": 1`

---

### 🔄 Request 12: Toggle Vote Off
**Purpose**: Test vote removal

1. **Use the same request as Request 11**
2. Click **Send** again

✅ **Expected**: `"upvotes": 0` (vote removed)

---

### 🔃 Request 13: Vote Flip Test
**Purpose**: Test vote switching

**Part A: Upvote**
1. Send Request 11 again

**Part B: Downvote (flips)**
1. New Request → Method: **POST**
2. URL: `http://localhost:8000/api/newsbox/posts/{POST_ID}/vote`
3. **Headers**: Same as before
4. **Body** (JSON):
```json
{
  "vote_type": "DOWN"
}
```
5. Click **Send**

✅ **Expected**: `"downvotes": 1`, `"upvotes": 0`

---

### 🔍 Request 14: Check Vote Status
**Purpose**: See your current vote

1. New Request → Method: **GET**
2. URL: `http://localhost:8000/api/newsbox/posts/{POST_ID}/vote-status`
3. **Headers**:
   - `Authorization: Bearer <your-token>`
4. Click **Send**

✅ **Expected**: `"user_vote": "DOWN"`

---

### 💬👍 Request 15: Vote on Comment
**Purpose**: Upvote a comment

1. New Request → Method: **POST**
2. URL: `http://localhost:8000/api/newsbox/comments/{COMMENT_ID}/vote`
   - Replace `{COMMENT_ID}` with comment UUID from Request 9
3. **Headers**:
   - `Content-Type: application/json`
   - `Authorization: Bearer <your-token>`
4. **Body** (JSON):
```json
{
  "vote_type": "UP"
}
```
5. Click **Send**

---

### 🗑️ Request 16: Delete Comment
**Purpose**: Delete your comment

1. New Request → Method: **DELETE**
2. URL: `http://localhost:8000/api/newsbox/comments/{COMMENT_ID}`
3. **Headers**:
   - `Authorization: Bearer <your-token>`
4. Click **Send**

✅ **Expected**: "Comment deleted successfully"

---

### 🗑️ Request 17: Delete Post
**Purpose**: Delete your post (cascades to all related data)

1. New Request → Method: **DELETE**
2. URL: `http://localhost:8000/api/newsbox/posts/{POST_ID}`
3. **Headers**:
   - `Authorization: Bearer <your-token>`
4. Click **Send**

✅ **Expected**: "Post deleted successfully"

---

## 📊 Quick Summary Table

| # | Name | Method | Auth? | Body? | Save Response? |
|---|------|--------|-------|-------|----------------|
| 1 | Health Check | GET | ❌ | ❌ | - |
| 2 | Create ACCOMMODATION Post | POST | ✅ | ✅ | 📌 POST ID |
| 3 | Create QUERY Post | POST | ✅ | ✅ | - |
| 4 | Create JOB Post | POST | ✅ | ✅ | - |
| 5 | Get All Posts | GET | ❌ | ❌ | - |
| 6 | Filter by Tag | GET | ❌ | ❌ | - |
| 7 | Sort Popular | GET | ❌ | ❌ | - |
| 8 | Get Single Post | GET | ❌ | ❌ | - |
| 9 | Add Comment | POST | ✅ | ✅ | 📌 COMMENT ID |
| 10 | Get Comments | GET | ❌ | ❌ | - |
| 11 | Upvote Post | POST | ✅ | ✅ | - |
| 12 | Toggle Vote | POST | ✅ | ✅ | - |
| 13 | Flip Vote | POST | ✅ | ✅ | - |
| 14 | Vote Status | GET | ✅ | ❌ | - |
| 15 | Vote Comment | POST | ✅ | ✅ | - |
| 16 | Delete Comment | DELETE | ✅ | ❌ | - |
| 17 | Delete Post | DELETE | ✅ | ❌ | - |

---

## 💡 Pro Tips

### Copy-Paste Your Token
Keep this ready to paste into Authorization headers:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdjMWEwYTE4LTAxNWYtNDdiZi04YmU0LWFiYzY1YzBlMjcyMiIsIm5hbWUiOiJXYWxpIFVsbGFoIEtoYW4iLCJlbWFpbCI6Im1raGFuMjIzNzU0QGJzY3NlLnVpdS5hYy5iZCIsImRlcGFydG1lbnQiOiJDb21wdXRlciBTY2llbmNlICYgRW5naW5lZXJpbmciLCJiYXRjaCI6IkZhbGwgLSAyMDIyIiwiaWF0IjoxNzY3OTc2NDE2LCJleHAiOjE3NjgwNjI4MTZ9.IkEHrjrkWtzBR3U_Ugtv-nTMafa8AVq0LfAeQ1ItQ54
```

### Keep Track of IDs
Use a notepad to track:
- Post ID from Request 2: `_________________`
- Comment ID from Request 9: `_________________`

### Common Headers Template
For authenticated POST requests:
```
Content-Type: application/json
Authorization: Bearer <paste-token-here>
```

---

## 🚨 Common Errors

| Error | Reason | Fix |
|-------|--------|-----|
| 401 | Missing/invalid token | Check Authorization header |
| 403 | Not your content | Only delete YOUR posts/comments |
| 404 | Invalid UUID | Check the ID is correct |
| 400 | Invalid tag | Use ACCOMMODATION/QUERY/JOB_POSTING |

---

## 🎯 Testing Checklist

Complete each request in order:

- [ ] 1. Health Check ✅
- [ ] 2. Create ACCOMMODATION Post (save ID!)
- [ ] 3. Create QUERY Post
- [ ] 4. Create JOB Post
- [ ] 5. Get All Posts (should see 3)
- [ ] 6. Filter by ACCOMMODATION (should see 1)
- [ ] 7. Sort by Popular
- [ ] 8. Get Single Post (use saved ID)
- [ ] 9. Add Comment (save comment ID!)
- [ ] 10. Get Comments (should see 1)
- [ ] 11. Upvote Post (count: 1)
- [ ] 12. Toggle Vote Off (count: 0)
- [ ] 13. Flip Vote to Downvote (count: -1)
- [ ] 14. Check Vote Status (shows DOWN)
- [ ] 15. Vote on Comment
- [ ] 16. Delete Comment (success)
- [ ] 17. Delete Post (cascades everything)

---

**Complete Guide! 🚀**

Need more details? See [API-TESTING-GUIDE.md](API-TESTING-GUIDE.md)
