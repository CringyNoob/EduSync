// server.js
const express = require('express');
const cors = require('cors');
const db = require('./src/config/db'); // Import the db connection
const authRoutes = require('./src/routes/authRoutes'); // Import auth routes
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');
require('dotenv').config();

const app = express();

// --- SECURITY & BODY PARSING ---
app.use(express.json({ limit: '10mb' })); // Allow JSON data with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- CORS CONFIGURATION ---
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- RATE LIMITING ---
// Apply general rate limiting to all routes
app.use(apiLimiter);

// --- REQUEST LOGGER ---
app.use((req, res, next) => {
    console.log(`[Auth Service] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// --- ROOT INFO ROUTE ---
app.get('/', (req, res) => {
    res.json({
        service: 'EduSync Auth Service',
        version: '1.0.0',
        status: 'running',
        port: PORT,
        message: 'Auth service is running. Use /api/auth endpoints or check /health',
        endpoints: {
            health: '/health',
            api: '/api/auth'
        }
    });
});

// --- HEALTH CHECK ROUTE ---
// Place before auth routes for quick access
app.get('/health', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({
            status: 'OK',
            service: 'auth-service',
            message: 'Database is connected!',
            timestamp: new Date().toISOString(),
            db_time: result.rows[0].now
        });
    } catch (err) {
        console.error('❌ Health check failed:', err);
        res.status(500).json({ 
            status: 'ERROR',
            service: 'auth-service',
            error: 'Database connection failed' 
        });
    }
});

// --- AUTH ROUTES ---
// Mount all auth routes under /api/auth prefix
app.use('/api/auth', authRoutes);

// --- 404 HANDLER ---
// Must be after all routes
app.use(notFoundHandler);

// --- ERROR HANDLER ---
// Must be last middleware
app.use(errorHandler);

// --- START SERVER ---
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 AUTH SERVICE STARTED');
    console.log('='.repeat(50));
    console.log(`📍 Port:        ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health:      http://localhost:${PORT}/health`);
    console.log(`📧 Auth API:    http://localhost:${PORT}/api/auth`);
    console.log('='.repeat(50) + '\n');
});

// --- GRACEFUL SHUTDOWN ---
process.on('SIGTERM', () => {
    console.log('\n⚠️  SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n⚠️  SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});