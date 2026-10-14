import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Health Endpoints', () => {
  it('GET /api/v1/health returns 200 and liveness status UP', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('Erkab Backend API');
  });

  it('GET /api/v1/health/ready returns 200 and database CONNECTED or LOCAL_FALLBACK', async () => {
    const res = await request(app).get('/api/v1/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('READY');
    expect(['CONNECTED', 'LOCAL_FALLBACK']).toContain(res.body.database);
  }, 15000);


  it('GET /api/v1/health/smtp returns secure SMTP diagnostics without exposing secrets', async () => {
    const res = await request(app).get('/api/v1/health/smtp');
    // Can be 200 (if verified) or 503 (if auth fails), but structure is always intact
    expect([200, 503]).toContain(res.status);
    expect(res.body.service).toBe('Brevo SMTP Relay');
    expect(res.body.diagnostics).toBeDefined();
    expect(res.body.diagnostics.host).toBe('smtp-relay.brevo.com');
    expect(res.body.diagnostics.port).toBe(587);
    expect(typeof res.body.diagnostics.hasLogin).toBe('boolean');
    expect(typeof res.body.diagnostics.hasKey).toBe('boolean');
    expect(typeof res.body.diagnostics.hasSenderEmail).toBe('boolean');
    expect(typeof res.body.diagnostics.verified).toBe('boolean');
    expect(res.body.diagnostics.timestamp).toBeDefined();

    // Verify secrets are strictly not exposed in response
    const jsonStr = JSON.stringify(res.body);
    expect(jsonStr).not.toContain(process.env.BREVO_SMTP_KEY || '___NOT_MATCHING___');
    expect(jsonStr).not.toContain(process.env.BREVO_API_KEY || '___NOT_MATCHING___');
  }, 15000);

  it('GET /api/v1/unknown-route returns 404 with structured error', async () => {
    const res = await request(app).get('/api/v1/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});
