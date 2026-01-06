// Test script to check all preowned listings in database
require('dotenv').config();
const db = require('./src/config/db');

async function checkListings() {
    try {
        console.log('Checking all pre-owned listings in database...\n');
        
        // Get ALL listings (without status filter)
        const allQuery = `
            SELECT id, title, status, category, price, created_at 
            FROM preowned_listings 
            ORDER BY created_at DESC
        `;
        const allResult = await db.query(allQuery);
        
        console.log(`Total listings in database: ${allResult.rows.length}\n`);
        
        allResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.title}`);
            console.log(`   ID: ${row.id}`);
            console.log(`   Status: ${row.status}`);
            console.log(`   Category: ${row.category}`);
            console.log(`   Price: $${row.price}`);
            console.log(`   Created: ${row.created_at}`);
            console.log('');
        });
        
        // Count by status
        const statusQuery = `
            SELECT status, COUNT(*) as count 
            FROM preowned_listings 
            GROUP BY status
        `;
        const statusResult = await db.query(statusQuery);
        
        console.log('\nBreakdown by status:');
        statusResult.rows.forEach(row => {
            console.log(`  ${row.status}: ${row.count}`);
        });
        
        // Get only AVAILABLE
        const availableQuery = `
            SELECT COUNT(*) as count 
            FROM preowned_listings 
            WHERE status = 'AVAILABLE'
        `;
        const availableResult = await db.query(availableQuery);
        console.log(`\nAVAILABLE listings (what API returns): ${availableResult.rows[0].count}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkListings();
