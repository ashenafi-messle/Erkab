import crypto from 'crypto';
import { query, queryOne } from '../database/db';
import { EmailService } from './email.service';
import { logger } from '../logging/logger';
import { NotFoundError, ValidationError } from '../errors/AppError';

export interface ApplicationNotificationRecord {
  id: string;
  applicationType: 'students' | 'trainers' | 'tutors';
  applicationId: string;
  referenceNumber: string;
  recipientName: string;
  recipientEmail: string;
  decision: 'APPROVED' | 'REJECTED';
  notificationType: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  attempts: number;
  maxAttempts: number;
  lastAttemptAt: Date | string | null;
  sentAt: Date | string | null;
  errorMessage: string | null;
  idempotencyKey: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateDecisionNotificationParams {
  applicationType: 'students' | 'trainers' | 'tutors';
  applicationId: string;
  referenceNumber: string;
  recipientName: string;
  recipientEmail: string;
  decision: 'APPROVED' | 'REJECTED';
  reviewId: string;
}

export class NotificationService {
  /**
   * Persists an outbox notification event within an existing database transaction client or pool.
   */
  public static async createDecisionNotification(
    dbClient: { query: (text: string, params?: any[]) => Promise<any> },
    params: CreateDecisionNotificationParams
  ): Promise<ApplicationNotificationRecord> {
    const {
      applicationType,
      applicationId,
      referenceNumber,
      recipientName,
      recipientEmail,
      decision,
      reviewId,
    } = params;

    const id = `notif_${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`;
    const notificationType = decision === 'APPROVED' ? 'DECISION_APPROVED' : 'DECISION_REJECTED';
    const idempotencyKey = `decision:${applicationType}:${applicationId}:${decision}:${reviewId}`;

    const cleanEmail = (recipientEmail || '').trim();
    const hasValidEmail = Boolean(cleanEmail && cleanEmail.includes('@') && cleanEmail.length >= 5);

    const initialStatus = hasValidEmail ? 'PENDING' : 'FAILED';
    const initialError = hasValidEmail ? null : 'Applicant email address is missing or invalid in database record';

    // Insert outbox notification record
    const insertSql = `
      INSERT INTO "public"."ApplicationNotification" (
        "id", "applicationType", "applicationId", "referenceNumber",
        "recipientName", "recipientEmail", "decision", "notificationType",
        "status", "attempts", "maxAttempts", "lastAttemptAt", "sentAt",
        "errorMessage", "idempotencyKey", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 3, NULL, NULL, $10, $11, NOW(), NOW())
      ON CONFLICT ("idempotencyKey") DO UPDATE 
      SET "updatedAt" = NOW()
      RETURNING *;
    `;

    const res = await dbClient.query(insertSql, [
      id,
      applicationType,
      applicationId,
      referenceNumber,
      recipientName || 'Applicant',
      cleanEmail || 'missing@no-email.erkab',
      decision,
      notificationType,
      initialStatus,
      initialError,
      idempotencyKey,
    ]);

    const record = res.rows && res.rows[0] ? res.rows[0] : null;
    if (!record) {
      throw new Error('Failed to persist notification outbox record');
    }

    logger.info(
      { notificationId: record.id, applicationId, decision, initialStatus, recipientEmail: cleanEmail },
      'Persisted application decision notification in outbox'
    );

    return record as ApplicationNotificationRecord;
  }

  /**
   * Asynchronously attempts to dispatch the notification via Brevo SMTP.
   * Never throws uncaught errors that would compromise the calling transaction or endpoint.
   */
  public static async dispatchNotification(
    notificationId: string
  ): Promise<{ success: boolean; notification: ApplicationNotificationRecord | null; error?: string }> {
    try {
      const record = await queryOne<ApplicationNotificationRecord>(
        `SELECT * FROM "public"."ApplicationNotification" WHERE "id" = $1`,
        [notificationId]
      );

      if (!record) {
        logger.warn({ notificationId }, 'Notification record not found for dispatch');
        return { success: false, notification: null, error: `Notification '${notificationId}' not found` };
      }

      if (record.status === 'SENT') {
        logger.info({ notificationId }, 'Notification has already been sent successfully');
        return { success: true, notification: record };
      }

      // Check if email is missing or invalid
      if (!record.recipientEmail || !record.recipientEmail.includes('@') || record.recipientEmail.includes('missing@no-email')) {
        const errorMsg = 'Applicant email address is missing or invalid in database record';
        await query(
          `UPDATE "public"."ApplicationNotification" 
           SET "status" = 'FAILED', "lastAttemptAt" = NOW(), "attempts" = "attempts" + 1, "errorMessage" = $1, "updatedAt" = NOW() 
           WHERE "id" = $2`,
          [errorMsg, notificationId]
        );
        const updated = await queryOne<ApplicationNotificationRecord>(
          `SELECT * FROM "public"."ApplicationNotification" WHERE "id" = $1`,
          [notificationId]
        );
        return { success: false, notification: updated, error: errorMsg };
      }

      // Build email content based on application type and decision
      const content = EmailService.buildDecisionContent({
        applicationType: record.applicationType,
        decision: record.decision,
        recipientName: record.recipientName,
        referenceNumber: record.referenceNumber,
      });

      // Dispatch via Brevo SMTP
      const sendResult = await EmailService.sendEmail({
        to: record.recipientEmail,
        subject: content.subject,
        text: content.text,
        html: content.html,
      });

      if (sendResult.success) {
        await query(
          `UPDATE "public"."ApplicationNotification" 
           SET "status" = 'SENT', "sentAt" = NOW(), "lastAttemptAt" = NOW(), "attempts" = "attempts" + 1, "errorMessage" = NULL, "updatedAt" = NOW() 
           WHERE "id" = $1`,
          [notificationId]
        );

        logger.info(
          { notificationId, to: record.recipientEmail, messageId: sendResult.messageId },
          'Application decision notification delivered to SMTP relay'
        );

        const updated = await queryOne<ApplicationNotificationRecord>(
          `SELECT * FROM "public"."ApplicationNotification" WHERE "id" = $1`,
          [notificationId]
        );
        return { success: true, notification: updated };
      } else {
        const safeError = sendResult.error || 'SMTP delivery rejected';
        await query(
          `UPDATE "public"."ApplicationNotification" 
           SET "status" = 'FAILED', "lastAttemptAt" = NOW(), "attempts" = "attempts" + 1, "errorMessage" = $1, "updatedAt" = NOW() 
           WHERE "id" = $2`,
          [safeError, notificationId]
        );

        logger.warn(
          {
            notificationId,
            to: record.recipientEmail,
            error: safeError,
            isAuthError: sendResult.isAuthError,
          },
          'Application decision notification failed to deliver via SMTP'
        );

        const updated = await queryOne<ApplicationNotificationRecord>(
          `SELECT * FROM "public"."ApplicationNotification" WHERE "id" = $1`,
          [notificationId]
        );
        return { success: false, notification: updated, error: safeError };
      }
    } catch (err: any) {
      const sanitized = EmailService.sanitizeError(err);
      logger.error({ notificationId, err: sanitized.message, isAuthError: sanitized.isAuthError }, 'Exception during notification dispatch');

      try {
        await query(
          `UPDATE "public"."ApplicationNotification" 
           SET "status" = 'FAILED', "lastAttemptAt" = NOW(), "attempts" = "attempts" + 1, "errorMessage" = $1, "updatedAt" = NOW() 
           WHERE "id" = $2`,
          [sanitized.message, notificationId]
        );
      } catch {}

      return { success: false, notification: null, error: sanitized.message };
    }
  }

  /**
   * Retries sending a previously failed notification.
   */
  public static async retryNotification(params: {
    notificationId: string;
    adminUser: { id: string; name: string };
    ipAddress?: string;
  }): Promise<{ success: boolean; notification: ApplicationNotificationRecord | null; message: string }> {
    const { notificationId, adminUser, ipAddress } = params;

    const record = await queryOne<ApplicationNotificationRecord>(
      `SELECT * FROM "public"."ApplicationNotification" WHERE "id" = $1`,
      [notificationId]
    );

    if (!record) {
      throw new NotFoundError(`Notification '${notificationId}' not found`);
    }

    if (record.status === 'SENT') {
      throw new ValidationError('Notification has already been successfully sent to the SMTP relay.');
    }

    // Audit retry attempt
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
          'NOTIFICATION_RETRY',
          'ApplicationNotification',
          JSON.stringify({
            notificationId: record.id,
            applicationId: record.applicationId,
            applicationType: record.applicationType,
            recipientEmail: record.recipientEmail,
            decision: record.decision,
            attempts: record.attempts,
          }),
          ipAddress || '127.0.0.1',
        ]
      );
    } catch (auditErr: any) {
      logger.warn({ err: auditErr.message }, 'Failed to record notification retry audit log');
    }

    const dispatchRes = await this.dispatchNotification(notificationId);

    return {
      success: dispatchRes.success,
      notification: dispatchRes.notification,
      message: dispatchRes.success
        ? 'Notification successfully sent to SMTP relay'
        : `Notification delivery failed: ${dispatchRes.error || 'SMTP delivery rejected'}`,
    };
  }

  /**
   * Retrieves all notification records for an application.
   */
  public static async getNotificationsForApplication(
    applicationType: 'students' | 'trainers' | 'tutors',
    applicationId: string
  ): Promise<ApplicationNotificationRecord[]> {
    return query<ApplicationNotificationRecord>(
      `SELECT * FROM "public"."ApplicationNotification" 
       WHERE "applicationType" = $1 AND "applicationId" = $2 
       ORDER BY "createdAt" DESC`,
      [applicationType, applicationId]
    );
  }

  /**
   * Retrieves the latest notification for an application.
   */
  public static async getLatestNotification(
    applicationType: 'students' | 'trainers' | 'tutors',
    applicationId: string
  ): Promise<ApplicationNotificationRecord | null> {
    return queryOne<ApplicationNotificationRecord>(
      `SELECT * FROM "public"."ApplicationNotification" 
       WHERE "applicationType" = $1 AND "applicationId" = $2 
       ORDER BY "createdAt" DESC LIMIT 1`,
      [applicationType, applicationId]
    );
  }
}
