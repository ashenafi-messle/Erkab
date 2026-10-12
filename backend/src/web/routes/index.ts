import { Router } from 'express';
import programsRoutes from './programs.routes';
import applicationsRoutes from './applications.routes';
import { ApplicationsController } from '../controllers/applications.controller';
import { applicationSubmitLimiter } from '../../core/middleware/rateLimiter';
import { upload } from '../../core/middleware/upload.middleware';

const router = Router();

router.use('/programs', programsRoutes);
router.use('/applications', applicationsRoutes);

// Tutoring requests & payment verification
router.post(
  '/tutoring/requests',
  applicationSubmitLimiter,
  upload.none(),
  ApplicationsController.submitTutor
);
router.post(
  '/tutoring/request',
  applicationSubmitLimiter,
  upload.none(),
  ApplicationsController.submitTutor
);

router.get(
  '/tutoring/payments/:reference',
  ApplicationsController.getPayment
);
router.post(
  '/tutoring/payments/:reference/confirm-demo',
  applicationSubmitLimiter,
  ApplicationsController.confirmDemoPayment
);

export default router;

