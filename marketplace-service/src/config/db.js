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
});

// Log successful connection
pool.on('connect', () => {
    console.log('✅ Marketplace DB connected successfully!');
});

// Handle connection errors
pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
    process.exit(-1);
});

// Export query helper function
module.exports = {
    query: (text, params) => pool.query(text, params),
};
