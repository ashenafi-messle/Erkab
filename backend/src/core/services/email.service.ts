import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../../config/env';
import { logger } from '../logging/logger';

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SentEmailRecord {
  to: string;
  subject: string;
  text: string;
  html: string;
  sentAt: Date;
  messageId: string;
}

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export class EmailService {
  private static transporter: Transporter | null = null;
  private static mockEmails: SentEmailRecord[] = [];
  private static forceMock = false;

  public static isConfigured(): boolean {
    const login = (env.BREVO_SMTP_LOGIN || '').trim();
    const key = (env.BREVO_SMTP_KEY || '').trim();
    const sender = (env.BREVO_SENDER_EMAIL || '').trim();

    return (
      Boolean(login) &&
      login !== 'YOUR_ROTATED_BREVO_SMTP_LOGIN' &&
      Boolean(key) &&
      key !== 'YOUR_ROTATED_BREVO_SMTP_KEY' &&
      Boolean(sender) &&
      sender !== 'YOUR_VERIFIED_SENDER_EMAIL'
    );
  }

  /**
   * For testing: enables or disables mock transport
   */
  public static setMockMode(enabled: boolean) {
    this.forceMock = enabled;
  }

  public static getSentEmails(): SentEmailRecord[] {
    return [...this.mockEmails];
  }

  public static clearSentEmails() {
    this.mockEmails = [];
  }

  public static resetTransporter(): void {
    if (this.transporter) {
      try {
        this.transporter.close();
      } catch {}
      this.transporter = null;
    }
  }

  public static getTransporter(): Transporter {
    if (!this.transporter) {
      const login = (env.BREVO_SMTP_LOGIN || '').trim();
      const key = (env.BREVO_SMTP_KEY || '').trim();

      this.transporter = nodemailer.createTransport({
        host: env.BREVO_SMTP_SERVER,
        port: Number(env.BREVO_SMTP_PORT || 587),
        secure: false, // port 587 uses STARTTLS
        auth: {
          user: login,
          pass: key,
        },
        requireTLS: true,
        tls: {
          rejectUnauthorized: true,
        },
      });
    }
    return this.transporter;
  }

  /**
   * Sanitizes any SMTP or transmission error to avoid leaking secrets,
   * while classifying authentication failures (535 5.7.8).
   */
  public static sanitizeError(err: any): { message: string; isAuthError: boolean; code?: string | number } {
    const rawMsg = err && typeof err.message === 'string' ? err.message : String(err || 'SMTP transmission error');
    const code = err?.responseCode || err?.code || undefined;

    const isAuthError =
      code === 535 ||
      code === 'EAUTH' ||
      /535|5\.7\.8|Authentication failed|Invalid login/i.test(rawMsg);

    let safeMsg = rawMsg;
    const smtpKey = (env.BREVO_SMTP_KEY || '').trim();
    if (smtpKey && smtpKey.length > 5) {
      safeMsg = safeMsg.split(smtpKey).join('[REDACTED_SMTP_KEY]');
    }
    const apiKey = (env.BREVO_API_KEY || '').trim();
    if (apiKey && apiKey.length > 5) {
      safeMsg = safeMsg.split(apiKey).join('[REDACTED_API_KEY]');
    }

    if (isAuthError) {
      safeMsg = `Invalid login: 535 5.7.8 Authentication failed (smtp-relay.brevo.com rejected the SMTP key). Please generate a new SMTP key from Brevo dashboard > SMTP & API > SMTP and configure BREVO_SMTP_KEY.`;
    }

    return {
      message: safeMsg,
      isAuthError,
      code,
    };
  }

  /**
   * Non-blocking SMTP connection and authentication verification using transporter.verify().
   * Runs with a configurable timeout (default 5000ms) to ensure it never blocks indefinitely.
   */
  public static async verifySmtpConnection(timeoutMs = 5000): Promise<{
    success: boolean;
    diagnostics: {
      host: string;
      port: number;
      secure: boolean;
      requireTLS: boolean;
      hasLogin: boolean;
      hasKey: boolean;
      hasSenderEmail: boolean;
      verified: boolean;
      isAuthError?: boolean;
      errorCode?: string | number;
      errorMessage?: string;
      timestamp: string;
    };
  }> {
    const login = (env.BREVO_SMTP_LOGIN || '').trim();
    const key = (env.BREVO_SMTP_KEY || '').trim();
    const sender = (env.BREVO_SENDER_EMAIL || '').trim();

    const diagnostics = {
      host: env.BREVO_SMTP_SERVER,
      port: Number(env.BREVO_SMTP_PORT || 587),
      secure: false,
      requireTLS: true,
      hasLogin: Boolean(login && login !== 'YOUR_ROTATED_BREVO_SMTP_LOGIN'),
      hasKey: Boolean(key && key !== 'YOUR_ROTATED_BREVO_SMTP_KEY'),
      hasSenderEmail: Boolean(sender && sender !== 'YOUR_VERIFIED_SENDER_EMAIL'),
      verified: false,
      timestamp: new Date().toISOString(),
    };

    if (!diagnostics.hasLogin || !diagnostics.hasKey) {
      return {
        success: false,
        diagnostics: {
          ...diagnostics,
          verified: false,
          errorMessage: 'Brevo SMTP login or key is not configured in environment variables.',
        },
      };
    }

    try {
      const transporter = this.getTransporter();
      let timer: NodeJS.Timeout;

      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`SMTP connection verification timed out after ${timeoutMs}ms`));
        }, timeoutMs);
        timer.unref();
      });

      await Promise.race([transporter.verify(), timeoutPromise]);

      return {
        success: true,
        diagnostics: {
          ...diagnostics,
          verified: true,
        },
      };
    } catch (err: any) {
      const sanitized = this.sanitizeError(err);
      return {
        success: false,
        diagnostics: {
          ...diagnostics,
          verified: false,
          isAuthError: sanitized.isAuthError,
          errorCode: sanitized.code,
          errorMessage: sanitized.message,
        },
      };
    }
  }

  public static async sendEmail(options: SendEmailOptions): Promise<SendEmailResult & { isAuthError?: boolean }> {
    const { to, subject, text, html } = options;

    // Validate email format
    if (!to || !to.includes('@')) {
      return {
        success: false,
        error: `Invalid recipient email address: '${to}'`,
      };
    }

    // In automated tests or mock mode, capture email in memory without external network calls
    if (this.forceMock || process.env.NODE_ENV === 'test') {
      const mockId = `mock_msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      this.mockEmails.push({
        to,
        subject,
        text,
        html,
        sentAt: new Date(),
        messageId: mockId,
      });

      logger.info({ to, subject, messageId: mockId }, '[Mock Email] Decision notification queued successfully');
      return {
        success: true,
        messageId: mockId,
      };
    }

    if (!this.isConfigured()) {
      logger.warn({ to, subject }, 'Brevo SMTP credentials not configured; skipping actual email dispatch');
      return {
        success: false,
        error: 'Brevo SMTP credentials not configured in environment variables.',
      };
    }

    try {
      const transporter = this.getTransporter();
      const senderName = env.BREVO_SENDER_NAME || 'Erkab Skills Training Organization';
      const senderEmail = (env.BREVO_SENDER_EMAIL || '').trim();

      const info = await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to,
        subject,
        text,
        html,
      });

      logger.info(
        { messageId: info.messageId, to, accepted: info.accepted },
        'Successfully dispatched decision email via Brevo SMTP'
      );

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      const sanitized = this.sanitizeError(err);

      logger.error(
        {
          error: sanitized.message,
          errorCode: sanitized.code,
          isAuthError: sanitized.isAuthError,
          to,
          host: env.BREVO_SMTP_SERVER,
          port: env.BREVO_SMTP_PORT,
          hasLogin: Boolean(env.BREVO_SMTP_LOGIN),
          hasKey: Boolean(env.BREVO_SMTP_KEY),
        },
        'Failed to deliver decision email via Brevo SMTP'
      );

      return {
        success: false,
        error: sanitized.message,
        isAuthError: sanitized.isAuthError,
      };
    }
  }

  /**
   * Builds the official, personalized email templates for Application Decisions
   */
  public static buildDecisionContent(params: {
    applicationType: 'students' | 'trainers' | 'tutors';
    decision: 'APPROVED' | 'REJECTED';
    recipientName: string;
    referenceNumber: string;
  }): { subject: string; text: string; html: string; notificationType: string } {
    const { applicationType, decision, recipientName, referenceNumber } = params;
    const safeName = escapeHtml(recipientName || 'Applicant');
    const safeRef = escapeHtml(referenceNumber || 'N/A');

    let typeLabel = 'Application';
    let nextStepsApprovedText = '';
    let nextStepsApprovedHtml = '';

    if (applicationType === 'students') {
      typeLabel = 'Student Scholarship';
      nextStepsApprovedText = `Our admissions and scholarship committee will reach out to you with your cohort onboarding details and schedule. Please keep your application reference number (${referenceNumber}) handy.`;
      nextStepsApprovedHtml = `<p style="margin: 16px 0; line-height: 1.6; color: #334155;">Our admissions and scholarship committee will reach out to you with your cohort onboarding details and schedule. Please keep your application reference number (<strong>${safeRef}</strong>) handy.</p>`;
    } else if (applicationType === 'trainers') {
      typeLabel = 'Trainer or Industry Mentor';
      nextStepsApprovedText = `Our curriculum lead will contact you to discuss track orientation, schedule alignment, and mentor agreement details. Please reference your application ID (${referenceNumber}) in all communications.`;
      nextStepsApprovedHtml = `<p style="margin: 16px 0; line-height: 1.6; color: #334155;">Our curriculum lead will contact you to discuss track orientation, schedule alignment, and mentor agreement details. Please reference your application ID (<strong>${safeRef}</strong>) in all communications.</p>`;
    } else if (applicationType === 'tutors') {
      typeLabel = 'Academic Tutor';
      nextStepsApprovedText = `Our tutoring coordinator will review your available schedule and match you with active tutoring requests. Please keep your reference number (${referenceNumber}) handy.`;
      nextStepsApprovedHtml = `<p style="margin: 16px 0; line-height: 1.6; color: #334155;">Our tutoring coordinator will review your available schedule and match you with active tutoring requests. Please keep your reference number (<strong>${safeRef}</strong>) handy.</p>`;
    }

    const safeType = escapeHtml(typeLabel);
    const logoUrl = escapeHtml(env.ERKAB_LOGO_URL);

    if (decision === 'APPROVED') {
      const subject = 'Erkab Skills Training Organization — Application Approved';
      const notificationType = 'DECISION_APPROVED';

      const text = `Dear ${recipientName},

We are pleased to inform you that your application to Erkab Skills Training Organization has been approved.

Application type: ${typeLabel}
Application reference: ${referenceNumber}

Your application has been reviewed, and the organization has approved your request.

${nextStepsApprovedText}

Please contact us through our official contact channels if you need clarification or further information.

Congratulations, and thank you for your interest in Erkab Skills Training Organization.

Kind regards,
Erkab Skills Training Organization
From Skills to Opportunity`;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px 0; background-color: #f8fafc; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background-color: #0f2b48; padding: 24px 32px; text-align: left;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tr>
          <td style="width: 58px; vertical-align: middle; padding-right: 16px;">
            <img src="${logoUrl}" alt="Erkab Logo" width="52" height="52" style="display: block; width: 52px; height: 52px; border-radius: 10px; border: 2px solid rgba(255, 255, 255, 0.25); background-color: #ffffff; object-fit: cover;" />
          </td>
          <td style="vertical-align: middle;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25;">Erkab Skills Training Organization</h1>
            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500;">From Skills to Opportunity</p>
          </td>
        </tr>
      </table>
    </div>
    <div style="padding: 32px;">
      <div style="display: inline-block; padding: 6px 14px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; color: #065f46; font-size: 13px; font-weight: 600; margin-bottom: 20px;">
        Application Approved
      </div>
      <p style="font-size: 16px; margin: 0 0 16px 0; color: #1e293b;">Dear <strong>${safeName}</strong>,</p>
      <p style="margin: 0 0 16px 0; line-height: 1.6; color: #334155;">
        We are pleased to inform you that your application to <strong>Erkab Skills Training Organization</strong> has been approved.
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">Application Details:</div>
        <div style="font-size: 14px; color: #1e293b; margin-bottom: 6px;"><strong>Type:</strong> ${safeType}</div>
        <div style="font-size: 14px; color: #1e293b;"><strong>Reference Number:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${safeRef}</span></div>
      </div>
      <p style="margin: 16px 0; line-height: 1.6; color: #334155;">
        Your application has been reviewed, and the organization has approved your request.
      </p>
      ${nextStepsApprovedHtml}
      <p style="margin: 16px 0; line-height: 1.6; color: #334155;">
        Please contact us through our official contact channels if you need clarification or further information.
      </p>
      <p style="margin: 20px 0 0 0; line-height: 1.6; color: #334155;">
        Congratulations, and thank you for your interest in Erkab Skills Training Organization.
      </p>
      <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 20px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td style="width: 44px; vertical-align: middle; padding-right: 12px;">
              <img src="${logoUrl}" alt="Erkab" width="38" height="38" style="display: block; width: 38px; height: 38px; border-radius: 8px; border: 1px solid #cbd5e1; background-color: #ffffff; object-fit: cover;" />
            </td>
            <td style="vertical-align: middle;">
              <p style="margin: 0; font-size: 13px; color: #64748b;">Kind regards,</p>
              <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 700; color: #0f2b48;">Erkab Skills Training Organization</p>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8; font-style: italic;">From Skills to Opportunity</p>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</body>
</html>`;

      return { subject, text, html, notificationType };
    } else {
      const subject = 'Erkab Skills Training Organization — Application Update';
      const notificationType = 'DECISION_REJECTED';

      const text = `Dear ${recipientName},

Thank you for applying to Erkab Skills Training Organization.

After reviewing your application, we regret to inform you that your application has not been approved at this time.

Application type: ${typeLabel}
Application reference: ${referenceNumber}

We appreciate the time and effort you invested in your application. If the organization permits applicants to apply again or provides an appeal process, please follow the relevant instructions published by the organization.

If you have questions about this decision, please contact us through our official contact channels.

Thank you for your interest in Erkab Skills Training Organization, and we wish you success in your future endeavors.

Kind regards,
Erkab Skills Training Organization
From Skills to Opportunity`;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px 0; background-color: #f8fafc; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background-color: #0f2b48; padding: 24px 32px; text-align: left;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tr>
          <td style="width: 58px; vertical-align: middle; padding-right: 16px;">
            <img src="${logoUrl}" alt="Erkab Logo" width="52" height="52" style="display: block; width: 52px; height: 52px; border-radius: 10px; border: 2px solid rgba(255, 255, 255, 0.25); background-color: #ffffff; object-fit: cover;" />
          </td>
          <td style="vertical-align: middle;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25;">Erkab Skills Training Organization</h1>
            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500;">From Skills to Opportunity</p>
          </td>
        </tr>
      </table>
    </div>
    <div style="padding: 32px;">
      <div style="display: inline-block; padding: 6px 14px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 9999px; color: #991b1b; font-size: 13px; font-weight: 600; margin-bottom: 20px;">
        Application Update
      </div>
      <p style="font-size: 16px; margin: 0 0 16px 0; color: #1e293b;">Dear <strong>${safeName}</strong>,</p>
      <p style="margin: 0 0 16px 0; line-height: 1.6; color: #334155;">
        Thank you for applying to <strong>Erkab Skills Training Organization</strong>.
      </p>
      <p style="margin: 0 0 16px 0; line-height: 1.6; color: #334155;">
        After reviewing your application, we regret to inform you that your application has not been approved at this time.
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">Application Details:</div>
        <div style="font-size: 14px; color: #1e293b; margin-bottom: 6px;"><strong>Type:</strong> ${safeType}</div>
        <div style="font-size: 14px; color: #1e293b;"><strong>Reference Number:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${safeRef}</span></div>
      </div>
      <p style="margin: 16px 0; line-height: 1.6; color: #334155;">
        We appreciate the time and effort you invested in your application. If the organization permits applicants to apply again or provides an appeal process, please follow the relevant instructions published by the organization.
      </p>
      <p style="margin: 16px 0; line-height: 1.6; color: #334155;">
        If you have questions about this decision, please contact us through our official contact channels.
      </p>
      <p style="margin: 20px 0 0 0; line-height: 1.6; color: #334155;">
        Thank you for your interest in Erkab Skills Training Organization, and we wish you success in your future endeavors.
      </p>
      <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 20px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <td style="width: 44px; vertical-align: middle; padding-right: 12px;">
              <img src="${logoUrl}" alt="Erkab" width="38" height="38" style="display: block; width: 38px; height: 38px; border-radius: 8px; border: 1px solid #cbd5e1; background-color: #ffffff; object-fit: cover;" />
            </td>
            <td style="vertical-align: middle;">
              <p style="margin: 0; font-size: 13px; color: #64748b;">Kind regards,</p>
              <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 700; color: #0f2b48;">Erkab Skills Training Organization</p>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8; font-style: italic;">From Skills to Opportunity</p>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</body>
</html>`;

      return { subject, text, html, notificationType };
    }
  }
}
