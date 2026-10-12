import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

const validPdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
const invalidBuffer = Buffer.from('Just plain text without PDF magic bytes');

describe('Erkab Platform: Partnerships, Donations, and News', () => {
  describe('Partnerships', () => {
    it('rejects partnership submission without license document', async () => {
      const res = await request(app)
        .post('/api/v1/web/partnerships')
        .field('organizationName', 'Acme Foundation')
        .field('organizationType', 'NGO')
        .field('contactPerson', 'Sarah Connor')
        .field('email', 'sarah@acme.org')
        .field('phone', '+251911223344')
        .field('partnershipType', 'Funding / Scholarships')
        .field('proposal', 'We want to sponsor vocational students');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('license document');
    });

    it('rejects partnership submission with invalid file content (magic bytes)', async () => {
      const res = await request(app)
        .post('/api/v1/web/partnerships')
        .field('organizationName', 'Acme Foundation')
        .field('organizationType', 'NGO')
        .field('contactPerson', 'Sarah Connor')
        .field('email', 'sarah@acme.org')
        .field('phone', '+251911223344')
        .field('partnershipType', 'Funding / Scholarships')
        .field('proposal', 'We want to sponsor vocational students')
        .attach('organizationLicense', invalidBuffer, 'fake_license.pdf');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('not a valid document');
    });

    it('successfully processes valid partnership submission with organization license', async () => {
      const res = await request(app)
        .post('/api/v1/web/partnerships')
        .field('organizationName', 'Global Tech Partners')
        .field('organizationType', 'International Enterprise')
        .field('contactPerson', 'John Doe')
        .field('email', 'john.doe@globaltech.org')
        .field('phone', '+251911998877')
        .field('country', 'Ethiopia')
        .field('city', 'Addis Ababa')
        .field('partnershipType', 'Equipment & Labs')
        .field('proposal', 'Proposal to equip 20 computer workstations in Gondar lab with developer gear.')
        .attach('organizationLicense', validPdfBuffer, 'business_license.pdf');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.referenceNumber).toMatch(/^ERK-PRT-\d{4}-[A-Z0-9]+$/);
      // Public response must NEVER expose private license URL
      expect(res.body.downloadUrl).toBeUndefined();
      expect(res.body.cloudinaryPublicId).toBeUndefined();

      const prtRef = res.body.referenceNumber;

      // Admin verification
      const adminListRes = await request(app)
        .get('/api/v1/admin/partnerships')
        .set('Authorization', 'Bearer test_admin_token_2026');
      expect(adminListRes.status).toBe(200);
      expect(adminListRes.body.success).toBe(true);
      expect(Array.isArray(adminListRes.body.data)).toBe(true);

      const adminDetailRes = await request(app)
        .get(`/api/v1/admin/partnerships/${prtRef}`)
        .set('Authorization', 'Bearer test_admin_token_2026');
      expect(adminDetailRes.status).toBe(200);
      expect(adminDetailRes.body.data.partnership.reference).toBe(prtRef);
      expect(adminDetailRes.body.data.documents.length).toBeGreaterThan(0);

      // Admin license download URL
      const adminLicenseRes = await request(app)
        .get(`/api/v1/admin/partnerships/${prtRef}/license`)
        .set('Authorization', 'Bearer test_admin_token_2026');
      expect(adminLicenseRes.status).toBe(200);
      expect(adminLicenseRes.body.downloadUrl).toBeDefined();

      // Admin review
      const reviewRes = await request(app)
        .post(`/api/v1/admin/partnerships/${prtRef}/review`)
        .set('Authorization', 'Bearer test_admin_token_2026')
        .send({
          status: 'APPROVED',
          reviewNotes: 'Verified registration document on official trade portal.',
        });
      expect(reviewRes.status).toBe(200);
      expect(reviewRes.body.success).toBe(true);
    }, 15000);

    it('rejects unauthorized access to admin partnerships', async () => {
      const res = await request(app).get('/api/v1/admin/partnerships');
      expect(res.status).toBe(401);
    });
  });

  describe('Donations & Demo Payments', () => {
    it('rejects donation with zero or negative amount', async () => {
      const res = await request(app)
        .post('/api/v1/web/donations')
        .send({
          amount: 0,
          email: 'donor@example.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('successfully creates donation and simulates full demo checkout lifecycle', async () => {
      const res = await request(app)
        .post('/api/v1/web/donations')
        .send({
          amount: 1500,
          currency: 'ETB',
          donorName: 'Abebe Tessema',
          email: 'abebe.donor@erkab.org',
          phone: '+251911554433',
          campaignSlug: 'scholarships',
          message: 'For youth tech training in Gondar',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.donationReference).toMatch(/^ERK-DON-\d{4}-[A-Z0-9]+$/);
      expect(res.body.paymentReference).toMatch(/^ERK-DPAY-\d{4}-[A-Z0-9]+$/);
      expect(res.body.amount).toBe(1500);
      expect(res.body.amountMinor).toBe(150000);
      expect(res.body.currency).toBe('ETB');

      const paymentRef = res.body.paymentReference;

      // Safe checkout details lookup
      const lookupRes = await request(app).get(`/api/v1/web/donations/payments/${paymentRef}`);
      expect(lookupRes.status).toBe(200);
      expect(lookupRes.body.data.amount).toBe(1500);
      expect(lookupRes.body.data.status).toBe('PENDING');
      expect(lookupRes.body.data.paymentMode).toBe('DEMO');
      // Must not expose donor phone or email in public payment query
      expect(lookupRes.body.data.phone).toBeUndefined();
      expect(lookupRes.body.data.email).toBeUndefined();

      // Confirm demo payment
      const confirmRes = await request(app)
        .post(`/api/v1/web/donations/payments/${paymentRef}/confirm-demo`)
        .send({ simulatedOutcome: 'SUCCESS' });

      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.success).toBe(true);
      expect(confirmRes.body.status).toBe('SUCCEEDED');
      expect(confirmRes.body.transactionId).toMatch(/^TXN-DEMO-DON-/);

      // Verify idempotency
      const idempotentRes = await request(app)
        .post(`/api/v1/web/donations/payments/${paymentRef}/confirm-demo`)
        .send({ simulatedOutcome: 'SUCCESS' });

      expect(idempotentRes.status).toBe(200);
      expect(idempotentRes.body.alreadyConfirmed).toBe(true);

      // Admin donation listing
      const adminRes = await request(app)
        .get('/api/v1/admin/donations')
        .set('Authorization', 'Bearer test_admin_token_2026');
      expect(adminRes.status).toBe(200);
      expect(adminRes.body.success).toBe(true);
      expect(Array.isArray(adminRes.body.data)).toBe(true);
    }, 15000);

    it('simulates failed demo payment without marking donation paid', async () => {
      const res = await request(app)
        .post('/api/v1/web/donations')
        .send({
          amount: 500,
          email: 'failed.donor@erkab.org',
        });

      expect(res.status).toBe(201);
      const paymentRef = res.body.paymentReference;

      const failRes = await request(app)
        .post(`/api/v1/web/donations/payments/${paymentRef}/confirm-demo`)
        .send({ simulatedOutcome: 'FAILURE' });

      expect(failRes.status).toBe(200);
      expect(failRes.body.success).toBe(false);
      expect(failRes.body.status).toBe('FAILED');

      const lookupRes = await request(app).get(`/api/v1/web/donations/payments/${paymentRef}`);
      expect(lookupRes.status).toBe(200);
      expect(lookupRes.body.data.status).toBe('FAILED');
      expect(lookupRes.body.data.donationStatus).toBe('PAYMENT_FAILED');
    }, 15000);
  });

  describe('News & Updates', () => {
    it('returns published articles only on public endpoint', async () => {
      const res = await request(app).get('/api/v1/web/news');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('returns article detail by slug and 404 for nonexistent slug', async () => {
      const res = await request(app).get('/api/v1/web/news/scholarship-cohort-1-announcement');
      expect(res.status).toBe(200);
      expect(res.body.data.title).toContain('Applications Open');

      const notFoundRes = await request(app).get('/api/v1/web/news/non-existent-article-slug');
      expect(notFoundRes.status).toBe(404);
    });

    it('allows authorized admin to manage news articles', async () => {
      const uniqueSlug = `test-article-${Date.now()}`;
      const createRes = await request(app)
        .post('/api/v1/admin/news')
        .set('Authorization', 'Bearer test_admin_token_2026')
        .send({
          title: 'Test Admin Article',
          slug: uniqueSlug,
          excerpt: 'Short summary for test article',
          content: 'Full comprehensive content for testing administrative news workflows.',
          category: 'Event',
          status: 'DRAFT',
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      const articleId = createRes.body.articleId;

      // Draft article must NOT appear on public endpoint
      const publicCheck = await request(app).get(`/api/v1/web/news/${uniqueSlug}`);
      expect(publicCheck.status).toBe(404);

      // Publish article
      const updateRes = await request(app)
        .put(`/api/v1/admin/news/${articleId}`)
        .set('Authorization', 'Bearer test_admin_token_2026')
        .send({ status: 'PUBLISHED' });
      expect(updateRes.status).toBe(200);

      // Now article is accessible publicly
      const publicAfter = await request(app).get(`/api/v1/web/news/${uniqueSlug}`);
      expect(publicAfter.status).toBe(200);
      expect(publicAfter.body.data.title).toBe('Test Admin Article');

      // Cleanup: delete article
      const deleteRes = await request(app)
        .delete(`/api/v1/admin/news/${articleId}`)
        .set('Authorization', 'Bearer test_admin_token_2026');
      expect(deleteRes.status).toBe(200);
    });
  });
});
