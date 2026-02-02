const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to rent_db database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on database client', err);
  process.exit(-1);
});

module.exports = pool;
