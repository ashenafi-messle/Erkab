import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

const validPdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');

describe('Admin Partnerships Management API & Secure Documents', () => {
  const adminToken = 'test_admin_token_2026';
  let createdReference: string;
  let createdDocumentId: string;

  it('rejects unauthenticated requests to /api/v1/admin/partnerships', async () => {
    const res = await request(app).get('/api/v1/admin/partnerships');
    expect(res.status).toBe(401);
  }, 20000);

  it('GET /api/v1/admin/partnerships/stats returns database counts', async () => {
    const res = await request(app)
      .get('/api/v1/admin/partnerships/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.totalRequests).toBe('number');
    expect(typeof res.body.data.pendingRequests).toBe('number');
    expect(typeof res.body.data.underReview).toBe('number');
    expect(typeof res.body.data.approved).toBe('number');
    expect(typeof res.body.data.rejected).toBe('number');
  }, 20000);

  it('Submits a partnership request through public form with license upload', async () => {
    const res = await request(app)
      .post('/api/v1/web/partnerships')
      .field('organizationName', 'Acme Innovation Lab')
      .field('organizationType', 'Corporate Enterprise')
      .field('contactPerson', 'Dr. Dawit Haile')
      .field('email', `dawit.${Date.now()}@acme-innovations.org`)
      .field('phone', '+251911445566')
      .field('partnershipType', 'Curriculum Co-development')
      .field('proposal', 'Strategic initiative to offer sponsored AI fellowships for underprivileged Ethiopian students.')
      .attach('organizationLicense', validPdfBuffer, 'acme_trade_license.pdf');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.referenceNumber).toBeDefined();

    createdReference = res.body.referenceNumber;
  }, 20000);

  it('GET /api/v1/admin/partnerships lists submitted request with document indicators', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/partnerships?search=Acme`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const match = res.body.data.find((p: any) => p.reference === createdReference);
    expect(match).toBeDefined();
    expect(match.organizationName).toBe('Acme Innovation Lab');
    expect(match.hasLicenseDocument).toBe(true);
  }, 20000);

  it('GET /api/v1/admin/partnerships/:id retrieves full details and document metadata', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/partnerships/${createdReference}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.partnership).toBeDefined();
    expect(res.body.data.partnership.contactPerson).toBe('Dr. Dawit Haile');
    expect(res.body.data.documents.length).toBeGreaterThan(0);

    const doc = res.body.data.documents[0];
    expect(doc.id).toBeDefined();
    expect(doc.originalName).toBe('acme_trade_license.pdf');
    expect(doc.mimeType).toBe('application/pdf');

    createdDocumentId = doc.id;
  }, 20000);

  it('POST /api/v1/admin/partnerships/:id/review updates review status with audit tracking', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/partnerships/${createdReference}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'UNDER_REVIEW',
        reviewNotes: 'Verified organization business registration and credential validity.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify status updated in database
    const verifyRes = await request(app)
      .get(`/api/v1/admin/partnerships/${createdReference}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(verifyRes.body.data.partnership.status).toBe('UNDER_REVIEW');
    expect(verifyRes.body.data.partnership.reviewNotes).toContain('Verified organization');
  }, 20000);

  it('GET /api/v1/admin/partnerships/:id/documents/:docId/access-url returns secure signed URL', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/partnerships/${createdReference}/documents/${createdDocumentId}/access-url`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessUrl).toBeDefined();
    expect(res.body.data.accessUrl).toContain('cloudinary.com');
  }, 20000);

  it('Prevents cross-application document tampering (mismatched doc ID)', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/partnerships/${createdReference}/documents/00000000-0000-0000-0000-000000000000/access-url`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  }, 20000);

  it('GET /api/v1/admin/partnerships/:id/documents/:docId/view securely streams document inline', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/partnerships/${createdReference}/documents/${createdDocumentId}/view`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('inline');
  }, 25000);

  it('GET /api/v1/admin/partnerships/:id/documents/:docId/download securely streams document attachment', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/partnerships/${createdReference}/documents/${createdDocumentId}/download?token=${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
  }, 25000);
});
