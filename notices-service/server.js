// notices-service/server.js
// EduSync Notices Scraper Service - Port 3005
// Scrapes notices from UIU website on startup and caches them

const express = require('express');
const cors = require('cors');
const noticesRoutes = require('./src/routes/noticesRoutes');
const { scrapeAllNotices, getNoticesCache } = require('./src/scraper/noticeScraper');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`[Notices Service] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/', noticesRoutes);

// Health check
app.get('/health', (req, res) => {
    const cache = getNoticesCache();
    res.json({
        status: 'OK',
        service: 'Notices Scraper Service',
        port: PORT,
        noticesCount: cache.notices.length,
        lastScraped: cache.lastScraped,
        source: 'https://www.uiu.ac.bd/notice/'
    });
});

// Start server and scrape notices on startup
app.listen(PORT, async () => {
    console.log(`\n========================================`);
    console.log(`  NOTICES SERVICE`);
    console.log(`  Port: ${PORT}`);
    console.log(`  Health: http://localhost:${PORT}/health`);
    console.log(`========================================\n`);
    
    console.log('Scraping notices from UIU website...');
    try {
        const notices = await scrapeAllNotices();
        console.log(`Successfully scraped ${notices.length} notices from last 3 months`);
    } catch (error) {
        console.error('Failed to scrape notices on startup:', error.message);
    }
});
