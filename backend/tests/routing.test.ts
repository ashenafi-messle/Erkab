import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('API Route Aliasing and Prefix Resiliency', () => {
  it('GET / returns 200 and status ONLINE', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('ONLINE');
  });

  it('GET /health, /api/health, and /api/v1/health all return 200', async () => {
    const res1 = await request(app).get('/health');
    const res2 = await request(app).get('/api/health');
    const res3 = await request(app).get('/api/v1/health');

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res3.status).toBe(200);
    expect(res1.body.status).toBe('UP');
    expect(res2.body.status).toBe('UP');
    expect(res3.body.status).toBe('UP');
  });

  it('POST /admin/auth/login and POST /api/v1/admin/auth/login both reach auth controller (not 404)', async () => {
    const unversionedRes = await request(app)
      .post('/admin/auth/login')
      .send({});
    const versionedRes = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({});

    // They should return validation error (400) because body is empty, definitely NOT 404
    expect(unversionedRes.status).toBe(400);
    expect(versionedRes.status).toBe(400);
  });

  it('GET /admin/auth/me and GET /api/v1/admin/auth/me both reach auth middleware (401, not 404)', async () => {
    const unversionedRes = await request(app).get('/admin/auth/me');
    const versionedRes = await request(app).get('/api/v1/admin/auth/me');

    // Should return 401 Unauthorized because no token was provided, definitely NOT 404
    expect(unversionedRes.status).toBe(401);
    expect(versionedRes.status).toBe(401);
  });
});
