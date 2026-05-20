import { Pool } from 'pg';
import { env } from '../config/env';

// Single Pool instance shared across the entire app.
// pg's Pool manages connection lifecycle automatically —
// do NOT create a new Pool per request.
export const db = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,              // max connections in pool
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

// Verify connectivity on startup (called from index.ts)
export async function connectDB(): Promise<void> {
  const client = await db.connect();
  try {
    await client.query('SELECT 1');
    console.log('✅  Database connected');
  } finally {
    client.release();
  }
}
