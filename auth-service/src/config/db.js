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
});

// 2. Add a listener to check if we successfully connected
pool.on('connect', () => {
    console.log('✅ Database connected successfully!');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
    process.exit(-1);
});

// 3. Export a helper function to run queries
module.exports = {
    query: (text, params) => pool.query(text, params),
};