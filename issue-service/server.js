// server.js
// Issue Service - Port 3007
// Campus Issue Reporting and Tracking System
const express = require('express');
const issueRoutes = require('./src/routes/issueRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3007;

// ==================== MIDDLEWARE ====================

// CORS is handled by API Gateway (port 8000)
// No CORS configuration needed here to avoid duplicate headers

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ==================== ROUTES ====================

// Mount all issue routes at root
app.use('/', issueRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to Issue Reporting Service API',
        version: '1.0.0',
        port: PORT,
        health: '/health'
    });
});

// ==================== ERROR HANDLING ====================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Global Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`🚨 Issue Service running on port ${PORT}`);
    console.log(`📋 Issues API: http://localhost:${PORT}/issues`);
    console.log(`📊 Admin Stats: http://localhost:${PORT}/admin/stats`);
});
