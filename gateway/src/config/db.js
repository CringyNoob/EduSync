// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false,
    },
});

pool.on('connect', () => {
    console.log('✅ Gateway DB Connected (for Chat)');
});

pool.on('error', (err) => {
    console.error('❌ Gateway DB Connection Error:', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool,
};
