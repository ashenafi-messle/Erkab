import { Router } from 'express';
import { AdminApplicationsController } from '../controllers/adminApplications.controller';
import { adminAuth, requirePermission } from '../middleware/adminAuth';

const router = Router();

// Protect all admin application routes with authentication
router.use(adminAuth);

router.get('/:type', AdminApplicationsController.list);
router.get('/:type/:id', AdminApplicationsController.getDetail);
router.get('/:type/:id/documents/:docId/access', AdminApplicationsController.getDocumentAccess);
router.get('/:type/:id/documents/:docId/view', AdminApplicationsController.viewDocument);
router.get('/:type/:id/documents/:docId/download', AdminApplicationsController.downloadDocument);

// Status and decision updates (requires applications:write permission or SUPER_ADMIN)
router.post('/:type/:id/decision', requirePermission('applications:write'), AdminApplicationsController.recordDecision);
router.patch('/:type/:id/status', requirePermission('applications:write'), AdminApplicationsController.recordDecision);

// Notification tracking and retries
router.get('/:type/:id/notifications', AdminApplicationsController.listNotifications);
router.post('/:type/:id/notifications/:notificationId/retry', requirePermission('applications:write'), AdminApplicationsController.retryNotification);

export default router;
