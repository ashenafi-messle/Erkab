import { pool } from '../core/database/db';
import { logger } from '../core/logging/logger';

export async function ensureContactMessageTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "public"."ContactMessage" (
        "id" VARCHAR(64) PRIMARY KEY,
        "referenceCode" VARCHAR(64) UNIQUE NOT NULL,
        "fullName" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) NOT NULL,
        "phone" VARCHAR(64),
        "subject" VARCHAR(255) NOT NULL,
        "category" VARCHAR(64) NOT NULL DEFAULT 'GENERAL_INQUIRY',
        "message" TEXT NOT NULL,
        "status" VARCHAR(32) NOT NULL DEFAULT 'NEW',
        "priority" VARCHAR(32) NOT NULL DEFAULT 'NORMAL',
        "assignedAdminId" VARCHAR(64),
        "internalNotes" TEXT,
        "readAt" TIMESTAMPTZ,
        "resolvedAt" TIMESTAMPTZ,
        "resolvedByAdminId" VARCHAR(64),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_contact_msg_ref" ON "public"."ContactMessage" ("referenceCode");
      CREATE INDEX IF NOT EXISTS "idx_contact_msg_status_created" ON "public"."ContactMessage" ("status", "createdAt");
      CREATE INDEX IF NOT EXISTS "idx_contact_msg_category_created" ON "public"."ContactMessage" ("category", "createdAt");
      CREATE INDEX IF NOT EXISTS "idx_contact_msg_assigned_status" ON "public"."ContactMessage" ("assignedAdminId", "status");
    `);
    logger.info('Ensured ContactMessage table and indexes in PostgreSQL database.');
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Failed to create ContactMessage table in PostgreSQL.');
  } finally {
    client.release();
  }
}

if (require.main === module) {
  ensureContactMessageTable()
    .then(() => {
      console.log('ContactMessage migration completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('ContactMessage migration failed:', err);
      process.exit(1);
    });
}
