import crypto from 'crypto';
import { query, queryOne } from '../../core/database/db';
import { logger } from '../../core/logging/logger';
import { EmailService, escapeHtml } from '../../core/services/email.service';
import { ContactSubmissionInput } from '../validation/contactSchemas';
import { env } from '../../config/env';

export class ContactService {
  /**
   * Generates a unique, non-sequential public reference code: MSG-YYYY-XXXXXX
   */
  public static generateReferenceCode(): string {
    const year = new Date().getFullYear();
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude easily confused chars like 0, 1, I, O
    let randomPart = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      randomPart += chars[bytes[i] % chars.length];
    }
    return `MSG-${year}-${randomPart}`;
  }

  /**
   * Process a validated public contact submission
   */
  public static async submitContactMessage(input: ContactSubmissionInput, ipAddress?: string) {
    // 1. Bot & Honeypot Detection
    if (input.hp_organization || input.honeypot) {
      logger.warn({ ip: ipAddress }, 'Bot submission detected via contact honeypot field. Dropping request.');
      // Return synthetic success to confuse automated bot scripts without polluting DB
      return {
        id: crypto.randomUUID(),
        referenceCode: this.generateReferenceCode(),
        isSpamDropped: true,
      };
    }

    const id = `msg-${crypto.randomUUID()}`;
    const referenceCode = this.generateReferenceCode();
    const now = new Date().toISOString();

    // 2. Persist message to database
    await query(
      `INSERT INTO "public"."ContactMessage" (
        "id", "referenceCode", "fullName", "email", "phone", "subject",
        "category", "message", "status", "priority", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'NEW', 'NORMAL', $9, $10)`,
      [
        id,
        referenceCode,
        input.fullName,
        input.email,
        input.phone || null,
        input.subject,
        input.category,
        input.message,
        now,
        now,
      ]
    );

    logger.info(
      {
        id,
        referenceCode,
        category: input.category,
        emailDomain: input.email.split('@')[1],
      },
      'Contact message successfully persisted'
    );

    // 3. Non-blocking Notification Dispatch
    this.sendNotificationSafely({
      id,
      referenceCode,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone || undefined,
      category: input.category,
      subject: input.subject,
      message: input.message,
    }).catch((err) => {
      logger.warn({ err: err.message, referenceCode }, 'Error during async contact notification dispatch');
    });

    return {
      id,
      referenceCode,
    };
  }

  /**
   * Asynchronous notification dispatch using Brevo/EmailService with resilient error isolation
   */
  private static async sendNotificationSafely(data: {
    id: string;
    referenceCode: string;
    fullName: string;
    email: string;
    phone?: string;
    category: string;
    subject: string;
    message: string;
  }): Promise<void> {
    if (!EmailService.isConfigured()) {
      return;
    }

    try {
      const recipient = env.BREVO_SENDER_EMAIL || 'admissions@erkab.org';
      const safeName = escapeHtml(data.fullName);
      const safeEmail = escapeHtml(data.email);
      const safeCategory = escapeHtml(data.category);
      const safeSubject = escapeHtml(data.subject);
      const safeRef = escapeHtml(data.referenceCode);

      const emailSubject = `[Erkab Contact] ${safeSubject} (${safeRef})`;
      const textBody = `New Contact Message Received
Reference: ${data.referenceCode}
Sender: ${data.fullName} <${data.email}>
Phone: ${data.phone || 'Not provided'}
Category: ${data.category}
Subject: ${data.subject}

Message:
${data.message}
`;

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #15171A; border: 1px solid #E5E8EC; border-radius: 8px; overflow: hidden;">
          <div style="background: #0878B9; color: #FFFFFF; padding: 20px 24px;">
            <h2 style="margin: 0; font-size: 1.25rem;">Erkab Skills Training Organization</h2>
            <p style="margin: 4px 0 0; font-size: 0.9rem; opacity: 0.9;">New Public Inquiry Received</p>
          </div>
          <div style="padding: 24px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 6px 0; color: #747982; width: 140px; font-weight: bold;">Reference Code:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0878B9;">${safeRef}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #747982; font-weight: bold;">Sender:</td>
                <td style="padding: 6px 0;">${safeName} &lt;${safeEmail}&gt;</td>
              </tr>
              ${
                data.phone
                  ? `<tr><td style="padding: 6px 0; color: #747982; font-weight: bold;">Phone:</td><td style="padding: 6px 0;">${escapeHtml(
                      data.phone
                    )}</td></tr>`
                  : ''
              }
              <tr>
                <td style="padding: 6px 0; color: #747982; font-weight: bold;">Category:</td>
                <td style="padding: 6px 0;"><span style="background: #F5F6F8; padding: 3px 8px; border-radius: 4px; font-size: 0.85rem;">${safeCategory}</span></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #747982; font-weight: bold;">Subject:</td>
                <td style="padding: 6px 0; font-weight: bold;">${safeSubject}</td>
              </tr>
            </table>
            <div style="background: #F8FAFC; border-left: 4px solid #0878B9; padding: 16px; border-radius: 4px; font-size: 0.95rem; line-height: 1.6; white-space: pre-wrap;">
${escapeHtml(data.message)}
            </div>
          </div>
        </div>
      `;

      await EmailService.sendEmail({
        to: recipient,
        subject: emailSubject,
        text: textBody,
        html: htmlBody,
      });

      logger.info({ referenceCode: data.referenceCode }, 'Contact notification email sent successfully');
    } catch (err: any) {
      logger.warn({ err: err.message, referenceCode: data.referenceCode }, 'Non-blocking contact email notification failed');
    }
  }
}
