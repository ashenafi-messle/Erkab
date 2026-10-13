import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

// Mock valid PDF buffer (%PDF-1.4...)
const validPdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
// Invalid buffer (plain text)
const invalidBuffer = Buffer.from('Just plain text file without PDF magic bytes');

describe('Applications Endpoints', () => {
  describe('Student Applications', () => {
    it('rejects student application with missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/web/applications/students')
        .field('fullName', 'Abebe Bikila');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects student application with missing files', async () => {
      const res = await request(app)
        .post('/api/v1/web/applications/students')
        .field('fullName', 'Abebe Bikila')
        .field('gender', 'Male')
        .field('age', '22')
        .field('classCompletionYear', '2025')
        .field('telegramPhone', '+251911223344')
        .field('email', 'abebe@example.com')
        .field('selectedProgramId', 'web-development');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects upload with invalid magic bytes', async () => {
      const res = await request(app)
        .post('/api/v1/web/applications/students')
        .field('fullName', 'Abebe Bikila')
        .field('gender', 'Male')
        .field('age', '22')
        .field('classCompletionYear', '2025')
        .field('telegramPhone', '+251911223344')
        .field('email', 'abebe@example.com')
        .field('selectedProgramId', 'web-development')
        .attach('educationCertificate', invalidBuffer, 'cert.pdf')
        .attach('nationalId', validPdfBuffer, 'id.pdf')
        .attach('ideaProposal', validPdfBuffer, 'idea.pdf');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('is not a valid document');
    });

    it('successfully processes valid student application', async () => {
      const res = await request(app)
        .post('/api/v1/web/applications/students')
        .field('fullName', 'Tadesse Gebre')
        .field('gender', 'Male')
        .field('age', '24')
        .field('classCompletionYear', '2025')
        .field('telegramPhone', '+251911445566')
        .field('email', 'tadesse.test@erkab.org')
        .field('selectedProgramId', 'web-development')
        .attach('educationCertificate', validPdfBuffer, 'degree.pdf')
        .attach('nationalId', validPdfBuffer, 'kebele_id.pdf')
        .attach('ideaProposal', validPdfBuffer, 'project_proposal.pdf');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.referenceNumber).toMatch(/^ERK-STU-\d{4}-[A-Z0-9]+$/);
    }, 15000);
  });

  describe('Trainer Applications', () => {
    it('successfully processes valid trainer application', async () => {
      const res = await request(app)
        .post('/api/v1/web/applications/trainers')
        .field('fullName', 'Almaz Ayana')
        .field('email', 'almaz.trainer@erkab.org')
        .field('telegramPhone', '+251922334455')
        .field('expertiseTrack', 'Mobile Application Development')
        .field('yearsOfExperience', '3-5 Years')
        .field('portfolioUrl', 'https://github.com/almaz')
        .field('teachingStatement', 'Passionate about training next generation Ethiopian developers.')
        .attach('resumeFile', validPdfBuffer, 'resume.pdf');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.referenceNumber).toMatch(/^ERK-TRN-\d{4}-[A-Z0-9]+$/);
    }, 15000);
  });

  describe('Tutor Applications & Demo Payments', () => {
    it('rejects tutoring request with invalid school grade', async () => {
      const res = await request(app)
        .post('/api/v1/web/applications/tutors')
        .send({
          studentName: 'Invalid Grade Student',
          gradeLevel: 'Grade 99', // Invalid
          subjects: ['Mathematics'],
          deliveryPreference: 'Online',
          parentOrContactPhone: '+251911223344',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(JSON.stringify(res.body.error)).toContain('Invalid grade level');
    });

    it('successfully processes valid tutoring request with Grade 10 and generates demo payment', async () => {
      const res = await request(app)
        .post('/api/v1/web/tutoring/requests')
        .send({
          studentName: 'Dawit Yohannes',
          gradeLevel: 'Grade 10',
          subjects: ['Mathematics', 'Physics'],
          deliveryPreference: 'In-Person / Home',
          parentOrContactPhone: '+251933445566',
          email: 'dawit.parent@erkab.org',
          locationDetails: 'Gondar, Piazza area',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.referenceNumber).toMatch(/^ERK-TUT-\d{4}-[A-Z0-9]+$/);
      expect(res.body.paymentReference).toMatch(/^ERK-PAY-\d{4}-[A-Z0-9]+$/);
      expect(res.body.amount).toBe(500);
      expect(res.body.currency).toBe('ETB');

      const paymentRef = res.body.paymentReference;

      // Verify payment lookup
      const lookupRes = await request(app).get(`/api/v1/web/tutoring/payments/${paymentRef}`);
      expect(lookupRes.status).toBe(200);
      expect(lookupRes.body.success).toBe(true);
      expect(lookupRes.body.data.paymentReference).toBe(paymentRef);
      expect(lookupRes.body.data.amount).toBe(500);
      expect(lookupRes.body.data.status).toBe('PENDING');
      expect(lookupRes.body.data.paymentMode).toBe('DEMO');

      // Confirm demo payment
      const confirmRes = await request(app)
        .post(`/api/v1/web/tutoring/payments/${paymentRef}/confirm-demo`)
        .send({ simulatedOutcome: 'SUCCESS' });

      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.success).toBe(true);
      expect(confirmRes.body.status).toBe('SUCCEEDED');
      expect(confirmRes.body.transactionId).toMatch(/^TXN-DEMO-/);

      // Verify idempotency
      const idempotentRes = await request(app)
        .post(`/api/v1/web/tutoring/payments/${paymentRef}/confirm-demo`)
        .send({ simulatedOutcome: 'SUCCESS' });

      expect(idempotentRes.status).toBe(200);
      expect(idempotentRes.body.success).toBe(true);
      expect(idempotentRes.body.alreadyConfirmed).toBe(true);
    });

    it('successfully processes university tutoring request with 750 ETB fee', async () => {
      const res = await request(app)
        .post('/api/v1/web/tutoring/requests')
        .send({
          studentName: 'Selamawit Bekele',
          educationLevel: 'University',
          gradeLevel: 'University - 2nd Year',
          subjects: ['Data Structures', 'Algorithms'],
          deliveryPreference: 'Online',
          parentOrContactPhone: '+251911887766',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.referenceNumber).toMatch(/^ERK-TUT-\d{4}-[A-Z0-9]+$/);
      expect(res.body.paymentReference).toMatch(/^ERK-PAY-\d{4}-[A-Z0-9]+$/);
      expect(res.body.amount).toBe(750);
      expect(res.body.currency).toBe('ETB');
    });

    it('simulates failed demo payment when requested without marking registration paid', async () => {
      const res = await request(app)
        .post('/api/v1/web/tutoring/requests')
        .send({
          studentName: 'Failed Payment Student',
          gradeLevel: 'Grade 7',
          subjects: ['English'],
          deliveryPreference: 'Online',
          parentOrContactPhone: '+251911998877',
        });

      expect(res.status).toBe(201);
      const paymentRef = res.body.paymentReference;

      const failRes = await request(app)
        .post(`/api/v1/web/tutoring/payments/${paymentRef}/confirm-demo`)
        .send({ simulatedOutcome: 'FAILURE' });

      expect(failRes.status).toBe(200);
      expect(failRes.body.success).toBe(false);
      expect(failRes.body.status).toBe('FAILED');

      // Verify payment status is FAILED
      const lookupRes = await request(app).get(`/api/v1/web/tutoring/payments/${paymentRef}`);
      expect(lookupRes.status).toBe(200);
      expect(lookupRes.body.data.status).toBe('FAILED');
      expect(lookupRes.body.data.tutoringStatus).toBe('PENDING_PAYMENT');
    });
  });

  describe('Protected Admin Access', () => {
    it('rejects unauthenticated requests to admin applications listing', async () => {
      const res = await request(app).get('/api/v1/admin/applications/students');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UnauthorizedError');
    });

    it('allows access to admin listing with bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/admin/applications/students')
        .set('Authorization', 'Bearer test_admin_token_2026');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('supports search query and document indicators', async () => {
      const res = await request(app)
        .get('/api/v1/admin/applications/students?search=Tadesse')
        .set('Authorization', 'Bearer test_admin_token_2026');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
        expect(res.body.data[0].documentCount).toBeDefined();
      }
    });

    it('retrieves detailed student application with signed document URLs', async () => {
      const listRes = await request(app)
        .get('/api/v1/admin/applications/students')
        .set('Authorization', 'Bearer test_admin_token_2026');

      expect(listRes.status).toBe(200);
      const student = listRes.body.data[0];
      expect(student).toBeDefined();

      const detailRes = await request(app)
        .get(`/api/v1/admin/applications/students/${student.id}`)
        .set('Authorization', 'Bearer test_admin_token_2026');

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.success).toBe(true);
      expect(detailRes.body.data.application).toBeDefined();
      expect(Array.isArray(detailRes.body.data.documents)).toBe(true);

      // Verify signed document review URLs
      if (detailRes.body.data.documents.length > 0) {
        const doc = detailRes.body.data.documents[0];
        expect(doc.reviewUrl).toBeDefined();
        expect(doc.reviewUrl).toContain('cloudinary.com');

        // Test secure document access endpoint
        const docAccessRes = await request(app)
          .get(`/api/v1/admin/applications/students/${student.id}/documents/${doc.id}/access`)
          .set('Authorization', 'Bearer test_admin_token_2026');

        expect(docAccessRes.status).toBe(200);
        expect(docAccessRes.body.success).toBe(true);
        expect(docAccessRes.body.document.accessUrl).toBeDefined();

        // Test secure document streaming view endpoint
        const viewRes = await request(app)
          .get(`/api/v1/admin/applications/students/${student.id}/documents/${doc.id}/view`)
          .set('Authorization', 'Bearer test_admin_token_2026');

        expect(viewRes.status).toBe(200);
        expect(viewRes.headers['content-disposition']).toContain('inline');

        // Test secure document download endpoint with query token
        const downloadRes = await request(app)
          .get(`/api/v1/admin/applications/students/${student.id}/documents/${doc.id}/download?token=test_admin_token_2026`);

        expect(downloadRes.status).toBe(200);
        expect(downloadRes.headers['content-disposition']).toContain('attachment');
      }
    });

    it('rejects document access if document does not belong to the requested application', async () => {
      const listRes = await request(app)
        .get('/api/v1/admin/applications/students')
        .set('Authorization', 'Bearer test_admin_token_2026');

      const student = listRes.body.data[0];

      const res = await request(app)
        .get(`/api/v1/admin/applications/students/${student.id}/documents/non-existent-doc-id/access`)
        .set('Authorization', 'Bearer test_admin_token_2026');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('updates application status with review notes and records audit trail', async () => {
      const listRes = await request(app)
        .get('/api/v1/admin/applications/students')
        .set('Authorization', 'Bearer test_admin_token_2026');

      const student = listRes.body.data[0];

      const patchRes = await request(app)
        .patch(`/api/v1/admin/applications/students/${student.id}/status`)
        .set('Authorization', 'Bearer test_admin_token_2026')
        .send({
          status: 'APPROVED',
          notes: 'Meets academic requirements and demonstrated outstanding project proposal.',
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.success).toBe(true);
      expect(patchRes.body.status).toBe('APPROVED');

      // Verify status persisted
      const detailRes = await request(app)
        .get(`/api/v1/admin/applications/students/${student.id}`)
        .set('Authorization', 'Bearer test_admin_token_2026');

      expect(detailRes.body.data.application.status).toBe('APPROVED');
      expect(detailRes.body.data.reviews.length).toBeGreaterThan(0);
      expect(detailRes.body.data.reviews[0].decision).toBe('APPROVED');
      expect(detailRes.body.data.reviews[0].notes).toContain('Meets academic requirements');
    });

    it('prevents duplicate pending student submissions idempotently', async () => {
      const res = await request(app)
        .post('/api/v1/web/applications/students')
        .field('fullName', 'Tadesse Gebre Duplicate')
        .field('gender', 'Male')
        .field('age', '24')
        .field('classCompletionYear', '2025')
        .field('telegramPhone', '+251911445566')
        .field('email', 'tadesse.duplicate@erkab.org')
        .field('selectedProgramId', 'web-development')
        .attach('educationCertificate', validPdfBuffer, 'degree.pdf')
        .attach('nationalId', validPdfBuffer, 'kebele_id.pdf')
        .attach('ideaProposal', validPdfBuffer, 'project_proposal.pdf');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const initialRef = res.body.referenceNumber;

      // Second immediate submission with same email & program
      const dupRes = await request(app)
        .post('/api/v1/web/applications/students')
        .field('fullName', 'Tadesse Gebre Duplicate')
        .field('gender', 'Male')
        .field('age', '24')
        .field('classCompletionYear', '2025')
        .field('telegramPhone', '+251911445566')
        .field('email', 'tadesse.duplicate@erkab.org')
        .field('selectedProgramId', 'web-development')
        .attach('educationCertificate', validPdfBuffer, 'degree.pdf')
        .attach('nationalId', validPdfBuffer, 'kebele_id.pdf')
        .attach('ideaProposal', validPdfBuffer, 'project_proposal.pdf');

      expect(dupRes.status).toBe(201);
      expect(dupRes.body.success).toBe(true);
      expect(dupRes.body.referenceNumber).toBe(initialRef);
      expect(dupRes.body.message).toContain('already submitted');
    }, 15000);
  });
});
