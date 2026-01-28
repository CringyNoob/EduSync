// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Create the connection Pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false, // Required for Aiven
    },
});

// Add a listener to check if we successfully connected
pool.on('connect', () => {
    console.log('✅ Issue DB connected successfully!');
});

pool.on('error', (err) => {
    console.error('❌ Issue DB connection error:', err);
    process.exit(-1);
});

// Export helper functions
module.exports = {
    query: (text, params) => pool.query(text, params),
    connect: () => pool.connect(),
    pool: pool,
};
