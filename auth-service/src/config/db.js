// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

// 1. Create the connection "Pool" (The manager of connections)
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false, // REQUIRED for Aiven to work easily
    },
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return error after 2s if connection fails
});

// 2. Add a listener to check if we successfully connected
pool.on('connect', () => {
    console.log('✅ Database connected successfully!');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
    process.exit(-1);
});

// 3. Export helper functions to run queries
module.exports = {
    /**
     * Execute a query using pool
     * @param {string} text - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise} Query result
     */
    query: (text, params) => pool.query(text, params),
    
    /**
     * Get a client from pool (for transactions)
     * Remember to call client.release() when done!
     * @returns {Promise<PoolClient>}
     */
    getClient: () => pool.connect(),
    
    /**
     * Get the pool instance directly
     */
    pool
};