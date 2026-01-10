const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool with SSL for Aiven
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'newsbox_db',
    ssl: {
        rejectUnauthorized: false, // Required for Aiven's SSL certificates
    },
    // Pool configuration
    max: 20,                    // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,   // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection not established
});

// Test connection on startup
pool.on('connect', () => {
    console.log('✅ NewsBox Service: Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ NewsBox Service: Unexpected database error:', err);
    process.exit(-1);
});

// Helper function to test database connection
const testConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time');
        console.log(`📡 Database connection verified at: ${result.rows[0].current_time}`);
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Failed to connect to database:', error.message);
        return false;
    }
};

module.exports = { pool, testConnection };
