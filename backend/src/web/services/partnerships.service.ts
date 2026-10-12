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

  public static async listPartnerships(page = 1, limit = 20, status?: string, search?: string) {
    const offset = (page - 1) * limit;
    let sql = `SELECT "id", "reference", "organizationName", "organizationType", "contactPerson", "email", "phone", "country", "city", "partnershipType", "status", "createdAt", "updatedAt" FROM "public"."PartnershipRequest"`;
    const params: any[] = [];
    const whereClauses: string[] = [];

    if (status) {
      params.push(status);
      whereClauses.push(`"status" = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`("organizationName" ILIKE $${params.length} OR "contactPerson" ILIKE $${params.length} OR "reference" ILIKE $${params.length} OR "email" ILIKE $${params.length})`);
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

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: rows,
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
      reviewUrl: CloudinaryService.generateSignedReviewUrl(
        doc.cloudinaryPublicId,
        doc.cloudinaryResourceType
      ),
    }));

    return {
      partnership,
      documents: signedDocuments,
    };
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
      `SELECT "id", "reference" FROM "public"."PartnershipRequest" WHERE "id" = $1 OR "reference" = $1`,
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
