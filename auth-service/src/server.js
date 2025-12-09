// server.js
const express = require('express');
const cors = require('cors');
const db = require('./src/config/db'); // Import the db connection
require('dotenv').config();

const app = express();
app.use(express.json()); // Allow JSON data
app.use(cors());         // Allow Frontend to talk to us

// --- TEST ROUTE ---
// Go to http://localhost:3001/health to see if it works
app.get('/health', async (req, res) => {
    try {
        // Run a simple query to ask the DB "What time is it?"
        const result = await db.query('SELECT NOW()');
        res.json({
            status: 'OK',
            message: 'Database is connected!',
            db_time: result.rows[0].now
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Test URL: http://localhost:${PORT}/health`);
});