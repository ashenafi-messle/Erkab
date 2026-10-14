import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { EmailService } from '../src/core/services/email.service';
import { createSessionToken } from '../src/core/utils/authSecurity';

// Valid PDF buffer for submissions
const validPdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');

// Super Admin token
const superAdminToken = 'test_admin_token_2026';

// Sub Admin token with only read access (no applications:write)
const subAdminReadOnlyToken = createSessionToken({
  id: 'usr-sub-readonly',
  email: 'subadmin-readonly@erkab.org',
  name: 'Sub Admin Read Only',
  role: 'SUB_ADMIN',
  permissions: ['applications:read'],
});

describe('Application Decision Notifications via Brevo SMTP Outbox', () => {
  beforeEach(() => {
    EmailService.setMockMode(true);
    EmailService.clearSentEmails();
  });

  describe('1. Student Scholarship Decision Notifications', () => {
    it('sends personalized approval email on final APPROVED transition', async () => {
      // 1. Submit a student application
      const uniqueSuffix = Date.now().toString(36);
      const studentEmail = `student.approved.${uniqueSuffix}@example.com`;
      const submitRes = await request(app)
        .post('/api/v1/web/applications/students')
        .field('fullName', 'Abebe Bikila Test')
        .field('gender', 'Male')
        .field('age', '22')
        .field('classCompletionYear', '2025')
        .field('telegramPhone', '+251911223344')
        .field('email', studentEmail)
        .field('selectedProgramId', 'web-development')
        .attach('educationCertificate', validPdfBuffer, 'cert.pdf')
        .attach('nationalId', validPdfBuffer, 'id.pdf')
        .attach('ideaProposal', validPdfBuffer, 'idea.pdf');

      expect(submitRes.status).toBe(201);
      const refNumber = submitRes.body.referenceNumber;
      expect(refNumber).toBeDefined();

      EmailService.clearSentEmails();

      // 2. Approve application as Super Admin using referenceNumber
      const decisionRes = await request(app)
        .patch(`/api/v1/admin/applications/students/${refNumber}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          status: 'APPROVED',
          notes: 'Meets academic criteria and submitted excellent technical essay.',
        });

      expect(decisionRes.status).toBe(200);
      expect(decisionRes.body.success).toBe(true);
      expect(decisionRes.body.status).toBe('APPROVED');
      expect(decisionRes.body.notification).toBeDefined();
      expect(decisionRes.body.notification.status).toBe('SENT');
      expect(decisionRes.body.notification.recipientEmail).toBe(studentEmail);

      // 3. Verify mock sent email
      const sentEmails = EmailService.getSentEmails();
      expect(sentEmails.length).toBe(1);
      const sent = sentEmails[0];
      expect(sent.to).toBe(studentEmail);
      expect(sent.subject).toBe('Erkab Skills Training Organization — Application Approved');
      expect(sent.text).toContain('Abebe Bikila Test');
      expect(sent.text).toContain(refNumber);
      expect(sent.text).toContain('Student Scholarship');
      expect(sent.html).toContain('Abebe Bikila Test');
      expect(sent.html).toContain(refNumber);
      // Ensure platform logo is present in HTML email
      expect(sent.html).toContain('alt="Erkab Logo"');
      expect(sent.html).toContain('erkab_logo_official.jpg');
      // Ensure internal notes are NOT leaked
      expect(sent.text).not.toContain('Meets academic criteria');
      expect(sent.html).not.toContain('Meets academic criteria');
    }, 15000);

    it('sends personalized rejection email on final REJECTED transition', async () => {
      const uniqueSuffix = Date.now().toString(36);
      const studentEmail = `student.rejected.${uniqueSuffix}@example.com`;
      const submitRes = await request(app)
        .post('/api/v1/web/applications/students')
        .field('fullName', 'Selamawit Desta')
        .field('gender', 'Female')
        .field('age', '21')
        .field('classCompletionYear', '2025')
        .field('telegramPhone', '+251922334455')
        .field('email', studentEmail)
        .field('selectedProgramId', 'ai-machine-learning')
        .attach('educationCertificate', validPdfBuffer, 'cert.pdf')
        .attach('nationalId', validPdfBuffer, 'id.pdf')
        .attach('ideaProposal', validPdfBuffer, 'idea.pdf');

      expect(submitRes.status).toBe(201);
      const refNumber = submitRes.body.referenceNumber;
      expect(refNumber).toBeDefined();

      EmailService.clearSentEmails();

      const decisionRes = await request(app)
        .patch(`/api/v1/admin/applications/students/${refNumber}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          status: 'REJECTED',
          notes: 'Insufficient prerequisites for AI track.',
        });

      expect(decisionRes.status).toBe(200);
      expect(decisionRes.body.success).toBe(true);
      expect(decisionRes.body.status).toBe('REJECTED');

      const sentEmails = EmailService.getSentEmails();
      expect(sentEmails.length).toBe(1);
      const sent = sentEmails[0];
      expect(sent.to).toBe(studentEmail);
      expect(sent.subject).toBe('Erkab Skills Training Organization — Application Update');
      expect(sent.text).toContain('Selamawit Desta');
      expect(sent.text).toContain(refNumber);
      expect(sent.text).toContain('Student Scholarship');
      // Ensure platform logo is present in HTML email
      expect(sent.html).toContain('alt="Erkab Logo"');
      expect(sent.html).toContain('erkab_logo_official.jpg');
      // Ensure internal notes are NOT leaked
      expect(sent.text).not.toContain('Insufficient prerequisites');
      expect(sent.html).not.toContain('Insufficient prerequisites');
    }, 15000);
  });

  describe('2. Trainer & Tutor Decision Templates', () => {
    it('sends correct trainer mentor template on approval', async () => {
      const uniqueSuffix = Date.now().toString(36);
      const trainerEmail = `trainer.${uniqueSuffix}@example.com`;
      const submitRes = await request(app)
        .post('/api/v1/web/applications/trainers')
        .field('fullName', 'Yonas Tesfaye')
        .field('email', trainerEmail)
        .field('telegramPhone', '+251933445566')
        .field('expertiseTrack', 'Software Engineering')
        .field('yearsOfExperience', '3-5 Years')
        .field('teachingStatement', 'Passionate about coding education')
        .attach('resumeFile', validPdfBuffer, 'resume.pdf');

      expect(submitRes.status).toBe(201);
      const refNumber = submitRes.body.referenceNumber;
      expect(refNumber).toBeDefined();

      EmailService.clearSentEmails();

      const decisionRes = await request(app)
        .patch(`/api/v1/admin/applications/trainers/${refNumber}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'APPROVED' });

      expect(decisionRes.status).toBe(200);
      const sentEmails = EmailService.getSentEmails();
      expect(sentEmails.length).toBe(1);
      expect(sentEmails[0].to).toBe(trainerEmail);
      expect(sentEmails[0].text).toContain('Trainer or Industry Mentor');
      expect(sentEmails[0].text).toContain('Yonas Tesfaye');
    }, 15000);

    it('sends correct academic tutor template on rejection', async () => {
      const uniqueSuffix = Date.now().toString(36);
      const tutorEmail = `tutor.${uniqueSuffix}@example.com`;
      const submitRes = await request(app)
        .post('/api/v1/web/applications/tutors')
        .field('studentOrApplicantName', 'Dr. Haile Wolde')
        .field('email', tutorEmail)
        .field('parentOrContactPhone', '+251944556677')
        .field('gradeLevel', 'Grade 12')
        .field('subjects', 'Physics, Calculus')
        .field('deliveryPreference', 'Online')
        .attach('resumeFile', validPdfBuffer, 'degree.pdf');

      expect(submitRes.status).toBe(201);
      const refNumber = submitRes.body.referenceNumber;
      expect(refNumber).toBeDefined();

      EmailService.clearSentEmails();

      const decisionRes = await request(app)
        .patch(`/api/v1/admin/applications/tutors/${refNumber}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'REJECTED' });

      expect(decisionRes.status).toBe(200);
      const sentEmails = EmailService.getSentEmails();
      expect(sentEmails.length).toBe(1);
      expect(sentEmails[0].to).toBe(tutorEmail);
      expect(sentEmails[0].text).toContain('Academic Tutor');
      expect(sentEmails[0].text).toContain('Dr. Haile Wolde');
    }, 15000);
  });

  describe('3. Transition and Non-Final Status Rules', () => {
    it('does not send email for non-final statuses (UNDER_REVIEW, WAITLISTED)', async () => {
      const uniqueSuffix = Date.now().toString(36);
      const studentEmail = `student.nonfinal.${uniqueSuffix}@example.com`;
      const submitRes = await request(app)
        .post('/api/v1/web/applications/students')
        .field('fullName', 'Kidus Yohannes')
        .field('gender', 'Male')
        .field('age', '20')
        .field('classCompletionYear', '2024')
        .field('telegramPhone', '+251955667788')
        .field('email', studentEmail)
        .field('selectedProgramId', 'cybersecurity')
        .attach('educationCertificate', validPdfBuffer, 'cert.pdf')
        .attach('nationalId', validPdfBuffer, 'id.pdf')
        .attach('ideaProposal', validPdfBuffer, 'idea.pdf');

      const refNumber = submitRes.body.referenceNumber;
      expect(refNumber).toBeDefined();
      EmailService.clearSentEmails();

      // Mark UNDER_REVIEW
      const underReviewRes = await request(app)
        .patch(`/api/v1/admin/applications/students/${refNumber}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'UNDER_REVIEW' });

      expect(underReviewRes.status).toBe(200);
      expect(underReviewRes.body.notification).toBeNull();
      expect(EmailService.getSentEmails().length).toBe(0);

      // Mark WAITLISTED
      const waitlistRes = await request(app)
        .patch(`/api/v1/admin/applications/students/${refNumber}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'WAITLISTED' });

      expect(waitlistRes.status).toBe(200);
      expect(waitlistRes.body.notification).toBeNull();
      expect(EmailService.getSentEmails().length).toBe(0);
    }, 15000);

    it('does not duplicate email when re-saving the same final status without a status change', async () => {
      const uniqueSuffix = Date.now().toString(36);
      const studentEmail = `student.resave.${uniqueSuffix}@example.com`;
      const submitRes = await request(app)
        .post('/api/v1/web/applications/students')
        .field('fullName', 'Marta Girma')
        .field('gender', 'Female')
        .field('age', '23')
        .field('classCompletionYear', '2025')
        .field('telegramPhone', '+251966778899')
        .field('email', studentEmail)
        .field('selectedProgramId', 'data-science')
        .attach('educationCertificate', validPdfBuffer, 'cert.pdf')
        .attach('nationalId', validPdfBuffer, 'id.pdf')
        .attach('ideaProposal', validPdfBuffer, 'idea.pdf');

      const refNumber = submitRes.body.referenceNumber;
      expect(refNumber).toBeDefined();
      EmailService.clearSentEmails();

      // 1. Initial approval
      await request(app)
        .patch(`/api/v1/admin/applications/students/${refNumber}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'APPROVED' });

      expect(EmailService.getSentEmails().length).toBe(1);

      // 2. Re-saving APPROVED again
      const resaveRes = await request(app)
        .patch(`/api/v1/admin/applications/students/${refNumber}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'APPROVED', notes: 'Re-saving notes without status change' });

      expect(resaveRes.status).toBe(200);
      expect(resaveRes.body.notification).toBeNull();
      // Email count must remain 1 (no duplicate sent!)
      expect(EmailService.getSentEmails().length).toBe(1);
    }, 15000);

    it('sends new decision notification when an application is reopened and given a genuinely new final decision', async () => {
      const uniqueSuffix = Date.now().toString(36);
      const studentEmail = `student.reopen.${uniqueSuffix}@example.com`;
      const submitRes = await request(app)
        .post('/api/v1/web/applications/students')
        .field('fullName', 'Berhanu Nega')
        .field('gender', 'Male')
        .field('age', '25')
        .field('classCompletionYear', '2024')
        .field('telegramPhone', '+251977889900')
        .field('email', studentEmail)
        .field('selectedProgramId', 'web-development')
        .attach('educationCertificate', validPdfBuffer, 'cert.pdf')
        .attach('nationalId', validPdfBuffer, 'id.pdf')
        .attach('ideaProposal', validPdfBuffer, 'idea.pdf');

      const refNumber = submitRes.body.referenceNumber;
      expect(refNumber).toBeDefined();
      EmailService.clearSentEmails();

      // 1. Initially REJECTED
      await request(app)
        .patch(`/api/v1/admin/applications/students/${refNumber}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'REJECTED' });

      expect(EmailService.getSentEmails().length).toBe(1);
      expect(EmailService.getSentEmails()[0].subject).toContain('Application Update');

      // 2. Reopened to UNDER_REVIEW
      await request(app)
        .patch(`/api/v1/admin/applications/students/${refNumber}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'UNDER_REVIEW' });

      expect(EmailService.getSentEmails().length).toBe(1);

      // 3. New final decision: APPROVED
      await request(app)
        .patch(`/api/v1/admin/applications/students/${refNumber}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'APPROVED' });

      // Second email dispatched for the new final decision
      expect(EmailService.getSentEmails().length).toBe(2);
      expect(EmailService.getSentEmails()[1].subject).toContain('Application Approved');
    }, 15000);
  });

  describe('4. Resilient Failure Isolation & Retries', () => {
    it('preserves the saved application decision even when email delivery fails', async () => {
      const uniqueSuffix = Date.now().toString(36);
      // Valid email format for web validator, but will simulate an SMTP error
      const studentEmail = `student.fail.${uniqueSuffix}@example.com`;
      const submitRes = await request(app)
        .post('/api/v1/web/applications/students')
        .field('fullName', 'Blen Assefa')
        .field('gender', 'Female')
        .field('age', '21')
        .field('classCompletionYear', '2025')
        .field('telegramPhone', '+251988990011')
        .field('email', studentEmail)
        .field('selectedProgramId', 'web-development')
        .attach('educationCertificate', validPdfBuffer, 'cert.pdf')
        .attach('nationalId', validPdfBuffer, 'id.pdf')
        .attach('ideaProposal', validPdfBuffer, 'idea.pdf');

      const refNumber = submitRes.body.referenceNumber;
      expect(refNumber).toBeDefined();

      // Force EmailService sendEmail to fail temporarily
      const originalSend = EmailService.sendEmail;
      EmailService.sendEmail = async () => ({
        success: false,
        error: 'Simulated Brevo SMTP timeout connection failure',
      });

      try {
        // Decision update must succeed even though email dispatch fails
        const decisionRes = await request(app)
          .patch(`/api/v1/admin/applications/students/${refNumber}/status`)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({ status: 'APPROVED' });

        expect(decisionRes.status).toBe(200);
        expect(decisionRes.body.success).toBe(true);
        expect(decisionRes.body.status).toBe('APPROVED');
        expect(decisionRes.body.notification).toBeDefined();
        expect(decisionRes.body.notification.status).toBe('FAILED');
        expect(decisionRes.body.notification.errorMessage).toContain('Simulated Brevo SMTP');

        // Verify the application remains APPROVED in database
        const detailRes = await request(app)
          .get(`/api/v1/admin/applications/students/${refNumber}`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(detailRes.body.data.application.status).toBe('APPROVED');
      } finally {
        EmailService.sendEmail = originalSend;
      }
    }, 15000);

    it('allows authorized administrators to view notifications and retry delivery', async () => {
      const uniqueSuffix = Date.now().toString(36);
      const studentEmail = `student.retry.${uniqueSuffix}@example.com`;
      const submitRes = await request(app)
        .post('/api/v1/web/applications/students')
        .field('fullName', 'Eskinder Nega')
        .field('gender', 'Male')
        .field('age', '22')
        .field('classCompletionYear', '2025')
        .field('telegramPhone', '+251999001122')
        .field('email', studentEmail)
        .field('selectedProgramId', 'web-development')
        .attach('educationCertificate', validPdfBuffer, 'cert.pdf')
        .attach('nationalId', validPdfBuffer, 'id.pdf')
        .attach('ideaProposal', validPdfBuffer, 'idea.pdf');

      const refNumber = submitRes.body.referenceNumber;
      expect(refNumber).toBeDefined();

      // 1. Initial decision update with failure
      const originalSend = EmailService.sendEmail;
      EmailService.sendEmail = async () => ({
        success: false,
        error: 'Initial SMTP outage',
      });

      await request(app)
        .patch(`/api/v1/admin/applications/students/${refNumber}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ status: 'APPROVED' });

      EmailService.sendEmail = originalSend;

      // 2. View notifications endpoint
      const notifRes = await request(app)
        .get(`/api/v1/admin/applications/students/${refNumber}/notifications`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(notifRes.status).toBe(200);
      expect(Array.isArray(notifRes.body.data)).toBe(true);
      expect(notifRes.body.data.length).toBeGreaterThan(0);
      const notifId = notifRes.body.data[0].id;
      expect(notifRes.body.data[0].status).toBe('FAILED');

      // 3. Retry sending notification
      EmailService.clearSentEmails();
      const retryRes = await request(app)
        .post(`/api/v1/admin/applications/students/${refNumber}/notifications/${notifId}/retry`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(retryRes.status).toBe(200);
      expect(retryRes.body.success).toBe(true);
      expect(retryRes.body.notification.status).toBe('SENT');
      expect(EmailService.getSentEmails().length).toBe(1);
    }, 15000);
  });

  describe('5. Authorization and Security', () => {
    it('rejects unauthenticated requests to record decisions or retry notifications', async () => {
      const res = await request(app)
        .patch('/api/v1/admin/applications/students/some-id/status')
        .send({ status: 'APPROVED' });

      expect(res.status).toBe(401);
    });

    it('rejects Sub Admins lacking applications:write permission from updating decisions or retrying', async () => {
      // 1. Try to record decision without permission
      const decisionRes = await request(app)
        .patch('/api/v1/admin/applications/students/some-id/status')
        .set('Authorization', `Bearer ${subAdminReadOnlyToken}`)
        .send({ status: 'APPROVED' });

      expect(decisionRes.status).toBe(403);
      expect(decisionRes.body.error.message).toContain('Missing required permission');

      // 2. Try to retry notification without permission
      const retryRes = await request(app)
        .post('/api/v1/admin/applications/students/some-id/notifications/some-notif-id/retry')
        .set('Authorization', `Bearer ${subAdminReadOnlyToken}`);

      expect(retryRes.status).toBe(403);
    });

    it('safely escapes malicious strings in HTML email bodies', () => {
      const content = EmailService.buildDecisionContent({
        applicationType: 'students',
        decision: 'APPROVED',
        recipientName: '<script>alert("xss")</script> & "Quotes"',
        referenceNumber: 'REF<123>&"ABC"',
      });

      expect(content.html).not.toContain('<script>');
      expect(content.html).toContain('&lt;script&gt;');
      expect(content.html).toContain('&amp;');
      expect(content.html).toContain('&quot;Quotes&quot;');
    });
  });
});
