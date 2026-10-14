import crypto from 'crypto';
import { Response } from 'express';
import { query, queryOne, transaction } from '../../core/database/db';
import { CloudinaryService } from '../../core/services/cloudinary.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotFoundError, ValidationError } from '../../core/errors/AppError';
import { logger } from '../../core/logging/logger';

export class AdminApplicationsService {
  public static async listApplications(
    type: 'students' | 'trainers' | 'tutors',
    status?: string,
    page = 1,
    limit = 20,
    search?: string
  ) {
    const offset = Math.max(0, (page - 1) * limit);
    const params: any[] = [];
    const countParams: any[] = [];

    let selectSql = '';
    let countSql = '';
    let whereClauses: string[] = [];

    if (type === 'students') {
      selectSql = `
        SELECT 
          s."id", s."referenceNumber", s."fullName", s."gender", s."age",
          s."classCompletionYear", s."telegramPhone", s."email", s."status",
          s."programId", s."createdAt", s."updatedAt",
          p."title" AS "programTitle", p."category" AS "programCategory",
          (SELECT COUNT(*) FROM "public"."ApplicationDocument" d WHERE d."studentApplicationId" = s."id") AS "documentCount"
        FROM "public"."StudentApplication" s
        LEFT JOIN "public"."TrainingProgram" p ON s."programId" = p."id"
      `;
      countSql = `
        SELECT COUNT(*) as total 
        FROM "public"."StudentApplication" s
        LEFT JOIN "public"."TrainingProgram" p ON s."programId" = p."id"
      `;

      if (status && status !== 'ALL') {
        params.push(status);
        countParams.push(status);
        whereClauses.push(`s."status" = $${params.length}`);
      }

      if (search && search.trim()) {
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern);
        countParams.push(searchPattern);
        const idx = params.length;
        whereClauses.push(
          `(s."fullName" ILIKE $${idx} OR s."email" ILIKE $${idx} OR s."referenceNumber" ILIKE $${idx} OR s."telegramPhone" ILIKE $${idx} OR p."title" ILIKE $${idx})`
        );
      }
    } else if (type === 'trainers') {
      selectSql = `
        SELECT 
          t."id", t."referenceNumber", t."fullName", t."email", t."telegramPhone",
          t."expertiseTrack", t."yearsOfExperience", t."portfolioUrl",
          t."teachingStatement", t."status", t."createdAt", t."updatedAt",
          (SELECT COUNT(*) FROM "public"."ApplicationDocument" d WHERE d."trainerApplicationId" = t."id") AS "documentCount"
        FROM "public"."TrainerApplication" t
      `;
      countSql = `SELECT COUNT(*) as total FROM "public"."TrainerApplication" t`;

      if (status && status !== 'ALL') {
        params.push(status);
        countParams.push(status);
        whereClauses.push(`t."status" = $${params.length}`);
      }

      if (search && search.trim()) {
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern);
        countParams.push(searchPattern);
        const idx = params.length;
        whereClauses.push(
          `(t."fullName" ILIKE $${idx} OR t."email" ILIKE $${idx} OR t."referenceNumber" ILIKE $${idx} OR t."telegramPhone" ILIKE $${idx} OR t."expertiseTrack" ILIKE $${idx})`
        );
      }
    } else if (type === 'tutors') {
      selectSql = `
        SELECT 
          u."id", u."referenceNumber", u."studentOrApplicantName",
          u."parentOrContactPhone", u."email", u."gradeLevel", u."subjects",
          u."deliveryPreference", u."locationDetails", u."qualifications",
          u."experience", u."hourlyRate", u."status", u."createdAt", u."updatedAt",
          p."paymentReference", p."status" AS "paymentStatus", p."amount" AS "paymentAmount",
          (SELECT COUNT(*) FROM "public"."ApplicationDocument" d WHERE d."tutorApplicationId" = u."id") AS "documentCount"
        FROM "public"."TutorApplication" u
        LEFT JOIN "public"."TutoringPayment" p ON u."id" = p."tutorApplicationId"
      `;
      countSql = `
        SELECT COUNT(*) as total 
        FROM "public"."TutorApplication" u
        LEFT JOIN "public"."TutoringPayment" p ON u."id" = p."tutorApplicationId"
      `;

      if (status && status !== 'ALL') {
        params.push(status);
        countParams.push(status);
        whereClauses.push(`u."status" = $${params.length}`);
      }

      if (search && search.trim()) {
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern);
        countParams.push(searchPattern);
        const idx = params.length;
        whereClauses.push(
          `(u."studentOrApplicantName" ILIKE $${idx} OR u."email" ILIKE $${idx} OR u."referenceNumber" ILIKE $${idx} OR u."parentOrContactPhone" ILIKE $${idx} OR u."subjects" ILIKE $${idx} OR u."gradeLevel" ILIKE $${idx})`
        );
      }
    } else {
      throw new ValidationError(`Invalid application type: ${type}`);
    }

    if (whereClauses.length > 0) {
      const whereString = ' WHERE ' + whereClauses.join(' AND ');
      selectSql += whereString;
      countSql += whereString;
    }

    const orderPrefix = type === 'students' ? 's' : type === 'trainers' ? 't' : 'u';
    selectSql += ` ORDER BY ${orderPrefix}."createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [rows, countRes] = await Promise.all([
      query(selectSql, params),
      queryOne<{ total: string | number }>(countSql, countParams),
    ]);

    const total = parseInt(String(countRes?.total || '0'), 10);

    return {
      type,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
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

    let application: any;

    if (type === 'students') {
      application = await queryOne(
        `SELECT 
           s.*, 
           p."title" AS "programTitle", 
           p."category" AS "programCategory", 
           p."duration" AS "programDuration"
         FROM "public"."StudentApplication" s
         LEFT JOIN "public"."TrainingProgram" p ON s."programId" = p."id"
         WHERE s."id" = $1 OR s."referenceNumber" = $1`,
        [id]
      );
    } else if (type === 'tutors') {
      application = await queryOne(
        `SELECT 
           u.*, 
           p."paymentReference", 
           p."status" AS "paymentStatus", 
           p."amount" AS "paymentAmount",
           p."currency" AS "paymentCurrency",
           p."paymentMode"
         FROM "public"."TutorApplication" u
         LEFT JOIN "public"."TutoringPayment" p ON u."id" = p."tutorApplicationId"
         WHERE u."id" = $1 OR u."referenceNumber" = $1`,
        [id]
      );
    } else {
      application = await queryOne(
        `SELECT * FROM "public"."${tableName}" WHERE "id" = $1 OR "referenceNumber" = $1`,
        [id]
      );
    }

    if (!application) {
      throw new NotFoundError(`Application '${id}' not found`);
    }

    // Load documents
    const documents = await query(
      `SELECT * FROM "public"."ApplicationDocument" WHERE "${docForeignKey}" = $1 ORDER BY "createdAt" ASC`,
      [application.id]
    );

    // Generate signed, expiring document URLs for admin review
    const signedDocuments = documents.map((doc: any) => {
      let ext = 'pdf';
      if (doc.originalFilename && doc.originalFilename.includes('.')) {
        ext = doc.originalFilename.split('.').pop()!.toLowerCase();
      } else if (doc.cloudinaryPublicId && doc.cloudinaryPublicId.includes('.')) {
        ext = doc.cloudinaryPublicId.split('.').pop()!.toLowerCase();
      }

      const reviewUrl = CloudinaryService.generateSignedReviewUrl(
        doc.cloudinaryPublicId,
        doc.cloudinaryResourceType || 'raw',
        ext
      );

      return {
        id: doc.id,
        category: doc.category,
        originalFilename: doc.originalFilename,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        cloudinaryPublicId: doc.cloudinaryPublicId,
        createdAt: doc.createdAt,
        reviewUrl,
        viewUrl: `/api/v1/admin/applications/${type}/${application.id}/documents/${doc.id}/view`,
        downloadUrl: `/api/v1/admin/applications/${type}/${application.id}/documents/${doc.id}/download`,
      };
    });

    // Load review history
    const reviews = await query(
      `SELECT * FROM "public"."ApplicationReview" WHERE "${docForeignKey}" = $1 ORDER BY "createdAt" DESC`,
      [application.id]
    );

    // Load decision notification outbox history
    const notifications = await NotificationService.getNotificationsForApplication(type, application.id);

    return {
      application,
      documents: signedDocuments,
      reviews,
      notifications,
      latestNotification: notifications.length > 0 ? notifications[0] : null,
    };
  }

  public static async getDocumentAccess(params: {
    type: 'students' | 'trainers' | 'tutors';
    applicationId: string;
    documentId: string;
    adminUser: { id: string; name: string };
    ipAddress?: string;
  }) {
    const { type, applicationId, documentId, adminUser, ipAddress } = params;
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

    // Verify application exists
    const app = await queryOne(
      `SELECT "id", "referenceNumber" FROM "public"."${tableName}" WHERE "id" = $1 OR "referenceNumber" = $1`,
      [applicationId]
    );
    if (!app) {
      throw new NotFoundError(`Application '${applicationId}' not found`);
    }

    // Verify document belongs to application
    const doc = await queryOne(
      `SELECT * FROM "public"."ApplicationDocument" WHERE "id" = $1 AND "${docForeignKey}" = $2`,
      [documentId, app.id]
    );
    if (!doc) {
      throw new NotFoundError(`Document '${documentId}' not found for application '${applicationId}'`);
    }

    // Generate signed URL
    let ext = 'pdf';
    if (doc.originalFilename && doc.originalFilename.includes('.')) {
      ext = doc.originalFilename.split('.').pop()!.toLowerCase();
    } else if (doc.cloudinaryPublicId && doc.cloudinaryPublicId.includes('.')) {
      ext = doc.cloudinaryPublicId.split('.').pop()!.toLowerCase();
    }

    const signedUrl = CloudinaryService.generateSignedReviewUrl(
      doc.cloudinaryPublicId,
      doc.cloudinaryResourceType || 'raw',
      ext
    );

    // Audit log document access
    try {
      const auditId = crypto.randomUUID();
      await query(
        `INSERT INTO "public"."AdminAuditLog" (
          "id", "adminUserId", "adminName", "action", "resource", "details", "ipAddress", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          auditId,
          adminUser.id,
          adminUser.name,
          'DOCUMENT_ACCESS',
          'ApplicationDocument',
          JSON.stringify({
            documentId: doc.id,
            filename: doc.originalFilename,
            category: doc.category,
            applicationId: app.id,
            referenceNumber: app.referenceNumber,
            applicationType: type,
          }),
          ipAddress || '127.0.0.1',
        ]
      );
    } catch (auditErr: any) {
      logger.warn({ err: auditErr.message }, 'Failed to record document access audit log');
    }

    return {
      success: true,
      document: {
        id: doc.id,
        category: doc.category,
        originalFilename: doc.originalFilename,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        accessUrl: signedUrl,
      },
    };
  }

  public static async streamDocument(params: {
    type: 'students' | 'trainers' | 'tutors';
    applicationId: string;
    documentId: string;
    adminUser: { id: string; name: string };
    disposition: 'inline' | 'attachment';
    ipAddress?: string;
    res: Response;
  }) {
    const { type, applicationId, documentId, adminUser, disposition, ipAddress, res } = params;
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

    const app = await queryOne(
      `SELECT "id", "referenceNumber" FROM "public"."${tableName}" WHERE "id" = $1 OR "referenceNumber" = $1`,
      [applicationId]
    );
    if (!app) {
      throw new NotFoundError(`Application '${applicationId}' not found`);
    }

    const doc = await queryOne(
      `SELECT * FROM "public"."ApplicationDocument" WHERE "id" = $1 AND "${docForeignKey}" = $2`,
      [documentId, app.id]
    );
    if (!doc) {
      throw new NotFoundError(`Document '${documentId}' not found for application '${applicationId}'`);
    }

    let ext = 'pdf';
    if (doc.originalFilename && doc.originalFilename.includes('.')) {
      ext = doc.originalFilename.split('.').pop()!.toLowerCase();
    } else if (doc.cloudinaryPublicId && doc.cloudinaryPublicId.includes('.')) {
      ext = doc.cloudinaryPublicId.split('.').pop()!.toLowerCase();
    }

    // Record audit log
    try {
      const auditId = crypto.randomUUID();
      await query(
        `INSERT INTO "public"."AdminAuditLog" (
          "id", "adminUserId", "adminName", "action", "resource", "details", "ipAddress", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          auditId,
          adminUser.id,
          adminUser.name,
          disposition === 'inline' ? 'DOCUMENT_VIEW' : 'DOCUMENT_DOWNLOAD',
          'ApplicationDocument',
          JSON.stringify({
            documentId: doc.id,
            filename: doc.originalFilename,
            category: doc.category,
            applicationId: app.id,
            referenceNumber: app.referenceNumber,
            applicationType: type,
          }),
          ipAddress || '127.0.0.1',
        ]
      );
    } catch (auditErr: any) {
      logger.warn({ err: auditErr.message }, 'Failed to record document streaming audit log');
    }

    const assetStream = await CloudinaryService.fetchAssetStream(
      doc.cloudinaryPublicId,
      doc.cloudinaryResourceType || 'raw',
      ext
    );

    const contentType = doc.fileType || (assetStream.headers['content-type'] as string) || 'application/pdf';
    const filename = encodeURIComponent(doc.originalFilename || 'document.pdf');

    res.writeHead(assetStream.statusCode || 200, {
      'Content-Type': contentType,
      'Content-Disposition': `${disposition}; filename="${filename}"; filename*=UTF-8''${filename}`,
      ...(assetStream.headers['content-length'] ? { 'Content-Length': assetStream.headers['content-length'] } : {}),
    });

    assetStream.stream.pipe(res);
  }

  public static async recordReviewDecision(params: {
    type: 'students' | 'trainers' | 'tutors';
    applicationId: string;
    reviewerId: string;
    reviewerName: string;
    decision: string;
    notes?: string;
    ipAddress?: string;
  }) {
    const { type, applicationId, reviewerId, reviewerName, decision, notes, ipAddress } = params;

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

    // Normalize decision / status
    let normalizedDecision = decision.toUpperCase().trim();
    if (normalizedDecision === 'ACCEPTED') {
      normalizedDecision = 'APPROVED';
    }

    const validDecisions = [
      'APPROVED',
      'REJECTED',
      'UNDER_REVIEW',
      'WAITLISTED',
      'NEEDS_INFO',
      'PENDING',
    ];

    if (!validDecisions.includes(normalizedDecision)) {
      throw new ValidationError(
        `Invalid decision '${decision}'. Allowed decisions: ${validDecisions.join(', ')}`
      );
    }

    let nameColumn = '"fullName"';
    if (type === 'tutors') {
      nameColumn = '"studentOrApplicantName"';
    }

    const existing = await queryOne(
      `SELECT "id", "referenceNumber", "status", ${nameColumn} AS "applicantName", "email" 
       FROM "public"."${tableName}" 
       WHERE "id" = $1 OR "referenceNumber" = $1`,
      [applicationId]
    );

    if (!existing) {
      throw new NotFoundError(`Application '${applicationId}' not found`);
    }

    const isFinalDecision = normalizedDecision === 'APPROVED' || normalizedDecision === 'REJECTED';
    const isStatusTransition = existing.status !== normalizedDecision;
    const shouldNotify = isFinalDecision && isStatusTransition;

    const reviewId = crypto.randomUUID();
    const auditId = crypto.randomUUID();
    let notificationRecord: any = null;

    await transaction(async (client) => {
      // Record review
      await client.query(
        `INSERT INTO "public"."ApplicationReview" (
          "id", "reviewerId", "reviewerName", "decision", "notes",
          "${docForeignKey}", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [reviewId, reviewerId, reviewerName, normalizedDecision, notes || null, existing.id]
      );

      // Update application status
      await client.query(
        `UPDATE "public"."${tableName}" 
         SET "status" = $1, "updatedAt" = NOW() 
         WHERE "id" = $2`,
        [normalizedDecision, existing.id]
      );

      // Insert audit log
      await client.query(
        `INSERT INTO "public"."AdminAuditLog" (
          "id", "adminUserId", "adminName", "action", "resource", "details", "ipAddress", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          auditId,
          reviewerId,
          reviewerName,
          'APPLICATION_STATUS_UPDATE',
          tableName,
          JSON.stringify({
            applicationId: existing.id,
            referenceNumber: existing.referenceNumber,
            previousStatus: existing.status,
            newStatus: normalizedDecision,
            notes: notes || null,
          }),
          ipAddress || '127.0.0.1',
        ]
      );

      // Trigger decision email notification only on actual transition into final status (APPROVED or REJECTED)
      if (shouldNotify) {
        notificationRecord = await NotificationService.createDecisionNotification(client, {
          applicationType: type,
          applicationId: existing.id,
          referenceNumber: existing.referenceNumber,
          recipientName: existing.applicantName || 'Applicant',
          recipientEmail: existing.email || '',
          decision: normalizedDecision as 'APPROVED' | 'REJECTED',
          reviewId,
        });
      }
    });

    // Asynchronously dispatch notification if one was created, without blocking or risking the saved decision
    let dispatchResult: any = null;
    if (notificationRecord && notificationRecord.id) {
      dispatchResult = await NotificationService.dispatchNotification(notificationRecord.id);
    }

    const finalNotification = dispatchResult?.notification || notificationRecord || null;

    logger.info(
      {
        reviewId,
        applicationId: existing.id,
        decision: normalizedDecision,
        reviewerId,
        notificationStatus: finalNotification?.status,
        shouldNotify,
      },
      'Recorded application review decision'
    );

    return {
      success: true,
      reviewId,
      status: normalizedDecision,
      message: shouldNotify
        ? `Application status updated to ${normalizedDecision}. Decision email notification processed.`
        : `Application status updated to ${normalizedDecision}.`,
      notification: finalNotification,
    };
  }

  public static async getApplicationNotifications(
    type: 'students' | 'trainers' | 'tutors',
    applicationId: string
  ) {
    let tableName: string;
    if (type === 'students') tableName = 'StudentApplication';
    else if (type === 'trainers') tableName = 'TrainerApplication';
    else if (type === 'tutors') tableName = 'TutorApplication';
    else throw new ValidationError(`Invalid application type: ${type}`);

    const app = await queryOne(
      `SELECT "id" FROM "public"."${tableName}" WHERE "id" = $1 OR "referenceNumber" = $1`,
      [applicationId]
    );

    if (!app) {
      throw new NotFoundError(`Application '${applicationId}' not found`);
    }

    const notifications = await NotificationService.getNotificationsForApplication(type, app.id);
    return {
      success: true,
      data: notifications,
    };
  }

  public static async retryApplicationNotification(params: {
    type: 'students' | 'trainers' | 'tutors';
    applicationId: string;
    notificationId: string;
    adminUser: { id: string; name: string };
    ipAddress?: string;
  }) {
    const { type, applicationId, notificationId, adminUser, ipAddress } = params;

    let tableName: string;
    if (type === 'students') tableName = 'StudentApplication';
    else if (type === 'trainers') tableName = 'TrainerApplication';
    else if (type === 'tutors') tableName = 'TutorApplication';
    else throw new ValidationError(`Invalid application type: ${type}`);

    const app = await queryOne(
      `SELECT "id" FROM "public"."${tableName}" WHERE "id" = $1 OR "referenceNumber" = $1`,
      [applicationId]
    );

    if (!app) {
      throw new NotFoundError(`Application '${applicationId}' not found`);
    }

    // Verify notification belongs to this application and type
    const notif = await queryOne(
      `SELECT * FROM "public"."ApplicationNotification" WHERE "id" = $1 AND "applicationId" = $2 AND "applicationType" = $3`,
      [notificationId, app.id, type]
    );

    if (!notif) {
      throw new NotFoundError(`Notification '${notificationId}' not found for this application`);
    }

    return NotificationService.retryNotification({
      notificationId,
      adminUser,
      ipAddress,
    });
  }
}
