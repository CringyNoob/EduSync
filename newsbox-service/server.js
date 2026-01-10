const express = require('express');
const cors = require('cors');
require('dotenv').config();

const newsRoutes = require('./src/routes/newsRoutes');
const { testConnection } = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 3004;

// ==================== MIDDLEWARE ====================

// CORS Configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Mount all news routes at root
app.use('/', newsRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to NewsBox Service API',
        version: '1.0.0',
        port: PORT,
        documentation: '/info',
        health: '/health'
    });
});

// ==================== ERROR HANDLING ====================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
        availableEndpoints: '/info'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// ==================== SERVER STARTUP ====================

const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('❌ Cannot start server: Database connection failed');
            process.exit(1);
        }

        app.listen(PORT, () => {
            console.log('═══════════════════════════════════════════════════');
            console.log('   📰 NEWSBOX SERVICE STARTED SUCCESSFULLY');
            console.log('═══════════════════════════════════════════════════');
            console.log(`   🌐 Server:      http://localhost:${PORT}`);
            console.log(`   📋 API Info:    http://localhost:${PORT}/info`);
            console.log(`   💚 Health:      http://localhost:${PORT}/health`);
            console.log(`   🏷️  Valid Tags:  QUERY, ACCOMMODATION, JOB_POSTING,`);
            console.log(`                   LOST_AND_FOUND, GENERAL`);
            console.log('═══════════════════════════════════════════════════');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
