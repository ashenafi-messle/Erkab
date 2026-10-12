import crypto from 'crypto';
import { query, queryOne, transaction } from '../../core/database/db';
import { CloudinaryService } from '../../core/services/cloudinary.service';
import { NotFoundError, ValidationError } from '../../core/errors/AppError';
import { logger } from '../../core/logging/logger';

export class AdminApplicationsService {
  public static async listApplications(
    type: 'students' | 'trainers' | 'tutors',
    status?: string,
    page = 1,
    limit = 20
  ) {
    const offset = (page - 1) * limit;
    let tableName: string;

    if (type === 'students') {
      tableName = 'StudentApplication';
    } else if (type === 'trainers') {
      tableName = 'TrainerApplication';
    } else if (type === 'tutors') {
      tableName = 'TutorApplication';
    } else {
      throw new ValidationError(`Invalid application type: ${type}`);
    }

    let sql = `SELECT * FROM "public"."${tableName}"`;
    const params: any[] = [];

    if (status) {
      params.push(status);
      sql += ` WHERE "status" = $${params.length}`;
    }

    sql += ` ORDER BY "createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const rows = await query(sql, params);

    // Get total count
    let countSql = `SELECT COUNT(*) as total FROM "public"."${tableName}"`;
    const countParams: any[] = [];
    if (status) {
      countParams.push(status);
      countSql += ` WHERE "status" = $1`;
    }
    const countRes = await queryOne<{ total: string }>(countSql, countParams);
    const total = parseInt(countRes?.total || '0', 10);

    return {
      type,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: rows,
    };
  }

  public static async getApplicationDetail(
    type: 'students' | 'trainers' | 'tutors',
    id: string
  ) {
    let tableName: string;
    let docForeignKey: string;

    if (type === 'students') {
      tableName = 'StudentApplication';
      docForeignKey = 'studentApplicationId';
    } else if (type === 'trainers') {
      tableName = 'TrainerApplication';
      docForeignKey = 'trainerApplicationId';
    } else if (type === 'tutors') {
      tableName = 'TutorApplication';
      docForeignKey = 'tutorApplicationId';
    } else {
      throw new ValidationError(`Invalid application type: ${type}`);
    }

    const application = await queryOne(
      `SELECT * FROM "public"."${tableName}" WHERE "id" = $1 OR "referenceNumber" = $1`,
      [id]
    );

    if (!application) {
      throw new NotFoundError(`Application '${id}' not found`);
    }

    // Load documents
    const documents = await query(
      `SELECT * FROM "public"."ApplicationDocument" WHERE "${docForeignKey}" = $1`,
      [application.id]
    );

    // Generate signed, expiring document URLs for admin review
    const signedDocuments = documents.map((doc: any) => ({
      ...doc,
      reviewUrl: CloudinaryService.generateSignedReviewUrl(
        doc.cloudinaryPublicId,
        doc.cloudinaryResourceType
      ),
    }));

    // Load review history
    const reviews = await query(
      `SELECT * FROM "public"."ApplicationReview" WHERE "${docForeignKey}" = $1 ORDER BY "createdAt" DESC`,
      [application.id]
    );

    return {
      application,
      documents: signedDocuments,
      reviews,
    };
  }

  public static async recordReviewDecision(params: {
    type: 'students' | 'trainers' | 'tutors';
    applicationId: string;
    reviewerId: string;
    reviewerName: string;
    decision: 'ACCEPTED' | 'REJECTED' | 'WAITLISTED' | 'NEEDS_INFO';
    notes?: string;
  }) {
    const { type, applicationId, reviewerId, reviewerName, decision, notes } = params;

    let tableName: string;
    let docForeignKey: string;

    if (type === 'students') {
      tableName = 'StudentApplication';
      docForeignKey = 'studentApplicationId';
    } else if (type === 'trainers') {
      tableName = 'TrainerApplication';
      docForeignKey = 'trainerApplicationId';
    } else if (type === 'tutors') {
      tableName = 'TutorApplication';
      docForeignKey = 'tutorApplicationId';
    } else {
      throw new ValidationError(`Invalid application type: ${type}`);
    }

    const existing = await queryOne(
      `SELECT "id" FROM "public"."${tableName}" WHERE "id" = $1 OR "referenceNumber" = $1`,
      [applicationId]
    );

    if (!existing) {
      throw new NotFoundError(`Application '${applicationId}' not found`);
    }

    const reviewId = crypto.randomUUID();

    await transaction(async (client) => {
      // Record review
      await client.query(
        `INSERT INTO "public"."ApplicationReview" (
          "id", "reviewerId", "reviewerName", "decision", "notes",
          "${docForeignKey}", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [reviewId, reviewerId, reviewerName, decision, notes || null, existing.id]
      );

      // Update application status
      await client.query(
        `UPDATE "public"."${tableName}" 
         SET "status" = $1, "updatedAt" = NOW() 
         WHERE "id" = $2`,
        [decision, existing.id]
      );
    });

    logger.info(
      { reviewId, applicationId: existing.id, decision, reviewerId },
      'Recorded application review decision'
    );

    return {
      success: true,
      reviewId,
      status: decision,
      message: `Application status updated to ${decision}`,
    };
  }
}
