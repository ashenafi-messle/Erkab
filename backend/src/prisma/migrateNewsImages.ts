import { pool } from '../core/database/db';
import { logger } from '../core/logging/logger';
import { localDb } from '../core/database/localFallback';
import crypto from 'crypto';

export async function ensureNewsArticleImagesTable() {
  // 1. PostgreSQL (Neon)
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "public"."NewsArticleImage" (
        "id" VARCHAR(64) PRIMARY KEY,
        "articleId" VARCHAR(64) NOT NULL,
        "imageUrl" TEXT NOT NULL,
        "cloudinaryPublicId" TEXT,
        "caption" TEXT,
        "displayOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS "idx_news_article_image_article" ON "public"."NewsArticleImage" ("articleId", "displayOrder");
      CREATE INDEX IF NOT EXISTS "idx_news_article_image_created" ON "public"."NewsArticleImage" ("createdAt");
    `);

    // Backfill existing articles that have coverImageUrl if no images exist yet
    const existingArticles = await client.query(`
      SELECT "id", "coverImageUrl", "coverImageAssetId" 
      FROM "public"."NewsArticle" 
      WHERE "coverImageUrl" IS NOT NULL AND "coverImageUrl" != ''
    `);

    for (const article of existingArticles.rows) {
      const check = await client.query(
        `SELECT "id" FROM "public"."NewsArticleImage" WHERE "articleId" = $1 LIMIT 1`,
        [article.id]
      );
      if (check.rows.length === 0) {
        await client.query(
          `INSERT INTO "public"."NewsArticleImage" ("id", "articleId", "imageUrl", "cloudinaryPublicId", "displayOrder", "createdAt")
           VALUES ($1, $2, $3, $4, 0, NOW())`,
          [
            crypto.randomUUID(),
            article.id,
            article.coverImageUrl,
            article.coverImageAssetId || null,
          ]
        );
      }
    }

    logger.info('Ensured NewsArticleImage table, indexes, and legacy backfill in PostgreSQL database.');
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Failed to ensure NewsArticleImage in PostgreSQL (or running offline).');
  } finally {
    client.release();
  }

  // 2. Local fallback SQLite
  try {
    localDb.exec(`
      CREATE TABLE IF NOT EXISTS NewsArticleImage (
        id TEXT PRIMARY KEY,
        articleId TEXT NOT NULL,
        imageUrl TEXT NOT NULL,
        cloudinaryPublicId TEXT,
        caption TEXT,
        displayOrder INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_news_article_image_article ON NewsArticleImage (articleId, displayOrder);
    `);

    // Backfill SQLite
    const articlesWithCover = localDb
      .prepare("SELECT id, coverImageUrl, coverImageAssetId FROM NewsArticle WHERE coverImageUrl IS NOT NULL AND coverImageUrl != ''")
      .all() as Array<{ id: string; coverImageUrl: string; coverImageAssetId?: string }>;

    for (const art of articlesWithCover) {
      const existing = localDb
        .prepare('SELECT id FROM NewsArticleImage WHERE articleId = ? LIMIT 1')
        .get(art.id);
      if (!existing) {
        localDb
          .prepare(
            "INSERT INTO NewsArticleImage (id, articleId, imageUrl, cloudinaryPublicId, displayOrder, createdAt) VALUES (?, ?, ?, ?, 0, datetime('now'))"
          )
          .run(crypto.randomUUID(), art.id, art.coverImageUrl, art.coverImageAssetId || null);
      }
    }
    logger.info('Ensured NewsArticleImage table and backfill in local SQLite fallback.');
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Failed to ensure NewsArticleImage in local SQLite fallback.');
  }
}

if (require.main === module) {
  ensureNewsArticleImagesTable()
    .then(() => {
      console.log('NewsArticleImage migration completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('NewsArticleImage migration failed:', err);
      process.exit(1);
    });
}
