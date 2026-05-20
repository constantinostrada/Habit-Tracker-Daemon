/**
 * Database Migration Runner
 *
 * Layer: Infrastructure
 * Responsibility: Applies SQL migration files in order.
 * Run with: npm run migrate:dev
 */

import * as fs from 'fs';
import * as path from 'path';
import { PostgresClient } from './PostgresClient';

const MIGRATIONS_DIR = path.resolve(__dirname, 'migrations');

async function runMigrations(): Promise<void> {
  const db = new PostgresClient();

  try {
    // Ensure the migrations tracking table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL PRIMARY KEY,
        filename   TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await db.query<{ filename: string }>(
        'SELECT filename FROM _migrations WHERE filename = $1',
        [file],
      );

      if (rows.length > 0) {
        process.stdout.write(`[migrate] Skipping (already applied): ${file}\n`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      await db.withTransaction(async (client) => {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
      });

      process.stdout.write(`[migrate] Applied: ${file}\n`);
    }

    process.stdout.write('[migrate] All migrations applied successfully.\n');
  } finally {
    await db.close();
  }
}

runMigrations().catch((err) => {
  process.stderr.write(`[migrate] Fatal: ${String(err)}\n`);
  process.exit(1);
});
