import { pool } from '../core/database/db';
import { logger } from '../core/logging/logger';
import { localDb } from '../core/database/localFallback';

export async function ensureTutoringPaymentColumns() {
  // 1. PostgreSQL (Neon)
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE "public"."TutoringPayment" ADD COLUMN IF NOT EXISTS "receiptUrl" TEXT;
      ALTER TABLE "public"."TutoringPayment" ADD COLUMN IF NOT EXISTS "receiptSubmittedAt" TIMESTAMPTZ;
      ALTER TABLE "public"."TutoringPayment" ADD COLUMN IF NOT EXISTS "verifiedBy" VARCHAR(64);
      ALTER TABLE "public"."TutoringPayment" ADD COLUMN IF NOT EXISTS "verifiedByName" VARCHAR(255);
      ALTER TABLE "public"."TutoringPayment" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMPTZ;
      ALTER TABLE "public"."TutoringPayment" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
      CREATE INDEX IF NOT EXISTS "idx_tutoring_payment_status" ON "public"."TutoringPayment" ("status");
      CREATE INDEX IF NOT EXISTS "idx_tutoring_payment_receipt" ON "public"."TutoringPayment" ("receiptUrl");
    `);
    logger.info('Ensured TutoringPayment receipt and verification columns in PostgreSQL database.');
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Failed to add TutoringPayment columns in PostgreSQL (or running offline).');
  } finally {
    client.release();
  }

  // 2. Local fallback SQLite
  try {
    const tableInfo = localDb.prepare("PRAGMA table_info('TutoringPayment')").all() as Array<{ name: string }>;
    const columnNames = new Set(tableInfo.map((col) => col.name));

    if (!columnNames.has('receiptUrl')) {
      localDb.exec('ALTER TABLE TutoringPayment ADD COLUMN receiptUrl TEXT;');
    }
    if (!columnNames.has('receiptSubmittedAt')) {
      localDb.exec('ALTER TABLE TutoringPayment ADD COLUMN receiptSubmittedAt TEXT;');
    }
    if (!columnNames.has('verifiedBy')) {
      localDb.exec('ALTER TABLE TutoringPayment ADD COLUMN verifiedBy TEXT;');
    }
    if (!columnNames.has('verifiedByName')) {
      localDb.exec('ALTER TABLE TutoringPayment ADD COLUMN verifiedByName TEXT;');
    }
    if (!columnNames.has('verifiedAt')) {
      localDb.exec('ALTER TABLE TutoringPayment ADD COLUMN verifiedAt TEXT;');
    }
    if (!columnNames.has('rejectionReason')) {
      localDb.exec('ALTER TABLE TutoringPayment ADD COLUMN rejectionReason TEXT;');
    }
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Failed to add TutoringPayment columns in local SQLite fallback.');
  }
}

if (require.main === module) {
  ensureTutoringPaymentColumns()
    .then(() => {
      console.log('TutoringPayment migration completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('TutoringPayment migration failed:', err);
      process.exit(1);
    });
}
