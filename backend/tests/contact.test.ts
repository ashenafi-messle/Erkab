import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { ensureContactMessageTable } from '../src/prisma/migrateContact';

const TEST_ADMIN_TOKEN = 'test_admin_token_2026';

describe('Contact Messaging System', () => {
  beforeAll(async () => {
    await ensureContactMessageTable();
  });

  describe('Public Contact Submission: POST /api/v1/web/contact & /api/v1/contact', () => {
    it('successfully submits a valid contact message and returns a unique reference code', async () => {
      const payload = {
        fullName: 'Abebe Bikila',
        email: 'abebe.bikila@example.com',
        phone: '+251 91 123 4567',
        subject: 'Inquiry regarding Full-Stack Web Development cohort',
        category: 'TRAINING_PROGRAMS',
        message: 'Hello Erkab team, I would like to inquire about the upcoming cohort schedule and laptop requirements in Gondar.',
      };

      const res = await request(app)
        .post('/api/v1/web/contact')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.referenceCode).toMatch(/^MSG-\d{4}-[A-Z0-9]{6}$/);
    });

    it('works identically via the backward-compatible alias POST /api/v1/contact', async () => {
      const payload = {
        fullName: 'Tirunesh Dibaba',
        email: 'tirunesh@example.com',
        subject: 'Scholarship eligibility criteria question',
        category: 'Scholarship Application', // test human-friendly category normalizer
        message: 'I would like to verify if university graduates are eligible for the scholarship track.',
      };

      const res = await request(app)
        .post('/api/v1/contact')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.referenceCode).toMatch(/^MSG-\d{4}-[A-Z0-9]{6}$/);
    });

    it('rejects submissions missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/web/contact')
        .send({
          fullName: '',
          email: 'invalid-email',
          subject: '',
          message: 'short',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.fullName).toBeDefined();
      expect(res.body.errors.email).toBeDefined();
      expect(res.body.errors.subject).toBeDefined();
      expect(res.body.errors.message).toBeDefined();
    });

    it('rejects invalid or unapproved inquiry categories', async () => {
      const res = await request(app)
        .post('/api/v1/web/contact')
        .send({
          fullName: 'Haile Gebrselassie',
          email: 'haile@example.com',
          subject: 'Random subject',
          category: 'UNAPPROVED_CATEGORY_NAME',
          message: 'Valid length message explaining the inquiry in detail.',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.category).toBeDefined();
    });

    it('rejects oversized message bodies exceeding 4000 characters', async () => {
      const res = await request(app)
        .post('/api/v1/web/contact')
        .send({
          fullName: 'Kenenisa Bekele',
          email: 'kenenisa@example.com',
          subject: 'Oversized message test',
          category: 'GENERAL_INQUIRY',
          message: 'A'.repeat(4005),
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.message).toBeDefined();
    });

    it('detects honeypot field and silently drops bot spam without saving to database', async () => {
      const res = await request(app)
        .post('/api/v1/web/contact')
        .send({
          fullName: 'Bot User',
          email: 'spam@botnet.ru',
          subject: 'Buy cheap watches online',
          category: 'OTHER',
          message: 'Click this link to purchase promotional items immediately.',
          hp_organization: 'Automated Spammer Corp', // honeypot filled
        });

      // Still returns 201 to the bot, but with synthetic reference code
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.referenceCode).toBeDefined();
    });
  });

  describe('Administrative Contact Message Management: /api/v1/admin/contact-messages', () => {
    it('denies access to administrative inbox without authentication', async () => {
      const res = await request(app).get('/api/v1/admin/contact-messages');
      expect([401, 403]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('allows authenticated admin to retrieve aggregated message statistics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/contact-messages/stats')
        .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(typeof res.body.data.TOTAL).toBe('number');
      expect(typeof res.body.data.NEW).toBe('number');
    });

    it('allows authenticated admin to list messages with pagination and filtering', async () => {
      const res = await request(app)
        .get('/api/v1/admin/contact-messages?page=1&limit=10')
        .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.messages)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.page).toBe(1);
    }, 15000);

    it('allows authenticated admin to view single message detail and update status and internal notes', async () => {
      // First submit a fresh message to get its referenceCode
      const createRes = await request(app)
        .post('/api/v1/web/contact')
        .send({
          fullName: 'Derartu Tulu',
          email: 'derartu@example.com',
          phone: '+251 92 000 1111',
          subject: 'Mentorship inquiry for women in technology track',
          category: 'PARTNERSHIP_MENTORSHIP',
          message: 'I am interested in offering weekend mentorship sessions to female tech students in Gondar.',
        });

      const refCode = createRes.body.data.referenceCode;

      // Fetch detail as admin
      const detailRes = await request(app)
        .get(`/api/v1/admin/contact-messages/${refCode}`)
        .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`);

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.data.fullName).toBe('Derartu Tulu');
      expect(detailRes.body.data.readAt).toBeDefined(); // marked as read on fetch

      const messageId = detailRes.body.data.id;

      // Update status and internal notes
      const updateRes = await request(app)
        .patch(`/api/v1/admin/contact-messages/${messageId}`)
        .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`)
        .send({
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          internalNotes: 'Assigned to Community Partnership Lead for follow-up call on Thursday.',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.status).toBe('IN_PROGRESS');
      expect(updateRes.body.data.priority).toBe('HIGH');
      expect(updateRes.body.data.internalNotes).toBe(
        'Assigned to Community Partnership Lead for follow-up call on Thursday.'
      );
    }, 15000);
  });
});
