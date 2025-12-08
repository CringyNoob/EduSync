import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Ensure .env is loaded
dotenv.config();

// Build robust pool config to ensure password is a string
const buildConfig = () => {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error('DATABASE_URL is not set');
  // Remove accidental quotes and trim
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
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };
  } catch {
    // Fallback to connectionString
    return {
      connectionString: url,
      ssl: url.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };
  }
};

const pool = new Pool(buildConfig());

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);

export default pool;
