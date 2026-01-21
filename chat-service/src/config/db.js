// src/config/db.js
// PostgreSQL Database Connection for Chat Service
const { Pool } = require('pg');
require('dotenv').config();

/**
 * Database Connection Pool
 * Connects to chat_db on Aiven PostgreSQL
 * Supports both individual credentials (DB_HOST, etc.) and DATABASE_URL
 */

// Build connection config
let poolConfig;

if (process.env.DATABASE_URL) {
    // Use connection string if provided
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    };
} else {
    // Use individual credentials (like other EduSync services)
    poolConfig = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'chat_db',
        ssl: {
            rejectUnauthorized: false
        }
    };
}

// Add pool settings
poolConfig.max = 20;
poolConfig.idleTimeoutMillis = 30000;
poolConfig.connectionTimeoutMillis = 10000;

const pool = new Pool(poolConfig);

// Test connection on startup
pool.on('connect', () => {
    console.log('✅ Connected to chat_db database');
});

pool.on('error', (err) => {
    console.error('❌ Database pool error:', err.message);
});

/**
 * Execute a query with optional parameters
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
async function query(text, params) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        // Log slow queries (> 100ms)
        if (duration > 100) {
            console.log(`⚠️ Slow query (${duration}ms):`, text.substring(0, 50));
        }
        
        return result;
    } catch (error) {
        console.error('❌ Query error:', error.message);
        throw error;
    }
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise} Pool client
 */
async function getClient() {
    return await pool.connect();
}

/**
 * Test database connection
 * @returns {Promise<boolean>}
 */
async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW() as now');
        console.log('✅ Database connection test successful:', result.rows[0].now);
        return true;
    } catch (error) {
        console.error('❌ Database connection test failed:', error.message);
        return false;
    }
}

module.exports = {
    pool,
    query,
    getClient,
    testConnection
};
