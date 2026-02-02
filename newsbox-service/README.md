# 📰 NewsBox Service

Community Feed Service for EduSync - Posts, Comments, and Voting System.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Aiven PostgreSQL credentials

# Start the service
npm start

# Development mode with auto-reload
npm run dev
```

## 📋 Features

- ✅ **Post Management**: Create, read, and delete posts
- ✅ **Tagging System**: QUERY, ACCOMMODATION, JOB_POSTING, LOST_AND_FOUND, GENERAL
- ✅ **Commenting**: Add and manage comments on posts
- ✅ **Voting System**: Upvote/downvote with toggle logic
- ✅ **Filtering & Sorting**: Filter by tag, sort by newest/popular
- ✅ **Vote Tracking**: Track individual user votes

## 🗄️ Database Setup

### 1. Create Database
Create a PostgreSQL database named `newsbox_db` in your Aiven console.

### 2. Run Schema
```bash
psql -h <host> -p <port> -U <user> -d newsbox_db -f database-schema.sql
```

### 3. Populate Sample Data (Optional)
```bash
psql -h <host> -p <port> -U <user> -d newsbox_db -f populate-newsbox-data.sql
```

## 🔌 API Endpoints

### Health & Info
- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /info` - API documentation

### Posts
- `POST /posts` - Create a new post
- `GET /posts` - Get all posts (filters: `tag`, `sort`)
- `GET /posts/:id` - Get single post with comments
- `DELETE /posts/:id` - Delete post (author only)

### Comments
- `POST /posts/:id/comments` - Add comment to post
- `GET /posts/:id/comments` - Get all comments for post
- `DELETE /comments/:id` - Delete comment (author only)

### Voting
- `POST /posts/:id/vote` - Vote on post
- `POST /comments/:id/vote` - Vote on comment
- `GET /posts/:id/vote-status` - Get user's vote status

## 📝 Request Examples

### Create Post
```json
POST /posts
{
  "author_id": "uuid",
  "author_name": "John Doe",
  "title": "Looking for a roommate",
  "description": "Need a roommate for spring semester...",
  "images": ["url1", "url2"],
  "tag": "ACCOMMODATION"
}
```

### Vote on Post
```json
POST /posts/:id/vote
{
  "user_id": "uuid",
  "vote_type": "UP"
}
```

**Vote Logic:**
- Same vote type → Remove vote (toggle off)
- Different vote type → Flip vote
- No existing vote → Add new vote

### Add Comment
```json
POST /posts/:id/comments
{
  "author_id": "uuid",
  "author_name": "Jane Smith",
  "content": "Great post! I'm interested."
}
```

## 🏷️ Valid Tags

- `QUERY` - Questions and inquiries
- `ACCOMMODATION` - Housing and roommate posts
- `JOB_POSTING` - Job opportunities
- `LOST_AND_FOUND` - Lost and found items
- `GENERAL` - General announcements

## 🛠️ Tech Stack

- **Framework**: Express.js
- **Database**: PostgreSQL (Aiven)
- **Libraries**: pg (connection pool), dotenv, cors, uuid

## 🔐 Environment Variables

```env
DB_HOST=your_aiven_host
DB_PORT=16231
DB_USER=avnadmin
DB_PASSWORD=your_password
DB_NAME=newsbox_db
PORT=3004
NODE_ENV=development
CORS_ORIGIN=*
```

## 📊 Database Schema

### Tables
- `posts` - Post data with tags and metadata
- `comments` - Comments on posts
- `post_votes` - User votes on posts
- `comment_votes` - User votes on comments

### Constraints
- Unique constraint: One vote per user per post/comment
- Foreign keys with CASCADE delete
- Check constraints on vote types and tags

## 🚀 Integration

### Gateway Route (Add to gateway/server.js)
```javascript
app.use('/api/newsbox', createProxyMiddleware({
  target: 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: { '^/api/newsbox': '' }
}));
```

## 📞 Support

For issues or questions, contact the EduSync development team.

---

**Version**: 1.0.0  
**Port**: 3004  
**Service**: NewsBox Community Feed
