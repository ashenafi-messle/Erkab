import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../database/db';

const router = Router();

// Liveness endpoint
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    service: 'Erkab Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Readiness endpoint
router.get('/ready', async (_req: Request, res: Response) => {
  const isDbReady = await checkDatabaseHealth();

  res.status(200).json({
    success: true,
    status: 'READY',
    database: isDbReady ? 'CONNECTED' : 'LOCAL_FALLBACK',
    timestamp: new Date().toISOString(),
  });
});

// Secure SMTP diagnostics & connectivity check
router.get('/smtp', async (_req: Request, res: Response) => {
  const { EmailService } = await import('../services/email.service');
  const result = await EmailService.verifySmtpConnection(5000);

  res.status(result.success ? 200 : 503).json({
    success: result.success,
    service: 'Brevo SMTP Relay',
    status: result.success ? 'CONNECTED' : 'AUTHENTICATION_OR_CONNECTION_FAILED',
    diagnostics: result.diagnostics,
  });
});

export default router;
