import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { query, queryOne } from '../src/core/database/db';
import crypto from 'crypto';

const TEST_ADMIN_TOKEN = 'test_admin_token_2026';

// Sample valid 1x1 PNG image buffer (magic bytes 89 50 4E 47 ...)
const validPngBuffer = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
  0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

describe('Feature 1: News Image Slideshows & Feature 2: Dashboard Approved Students Count', { timeout: 60000 }, () => {
  describe('News Image Slideshows: Super Admin Uploads and Multi-Image Announcements', () => {
    it('uploads single announcement image to /api/v1/admin/news/upload-image', async () => {
      const res = await request(app)
        .post('/api/v1/admin/news/upload-image')
        .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`)
        .field('title', 'Hackathon 2026 Launch')
        .attach('image', validPngBuffer, 'hackathon_slide1.png');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.secureUrl).toBeDefined();
      expect(res.body.data.publicId).toBeDefined();
    });

    it('uploads multiple announcement images at once to /api/v1/admin/news/upload-images', async () => {
      const res = await request(app)
        .post('/api/v1/admin/news/upload-images')
        .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`)
        .field('title', 'Gondar Tech Hub Ceremony')
        .attach('images', validPngBuffer, 'ceremony_photo1.png')
        .attach('images', validPngBuffer, 'ceremony_photo2.png')
        .attach('images', validPngBuffer, 'ceremony_photo3.png');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(3);
      expect(res.body.data[0].displayOrder).toBe(0);
      expect(res.body.data[1].displayOrder).toBe(1);
      expect(res.body.data[2].displayOrder).toBe(2);
    });

    it('rejects upload of unsupported non-image formats', async () => {
      const fakeTextBuffer = Buffer.from('Plain text content disguised as an image');
      const res = await request(app)
        .post('/api/v1/admin/news/upload-image')
        .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`)
        .attach('image', fakeTextBuffer, 'virus.txt');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('creates an announcement with multiple ordered images and publishes it', async () => {
      const uniqueSlug = `multi-image-announcement-${Date.now()}`;
      const sampleImages = [
        {
          imageUrl: 'https://res.cloudinary.com/mock-erkab/news/slide_1.jpg',
          cloudinaryPublicId: 'news/slide_1',
          caption: 'Opening ceremony keynotes',
          displayOrder: 0,
        },
        {
          imageUrl: 'https://res.cloudinary.com/mock-erkab/news/slide_2.jpg',
          cloudinaryPublicId: 'news/slide_2',
          caption: 'Students receiving workstations',
          displayOrder: 1,
        },
        {
          imageUrl: 'https://res.cloudinary.com/mock-erkab/news/slide_3.jpg',
          cloudinaryPublicId: 'news/slide_3',
          caption: 'First cohort group photo',
          displayOrder: 2,
        },
      ];

      const createRes = await request(app)
        .post('/api/v1/admin/news')
        .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`)
        .send({
          title: 'Full Multi-Image Photo Gallery Test',
          slug: uniqueSlug,
          excerpt: 'Short teaser highlighting our cohort inauguration.',
          content: 'Full comprehensive announcement text discussing our vocational milestones and community partnerships.',
          category: 'Training Updates',
          status: 'PUBLISHED',
          images: sampleImages,
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      const articleId = createRes.body.articleId;

      // Public listing check: verifies attached images and cover image
      const publicList = await request(app).get('/api/v1/web/news');
      expect(publicList.status).toBe(200);
      expect(publicList.body.success).toBe(true);
      const foundInList = publicList.body.data.find((a: any) => a.slug === uniqueSlug);
      expect(foundInList).toBeDefined();
      expect(foundInList.coverImageUrl).toBe(sampleImages[0].imageUrl);
      expect(foundInList.images.length).toBe(3);

      // Public detail check by slug: verifies full ordered gallery
      const publicDetail = await request(app).get(`/api/v1/web/news/${uniqueSlug}`);
      expect(publicDetail.status).toBe(200);
      expect(publicDetail.body.data.title).toBe('Full Multi-Image Photo Gallery Test');
      expect(publicDetail.body.data.images.length).toBe(3);
      expect(publicDetail.body.data.images[0].imageUrl).toBe(sampleImages[0].imageUrl);
      expect(publicDetail.body.data.images[1].imageUrl).toBe(sampleImages[1].imageUrl);
      expect(publicDetail.body.data.images[2].imageUrl).toBe(sampleImages[2].imageUrl);

      // Super Admin edits announcement: reorders images (slide 2 moved to first), removes slide 3, adds slide 4
      const reorderedAndUpdated = [
        {
          imageUrl: sampleImages[1].imageUrl,
          cloudinaryPublicId: sampleImages[1].cloudinaryPublicId,
          caption: 'Students receiving workstations (NOW COVER)',
          displayOrder: 0,
        },
        {
          imageUrl: sampleImages[0].imageUrl,
          cloudinaryPublicId: sampleImages[0].cloudinaryPublicId,
          caption: 'Opening ceremony keynotes (NOW SECOND)',
          displayOrder: 1,
        },
        {
          imageUrl: 'https://res.cloudinary.com/mock-erkab/news/slide_4_new.jpg',
          cloudinaryPublicId: 'news/slide_4_new',
          caption: 'Newly added lab equipment',
          displayOrder: 2,
        },
      ];

      const updateRes = await request(app)
        .put(`/api/v1/admin/news/${articleId}`)
        .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`)
        .send({
          title: 'Full Multi-Image Photo Gallery Test (Updated)',
          images: reorderedAndUpdated,
        });

      expect(updateRes.status).toBe(200);

      // Verify updated ordering on public detail endpoint
      const publicDetailAfter = await request(app).get(`/api/v1/web/news/${uniqueSlug}`);
      expect(publicDetailAfter.status).toBe(200);
      expect(publicDetailAfter.body.data.title).toBe('Full Multi-Image Photo Gallery Test (Updated)');
      expect(publicDetailAfter.body.data.images.length).toBe(3);
      expect(publicDetailAfter.body.data.images[0].imageUrl).toBe(sampleImages[1].imageUrl);
      expect(publicDetailAfter.body.data.images[1].imageUrl).toBe(sampleImages[0].imageUrl);
      expect(publicDetailAfter.body.data.images[2].imageUrl).toBe('https://res.cloudinary.com/mock-erkab/news/slide_4_new.jpg');

      // Super Admin deletes announcement: cleans up article and images
      const deleteRes = await request(app)
        .delete(`/api/v1/admin/news/${articleId}`)
        .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`);

      expect(deleteRes.status).toBe(200);

      const publicCheckDeleted = await request(app).get(`/api/v1/web/news/${uniqueSlug}`);
      expect(publicCheckDeleted.status).toBe(404);
    }, 60000);
  });

  describe('Feature 2: Super-Admin Dashboard Total Students Approved Count', () => {
    it('accurately counts ONLY student applications with status = APPROVED', async () => {
      // 1. Query current database count of approved student applications directly
      const approvedDbResult = await queryOne<{ count: number | string }>(
        `SELECT COUNT(*) as count FROM "public"."StudentApplication" WHERE "status" = 'APPROVED'`
      );
      const expectedApprovedCount = Number(approvedDbResult?.count || 0);

      // 2. Fetch dashboard summary as authenticated Super Admin
      const res = await request(app)
        .get('/api/v1/admin/dashboard/summary')
        .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.counts).toBeDefined();

      // The Total Students count MUST equal the exact number of APPROVED student applications
      expect(res.body.counts.students).toBe(expectedApprovedCount);
      expect(res.body.counts.approvedStudents).toBe(expectedApprovedCount);
      expect(res.body.overview.students.approved).toBe(expectedApprovedCount);

      // Verify that pending applications are separated and NOT inflating Total Students
      if (Number(res.body.overview.students.pending) > 0) {
        expect(res.body.counts.students).not.toBe(Number(res.body.overview.students.total));
      }
    });

    it('updates approved student count immediately when a student application is approved', async () => {
      // Query an existing valid programId to satisfy foreign key constraint
      const existingProg = await queryOne<{ id: string }>('SELECT "id" FROM "public"."TrainingProgram" LIMIT 1');
      const programId = existingProg?.id || 'prog-1';

      // Create a new PENDING student application
      const tempRef = `TEST-STU-${Date.now()}`;
      const tempId = crypto.randomUUID();
      await query(
        `INSERT INTO "public"."StudentApplication" ("id", "referenceNumber", "fullName", "gender", "age", "classCompletionYear", "telegramPhone", "email", "status", "programId", "createdAt", "updatedAt")
         VALUES ($1, $2, 'Test Student Candidate', 'M', 22, '2025', '+251911002233', 'test.student@example.com', 'PENDING', $3, NOW(), NOW())`,
        [tempId, tempRef, programId]
      );

      // Check count before approval
      const resBefore = await request(app)
        .get('/api/v1/admin/dashboard/summary')
        .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`);
      const beforeApprovedCount = resBefore.body.counts.students;

      // Approve this student application
      await query(
        `UPDATE "public"."StudentApplication" SET "status" = 'APPROVED' WHERE "id" = $1`,
        [tempId]
      );

      // Fetch dashboard summary again
      const resAfter = await request(app)
        .get('/api/v1/admin/dashboard/summary')
        .set('Authorization', `Bearer ${TEST_ADMIN_TOKEN}`);

      expect(resAfter.body.counts.students).toBe(beforeApprovedCount + 1);
      expect(resAfter.body.overview.students.approved).toBe(beforeApprovedCount + 1);

      // Clean up test record
      await query(`DELETE FROM "public"."StudentApplication" WHERE "id" = $1`, [tempId]);
    }, 25000);
  });
});
