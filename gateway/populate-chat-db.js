const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
});

async function populateDB() {
    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connected!');

        const sqlFile = path.join(__dirname, 'chat-schema.sql');
        console.log(`📖 Reading SQL file: ${sqlFile}`);
        const sql = fs.readFileSync(sqlFile, 'utf8');

        console.log('🚀 Executing SQL...');
        await client.query(sql);

        console.log('✅ Chat tables created successfully!');
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await client.end();
        console.log('👋 Connection closed.');
    }
}

populateDB();
