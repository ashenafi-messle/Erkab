import crypto from 'crypto';
import { transaction, query, queryOne } from '../../core/database/db';
import { CloudinaryService, UploadedFileResult, FileToUpload } from '../../core/services/cloudinary.service';
import { generateReferenceNumber } from '../../core/utils/referenceNumber';
import { ValidationError, NotFoundError } from '../../core/errors/AppError';
import { logger } from '../../core/logging/logger';
import { ProgramsService } from './programs.service';

export interface StudentSubmissionDTO {
  fullName: string;
  gender: string;
  age: number;
  classCompletionYear: string;
  telegramPhone: string;
  email: string;
  selectedProgramId: string;
}

export interface TrainerSubmissionDTO {
  fullName: string;
  email: string;
  telegramPhone: string;
  expertiseTrack: string;
  yearsOfExperience: string;
  portfolioUrl?: string;
  teachingStatement: string;
}

export interface TutorSubmissionDTO {
  studentName?: string;
  studentOrApplicantName?: string;
  parentOrContactPhone: string;
  email?: string;
  educationLevel?: string;
  gradeLevel: string;
  subjects: string | string[];
  deliveryPreference: string;
  locationDetails?: string;
  qualifications?: string;
  experience?: string;
  hourlyRate?: string;
}

export interface SubmissionResponse {
  success: boolean;
  referenceNumber: string;
  paymentReference?: string;
  paymentUrl?: string;
  amount?: number;
  currency?: string;
  message: string;
}

export class ApplicationsService {
  public static async createStudentApplication(
    data: StudentSubmissionDTO,
    files: {
      educationCertificate?: FileToUpload;
      nationalId?: FileToUpload;
      ideaProposal?: FileToUpload;
    }
  ): Promise<SubmissionResponse> {
    // 1. Verify program exists
    const program = await ProgramsService.getByIdOrSlug(data.selectedProgramId);
    if (!program) {
      throw new NotFoundError(
        `Selected training program '${data.selectedProgramId}' does not exist or is not currently accepting applications.`
      );
    }

    // 2. Verify required files are provided
    if (!files.educationCertificate) {
      throw new ValidationError('Education certificate / degree document is required.');
    }
    if (!files.nationalId) {
      throw new ValidationError('National ID document is required.');
    }
    if (!files.ideaProposal) {
      throw new ValidationError('One-page project idea proposal is required.');
    }

    // 3. Upload documents to Cloudinary
    const uploadedDocs: { category: string; result: UploadedFileResult }[] = [];

    try {
      const certUpload = await CloudinaryService.uploadDocument(
        files.educationCertificate,
        'students',
        'EDUCATION_CERTIFICATE'
      );
      uploadedDocs.push({ category: 'EDUCATION_CERTIFICATE', result: certUpload });

      const idUpload = await CloudinaryService.uploadDocument(
        files.nationalId,
        'students',
        'NATIONAL_ID'
      );
      uploadedDocs.push({ category: 'NATIONAL_ID', result: idUpload });

      const proposalUpload = await CloudinaryService.uploadDocument(
        files.ideaProposal,
        'students',
        'IDEA_PROPOSAL'
      );
      uploadedDocs.push({ category: 'IDEA_PROPOSAL', result: proposalUpload });
    } catch (uploadError: any) {
      // Clean up any files that were already uploaded before failure
      for (const item of uploadedDocs) {
        await CloudinaryService.deleteAsset(
          item.result.cloudinaryPublicId,
          item.result.cloudinaryResourceType
        );
      }
      throw uploadError;
    }

    // 4. Persist to PostgreSQL using transaction
    const applicationId = crypto.randomUUID();
    const referenceNumber = generateReferenceNumber('STU');

    try {
      await transaction(async (client) => {
        // Insert student application
        await client.query(
          `INSERT INTO "public"."StudentApplication" (
            "id", "referenceNumber", "fullName", "gender", "age",
            "classCompletionYear", "telegramPhone", "email", "status",
            "programId", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
          [
            applicationId,
            referenceNumber,
            data.fullName,
            data.gender,
            data.age,
            data.classCompletionYear,
            data.telegramPhone,
            data.email,
            'PENDING',
            program.id,
          ]
        );

        // Insert documents
        for (const doc of uploadedDocs) {
          const docId = crypto.randomUUID();
          await client.query(
            `INSERT INTO "public"."ApplicationDocument" (
              "id", "category", "originalFilename", "fileType", "fileSize",
              "cloudinaryPublicId", "cloudinarySecureUrl", "cloudinaryResourceType",
              "studentApplicationId", "createdAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
            [
              docId,
              doc.category,
              doc.result.originalFilename,
              doc.result.fileType,
              doc.result.fileSize,
              doc.result.cloudinaryPublicId,
              doc.result.cloudinarySecureUrl,
              doc.result.cloudinaryResourceType,
              applicationId,
            ]
          );
        }
      });

      logger.info(
        { referenceNumber, applicationId, email: data.email },
        'Student application successfully created'
      );

      return {
        success: true,
        referenceNumber,
        message: 'Your scholarship application has been successfully submitted.',
      };
    } catch (dbError: any) {
      logger.error(
        { err: dbError.message, referenceNumber },
        'Database transaction failed; rolling back Cloudinary assets'
      );

      // Clean up orphaned Cloudinary assets
      for (const item of uploadedDocs) {
        await CloudinaryService.deleteAsset(
          item.result.cloudinaryPublicId,
          item.result.cloudinaryResourceType
        );
      }

      throw dbError;
    }
  }

  public static async createTrainerApplication(
    data: TrainerSubmissionDTO,
    files: { resumeFile?: FileToUpload }
  ): Promise<SubmissionResponse> {
    if (!files.resumeFile) {
      throw new ValidationError('Resume / CV document (PDF) is required.');
    }

    let uploadedDoc: UploadedFileResult | null = null;

    try {
      uploadedDoc = await CloudinaryService.uploadDocument(
        files.resumeFile,
        'trainers',
        'RESUME'
      );
    } catch (uploadError) {
      throw uploadError;
    }

    const applicationId = crypto.randomUUID();
    const referenceNumber = generateReferenceNumber('TRN');

    try {
      await transaction(async (client) => {
        await client.query(
          `INSERT INTO "public"."TrainerApplication" (
            "id", "referenceNumber", "fullName", "email", "telegramPhone",
            "expertiseTrack", "yearsOfExperience", "portfolioUrl",
            "teachingStatement", "status", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
          [
            applicationId,
            referenceNumber,
            data.fullName,
            data.email,
            data.telegramPhone,
            data.expertiseTrack,
            data.yearsOfExperience,
            data.portfolioUrl || null,
            data.teachingStatement,
            'PENDING',
          ]
        );

        if (uploadedDoc) {
          const docId = crypto.randomUUID();
          await client.query(
            `INSERT INTO "public"."ApplicationDocument" (
              "id", "category", "originalFilename", "fileType", "fileSize",
              "cloudinaryPublicId", "cloudinarySecureUrl", "cloudinaryResourceType",
              "trainerApplicationId", "createdAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
            [
              docId,
              'RESUME',
              uploadedDoc.originalFilename,
              uploadedDoc.fileType,
              uploadedDoc.fileSize,
              uploadedDoc.cloudinaryPublicId,
              uploadedDoc.cloudinarySecureUrl,
              uploadedDoc.cloudinaryResourceType,
              applicationId,
            ]
          );
        }
      });

      logger.info(
        { referenceNumber, applicationId, email: data.email },
        'Trainer application successfully created'
      );

      return {
        success: true,
        referenceNumber,
        message: 'Your trainer application has been successfully submitted.',
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

  private static calculateTutoringFee(gradeLevel: string): number {
    const gl = gradeLevel.toLowerCase();
    if (gl.includes('university') || gl.includes('higher') || gl.includes('degree')) {
      return 750;
    }
    return 500; // Standard 500 ETB for school grades 1-12
  }

  public static async createTutorApplication(
    data: TutorSubmissionDTO,
    files?: { resumeFile?: FileToUpload }
  ): Promise<SubmissionResponse> {
    const studentName = data.studentName || data.studentOrApplicantName;
    if (!studentName) {
      throw new ValidationError('Student or applicant name is required.');
    }

    const subjectsString = Array.isArray(data.subjects)
      ? data.subjects.join(', ')
      : data.subjects;

    let uploadedDoc: UploadedFileResult | null = null;
    if (files?.resumeFile) {
      uploadedDoc = await CloudinaryService.uploadDocument(
        files.resumeFile,
        'tutors',
        'RESUME'
      );
    }

    const applicationId = crypto.randomUUID();
    const referenceNumber = generateReferenceNumber('TUT');
    // If it's a student requesting tutoring (no resume submitted), require demo payment
    const isStudentRequest = !files?.resumeFile || Boolean(data.studentName);
    const initialStatus = isStudentRequest ? 'PENDING_PAYMENT' : 'PENDING';

    let paymentReference: string | undefined;
    let paymentAmount: number | undefined;

    if (isStudentRequest) {
      paymentReference = generateReferenceNumber('PAY');
      paymentAmount = this.calculateTutoringFee(data.gradeLevel);
    }

    try {
      await transaction(async (client) => {
        await client.query(
          `INSERT INTO "public"."TutorApplication" (
            "id", "referenceNumber", "studentOrApplicantName",
            "parentOrContactPhone", "email", "gradeLevel", "subjects",
            "deliveryPreference", "locationDetails", "qualifications",
            "experience", "hourlyRate", "status", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
          [
            applicationId,
            referenceNumber,
            studentName,
            data.parentOrContactPhone,
            data.email || null,
            data.gradeLevel,
            subjectsString,
            data.deliveryPreference,
            data.locationDetails || null,
            data.qualifications || null,
            data.experience || null,
            data.hourlyRate || null,
            initialStatus,
          ]
        );

        if (uploadedDoc) {
          const docId = crypto.randomUUID();
          await client.query(
            `INSERT INTO "public"."ApplicationDocument" (
              "id", "category", "originalFilename", "fileType", "fileSize",
              "cloudinaryPublicId", "cloudinarySecureUrl", "cloudinaryResourceType",
              "tutorApplicationId", "createdAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
            [
              docId,
              'RESUME',
              uploadedDoc.originalFilename,
              uploadedDoc.fileType,
              uploadedDoc.fileSize,
              uploadedDoc.cloudinaryPublicId,
              uploadedDoc.cloudinarySecureUrl,
              uploadedDoc.cloudinaryResourceType,
              applicationId,
            ]
          );
        }

        if (isStudentRequest && paymentReference && paymentAmount) {
          const paymentId = crypto.randomUUID();
          await client.query(
            `INSERT INTO "public"."TutoringPayment" (
              "id", "paymentReference", "tutorApplicationId", "amount", "currency",
              "status", "paymentMode", "createdAt", "updatedAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
            [
              paymentId,
              paymentReference,
              applicationId,
              paymentAmount,
              'ETB',
              'PENDING',
              'DEMO',
            ]
          );
        }
      });

      logger.info(
        { referenceNumber, applicationId, paymentReference, isStudentRequest },
        'Tutor application / request successfully created'
      );

      if (isStudentRequest && paymentReference && paymentAmount) {
        return {
          success: true,
          referenceNumber,
          paymentReference,
          paymentUrl: `/tutoring/payment/${paymentReference}`,
          amount: paymentAmount,
          currency: 'ETB',
          message: 'Tutoring request submitted. Please complete the demo payment to confirm your registration.',
        };
      }

      return {
        success: true,
        referenceNumber,
        message: 'Your tutoring application / request has been successfully submitted.',
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

  public static async getTutoringPaymentByReference(paymentReference: string) {
    const row = await queryOne(
      `SELECT 
        p."id", p."paymentReference", p."amount", p."currency", p."status", p."paymentMode", 
        p."transactionId", p."createdAt", p."updatedAt",
        t."id" AS "tutoringId", t."referenceNumber" AS "tutoringReference",
        t."studentOrApplicantName" AS "studentName", t."gradeLevel", t."subjects",
        t."deliveryPreference", t."status" AS "tutoringStatus"
       FROM "public"."TutoringPayment" p
       JOIN "public"."TutorApplication" t ON p."tutorApplicationId" = t."id"
       WHERE p."paymentReference" = $1
       LIMIT 1`,
      [paymentReference]
    );

    if (!row) {
      throw new NotFoundError(`Payment with reference '${paymentReference}' not found`);
    }

    return {
      paymentReference: row.paymentReference,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      paymentMode: row.paymentMode,
      transactionId: row.transactionId,
      tutoringReference: row.tutoringReference,
      studentName: row.studentName,
      gradeLevel: row.gradeLevel,
      subjects: row.subjects,
      deliveryPreference: row.deliveryPreference,
      tutoringStatus: row.tutoringStatus,
      createdAt: row.createdAt,
    };
  }

  public static async confirmDemoPayment(
    paymentReference: string,
    simulatedOutcome: 'SUCCESS' | 'FAILURE' = 'SUCCESS'
  ) {
    const payment = await this.getTutoringPaymentByReference(paymentReference);

    // Idempotency check: if already confirmed/succeeded
    if (payment.status === 'SUCCEEDED') {
      logger.info({ paymentReference }, 'Demo payment already verified (idempotent response)');
      return {
        success: true,
        alreadyConfirmed: true,
        status: 'SUCCEEDED',
        paymentReference: payment.paymentReference,
        transactionId: payment.transactionId,
        tutoringReference: payment.tutoringReference,
        amount: payment.amount,
        currency: payment.currency,
        message: 'Payment has already been confirmed and verified.',
      };
    }

    if (simulatedOutcome === 'FAILURE') {
      await query(
        `UPDATE "public"."TutoringPayment" 
         SET "status" = 'FAILED', "updatedAt" = NOW() 
         WHERE "paymentReference" = $1`,
        [paymentReference]
      );

      logger.warn({ paymentReference }, 'Simulated demo payment marked as failed');
      return {
        success: false,
        status: 'FAILED',
        paymentReference,
        tutoringReference: payment.tutoringReference,
        amount: payment.amount,
        currency: payment.currency,
        message: 'Simulated payment was declined or failed. You may retry the demo payment.',
      };
    }

    // Atomic transaction for successful demo payment verification
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const transactionId = `TXN-DEMO-${Date.now().toString(36).toUpperCase()}-${randomHex}`;

    await transaction(async (client) => {
      // Update payment
      await client.query(
        `UPDATE "public"."TutoringPayment" 
         SET "status" = 'SUCCEEDED', "transactionId" = $1, "updatedAt" = NOW() 
         WHERE "paymentReference" = $2`,
        [transactionId, paymentReference]
      );

      // Update tutoring registration
      await client.query(
        `UPDATE "public"."TutorApplication"
         SET "status" = 'PAID', "updatedAt" = NOW()
         WHERE "referenceNumber" = $1`,
        [payment.tutoringReference]
      );
    });

    logger.info(
      { paymentReference, transactionId, tutoringReference: payment.tutoringReference },
      'Demo payment confirmed and registration marked as PAID'
    );

    return {
      success: true,
      status: 'SUCCEEDED',
      paymentReference,
      transactionId,
      tutoringReference: payment.tutoringReference,
      amount: payment.amount,
      currency: payment.currency,
      message: 'Demo payment successfully verified. Your tutoring registration is confirmed!',
    };
  }
}
