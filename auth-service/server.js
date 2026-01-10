// server.js
const express = require('express');
const cors = require('cors');
const db = require('./src/config/db'); // Import the db connection
const authRoutes = require('./src/routes/authRoutes'); // Import auth routes
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const app = express();

// 0. File Logging
const logFile = path.join(__dirname, 'auth-service.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function log(msg) {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] ${msg}\n`;
    console.log(msg);
    logStream.write(formatted);
}

app.use(express.json()); // Allow JSON data
app.use(cors());         // Allow Frontend to talk to us

// --- THE SPY LOGGER ---
app.use((req, res, next) => {
    log(`Received Request: ${req.method} ${req.url}`);
    next();
});

// --- AUTH ROUTES ---
app.use('/', authRoutes);

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
    console.log(`📧 Auth API: http://localhost:${PORT}/api/auth`);
});