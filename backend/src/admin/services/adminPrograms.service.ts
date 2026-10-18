import crypto from 'crypto';
import { query, queryOne } from '../../core/database/db';
import { NotFoundError, ValidationError, ConflictError } from '../../core/errors/AppError';
import { CloudinaryService } from '../../core/services/cloudinary.service';
import { logger } from '../../core/logging/logger';

export interface AdminProgramDTO {
  title: string;
  slug?: string;
  category: string;
  duration: string;
  delivery: string;
  scholarship?: boolean;
  image?: string;
  imageAlt?: string;
  summary: string;
  description: string;
  skills: string[] | string;
  modules: string[] | string;
  careerPaths: string[] | string;
  prerequisites: string;
  isPublished?: boolean;
}

function parseJsonArray(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function stringifyArray(val: any): string {
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return JSON.stringify(parsed);
    } catch {
      const parts = val.split(',').map((s: string) => s.trim()).filter(Boolean);
      return JSON.stringify(parts);
    }
  }
  if (Array.isArray(val)) {
    return JSON.stringify(val);
  }
  return JSON.stringify([]);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class AdminProgramsService {
  /**
   * Accurate dashboard metrics derived directly from the database
   */
  public static async getProgramStats() {
    const totalRow = await queryOne<{ count: string | number }>(
      `SELECT COUNT(*) as count FROM "public"."TrainingProgram"`
    );
    const publishedRow = await queryOne<{ count: string | number }>(
      `SELECT COUNT(*) as count FROM "public"."TrainingProgram" WHERE "isPublished" = true`
    );
    const categoriesRow = await queryOne<{ count: string | number }>(
      `SELECT COUNT(DISTINCT "category") as count FROM "public"."TrainingProgram"`
    );
    const applicationsRow = await queryOne<{ count: string | number }>(
      `SELECT COUNT(*) as count FROM "public"."StudentApplication"`
    );

    const total = Number(totalRow?.count || 0);
    const published = Number(publishedRow?.count || 0);
    const draft = Math.max(0, total - published);
    const categories = Number(categoriesRow?.count || 0);
    const totalApplications = Number(applicationsRow?.count || 0);

    return {
      total,
      published,
      draft,
      categories,
      totalApplications,
      totalPrograms: total,
      publishedPrograms: published,
      draftPrograms: draft,
    };
  }

  /**
   * Server-side paginated list with search, filter, and application count aggregation
   */
  public static async listPrograms(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const offset = (page - 1) * limit;

    let baseSql = `SELECT * FROM "public"."TrainingProgram"`;
    const whereClauses: string[] = [];
    const queryParams: any[] = [];

    if (params.category && params.category !== 'ALL') {
      queryParams.push(params.category);
      whereClauses.push(`"category" = $${queryParams.length}`);
    }

    if (params.status && params.status !== 'ALL') {
      if (params.status.toUpperCase() === 'PUBLISHED') {
        whereClauses.push(`"isPublished" = true`);
      } else if (params.status.toUpperCase() === 'UNPUBLISHED' || params.status.toUpperCase() === 'DRAFT') {
        whereClauses.push(`"isPublished" = false`);
      }
    }

    if (params.search && params.search.trim()) {
      queryParams.push(`%${params.search.trim()}%`);
      whereClauses.push(`("title" ILIKE $${queryParams.length} OR "slug" ILIKE $${queryParams.length} OR "summary" ILIKE $${queryParams.length} OR "category" ILIKE $${queryParams.length})`);
    }

    if (whereClauses.length > 0) {
      baseSql += ` WHERE ` + whereClauses.join(' AND ');
    }

    // Sorting
    const sortFieldMap: Record<string, string> = {
      title: '"title"',
      category: '"category"',
      duration: '"duration"',
      isPublished: '"isPublished"',
      createdAt: '"createdAt"',
      updatedAt: '"updatedAt"',
      id: '"id"',
    };
    const sortCol = sortFieldMap[params.sortBy || 'id'] || '"id"';
    const sortDir = params.sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const countSql = `SELECT COUNT(*) as total FROM (${baseSql}) as filtered_progs`;
    const countRes = await queryOne<{ total: string | number }>(countSql, queryParams);
    const total = Number(countRes?.total || 0);

    const dataSql = `${baseSql} ORDER BY ${sortCol} ${sortDir} LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    const rows = await query<any>(dataSql, [...queryParams, limit, offset]);

    // Aggregate student applications count
    const appCounts = await query<{ programId: string; count: number | string }>(
      `SELECT "programId", COUNT(*) as count 
       FROM "public"."StudentApplication" 
       GROUP BY "programId"`
    );
    const countMap = new Map(appCounts.map((r) => [r.programId, Number(r.count)]));

    const enriched = rows.map((p) => ({
      ...p,
      skills: parseJsonArray(p.skills),
      modules: parseJsonArray(p.modules),
      careerPaths: parseJsonArray(p.careerPaths),
      applicationCount: countMap.get(p.id) || countMap.get(p.slug) || 0,
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: enriched,
      items: enriched,
      total,
      page,
      limit,
      totalPages,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Retrieve a single training program with parsed lists and metrics
   */
  public static async getProgramById(idOrSlug: string) {
    const prog = await queryOne<any>(
      `SELECT * FROM "public"."TrainingProgram" WHERE "id" = $1 OR "slug" = $1`,
      [idOrSlug]
    );

    if (!prog) {
      throw new NotFoundError(`Training program '${idOrSlug}' not found`);
    }

    const appCountRes = await queryOne<{ count: string | number }>(
      `SELECT COUNT(*) as count FROM "public"."StudentApplication" WHERE "programId" = $1 OR "programId" = $2`,
      [prog.id, prog.slug]
    );

    return {
      ...prog,
      skills: parseJsonArray(prog.skills),
      modules: parseJsonArray(prog.modules),
      careerPaths: parseJsonArray(prog.careerPaths),
      applicationCount: Number(appCountRes?.count || 0),
    };
  }

  /**
   * Create a new training program with unique slug validation and audit logging
   */
  public static async createProgram(data: AdminProgramDTO, adminUser: { id: string; name: string }) {
    let slug = data.slug ? generateSlug(data.slug) : generateSlug(data.title);
    if (!slug) {
      slug = `program-${Date.now().toString(36)}`;
    }

    // Check slug uniqueness
    const existingSlug = await queryOne(
      `SELECT "id" FROM "public"."TrainingProgram" WHERE "slug" = $1`,
      [slug]
    );
    if (existingSlug) {
      if (data.slug) {
        throw new ConflictError(`A training program with slug '${slug}' already exists.`);
      }
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const id = `prog-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const image = data.image?.trim() || '/images/programs/web-development.jpg';
    const imageAlt = data.imageAlt?.trim() || `${data.title} curriculum track at Erkab Gondar training center`;
    const skillsJson = stringifyArray(data.skills);
    const modulesJson = stringifyArray(data.modules);
    const careerPathsJson = stringifyArray(data.careerPaths);
    const scholarship = data.scholarship !== undefined ? Boolean(data.scholarship) : true;
    const isPublished = data.isPublished !== undefined ? Boolean(data.isPublished) : true;
    const summary = data.summary?.trim() || data.description.trim().substring(0, 160);

    await query(
      `INSERT INTO "public"."TrainingProgram" (
        "id", "slug", "title", "category", "duration", "delivery", "scholarship",
        "image", "imageAlt", "summary", "description", "skills", "modules",
        "careerPaths", "prerequisites", "isPublished", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())`,
      [
        id,
        slug,
        data.title.trim(),
        data.category.trim(),
        data.duration.trim(),
        data.delivery.trim(),
        scholarship,
        image,
        imageAlt,
        summary,
        data.description.trim(),
        skillsJson,
        modulesJson,
        careerPathsJson,
        data.prerequisites.trim(),
        isPublished,
      ]
    );

    // Record audit log
    try {
      await query(
        `INSERT INTO "public"."AdminAuditLog" (
          "id", "adminUserId", "adminName", "action", "resource", "details", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          crypto.randomUUID(),
          adminUser.id,
          adminUser.name,
          'PROGRAM_CREATE',
          'TrainingProgram',
          JSON.stringify({ programId: id, slug, title: data.title, category: data.category }),
        ]
      );
    } catch (auditErr: any) {
      logger.warn({ err: auditErr.message }, 'Failed to record program creation audit log');
    }

    logger.info({ programId: id, slug, title: data.title }, 'Successfully created training program');

    return this.getProgramById(id);
  }

  /**
   * Update an existing training program
   */
  public static async updateProgram(id: string, data: Partial<AdminProgramDTO>, adminUser: { id: string; name: string }) {
    const existing = await queryOne<any>(
      `SELECT * FROM "public"."TrainingProgram" WHERE "id" = $1 OR "slug" = $1`,
      [id]
    );

    if (!existing) {
      throw new NotFoundError(`Training program '${id}' not found`);
    }

    let slug = existing.slug;
    if (data.slug && data.slug.trim()) {
      const candidateSlug = generateSlug(data.slug);
      if (candidateSlug !== existing.slug) {
        const slugConflict = await queryOne(
          `SELECT "id" FROM "public"."TrainingProgram" WHERE "slug" = $1 AND "id" != $2`,
          [candidateSlug, existing.id]
        );
        if (slugConflict) {
          throw new ValidationError(`Slug '${candidateSlug}' is already in use by another program.`);
        }
        slug = candidateSlug;
      }
    }

    const title = data.title !== undefined ? data.title.trim() : existing.title;
    const category = data.category !== undefined ? data.category.trim() : existing.category;
    const duration = data.duration !== undefined ? data.duration.trim() : existing.duration;
    const delivery = data.delivery !== undefined ? data.delivery.trim() : existing.delivery;
    const scholarship = data.scholarship !== undefined ? Boolean(data.scholarship) : existing.scholarship;
    const image = data.image !== undefined ? data.image.trim() : existing.image;
    const imageAlt = data.imageAlt !== undefined ? data.imageAlt.trim() : existing.imageAlt;
    const summary = data.summary !== undefined ? data.summary.trim() : existing.summary;
    const description = data.description !== undefined ? data.description.trim() : existing.description;
    const prerequisites = data.prerequisites !== undefined ? data.prerequisites.trim() : existing.prerequisites;
    const isPublished = data.isPublished !== undefined ? Boolean(data.isPublished) : existing.isPublished;

    const skillsJson = data.skills !== undefined ? stringifyArray(data.skills) : existing.skills;
    const modulesJson = data.modules !== undefined ? stringifyArray(data.modules) : existing.modules;
    const careerPathsJson = data.careerPaths !== undefined ? stringifyArray(data.careerPaths) : existing.careerPaths;

    await query(
      `UPDATE "public"."TrainingProgram"
       SET "slug" = $1, "title" = $2, "category" = $3, "duration" = $4, "delivery" = $5,
           "scholarship" = $6, "image" = $7, "imageAlt" = $8, "summary" = $9, "description" = $10,
           "skills" = $11, "modules" = $12, "careerPaths" = $13, "prerequisites" = $14,
           "isPublished" = $15, "updatedAt" = NOW()
       WHERE "id" = $16`,
      [
        slug,
        title,
        category,
        duration,
        delivery,
        scholarship,
        image,
        imageAlt,
        summary,
        description,
        skillsJson,
        modulesJson,
        careerPathsJson,
        prerequisites,
        isPublished,
        existing.id,
      ]
    );

    // If image changed and old image was an uploaded Cloudinary asset, clean it up safely
    if (existing.image && existing.image !== image && existing.image.includes('erkab/programs')) {
      try {
        await CloudinaryService.deleteProgramImage(existing.image);
      } catch (imgErr: any) {
        logger.warn({ err: imgErr.message, oldImage: existing.image }, 'Failed to delete replaced Cloudinary image');
      }
    }

    // Record audit log
    try {
      await query(
        `INSERT INTO "public"."AdminAuditLog" (
          "id", "adminUserId", "adminName", "action", "resource", "details", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          crypto.randomUUID(),
          adminUser.id,
          adminUser.name,
          'PROGRAM_UPDATE',
          'TrainingProgram',
          JSON.stringify({ programId: existing.id, slug, title, isPublished }),
        ]
      );
    } catch (auditErr: any) {
      logger.warn({ err: auditErr.message }, 'Failed to record program update audit log');
    }

    logger.info({ programId: existing.id, title }, 'Successfully updated training program');

    return this.getProgramById(existing.id);
  }

  /**
   * Toggle publication status
   */
  public static async togglePublish(id: string, isPublished: boolean, adminUser: { id: string; name: string }) {
    const prog = await queryOne<any>(
      `SELECT "id", "title", "slug", "isPublished" FROM "public"."TrainingProgram" WHERE "id" = $1 OR "slug" = $1`,
      [id]
    );

    if (!prog) {
      throw new NotFoundError(`Training program '${id}' not found`);
    }

    await query(
      `UPDATE "public"."TrainingProgram" SET "isPublished" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
      [isPublished, prog.id]
    );

    try {
      await query(
        `INSERT INTO "public"."AdminAuditLog" (
          "id", "adminUserId", "adminName", "action", "resource", "details", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          crypto.randomUUID(),
          adminUser.id,
          adminUser.name,
          isPublished ? 'PROGRAM_PUBLISH' : 'PROGRAM_UNPUBLISH',
          'TrainingProgram',
          JSON.stringify({ programId: prog.id, title: prog.title, isPublished }),
        ]
      );
    } catch (auditErr: any) {
      logger.warn({ err: auditErr.message }, 'Failed to record program publication toggle audit log');
    }

    return {
      success: true,
      data: {
        id: prog.id,
        title: prog.title,
        isPublished,
      },
      id: prog.id,
      title: prog.title,
      isPublished,
      message: `Program '${prog.title}' is now ${isPublished ? 'Published' : 'Hidden from public discovery'}.`,
    };
  }

  /**
   * Safe program deletion with cascade protection check
   */
  public static async deleteProgram(id: string, adminUser: { id: string; name: string }) {
    const prog = await queryOne<any>(
      `SELECT "id", "title", "slug" FROM "public"."TrainingProgram" WHERE "id" = $1 OR "slug" = $1`,
      [id]
    );

    if (!prog) {
      throw new NotFoundError(`Training program '${id}' not found`);
    }

    // Check if any student scholarship applications reference this program
    const appCountRes = await queryOne<{ count: string | number }>(
      `SELECT COUNT(*) as count FROM "public"."StudentApplication" WHERE "programId" = $1 OR "programId" = $2`,
      [prog.id, prog.slug]
    );
    const count = Number(appCountRes?.count || 0);

    if (count > 0) {
      throw new ConflictError(
        `Cannot delete program '${prog.title}' because it has ${count} registered student scholarship application(s). You can safely Unpublish the program to remove it from public admissions without destroying applicant history.`
      );
    }

    await query(`DELETE FROM "public"."TrainingProgram" WHERE "id" = $1`, [prog.id]);

    // Clean up uploaded Cloudinary image if applicable
    if (prog.image && prog.image.includes('erkab/programs')) {
      try {
        await CloudinaryService.deleteProgramImage(prog.image);
      } catch (imgErr: any) {
        logger.warn({ err: imgErr.message, image: prog.image }, 'Failed to delete Cloudinary image for deleted program');
      }
    }

    try {
      await query(
        `INSERT INTO "public"."AdminAuditLog" (
          "id", "adminUserId", "adminName", "action", "resource", "details", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          crypto.randomUUID(),
          adminUser.id,
          adminUser.name,
          'PROGRAM_DELETE',
          'TrainingProgram',
          JSON.stringify({ programId: prog.id, title: prog.title, slug: prog.slug }),
        ]
      );
    } catch (auditErr: any) {
      logger.warn({ err: auditErr.message }, 'Failed to record program deletion audit log');
    }

    logger.info({ programId: prog.id, title: prog.title }, 'Successfully deleted training program');

    return {
      success: true,
      message: `Training program '${prog.title}' has been successfully deleted.`,
    };
  }
}
