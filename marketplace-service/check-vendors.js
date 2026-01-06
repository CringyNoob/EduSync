// Test script to check all vendors and their is_active status
require('dotenv').config();
const db = require('./src/config/db');

async function checkVendors() {
    try {
        console.log('Checking all vendors in database...\n');
        
        // Get ALL vendors
        const allQuery = `
            SELECT id, name, type, is_active, created_at 
            FROM vendors 
            ORDER BY type, name
        `;
        const allResult = await db.query(allQuery);
        
        console.log(`Total vendors in database: ${allResult.rows.length}\n`);
        
        // Group by type
        const startups = allResult.rows.filter(v => v.type === 'STARTUP');
        const foodVendors = allResult.rows.filter(v => v.type === 'FOOD_VENDOR');
        
        console.log('=== STARTUPS ===');
        startups.forEach((row, index) => {
            console.log(`${index + 1}. ${row.name}`);
            console.log(`   ID: ${row.id}`);
            console.log(`   Active: ${row.is_active ? '✅ YES' : '❌ NO'}`);
            console.log(`   Created: ${row.created_at}`);
            console.log('');
        });
        
        console.log('\n=== FOOD VENDORS ===');
        foodVendors.forEach((row, index) => {
            console.log(`${index + 1}. ${row.name}`);
            console.log(`   ID: ${row.id}`);
            console.log(`   Active: ${row.is_active ? '✅ YES' : '❌ NO'}`);
            console.log(`   Created: ${row.created_at}`);
            console.log('');
        });
        
        // Count by active status
        const activeCount = allResult.rows.filter(v => v.is_active).length;
        const inactiveCount = allResult.rows.filter(v => !v.is_active).length;
        
        console.log('\n=== SUMMARY ===');
        console.log(`Total Vendors: ${allResult.rows.length}`);
        console.log(`  - Startups: ${startups.length} (Active: ${startups.filter(v => v.is_active).length}, Inactive: ${startups.filter(v => !v.is_active).length})`);
        console.log(`  - Food Vendors: ${foodVendors.length} (Active: ${foodVendors.filter(v => v.is_active).length}, Inactive: ${foodVendors.filter(v => !v.is_active).length})`);
        console.log(`\nActive: ${activeCount}`);
        console.log(`Inactive: ${inactiveCount}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkVendors();
