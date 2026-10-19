import crypto from 'crypto';
import { query, queryOne } from '../../core/database/db';
import { NotFoundError, ValidationError, ConflictError } from '../../core/errors/AppError';
import { logger } from '../../core/logging/logger';
import { CloudinaryService } from '../../core/services/cloudinary.service';

export interface ArticleImageDTO {
  id?: string;
  imageUrl: string;
  cloudinaryPublicId?: string | null;
  caption?: string | null;
  displayOrder?: number;
}

export interface CreateArticleDTO {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  coverImageAssetId?: string | null;
  coverImageUrl?: string | null;
  authorName?: string | null;
  publishedAt?: string | null;
  images?: ArticleImageDTO[];
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
  public static async getImagesForArticle(articleId: string): Promise<ArticleImageDTO[]> {
    try {
      const rows = await query<any>(
        `SELECT "id", "articleId", "imageUrl", "cloudinaryPublicId", "caption", "displayOrder"
         FROM "public"."NewsArticleImage"
         WHERE "articleId" = $1
         ORDER BY "displayOrder" ASC, "createdAt" ASC`,
        [articleId]
      );
      return rows.map((r: any) => ({
        id: r.id,
        imageUrl: r.imageUrl,
        cloudinaryPublicId: r.cloudinaryPublicId || null,
        caption: r.caption || null,
        displayOrder: Number(r.displayOrder || 0),
      }));
    } catch (err: any) {
      logger.warn({ articleId, error: err.message }, 'Failed to fetch article images');
      return [];
    }
  }

  public static async attachImagesToArticles(articles: any[]): Promise<any[]> {
    if (!articles || articles.length === 0) return [];

    return Promise.all(
      articles.map(async (art) => {
        let images = await NewsService.getImagesForArticle(art.id);
        if (images.length === 0 && art.coverImageUrl) {
          images = [
            {
              id: 'legacy-cover',
              imageUrl: art.coverImageUrl,
              cloudinaryPublicId: art.coverImageAssetId || null,
              displayOrder: 0,
            },
          ];
        }
        return {
          ...art,
          images,
          coverImageUrl: images.length > 0 ? images[0].imageUrl : (art.coverImageUrl || null),
        };
      })
    );
  }

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

    const data = await NewsService.attachImagesToArticles(rows);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
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

    let images = await NewsService.getImagesForArticle(article.id);
    if (images.length === 0 && article.coverImageUrl) {
      images = [
        {
          id: 'legacy-cover',
          imageUrl: article.coverImageUrl,
          cloudinaryPublicId: article.coverImageAssetId || null,
          displayOrder: 0,
        },
      ];
    }

    return {
      ...article,
      images,
      coverImageUrl: images.length > 0 ? images[0].imageUrl : (article.coverImageUrl || null),
    };
  }

  public static async getArticleById(id: string) {
    const article = await queryOne(
      `SELECT "id", "slug", "title", "excerpt", "content", "category", "status", "coverImageUrl", "publishedAt", "authorName", "createdAt", "updatedAt"
       FROM "public"."NewsArticle"
       WHERE "id" = $1 OR "slug" = $1
       LIMIT 1`,
      [id]
    );

    if (!article) {
      throw new NotFoundError(`News article '${id}' not found`);
    }

    let images = await NewsService.getImagesForArticle(article.id);
    if (images.length === 0 && article.coverImageUrl) {
      images = [
        {
          id: 'legacy-cover',
          imageUrl: article.coverImageUrl,
          cloudinaryPublicId: article.coverImageAssetId || null,
          displayOrder: 0,
        },
      ];
    }

    return {
      ...article,
      images,
      coverImageUrl: images.length > 0 ? images[0].imageUrl : (article.coverImageUrl || null),
    };
  }

  public static async listAllArticles(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;
    let sql = `SELECT "id", "slug", "title", "excerpt", "content", "category", "status", "coverImageUrl", "publishedAt", "authorName", "createdAt", "updatedAt"
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

    const data = await NewsService.attachImagesToArticles(rows);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
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
    const publishedAt =
      status === 'PUBLISHED'
        ? data.publishedAt || new Date().toISOString()
        : data.publishedAt || null;

    const images = Array.isArray(data.images) ? data.images : [];
    const coverImageUrl = images.length > 0 ? images[0].imageUrl : (data.coverImageUrl || null);
    const coverImageAssetId = images.length > 0 ? (images[0].cloudinaryPublicId || null) : (data.coverImageAssetId || null);

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
        coverImageAssetId,
        coverImageUrl,
        publishedAt,
        data.authorName || authorName,
      ]
    );

    // Insert associated images
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const imgId = img.id || crypto.randomUUID();
      const order = typeof img.displayOrder === 'number' ? img.displayOrder : i;
      await query(
        `INSERT INTO "public"."NewsArticleImage" (
          "id", "articleId", "imageUrl", "cloudinaryPublicId", "caption", "displayOrder", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          imgId,
          articleId,
          img.imageUrl,
          img.cloudinaryPublicId || null,
          img.caption || null,
          order,
        ]
      );
    }

    logger.info({ articleId, slug: finalSlug, status, imageCount: images.length }, 'News article created with images');

    const createdArticle = await NewsService.getArticleById(articleId);

    return {
      success: true,
      articleId,
      slug: finalSlug,
      data: createdArticle,
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
    let coverImageAssetId = data.coverImageAssetId ?? existing.coverImageAssetId;
    let coverImageUrl = data.coverImageUrl ?? existing.coverImageUrl;
    const authorName = data.authorName ?? existing.authorName;

    let publishedAt = existing.publishedAt;
    if (status === 'PUBLISHED' && !existing.publishedAt) {
      publishedAt = new Date().toISOString();
    } else if (data.publishedAt !== undefined) {
      publishedAt = data.publishedAt;
    }

    // Handle images if provided
    if (data.images !== undefined) {
      const currentImages = await NewsService.getImagesForArticle(existing.id);
      const newImages = Array.isArray(data.images) ? data.images : [];

      // Find images removed by the admin
      const newImageUrls = new Set(newImages.map((img) => img.imageUrl));
      const removedImages = currentImages.filter((oldImg) => !newImageUrls.has(oldImg.imageUrl));

      for (const removed of removedImages) {
        if (removed.cloudinaryPublicId) {
          await CloudinaryService.deleteNewsImage(removed.cloudinaryPublicId);
        }
      }

      // Re-populate images table with updated order
      await query(`DELETE FROM "public"."NewsArticleImage" WHERE "articleId" = $1`, [existing.id]);

      for (let i = 0; i < newImages.length; i++) {
        const img = newImages[i];
        const imgId = img.id || crypto.randomUUID();
        const order = typeof img.displayOrder === 'number' ? img.displayOrder : i;
        await query(
          `INSERT INTO "public"."NewsArticleImage" (
            "id", "articleId", "imageUrl", "cloudinaryPublicId", "caption", "displayOrder", "createdAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            imgId,
            existing.id,
            img.imageUrl,
            img.cloudinaryPublicId || null,
            img.caption || null,
            order,
          ]
        );
      }

      coverImageUrl = newImages.length > 0 ? newImages[0].imageUrl : null;
      coverImageAssetId = newImages.length > 0 ? (newImages[0].cloudinaryPublicId || null) : null;
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

    const updatedArticle = await NewsService.getArticleById(existing.id);

    return {
      success: true,
      articleId: existing.id,
      slug: finalSlug,
      data: updatedArticle,
      message: 'News article updated successfully',
    };
  }

  public static async deleteArticle(id: string) {
    const existing = await queryOne(
      `SELECT "id", "title", "coverImageAssetId" FROM "public"."NewsArticle" WHERE "id" = $1 OR "slug" = $1`,
      [id]
    );
    if (!existing) {
      throw new NotFoundError(`News article '${id}' not found`);
    }

    // Clean up all Cloudinary assets associated with this article
    const images = await NewsService.getImagesForArticle(existing.id);
    for (const img of images) {
      if (img.cloudinaryPublicId) {
        await CloudinaryService.deleteNewsImage(img.cloudinaryPublicId);
      }
    }
    if (existing.coverImageAssetId) {
      await CloudinaryService.deleteNewsImage(existing.coverImageAssetId);
    }

    await query(`DELETE FROM "public"."NewsArticleImage" WHERE "articleId" = $1`, [existing.id]);
    await query(`DELETE FROM "public"."NewsArticle" WHERE "id" = $1`, [existing.id]);

    return {
      success: true,
      message: `News article '${existing.title}' deleted successfully`,
    };
  }
}
