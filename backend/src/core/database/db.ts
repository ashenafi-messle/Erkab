import { Pool, PoolClient } from 'pg';
import { env } from '../../config/env';
import { logger } from '../logging/logger';
import { localQuery, localQueryOne, localTransaction } from './localFallback';

export const pool = new Pool({
  connectionString: env.DATABASE_URL || env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 10s connection timeout for Neon serverless wake-up
});

let isPostgresHealthy = false;

pool.on('error', (err) => {
  logger.warn({ err: err.message }, 'Remote database pool encountered an error.');
  isPostgresHealthy = false;
});

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  // Always attempt primary PostgreSQL first if DATABASE_URL is configured
  if (env.DATABASE_URL) {
    try {
      const res = await pool.query(text, params);
      isPostgresHealthy = true;
      return res.rows;
    } catch (err: any) {
      logger.warn({ err: err.message }, 'PostgreSQL query failed, resiliently falling back to local storage.');
      isPostgresHealthy = false;
    }
  }

  // Resilient fallback query
  return localQuery<T>(text, params);
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  if (env.DATABASE_URL) {
    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      isPostgresHealthy = true;
      return result;
    } catch (err: any) {
      if (client) {
        try {
          await client.query('ROLLBACK');
        } catch {}
      }
      logger.warn({ err: err.message }, 'PostgreSQL transaction failed, resiliently falling back to local storage transaction.');
      isPostgresHealthy = false;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  // Resilient local storage transaction
  return localTransaction<T>(callback);
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const res = await pool.query('SELECT 1 as health');
    isPostgresHealthy = res.rows.length > 0 && res.rows[0].health === 1;
    return isPostgresHealthy;
  } catch (err: any) {
    isPostgresHealthy = false;
    logger.warn({ err: err.message }, 'Remote database check failed. Operating with resilient local fallback.');
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await pool.end();
  } catch {}
}
