import { Router } from 'express';
import { AdminApplicationsController } from '../controllers/adminApplications.controller';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Protect all admin application routes with authentication
router.use(adminAuth);

router.get('/:type', AdminApplicationsController.list);
router.get('/:type/:id', AdminApplicationsController.getDetail);
router.get('/:type/:id/documents/:docId/access', AdminApplicationsController.getDocumentAccess);
router.get('/:type/:id/documents/:docId/view', AdminApplicationsController.viewDocument);
router.get('/:type/:id/documents/:docId/download', AdminApplicationsController.downloadDocument);
router.post('/:type/:id/decision', AdminApplicationsController.recordDecision);
router.patch('/:type/:id/status', AdminApplicationsController.recordDecision);

export default router;
