/**
 * PostgresClient
 *
 * Layer: Infrastructure
 * Responsibility: Manages the PostgreSQL connection pool.
 * All I/O configuration (env vars, pool settings) lives here.
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

export class PostgresClient {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env['POSTGRES_HOST'] ?? 'localhost',
      port: parseInt(process.env['POSTGRES_PORT'] ?? '5432', 10),
      database: process.env['POSTGRES_DB'] ?? 'habit_tracker',
      user: process.env['POSTGRES_USER'] ?? 'postgres',
      password: process.env['POSTGRES_PASSWORD'] ?? 'postgres',
      max: parseInt(process.env['PG_POOL_MAX'] ?? '10', 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    this.pool.on('error', (err) => {
      // Pool-level errors — log and let the process decide
      process.stderr.write(`[PostgresClient] Pool error: ${err.message}\n`);
    });
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(sql, params);
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  /** Execute a callback inside a transaction; auto-rollback on error. */
  async withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
