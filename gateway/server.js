const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;

// 0. File Logging (Diagnostic mechanism)
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

// 1. CORS Setup: Allow both localhost and 127.0.0.1
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));

// 2. Health Check
app.get('/', (req, res) => {
    res.send('Gateway is Running');
});

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

app.use(express.json());
app.listen(PORT, () => {
    log(`🚀 Gateway running on http://localhost:${PORT}`);
});
