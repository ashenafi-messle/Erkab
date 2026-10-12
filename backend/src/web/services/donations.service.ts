import crypto from 'crypto';
import { query, queryOne, transaction } from '../../core/database/db';
import { generateReferenceNumber } from '../../core/utils/referenceNumber';
import { NotFoundError, ValidationError } from '../../core/errors/AppError';
import { logger } from '../../core/logging/logger';

export interface CreateDonationDTO {
  amount: number;
  currency?: string;
  donorName?: string;
  email: string;
  phone?: string;
  campaignSlug?: string;
  campaignId?: string;
  isAnonymous?: boolean;
  message?: string;
}

export class DonationsService {
  public static async listCampaigns() {
    const campaigns = await query(
      `SELECT "id", "slug", "title", "description", "imageUrl", "goalAmountMinor", "currency", "isPublished", "createdAt" 
       FROM "public"."DonationCampaign" 
       WHERE "isPublished" = true 
       ORDER BY "createdAt" ASC`
    );
    return campaigns;
  }

  public static async getCampaignBySlug(slug: string) {
    const campaign = await queryOne(
      `SELECT "id", "slug", "title", "description", "imageUrl", "goalAmountMinor", "currency", "isPublished", "createdAt" 
       FROM "public"."DonationCampaign" 
       WHERE "slug" = $1 AND "isPublished" = true`,
      [slug]
    );
    if (!campaign) {
      throw new NotFoundError(`Donation campaign '${slug}' not found`);
    }
    return campaign;
  }

  public static async createDonation(data: CreateDonationDTO) {
    if (!data.amount || data.amount <= 0) {
      throw new ValidationError('Donation amount must be greater than 0');
    }

    const currency = (data.currency || 'ETB').toUpperCase();
    const amountMinor = Math.round(data.amount * 100);

    let resolvedCampaignId: string | null = null;
    let resolvedCampaignTitle: string | null = null;

    if (data.campaignSlug) {
      const camp = await queryOne(
        `SELECT "id", "title" FROM "public"."DonationCampaign" WHERE "slug" = $1`,
        [data.campaignSlug]
      );
      if (camp) {
        resolvedCampaignId = camp.id;
        resolvedCampaignTitle = camp.title;
      }
    } else if (data.campaignId) {
      const camp = await queryOne(
        `SELECT "id", "title" FROM "public"."DonationCampaign" WHERE "id" = $1`,
        [data.campaignId]
      );
      if (camp) {
        resolvedCampaignId = camp.id;
        resolvedCampaignTitle = camp.title;
      }
    }

    const donationId = crypto.randomUUID();
    const donationReference = generateReferenceNumber('DON');
    const paymentId = crypto.randomUUID();
    const paymentReference = generateReferenceNumber('DPAY');

    await transaction(async (client) => {
      await client.query(
        `INSERT INTO "public"."Donation" (
          "id", "reference", "campaignId", "donorName", "email",
          "phone", "isAnonymous", "amountMinor", "currency",
          "message", "status", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING_PAYMENT', NOW(), NOW())`,
        [
          donationId,
          donationReference,
          resolvedCampaignId,
          data.isAnonymous ? null : (data.donorName || null),
          data.email.toLowerCase().trim(),
          data.phone || null,
          Boolean(data.isAnonymous),
          amountMinor,
          currency,
          data.message || null,
        ]
      );

      await client.query(
        `INSERT INTO "public"."DonationPayment" (
          "id", "reference", "donationId", "provider", "mode",
          "amountMinor", "currency", "status", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, 'DEMO', 'DEMO', $4, $5, 'PENDING', NOW(), NOW())`,
        [
          paymentId,
          paymentReference,
          donationId,
          amountMinor,
          currency,
        ]
      );
    });

    logger.info(
      { donationReference, paymentReference, amountMinor, currency },
      'Donation record and demo payment created'
    );

    return {
      success: true,
      donationReference,
      paymentReference,
      paymentUrl: `/donations/checkout/${paymentReference}`,
      amount: data.amount,
      amountMinor,
      currency,
      campaignTitle: resolvedCampaignTitle,
      message: 'Donation registered. Please complete the demo payment to confirm your contribution.',
    };
  }

  public static async getPaymentByReference(paymentReference: string) {
    const row = await queryOne(
      `SELECT 
        p."id", p."reference" AS "paymentReference", p."amountMinor", p."currency",
        p."status", p."mode" AS "paymentMode", p."providerTransactionId", p."verifiedAt",
        p."failureMessage", p."createdAt",
        d."reference" AS "donationReference", d."status" AS "donationStatus",
        d."isAnonymous", c."title" AS "campaignTitle"
       FROM "public"."DonationPayment" p
       JOIN "public"."Donation" d ON p."donationId" = d."id"
       LEFT JOIN "public"."DonationCampaign" c ON d."campaignId" = c."id"
       WHERE p."reference" = $1
       LIMIT 1`,
      [paymentReference]
    );

    if (!row) {
      throw new NotFoundError(`Payment reference '${paymentReference}' not found`);
    }

    return {
      paymentReference: row.paymentReference,
      donationReference: row.donationReference,
      amountMinor: row.amountMinor,
      amount: row.amountMinor / 100,
      currency: row.currency,
      status: row.status,
      paymentMode: row.paymentMode,
      providerTransactionId: row.providerTransactionId,
      campaignTitle: row.campaignTitle || 'General Scholarship & Operations Fund',
      donationStatus: row.donationStatus,
      verifiedAt: row.verifiedAt,
      createdAt: row.createdAt,
    };
  }

  public static async confirmDemoPayment(
    paymentReference: string,
    simulatedOutcome: 'SUCCESS' | 'FAILURE' = 'SUCCESS'
  ) {
    const payment = await this.getPaymentByReference(paymentReference);

    // Idempotency: if already confirmed
    if (payment.status === 'SUCCEEDED') {
      logger.info({ paymentReference }, 'Demo donation payment already succeeded (idempotent)');
      return {
        success: true,
        alreadyConfirmed: true,
        status: 'SUCCEEDED',
        paymentReference: payment.paymentReference,
        donationReference: payment.donationReference,
        transactionId: payment.providerTransactionId,
        amount: payment.amount,
        currency: payment.currency,
        message: 'Payment has already been confirmed and verified.',
      };
    }

    if (simulatedOutcome === 'FAILURE') {
      await transaction(async (client) => {
        await client.query(
          `UPDATE "public"."DonationPayment"
           SET "status" = 'FAILED', "failureCode" = 'SIMULATED_DECLINE',
               "failureMessage" = 'Simulated demo payment was declined', "updatedAt" = NOW()
           WHERE "reference" = $1`,
          [paymentReference]
        );

        await client.query(
          `UPDATE "public"."Donation"
           SET "status" = 'PAYMENT_FAILED', "updatedAt" = NOW()
           WHERE "reference" = $1`,
          [payment.donationReference]
        );
      });

      logger.warn({ paymentReference }, 'Demo donation payment marked as failed');
      return {
        success: false,
        status: 'FAILED',
        paymentReference,
        donationReference: payment.donationReference,
        amount: payment.amount,
        currency: payment.currency,
        message: 'Simulated payment declined. You may retry the demo payment.',
      };
    }

    // Atomic confirmation of successful demo payment
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const transactionId = `TXN-DEMO-DON-${Date.now().toString(36).toUpperCase()}-${randomHex}`;

    await transaction(async (client) => {
      await client.query(
        `UPDATE "public"."DonationPayment"
         SET "status" = 'SUCCEEDED', "providerTransactionId" = $1, "verifiedAt" = NOW(), "updatedAt" = NOW()
         WHERE "reference" = $2`,
        [transactionId, paymentReference]
      );

      await client.query(
        `UPDATE "public"."Donation"
         SET "status" = 'PAID', "updatedAt" = NOW()
         WHERE "reference" = $1`,
        [payment.donationReference]
      );
    });

    logger.info(
      { paymentReference, donationReference: payment.donationReference, transactionId },
      'Demo donation payment successfully verified and marked PAID'
    );

    return {
      success: true,
      status: 'SUCCEEDED',
      paymentReference,
      transactionId,
      donationReference: payment.donationReference,
      amount: payment.amount,
      currency: payment.currency,
      message: 'Demo donation payment successfully verified. Thank you for your contribution!',
    };
  }

  public static async listDonations(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;
    let sql = `SELECT 
      d."id", d."reference", d."amountMinor", d."currency", d."status", d."donorName", 
      d."email", d."phone", d."isAnonymous", d."message", d."createdAt",
      c."title" AS "campaignTitle"
     FROM "public"."Donation" d
     LEFT JOIN "public"."DonationCampaign" c ON d."campaignId" = c."id"`;
    const params: any[] = [];

    if (status) {
      params.push(status);
      sql += ` WHERE d."status" = $1`;
    }

    sql += ` ORDER BY d."createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const rows = await query(sql, params);

    let countSql = `SELECT COUNT(*) as total FROM "public"."Donation"`;
    const countParams: any[] = [];
    if (status) {
      countParams.push(status);
      countSql += ` WHERE "status" = $1`;
    }
    const countRes = await queryOne<{ total: string }>(countSql, countParams);
    const total = parseInt(countRes?.total || '0', 10);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: rows.map((r: any) => ({
        ...r,
        amount: r.amountMinor / 100,
      })),
    };
  }
}
