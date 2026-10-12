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

  if (!isDbReady) {
    return res.status(503).json({
      success: false,
      status: 'NOT_READY',
      database: 'UNAVAILABLE',
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    success: true,
    status: 'READY',
    database: 'CONNECTED',
    timestamp: new Date().toISOString(),
  });
});

export default router;
