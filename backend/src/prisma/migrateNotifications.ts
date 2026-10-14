import { pool } from '../core/database/db';
import { logger } from '../core/logging/logger';

export async function ensureNotificationTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "public"."ApplicationNotification" (
        "id" VARCHAR(64) PRIMARY KEY,
        "applicationType" VARCHAR(32) NOT NULL,
        "applicationId" VARCHAR(64) NOT NULL,
        "referenceNumber" VARCHAR(64) NOT NULL,
        "recipientName" VARCHAR(255) NOT NULL,
        "recipientEmail" VARCHAR(255) NOT NULL,
        "decision" VARCHAR(32) NOT NULL,
        "notificationType" VARCHAR(64) NOT NULL,
        "status" VARCHAR(32) NOT NULL DEFAULT 'PENDING',
        "attempts" INTEGER NOT NULL DEFAULT 0,
        "maxAttempts" INTEGER NOT NULL DEFAULT 3,
        "lastAttemptAt" TIMESTAMPTZ,
        "sentAt" TIMESTAMPTZ,
        "errorMessage" TEXT,
        "idempotencyKey" VARCHAR(255) UNIQUE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_app_notification_app" ON "public"."ApplicationNotification" ("applicationType", "applicationId");
      CREATE INDEX IF NOT EXISTS "idx_app_notification_status" ON "public"."ApplicationNotification" ("status");
    `);
    logger.info('Ensured ApplicationNotification table in PostgreSQL database.');
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Failed to create ApplicationNotification table in PostgreSQL.');
  } finally {
    client.release();
  }
}

if (require.main === module) {
  ensureNotificationTable()
    .then(() => {
      console.log('Migration completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
