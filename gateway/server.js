const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = 8000;

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 1. CORS Setup: Allow your Frontend (Port 5173) to talk to this Gateway
app.use(cors({
    origin: 'http://localhost:5173', // Your React Frontend URL
    credentials: true
}));

// 2. Health Check (To test Gateway itself)
app.get('/', (req, res) => {
    res.send('Gateway is Running');
});

// IMPORTANT: Proxy middleware MUST come BEFORE body parsers
// The proxy needs access to the raw request stream

// 3. Proxy Configuration: Route /api/auth -> Auth Service (Port 3001)
app.use('/api/auth', createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': '/auth',
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log('→ Proxying to Auth Service:', req.method, req.url);
    },
    onError: (err, req, res) => {
        console.error('❌ Auth Proxy Error:', err.message);
        res.status(500).json({ error: 'Could not reach Auth Service' });
    },
}));

// 2. Marketplace Proxy
app.use('/api/market', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: {
        '^/api/market': '/',
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log('→ Proxying to Marketplace Service:', req.method, req.url);
    },
    onError: (err, req, res) => {
        console.error('❌ Marketplace Proxy Error:', err.message);
        res.status(500).json({ error: 'Could not reach Marketplace Service' });
    },
}));

// 3. RentHub Proxy
app.use('/api/renthub', createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: {
        '^/api/renthub': '/',
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log('→ Proxying to RentHub Service:', req.method, req.url);
    },
    onError: (err, req, res) => {
        console.error('❌ RentHub Proxy Error:', err.message);
        res.status(500).json({ error: 'Could not reach RentHub Service' });
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

app.listen(PORT, () => {
    console.log(`🚀 Gateway running on http://localhost:${PORT}`);
});