import { Router } from 'express';
import { AdminApplicationsController } from '../controllers/adminApplications.controller';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Protect all admin application routes with authentication
router.use(adminAuth);

router.get('/:type', AdminApplicationsController.list);
router.get('/:type/:id', AdminApplicationsController.getDetail);
router.post('/:type/:id/decision', AdminApplicationsController.recordDecision);

export default router;
