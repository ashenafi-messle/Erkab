import crypto from 'crypto';
import { query, queryOne } from '../../core/database/db';
import { NotFoundError, ValidationError, ConflictError } from '../../core/errors/AppError';
import { logger } from '../../core/logging/logger';

export interface CreateArticleDTO {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  coverImageAssetId?: string;
  coverImageUrl?: string;
  authorName?: string;
  publishedAt?: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export class NewsService {
  public static async getPublishedArticles(page = 1, limit = 10, category?: string) {
    const offset = (page - 1) * limit;
    let sql = `SELECT "id", "slug", "title", "excerpt", "category", "coverImageUrl", "publishedAt", "createdAt"
               FROM "public"."NewsArticle"
               WHERE "status" = 'PUBLISHED'`;
    const params: any[] = [];

    if (category && category !== 'All') {
      params.push(category);
      sql += ` AND "category" = $${params.length}`;
    }

    sql += ` ORDER BY COALESCE("publishedAt", "createdAt") DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const rows = await query(sql, params);

    let countSql = `SELECT COUNT(*) as total FROM "public"."NewsArticle" WHERE "status" = 'PUBLISHED'`;
    const countParams: any[] = [];
    if (category && category !== 'All') {
      countParams.push(category);
      countSql += ` AND "category" = $1`;
    }
    const countRes = await queryOne<{ total: string }>(countSql, countParams);
    const total = parseInt(countRes?.total || '0', 10);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: rows,
    };
  }

  public static async getPublishedArticleBySlug(slug: string) {
    const article = await queryOne(
      `SELECT "id", "slug", "title", "excerpt", "content", "category", "coverImageUrl", "publishedAt", "authorName", "createdAt"
       FROM "public"."NewsArticle"
       WHERE "slug" = $1 AND "status" = 'PUBLISHED'
       LIMIT 1`,
      [slug]
    );

    if (!article) {
      throw new NotFoundError(`News article '${slug}' not found or is not currently published`);
    }

    return article;
  }

  public static async listAllArticles(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;
    let sql = `SELECT "id", "slug", "title", "excerpt", "category", "status", "coverImageUrl", "publishedAt", "authorName", "createdAt", "updatedAt"
               FROM "public"."NewsArticle"`;
    const params: any[] = [];

    if (status) {
      params.push(status);
      sql += ` WHERE "status" = $1`;
    }

    sql += ` ORDER BY "createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const rows = await query(sql, params);

    let countSql = `SELECT COUNT(*) as total FROM "public"."NewsArticle"`;
    const countParams: any[] = [];
    if (status) {
      countParams.push(status);
      countSql += ` WHERE "status" = $1`;
    }
    const countRes = await queryOne<{ total: string }>(countSql, countParams);
    const total = parseInt(countRes?.total || '0', 10);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: rows,
    };
  }

  public static async createArticle(data: CreateArticleDTO, authorName = 'Erkab Editorial Team') {
    let finalSlug = data.slug ? slugify(data.slug) : slugify(data.title);
    if (!finalSlug) {
      finalSlug = `article-${crypto.randomBytes(4).toString('hex')}`;
    }

    // Check slug collision
    const existing = await queryOne(
      `SELECT "id" FROM "public"."NewsArticle" WHERE "slug" = $1`,
      [finalSlug]
    );
    if (existing) {
      finalSlug = `${finalSlug}-${crypto.randomBytes(2).toString('hex')}`;
    }

    const articleId = crypto.randomUUID();
    const status = data.status || 'DRAFT';
    const publishedAt = status === 'PUBLISHED' ? (data.publishedAt || new Date().toISOString()) : (data.publishedAt || null);

    await query(
      `INSERT INTO "public"."NewsArticle" (
        "id", "slug", "title", "excerpt", "content", "category",
        "status", "coverImageAssetId", "coverImageUrl", "publishedAt",
        "authorName", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
      [
        articleId,
        finalSlug,
        data.title,
        data.excerpt,
        data.content,
        data.category || 'General',
        status,
        data.coverImageAssetId || null,
        data.coverImageUrl || null,
        publishedAt,
        data.authorName || authorName,
      ]
    );

    logger.info({ articleId, slug: finalSlug, status }, 'News article created');

    return {
      success: true,
      articleId,
      slug: finalSlug,
      message: `News article '${data.title}' created successfully`,
    };
  }

  public static async updateArticle(id: string, data: Partial<CreateArticleDTO>) {
    const existing = await queryOne(
      `SELECT * FROM "public"."NewsArticle" WHERE "id" = $1 OR "slug" = $1`,
      [id]
    );
    if (!existing) {
      throw new NotFoundError(`News article '${id}' not found`);
    }

    let finalSlug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      finalSlug = slugify(data.slug);
      const conflict = await queryOne(
        `SELECT "id" FROM "public"."NewsArticle" WHERE "slug" = $1 AND "id" != $2`,
        [finalSlug, existing.id]
      );
      if (conflict) {
        throw new ConflictError(`Slug '${finalSlug}' is already in use by another article`);
      }
    }

    const title = data.title ?? existing.title;
    const excerpt = data.excerpt ?? existing.excerpt;
    const content = data.content ?? existing.content;
    const category = data.category ?? existing.category;
    const status = data.status ?? existing.status;
    const coverImageAssetId = data.coverImageAssetId ?? existing.coverImageAssetId;
    const coverImageUrl = data.coverImageUrl ?? existing.coverImageUrl;
    const authorName = data.authorName ?? existing.authorName;

    let publishedAt = existing.publishedAt;
    if (status === 'PUBLISHED' && !existing.publishedAt) {
      publishedAt = new Date().toISOString();
    } else if (data.publishedAt !== undefined) {
      publishedAt = data.publishedAt;
    }

    await query(
      `UPDATE "public"."NewsArticle"
       SET "title" = $1, "slug" = $2, "excerpt" = $3, "content" = $4,
           "category" = $5, "status" = $6, "coverImageAssetId" = $7,
           "coverImageUrl" = $8, "publishedAt" = $9, "authorName" = $10,
           "updatedAt" = NOW()
       WHERE "id" = $11`,
      [
        title,
        finalSlug,
        excerpt,
        content,
        category,
        status,
        coverImageAssetId,
        coverImageUrl,
        publishedAt,
        authorName,
        existing.id,
      ]
    );

    return {
      success: true,
      articleId: existing.id,
      slug: finalSlug,
      message: 'News article updated successfully',
    };
  }

  public static async deleteArticle(id: string) {
    const existing = await queryOne(
      `SELECT "id", "title" FROM "public"."NewsArticle" WHERE "id" = $1 OR "slug" = $1`,
      [id]
    );
    if (!existing) {
      throw new NotFoundError(`News article '${id}' not found`);
    }

    await query(`DELETE FROM "public"."NewsArticle" WHERE "id" = $1`, [existing.id]);

    return {
      success: true,
      message: `News article '${existing.title}' deleted successfully`,
    };
  }
}
