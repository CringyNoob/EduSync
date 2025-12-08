import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse DATABASE_URL to build proper config
const buildConfig = () => {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error('DATABASE_URL is not set');
  const url = String(raw).trim().replace(/^"|"$/g, '');

  try {
    const u = new URL(url);
    const requiresSSL = !/localhost|127\.0\.0\.1/.test(url);
    return {
      user: u.username,
      password: String(u.password || ''),
      host: u.hostname,
      port: Number(u.port || 5432),
      database: u.pathname.replace(/^\//, '') || 'postgres',
      ssl: requiresSSL ? { rejectUnauthorized: false } : false,
    };
  } catch {
    return { connectionString: url };
  }
};

const pool = new Pool(buildConfig());

async function runMigration() {
  try {
    console.log('🔄 Running migrations...');
    
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    
    for (const file of files) {
      console.log(`  📄 Running ${file}...`);
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
      await pool.query(migrationSQL);
      console.log(`  ✅ ${file} completed`);
    }
    
    console.log('✅ All migrations completed successfully');
    
    // Verify sessions table exists
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('sessions', 'user_sessions');
    `);
    
    console.log('📋 Session tables found:', result.rows.map(r => r.table_name).join(', ') || 'none');
    
    // Check sessions columns
    if (result.rows.some(r => r.table_name === 'sessions')) {
      const cols = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='sessions' 
        ORDER BY ordinal_position;
      `);
      console.log('📋 Sessions columns:', cols.rows.map(r => r.column_name).join(', '));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
