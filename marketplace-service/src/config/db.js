// src/config/db.js
// PostgreSQL Connection Pool for Marketplace Service
const { Pool } = require('pg');
require('dotenv').config();

// Create the connection pool using environment variables
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // CRITICAL: Required for Aiven cloud PostgreSQL
    ssl: {
        rejectUnauthorized: false,
    },
    // Connection pool settings to prevent exhaustion
    max: 10, // Maximum number of clients in the pool (reduced for shared DB)
    min: 2, // Minimum number of clients
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000, // Return error after 5s if connection fails
    allowExitOnIdle: true, // Allow pool to exit when all clients are idle
});

// Log successful connection
pool.on('connect', () => {
    console.log('✅ Marketplace DB connected successfully!');
});

// Handle connection errors
pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
    // Don't exit immediately, let the app handle it
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Closing database pool...');
    await pool.end();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Closing database pool...');
    await pool.end();
    process.exit(0);
});

// Export query helper function
module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
    pool
};
