import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Admin Training Programs Management API', () => {
  const adminToken = 'test_admin_token_2026';
  const testTrackSlug = `test-track-${Date.now()}`;
  let createdProgramId: string;

  it('rejects unauthenticated requests to /api/v1/admin/programs', async () => {
    const res = await request(app).get('/api/v1/admin/programs');
    expect(res.status).toBe(401);
  }, 20000);

  it('GET /api/v1/admin/programs/stats returns accurate database stats', async () => {
    const res = await request(app)
      .get('/api/v1/admin/programs/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.totalPrograms).toBe('number');
    expect(typeof res.body.data.publishedPrograms).toBe('number');
    expect(typeof res.body.data.draftPrograms).toBe('number');
    expect(res.body.data.totalPrograms).toBeGreaterThanOrEqual(7);
  }, 20000);

  it('GET /api/v1/admin/programs returns paginated program list with search & category filters', async () => {
    const res = await request(app)
      .get('/api/v1/admin/programs?page=1&limit=5&category=SOFTWARE_DEVELOPMENT')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(5);
  }, 20000);

  it('POST /api/v1/admin/programs creates a new training program', async () => {
    const payload = {
      title: 'Cloud DevOps Engineering',
      slug: testTrackSlug,
      category: 'SOFTWARE_DEVELOPMENT',
      summary: 'Comprehensive hands-on training covering Kubernetes, Terraform, and Docker.',
      description: 'Comprehensive training program on Kubernetes, Terraform, Docker, and CI/CD automation pipelines.',
      duration: '4 Months',
      delivery: 'HYBRID',
      isPublished: false,
      prerequisites: 'Foundational understanding of Linux and basic Python/Bash scripting.',
      modules: ['Linux Fundamentals', 'Containerization with Docker', 'Kubernetes Architecture', 'CI/CD Pipelines'],
      skills: ['Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'AWS'],
      careerPaths: ['DevOps Engineer', 'Cloud Architect', 'Site Reliability Engineer'],
      displayOrder: 15
    };

    const res = await request(app)
      .post('/api/v1/admin/programs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.slug).toBe(testTrackSlug);
    expect(res.body.data.isPublished).toBe(false);

    createdProgramId = res.body.data.id;
  }, 20000);

  it('POST /api/v1/admin/programs rejects duplicate slug', async () => {
    const payload = {
      title: 'Duplicate Cloud DevOps',
      slug: testTrackSlug,
      category: 'SOFTWARE_DEVELOPMENT',
      summary: 'Duplicate track to test slug uniqueness enforcement.',
      description: 'Duplicate track to verify unique slug enforcement on the centralized server.',
      duration: '4 Months',
      delivery: 'HYBRID',
      isPublished: false
    };

    const res = await request(app)
      .post('/api/v1/admin/programs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ConflictError');
  }, 20000);

  it('Draft program is NOT visible on public programs API', async () => {
    const res = await request(app).get(`/api/v1/web/programs/${testTrackSlug}`);
    expect(res.status).toBe(404);
  }, 20000);

  it('GET /api/v1/admin/programs/:id retrieves program detail with application count', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/programs/${createdProgramId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe(testTrackSlug);
    expect(res.body.data.modules.length).toBe(4);
    expect(res.body.data.skills.length).toBe(5);
    expect(typeof res.body.data.applicationCount).toBe('number');
  }, 20000);

  it('PATCH /api/v1/admin/programs/:id updates program fields', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/programs/${createdProgramId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        duration: '5 Months',
        delivery: 'ONLINE'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.duration).toBe('5 Months');
    expect(res.body.data.delivery).toBe('ONLINE');
  }, 20000);

  it('PATCH /api/v1/admin/programs/:id/publish toggles publication and reflects on public website', async () => {
    // Publish
    const pubRes = await request(app)
      .patch(`/api/v1/admin/programs/${createdProgramId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isPublished: true });

    expect(pubRes.status).toBe(200);
    expect(pubRes.body.data.isPublished).toBe(true);

    // Verify it is now immediately accessible on public website
    const publicRes = await request(app).get(`/api/v1/web/programs/${testTrackSlug}`);
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.success).toBe(true);
    expect(publicRes.body.data.slug).toBe(testTrackSlug);
    expect(publicRes.body.data.title).toBe('Cloud DevOps Engineering');

    // Unpublish
    const unpubRes = await request(app)
      .patch(`/api/v1/admin/programs/${createdProgramId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isPublished: false });

    expect(unpubRes.status).toBe(200);
    expect(unpubRes.body.data.isPublished).toBe(false);

    // Verify public website hides it again
    const publicHiddenRes = await request(app).get(`/api/v1/web/programs/${testTrackSlug}`);
    expect(publicHiddenRes.status).toBe(404);
  }, 20000);

  it('DELETE /api/v1/admin/programs/:id safely deletes a program with zero applications', async () => {
    const res = await request(app)
      .delete(`/api/v1/admin/programs/${createdProgramId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify program is no longer in admin database
    const verifyRes = await request(app)
      .get(`/api/v1/admin/programs/${createdProgramId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(verifyRes.status).toBe(404);
  }, 20000);

  it('DELETE /api/v1/admin/programs/:id prevents deletion of program with enrolled applications', async () => {
    // 'web-development' is the active program used in applications.test.ts with student submissions
    const res = await request(app)
      .delete('/api/v1/admin/programs/web-development')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ConflictError');
    expect(res.body.error.message).toContain('student scholarship application');
  }, 20000);
});
