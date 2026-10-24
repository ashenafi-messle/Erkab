
import { Pool, PoolClient } from 'pg';
import { env } from '../../config/env';
import { logger } from '../logging/logger';
import {
  localQuery,
  localTransaction,
} from './localFallback';

const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({
  connectionString: env.DATABASE_URL || env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

let isPostgresHealthy = false;

pool.on('error', (err) => {
  logger.warn(
    { err: err.message },
    'Remote database pool encountered an error.',
  );
  isPostgresHealthy = false;
});

/**
 * Execute a PostgreSQL query.
 *
 * Production must never silently switch to local storage.
 * Local fallback is permitted only outside production.
 */
export async function query<T = any>(
  text: string,
  params?: any[],
): Promise<T[]> {
  if (!env.DATABASE_URL) {
    isPostgresHealthy = false;

    if (isProduction) {
      throw new Error(
        'DATABASE_URL is required for production database queries.',
      );
    }

    return localQuery<T>(text, params);
  }

  try {
    const result = await pool.query(text, params);
    isPostgresHealthy = true;
    return result.rows;
  } catch (err: any) {
    isPostgresHealthy = false;

    logger.warn(
      { err: err instanceof Error ? err.message : String(err) },
      'PostgreSQL query failed.',
    );

    if (isProduction) {
      throw err;
    }

    logger.warn(
      'Using local storage fallback outside production.',
    );

    return localQuery<T>(text, params);
  }
}

export async function queryOne<T = any>(
  text: string,
  params?: any[],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute a transaction.
 *
 * Failed production transactions must propagate their errors.
 * They must never be replayed against local storage.
 */
export async function transaction<T>(
  callback: (client: any) => Promise<T>,
): Promise<T> {
  if (!env.DATABASE_URL) {
    isPostgresHealthy = false;

    if (isProduction) {
      throw new Error(
        'DATABASE_URL is required for production transactions.',
      );
    }

    return localTransaction<T>(callback);
  }

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
      } catch (rollbackError: any) {
        logger.warn(
          {
            err: rollbackError instanceof Error
              ? rollbackError.message
              : String(rollbackError),
          },
          'PostgreSQL transaction rollback failed.',
        );
      }
    }

    isPostgresHealthy = false;

    logger.warn(
      { err: err instanceof Error ? err.message : String(err) },
      'PostgreSQL transaction failed.',
    );

    if (isProduction) {
      throw err;
    }

    logger.warn(
      'Using local transaction fallback outside production.',
    );

    return localTransaction<T>(callback);
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Report the actual PostgreSQL health.
 * Local storage does not count as a healthy production database.
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  if (!env.DATABASE_URL) {
    isPostgresHealthy = false;

    logger.warn(
      'DATABASE_URL is missing; PostgreSQL health check failed.',
    );

    return false;
  }

  try {
    const result = await pool.query('SELECT 1 AS health');

    isPostgresHealthy =
      result.rows.length > 0 &&
      Number(result.rows[0].health) === 1;

    return isPostgresHealthy;
  } catch (err: any) {
    isPostgresHealthy = false;

    logger.warn(
      { err: err instanceof Error ? err.message : String(err) },
      'PostgreSQL health check failed.',
    );

    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await pool.end();
  } catch (err: any) {
    logger.warn(
      { err: err instanceof Error ? err.message : String(err) },
      'Database pool shutdown encountered an error.',
    );
  }
}
