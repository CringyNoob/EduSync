const { pool } = require('./db');

/**
 * Detect the current schema version by checking which columns exist
 * Returns an object with schema capabilities
 */
let schemaCache = null;

const detectSchema = async () => {
    if (schemaCache) return schemaCache;
    
    const client = await pool.connect();
    try {
        // Check if categories table exists
        const categoriesCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'categories'
            ) as exists
        `);
        
        // Check if posts has category_id column
        const categoryIdCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_name = 'posts' AND column_name = 'category_id'
            ) as exists
        `);
        
        // Check if posts has is_official column
        const isOfficialCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_name = 'posts' AND column_name = 'is_official'
            ) as exists
        `);
        
        // Check if posts has status column
        const statusCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_name = 'posts' AND column_name = 'status'
            ) as exists
        `);
        
        // Check if posts has is_pinned column
        const isPinnedCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_name = 'posts' AND column_name = 'is_pinned'
            ) as exists
        `);
        
        schemaCache = {
            hasCategories: categoriesCheck.rows[0].exists,
            hasCategoryId: categoryIdCheck.rows[0].exists,
            hasIsOfficial: isOfficialCheck.rows[0].exists,
            hasStatus: statusCheck.rows[0].exists,
            hasIsPinned: isPinnedCheck.rows[0].exists,
            isNewSchema: categoriesCheck.rows[0].exists && categoryIdCheck.rows[0].exists
        };
        
        console.log('📊 Schema Detection:', schemaCache);
        return schemaCache;
        
    } catch (error) {
        console.error('Error detecting schema:', error);
        // Default to legacy schema
        return {
            hasCategories: false,
            hasCategoryId: false,
            hasIsOfficial: false,
            hasStatus: false,
            hasIsPinned: false,
            isNewSchema: false
        };
    } finally {
        client.release();
    }
};

/**
 * Clear the schema cache (call after migration)
 */
const clearSchemaCache = () => {
    schemaCache = null;
};

module.exports = { detectSchema, clearSchemaCache };
