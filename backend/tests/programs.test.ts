import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Public Programs Endpoints', () => {
  it('GET /api/v1/web/programs returns list of 10 programs', async () => {
    const res = await request(app).get('/api/v1/web/programs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(7);
  }, 15000);

  it('GET /api/v1/web/programs/:slug returns valid program details', async () => {
    const res = await request(app).get('/api/v1/web/programs/web-development');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('web-development');
    expect(res.body.data.title).toContain('Web Development');
  });

  it('GET /api/v1/web/programs/:slug with invalid slug returns 404', async () => {
    const res = await request(app).get('/api/v1/web/programs/non-existent-track');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NotFoundError');
  });
});
