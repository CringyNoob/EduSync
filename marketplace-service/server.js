// server.js
// Marketplace Service - Port 3002
// Hybrid Architecture: Shop-First (Startups/Food) + Product-First (Pre-owned)
const express = require('express');
const cors = require('cors');
const marketRoutes = require('./src/routes/marketRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors());           // Enable CORS for frontend/gateway communication
app.use(express.json({ limit: '50mb' }));   // Parse JSON request bodies with 50MB limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Parse URL-encoded bodies

// ========================================
// ROUTES
// ========================================
// Mount at root - Gateway handles the /api/marketplace prefix
app.use('/', marketRoutes);

// ========================================
// HEALTH CHECK
// ========================================
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Marketplace Service Running',
        port: PORT,
        architecture: {
            shopFirst: ['STARTUP', 'FOOD_VENDOR'],
            productFirst: ['PREOWNED']
        }
    });
});

// ========================================
// ERROR HANDLING
// ========================================

// 404 Handler - Route not found
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

// ========================================
// START SERVER
// ========================================
app.listen(PORT, () => {
    console.log(`🚀 Marketplace Service running on port ${PORT}`);
    console.log(`📦 Vendors API: http://localhost:${PORT}/vendors`);
    console.log(`🛍️  Products API: http://localhost:${PORT}/products/:id`);
    console.log(`🏷️  Preowned API: http://localhost:${PORT}/preowned`);
});
