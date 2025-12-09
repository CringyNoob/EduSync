const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = 8000;

// 1. CORS Setup: Allow your Frontend (Port 5173) to talk to this Gateway
app.use(cors({
    origin: 'http://localhost:5173', // Your React Frontend URL
    credentials: true
}));

// 2. Health Check (To test Gateway itself)
app.get('/', (req, res) => {
    res.send('Gateway is Running');
});

// 3. Proxy Configuration: Route /api/auth -> Auth Service (Port 3001)
app.use('/api/auth', createProxyMiddleware({
    target: 'http://localhost:3001', // Target Service
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': '/auth', // Rewrites '/api/auth/login' to '/auth/login'
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).send('Proxy Error: Could not reach Auth Service');
    },
}));

// 2. Marketplace Proxy (New)
app.use('/api/market', createProxyMiddleware({
    target: 'http://localhost:3002', // Marketplace Service Port
    changeOrigin: true,
    pathRewrite: {
        '^/api/market': '/', // Rewrites /api/market/vendors -> /vendors
    },
    onError: (err, req, res) => {
        console.error('Market Proxy Error:', err);
        res.status(500).send('Proxy Error: Could not reach Marketplace Service');
    },
}));

app.listen(PORT, () => {
    console.log(`🚀 Gateway running on http://localhost:${PORT}`);
});