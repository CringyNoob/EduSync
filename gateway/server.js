const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const app = express();
<<<<<<< HEAD
const PORT = 8000;

// 0. File Logging (Diagnostic mechanism)
=======
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const PORT = 8080;

// Import Chat Logic
const chatRoutes = require('./src/routes/chatRoutes');
const chatController = require('./src/controllers/chatController');

// Socket.IO Setup
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Socket.IO Events
io.on('connection', (socket) => {
    log(`🔌 New Client Connected: ${socket.id}`);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        log(`👤 User ${socket.id} joined room: ${roomId}`);
    });

    socket.on('send_message', async (data) => {
        // Broadcast to others immediately for speed
        socket.to(data.roomId).emit('receive_message', data);

        // Save to Database Asynchronously
        try {
            const savedMsg = await chatController.saveMessage(
                data.roomId,
                data.senderId || '00000000-0000-0000-0000-000000000000', // Default UUID if missing
                data.sender,
                data.message
            );
            if (savedMsg) {
                log(`💾 Message saved to DB: ${savedMsg.id}`);
            }
        } catch (err) {
            log(`❌ Failed to save message: ${err.message}`);
        }
    });

    socket.on('disconnect', () => {
        log(`❌ Client Disconnected: ${socket.id}`);
    });
});

// 0. File Logging
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
const logFile = path.join(__dirname, 'gateway.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(msg) {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] ${msg}\n`;
    console.log(msg);
    logStream.write(formatted);
}

// Logging middleware
app.use((req, res, next) => {
    log(`${req.method} ${req.url}`);
    next();
});

<<<<<<< HEAD
// 1. CORS Setup: Allow both localhost and 127.0.0.1
=======
// 1. CORS Setup
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));

// 2. Health Check
app.get('/', (req, res) => {
    res.send('Gateway is Running');
});

<<<<<<< HEAD
=======
// --- CHAT API ROUTES ---
app.use('/api/chat', chatRoutes);

>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
// 3. Proxy Configuration
// Auth Service (Port 3001)
app.use('/api/auth', createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': '',
    },
    onProxyReq: (proxyReq, req, res) => {
        log(`→ Proxying to Auth Service: ${req.method} ${req.url}`);
    },
    onError: (err, req, res) => {
        log(`❌ Auth Proxy Error: ${err.message}`);
        res.status(500).json({ error: 'Could not reach Auth Service', details: err.message });
    },
}));

// Marketplace Service (Port 3002)
app.use('/api/market', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: {
        '^/api/market': '',
    },
    onProxyReq: (proxyReq, req, res) => {
        log(`→ Proxying to Marketplace Service: ${req.method} ${req.url}`);
    },
    onError: (err, req, res) => {
        log(`❌ Marketplace Proxy Error: ${err.message}`);
        res.status(500).json({ error: 'Could not reach Marketplace Service', details: err.message });
    },
}));

// RentHub Service (Port 3003)
app.use('/api/renthub', createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: {
        '^/api/renthub': '',
    },
    onProxyReq: (proxyReq, req, res) => {
        log(`→ Proxying to RentHub Service: ${req.method} ${req.url}`);
    },
    onError: (err, req, res) => {
        log(`❌ RentHub Proxy Error: ${err.message}`);
        res.status(500).json({ error: 'Could not reach RentHub Service', details: err.message });
    },
}));

// 4. NewsBox Proxy
app.use('/api/newsbox', createProxyMiddleware({
    target: 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: {
        '^/api/newsbox': '/',
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log('→ Proxying to NewsBox Service:', req.method, req.url);
    },
    onError: (err, req, res) => {
        console.error('❌ NewsBox Proxy Error:', err.message);
        res.status(500).json({ error: 'Could not reach NewsBox Service' });
    },
}));

<<<<<<< HEAD
app.listen(PORT, () => {
    log(`🚀 Gateway running on http://localhost:${PORT}`);
=======
server.listen(PORT, () => {
    log(`🚀 Gateway (HTTP + Socket.IO) running on http://localhost:${PORT}`);
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
});
