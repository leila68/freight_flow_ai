import fs from 'fs';
import path from 'path';
import { pool, connectDB } from './client'

// Simple migration runner — reads every .sql file from the
// migrations/ directory in alphabetical order and executes them.
// Idempotent: uses IF NOT EXISTS / ON CONFLICT throughout.
async function runMigrations(): Promise<void> {
  await connectDB();

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort(); // alphabetical = chronological (001_, 002_, ...)

  console.log(`🗂️  Running ${files.length} migration(s)...\n`);

  // for (const file of files) {
  //   const filePath = path.join(migrationsDir, file);
  //   const sql = fs.readFileSync(filePath, 'utf-8');
  //   console.log(`  ▶ ${file}`);
  //   await pool.query(sql);
  //   console.log(`  ✅ ${file} complete`);
  // }
  for (const file of files) {
  const sql = fs.readFileSync(
    path.join(migrationsDir, file),
    'utf-8'
  );

  console.log(`▶ ${file}`);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    console.log(`✅ ${file} complete`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

  console.log('\n✅  All migrations complete');
  await pool.end();
}

runMigrations().catch((err) => {
  console.error('❌  Migration failed:', err.message);
  process.exit(1);
});
