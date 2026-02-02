// server.js
// Chat Service Entry Point
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

// Import modules
const db = require('./src/config/db');
const chatRoutes = require('./src/routes/chatRoutes');
const batchChatRoutes = require('./src/routes/batchChatRoutes');
const { initializeSocket } = require('./src/socket/socketHandler');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Port configuration
const PORT = process.env.PORT || 3006;

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

// Initialize Socket.io with CORS
const io = new Server(server, {
    cors: {
        origin: corsOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// =============================================
// MIDDLEWARE
// =============================================

// CORS for REST API
app.use(cors({
    origin: corsOrigins,
    credentials: true
}));

// Parse JSON bodies
app.use(express.json({ limit: '5mb' }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
    next();
});

// =============================================
// ROUTES
// =============================================

// Health check
app.get('/', (req, res) => {
    res.json({
        service: 'EduSync Chat Service',
        status: 'running',
        port: PORT,
        version: '1.0.0',
        features: ['REST API', 'Socket.io Real-time'],
        endpoints: {
            rest: '/api/chat',
            socket: `ws://localhost:${PORT}`
        }
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Mount chat routes at root for gateway proxy compatibility
// Gateway rewrites /api/chat to / so routes need to be at root
app.use('/', chatRoutes);

// Mount batch chat routes
app.use('/batch', batchChatRoutes);

// Also keep /api/chat for direct access (testing without gateway)
app.use('/api/chat', chatRoutes);
app.use('/api/chat/batch', batchChatRoutes);

// =============================================
// SOCKET.IO INITIALIZATION
// =============================================

// Initialize Socket.io handlers
initializeSocket(io);

// Make io accessible to routes if needed
app.set('io', io);

// =============================================
// ERROR HANDLING
// =============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// =============================================
// SERVER STARTUP
// =============================================

async function startServer() {
    try {
        // Test database connection
        const dbConnected = await db.testConnection();
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Server will start but database features may not work.');
        }

        // Start server
        server.listen(PORT, () => {
            console.log('');
            console.log('╔════════════════════════════════════════════════════════╗');
            console.log('║           💬 EDUSYNC CHAT SERVICE                       ║');
            console.log('╠════════════════════════════════════════════════════════╣');
            console.log(`║  🚀 Server:    http://localhost:${PORT}                    ║`);
            console.log(`║  🔌 Socket:    ws://localhost:${PORT}                      ║`);
            console.log(`║  📡 REST API:  http://localhost:${PORT}/api/chat           ║`);
            console.log('╠════════════════════════════════════════════════════════╣');
            console.log('║  Endpoints:                                            ║');
            console.log('║  • POST   /api/chat/init                               ║');
            console.log('║  • GET    /api/chat/my-conversations                   ║');
            console.log('║  • GET    /api/chat/:id/messages                       ║');
            console.log('║  • PUT    /api/chat/:id/archive                        ║');
            console.log('╠════════════════════════════════════════════════════════╣');
            console.log('║  Socket Events:                                        ║');
            console.log('║  • join_room, leave_room                               ║');
            console.log('║  • send_message → receive_message                      ║');
            console.log('║  • typing, mark_read                                   ║');
            console.log('╚════════════════════════════════════════════════════════╝');
            console.log('');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

// Start the server
startServer();

module.exports = { app, server, io };
