import crypto from 'crypto';
import { query, queryOne, transaction } from '../../core/database/db';
import { CloudinaryService, FileToUpload, UploadedFileResult } from '../../core/services/cloudinary.service';
import { generateReferenceNumber } from '../../core/utils/referenceNumber';
import { NotFoundError, ValidationError } from '../../core/errors/AppError';
import { logger } from '../../core/logging/logger';

export interface CreatePartnershipDTO {
  organizationName: string;
  organizationType: string;
  contactPerson: string;
  email: string;
  phone: string;
  country?: string;
  city?: string;
  partnershipType: string;
  proposal?: string;
}

export class PartnershipsService {
  public static async createPartnership(
    data: CreatePartnershipDTO,
    licenseFile?: FileToUpload
  ) {
    if (!licenseFile || !licenseFile.buffer || licenseFile.buffer.length === 0) {
      throw new ValidationError('Organization license document (PDF/JPEG/PNG) is required.');
    }

    let uploadedDoc: UploadedFileResult | null = null;
    try {
      uploadedDoc = await CloudinaryService.uploadDocument(
        licenseFile,
        'partnerships',
        'ORGANIZATION_LICENSE'
      );
    } catch (uploadError) {
      throw uploadError;
    }

    const partnershipId = crypto.randomUUID();
    const reference = generateReferenceNumber('PRT');
    const docId = crypto.randomUUID();

    try {
      await transaction(async (client) => {
        await client.query(
          `INSERT INTO "public"."PartnershipRequest" (
            "id", "reference", "organizationName", "organizationType",
            "contactPerson", "email", "phone", "country", "city",
            "partnershipType", "proposal", "status", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PENDING', NOW(), NOW())`,
          [
            partnershipId,
            reference,
            data.organizationName,
            data.organizationType,
            data.contactPerson,
            data.email.toLowerCase().trim(),
            data.phone.trim(),
            data.country || null,
            data.city || null,
            data.partnershipType,
            data.proposal || null,
          ]
        );

        await client.query(
          `INSERT INTO "public"."ApplicationDocument" (
            "id", "category", "originalFilename", "fileType", "fileSize",
            "cloudinaryPublicId", "cloudinarySecureUrl", "cloudinaryResourceType",
            "cloudinaryDeliveryType", "partnershipRequestId", "createdAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
          [
            docId,
            'ORGANIZATION_LICENSE',
            uploadedDoc.originalFilename,
            uploadedDoc.fileType,
            uploadedDoc.fileSize,
            uploadedDoc.cloudinaryPublicId,
            uploadedDoc.cloudinarySecureUrl,
            uploadedDoc.cloudinaryResourceType,
            'authenticated',
            partnershipId,
          ]
        );
      });

      logger.info(
        { reference, partnershipId, organizationName: data.organizationName },
        'Partnership request successfully created with organization license'
      );

      return {
        success: true,
        reference,
        referenceNumber: reference,
        message: 'Your partnership inquiry and license document have been securely received. Our partnerships director will review and follow up within two business days.',
      };
    } catch (dbError) {
      if (uploadedDoc) {
        await CloudinaryService.deleteAsset(
          uploadedDoc.cloudinaryPublicId,
          uploadedDoc.cloudinaryResourceType
        );
      }
      throw dbError;
    }
  }

  public static async getPartnershipStats() {
    const totalRow = await queryOne<{ count: string | number }>(
      `SELECT COUNT(*) as count FROM "public"."PartnershipRequest"`
    );
    const pendingRow = await queryOne<{ count: string | number }>(
      `SELECT COUNT(*) as count FROM "public"."PartnershipRequest" WHERE "status" = 'PENDING'`
    );
    const underReviewRow = await queryOne<{ count: string | number }>(
      `SELECT COUNT(*) as count FROM "public"."PartnershipRequest" WHERE "status" = 'UNDER_REVIEW'`
    );
    const approvedRow = await queryOne<{ count: string | number }>(
      `SELECT COUNT(*) as count FROM "public"."PartnershipRequest" WHERE "status" = 'APPROVED'`
    );
    const rejectedRow = await queryOne<{ count: string | number }>(
      `SELECT COUNT(*) as count FROM "public"."PartnershipRequest" WHERE "status" = 'REJECTED'`
    );

    return {
      total: Number(totalRow?.count || 0),
      pending: Number(pendingRow?.count || 0),
      underReview: Number(underReviewRow?.count || 0),
      approved: Number(approvedRow?.count || 0),
      rejected: Number(rejectedRow?.count || 0),
      totalRequests: Number(totalRow?.count || 0),
      pendingRequests: Number(pendingRow?.count || 0),
    };
  }

  public static async listPartnerships(page = 1, limit = 20, status?: string, search?: string) {
    const offset = (page - 1) * limit;
    let sql = `SELECT "id", "reference", "organizationName", "organizationType", "contactPerson", "email", "phone", "country", "city", "partnershipType", "status", "reviewNotes", "reviewedBy", "reviewedAt", "createdAt", "updatedAt" FROM "public"."PartnershipRequest"`;
    const params: any[] = [];
    const whereClauses: string[] = [];

    if (status && status !== 'ALL') {
      params.push(status);
      whereClauses.push(`"status" = $${params.length}`);
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      whereClauses.push(`("organizationName" ILIKE $${params.length} OR "contactPerson" ILIKE $${params.length} OR "reference" ILIKE $${params.length} OR "email" ILIKE $${params.length} OR "phone" ILIKE $${params.length})`);
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ` + whereClauses.join(' AND ');
    }

    sql += ` ORDER BY "createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const rows = await query(sql, params);

    let countSql = `SELECT COUNT(*) as total FROM "public"."PartnershipRequest"`;
    if (whereClauses.length > 0) {
      countSql += ` WHERE ` + whereClauses.join(' AND ');
    }
    const countRes = await queryOne<{ total: string }>(countSql, params.slice(0, whereClauses.length));
    const total = parseInt(countRes?.total || '0', 10);

    // Query attached documents for these partnerships
    const partnershipIds = rows.map((r: any) => r.id);
    const docMap = new Map<string, any[]>();
    if (partnershipIds.length > 0) {
      const placeholders = partnershipIds.map((_, i) => `$${i + 1}`).join(', ');
      const docs = await query(
        `SELECT "id", "partnershipRequestId", "category", "originalFilename", "fileType", "fileSize", "createdAt" 
         FROM "public"."ApplicationDocument" 
         WHERE "partnershipRequestId" IN (${placeholders})`,
        partnershipIds
      );
      for (const d of docs) {
        if (!docMap.has(d.partnershipRequestId)) {
          docMap.set(d.partnershipRequestId, []);
        }
        docMap.get(d.partnershipRequestId)!.push(d);
      }
    }

    const enriched = rows.map((r: any) => {
      const pDocs = docMap.get(r.id) || [];
      return {
        ...r,
        documents: pDocs,
        hasDocument: pDocs.length > 0,
        hasLicenseDocument: pDocs.length > 0,
        organizationLicenseDoc: pDocs.length > 0 ? `/api/v1/admin/partnerships/${r.id}/documents/${pDocs[0].id}/view` : null,
      };
    });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      data: enriched,
    };
  }

  public static async getPartnershipDetail(id: string) {
    const partnership = await queryOne(
      `SELECT * FROM "public"."PartnershipRequest" WHERE "id" = $1 OR "reference" = $1`,
      [id]
    );

    if (!partnership) {
      throw new NotFoundError(`Partnership request '${id}' not found`);
    }

    const documents = await query(
      `SELECT "id", "category", "originalFilename", "fileType", "fileSize", "cloudinaryPublicId", "cloudinaryResourceType", "cloudinaryDeliveryType", "createdAt" 
       FROM "public"."ApplicationDocument" WHERE "partnershipRequestId" = $1`,
      [partnership.id]
    );

    const signedDocuments = documents.map((doc: any) => ({
      ...doc,
      originalName: doc.originalFilename,
      mimeType: doc.fileType,
      reviewUrl: CloudinaryService.generateSignedReviewUrl(
        doc.cloudinaryPublicId,
        doc.cloudinaryResourceType
      ),
      viewUrl: `/api/v1/admin/partnerships/${partnership.id}/documents/${doc.id}/view`,
      downloadUrl: `/api/v1/admin/partnerships/${partnership.id}/documents/${doc.id}/download`,
    }));

    // Fetch audit history for this partnership
    const auditLogs = await query(
      `SELECT "id", "adminUserId", "adminName", "action", "details", "createdAt" 
       FROM "public"."AdminAuditLog" 
       WHERE "resource" IN ('PartnershipRequest', 'ApplicationDocument') AND "details" ILIKE $1 
       ORDER BY "createdAt" DESC LIMIT 10`,
      [`%${partnership.id}%`]
    );

    return {
      partnership,
      documents: signedDocuments,
      auditLogs,
    };
  }

  public static async getDocumentAccessUrl(params: {
    partnershipId: string;
    documentId: string;
    adminUser: { id: string; name: string };
    ipAddress?: string;
  }) {
    const { partnershipId, documentId, adminUser, ipAddress } = params;

    const partnership = await queryOne(
      `SELECT "id", "reference", "organizationName" FROM "public"."PartnershipRequest" WHERE "id" = $1 OR "reference" = $1`,
      [partnershipId]
    );

    if (!partnership) {
      throw new NotFoundError(`Partnership request '${partnershipId}' not found`);
    }

    const doc = await queryOne(
      `SELECT * FROM "public"."ApplicationDocument" WHERE "id" = $1 AND "partnershipRequestId" = $2`,
      [documentId, partnership.id]
    );

    if (!doc) {
      throw new NotFoundError(`Document '${documentId}' not found for partnership '${partnership.reference}'`);
    }

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

    try {
      await query(
        `INSERT INTO "public"."AdminAuditLog" (
          "id", "adminUserId", "adminName", "action", "resource", "details", "ipAddress", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          crypto.randomUUID(),
          adminUser.id,
          adminUser.name,
          'DOCUMENT_ACCESS',
          'ApplicationDocument',
          JSON.stringify({
            documentId: doc.id,
            filename: doc.originalFilename,
            category: doc.category,
            partnershipId: partnership.id,
            reference: partnership.reference,
            organizationName: partnership.organizationName,
          }),
          ipAddress || '127.0.0.1',
        ]
      );
    } catch (auditErr: any) {
      logger.warn({ err: auditErr.message }, 'Failed to record partnership document access audit log');
    }

    return {
      success: true,
      data: {
        id: doc.id,
        category: doc.category,
        originalFilename: doc.originalFilename,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        accessUrl: signedUrl,
      },
      document: {
        id: doc.id,
        category: doc.category,
        originalFilename: doc.originalFilename,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        accessUrl: signedUrl,
      },
      accessUrl: signedUrl,
    };
  }

  public static async streamDocument(params: {
    partnershipId: string;
    documentId: string;
    adminUser: { id: string; name: string };
    disposition: 'inline' | 'attachment';
    ipAddress?: string;
    res: any;
  }) {
    const { partnershipId, documentId, adminUser, disposition, ipAddress, res } = params;

    const partnership = await queryOne(
      `SELECT "id", "reference", "organizationName" FROM "public"."PartnershipRequest" WHERE "id" = $1 OR "reference" = $1`,
      [partnershipId]
    );

    if (!partnership) {
      throw new NotFoundError(`Partnership request '${partnershipId}' not found`);
    }

    const doc = await queryOne(
      `SELECT * FROM "public"."ApplicationDocument" WHERE "id" = $1 AND "partnershipRequestId" = $2`,
      [documentId, partnership.id]
    );

    if (!doc) {
      throw new NotFoundError(`Document '${documentId}' not found for partnership '${partnership.reference}'`);
    }

    let ext = 'pdf';
    if (doc.originalFilename && doc.originalFilename.includes('.')) {
      ext = doc.originalFilename.split('.').pop()!.toLowerCase();
    } else if (doc.cloudinaryPublicId && doc.cloudinaryPublicId.includes('.')) {
      ext = doc.cloudinaryPublicId.split('.').pop()!.toLowerCase();
    }

    try {
      await query(
        `INSERT INTO "public"."AdminAuditLog" (
          "id", "adminUserId", "adminName", "action", "resource", "details", "ipAddress", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          crypto.randomUUID(),
          adminUser.id,
          adminUser.name,
          disposition === 'inline' ? 'DOCUMENT_VIEW' : 'DOCUMENT_DOWNLOAD',
          'ApplicationDocument',
          JSON.stringify({
            documentId: doc.id,
            filename: doc.originalFilename,
            category: doc.category,
            partnershipId: partnership.id,
            reference: partnership.reference,
            organizationName: partnership.organizationName,
          }),
          ipAddress || '127.0.0.1',
        ]
      );
    } catch (auditErr: any) {
      logger.warn({ err: auditErr.message }, 'Failed to record partnership document stream audit log');
    }

    const assetStream = await CloudinaryService.fetchAssetStream(
      doc.cloudinaryPublicId,
      doc.cloudinaryResourceType || 'raw',
      ext
    );

    const contentType = doc.fileType || (assetStream.headers['content-type'] as string) || 'application/pdf';
    const filename = encodeURIComponent(doc.originalFilename || 'partnership_document.pdf');

    res.writeHead(assetStream.statusCode || 200, {
      'Content-Type': contentType,
      'Content-Disposition': `${disposition}; filename="${filename}"; filename*=UTF-8''${filename}`,
      'X-Content-Type-Options': 'nosniff',
      ...(assetStream.headers['content-length'] ? { 'Content-Length': assetStream.headers['content-length'] } : {}),
    });

    assetStream.stream.pipe(res);
  }

  public static async getLicenseDownloadUrl(id: string) {
    const partnership = await queryOne(
      `SELECT "id", "reference" FROM "public"."PartnershipRequest" WHERE "id" = $1 OR "reference" = $1`,
      [id]
    );

    if (!partnership) {
      throw new NotFoundError(`Partnership request '${id}' not found`);
    }

    const doc = await queryOne(
      `SELECT * FROM "public"."ApplicationDocument" WHERE "partnershipRequestId" = $1 AND "category" = 'ORGANIZATION_LICENSE' LIMIT 1`,
      [partnership.id]
    );

    if (!doc) {
      throw new NotFoundError('No organization license document found for this partnership');
    }

    const signedUrl = CloudinaryService.generateSignedReviewUrl(
      doc.cloudinaryPublicId,
      doc.cloudinaryResourceType
    );

    return {
      success: true,
      filename: doc.originalFilename,
      mimeType: doc.fileType,
      sizeBytes: doc.fileSize,
      downloadUrl: signedUrl,
      expiresInSeconds: 3600,
    };
  }

  public static async reviewPartnership(params: {
    id: string;
    status: string;
    reviewNotes?: string;
    reviewerId: string;
    reviewerName: string;
  }) {
    const partnership = await queryOne(
      `SELECT "id", "reference", "organizationName" FROM "public"."PartnershipRequest" WHERE "id" = $1 OR "reference" = $1`,
      [params.id]
    );

    if (!partnership) {
      throw new NotFoundError(`Partnership request '${params.id}' not found`);
    }

    await query(
      `UPDATE "public"."PartnershipRequest"
       SET "status" = $1, "reviewNotes" = $2, "reviewedBy" = $3, "reviewedAt" = NOW(), "updatedAt" = NOW()
       WHERE "id" = $4`,
      [params.status, params.reviewNotes || null, params.reviewerName, partnership.id]
    );

    // Record audit log
    try {
      await query(
        `INSERT INTO "public"."AdminAuditLog" (
          "id", "adminUserId", "adminName", "action", "resource", "details", "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          crypto.randomUUID(),
          params.reviewerId,
          params.reviewerName,
          'PARTNERSHIP_REVIEW',
          'PartnershipRequest',
          JSON.stringify({
            partnershipId: partnership.id,
            reference: partnership.reference,
            organizationName: partnership.organizationName,
            status: params.status,
            reviewNotes: params.reviewNotes || null,
          }),
        ]
      );
    } catch (auditErr: any) {
      logger.warn({ err: auditErr.message }, 'Failed to record partnership review audit log');
    }

    logger.info(
      { partnershipId: partnership.id, status: params.status, reviewedBy: params.reviewerName },
      'Partnership request status reviewed and updated'
    );

    return {
      success: true,
      message: `Partnership request '${partnership.reference}' status updated to ${params.status}`,
    };
  }
}
