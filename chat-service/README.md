# 💬 EduSync Chat Service

Real-time messaging service using Express, PostgreSQL, and Socket.io.

## Features

- **Context-Based Chats**: Link conversations to Products, Orders, Rentals
- **Archival System**: Completed deals become read-only
- **Real-time Messaging**: Socket.io for instant message delivery
- **Security**: JWT authentication for both REST and WebSocket

## Quick Start

### 1. Install Dependencies

```bash
cd chat-service
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string for `chat_db`
- `JWT_SECRET` - Must match auth-service (for token verification)
- `PORT` - Default: 3006

### 3. Setup Database

Run the schema in your PostgreSQL database:

```sql
-- Connect to your PostgreSQL server and create the database
CREATE DATABASE chat_db;

-- Then run the schema
\c chat_db
\i database-schema.sql
```

### 4. Start Service

```bash
npm start     # Production
npm run dev   # Development with nodemon
```

## API Endpoints

### REST API (`/api/chat`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/init` | Create or get existing conversation |
| GET | `/my-conversations` | List user's conversations |
| GET | `/:id` | Get conversation details |
| GET | `/:id/messages` | Get message history |
| PUT | `/:id/archive` | Archive conversation |

### Socket.io Events

#### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `join_room` | `{ conversationId }` | Join a conversation room |
| `leave_room` | `{ conversationId }` | Leave a conversation room |
| `send_message` | `{ conversationId, content }` | Send a message |
| `typing` | `{ conversationId, isTyping }` | Typing indicator |
| `mark_read` | `{ conversationId, messageIds? }` | Mark messages as read |

#### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `room_joined` | `{ conversationId, status }` | Confirmation of room join |
| `receive_message` | `{ id, senderId, content, ... }` | New message received |
| `user_typing` | `{ userId, isTyping }` | Someone is typing |
| `user_online` | `{ userId }` | User came online |
| `user_offline` | `{ userId }` | User went offline |
| `messages_read` | `{ readBy }` | Messages marked as read |
| `error` | `{ type, message }` | Error occurred |

## Usage Examples

### REST API (Frontend)

```javascript
import chatService from './services/chatService';

// Initiate chat about a product
const { conversation } = await chatService.initiateChat({
  targetUserId: 'vendor-uuid',
  contextType: 'PRODUCT',
  contextId: 'product-uuid',
  title: 'Question about iPhone 13'
});

// Get messages
const { messages } = await chatService.getMessages(conversation.id);
```

### Socket.io (Frontend)

```javascript
import chatService from './services/chatService';

// Connect with JWT token
chatService.connect(localStorage.getItem('edusync_token'));

// Join conversation room
chatService.joinRoom(conversationId);

// Listen for messages
chatService.on('receive_message', (message) => {
  console.log('New message:', message);
});

// Send message
chatService.sendMessage(conversationId, 'Hello!');

// Cleanup
chatService.leaveRoom(conversationId);
chatService.disconnect();
```

## Security

### Authentication Flow

1. **REST API**: Bearer token in `Authorization` header
2. **Socket.io**: Token in handshake auth object
3. **Room Join**: Verify user is participant before allowing

### Archival Rules

- Archived conversations are **read-only**
- `send_message` on archived chat returns error
- Archival typically triggered when deal completes

## Database Schema

```
conversations
├── id (UUID)
├── participants (UUID[])  -- Array of user IDs
├── context_type (ENUM)    -- PRODUCT, ORDER, RENTAL, PREOWNED, GENERAL
├── context_id (UUID)      -- Related entity ID
├── status (ENUM)          -- ACTIVE, ARCHIVED
├── title (VARCHAR)
├── last_message_at (TIMESTAMP)
└── created_at (TIMESTAMP)

messages
├── id (UUID)
├── conversation_id (UUID FK)
├── sender_id (UUID)
├── content (TEXT)
├── message_type (VARCHAR)  -- TEXT, IMAGE, SYSTEM
├── is_read (BOOLEAN)
└── created_at (TIMESTAMP)
```

## Error Handling

Socket errors are emitted with type:
- `INVALID_REQUEST` - Missing required fields
- `ACCESS_DENIED` - Not a participant
- `CHAT_ARCHIVED` - Cannot send to archived chat
- `SERVER_ERROR` - Internal error

## Integration with Other Services

### Marketplace Service
When order is completed:
```javascript
// Call from marketplace-service
await axios.put(`http://localhost:3006/api/chat/${conversationId}/archive`, {}, {
  headers: { Authorization: `Bearer ${serviceToken}` }
});
```

### RentHub Service
When rental transaction completes, archive the chat.

## Port: 3006

The chat service runs on port 3006 by default.

---

**Last Updated:** January 2026
**Maintained By:** EduSync Development Team
