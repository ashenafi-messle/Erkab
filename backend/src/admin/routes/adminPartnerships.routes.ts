import { Router } from 'express';
import { AdminPartnershipsController } from '../controllers/adminPartnerships.controller';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

router.use(adminAuth);

// Summary statistics
router.get('/stats', AdminPartnershipsController.getStats);

// Listing and detail
router.get('/', AdminPartnershipsController.list);
router.get('/:id', AdminPartnershipsController.getDetail);

// Review and status updates
router.patch('/:id/status', AdminPartnershipsController.review);
router.post('/:id/review', AdminPartnershipsController.review);

// Secure Cloudinary document access & streaming
router.get('/:id/documents/:docId/access-url', AdminPartnershipsController.getDocumentAccessUrl);
router.get('/:id/documents/:docId/view', AdminPartnershipsController.viewDocument);
router.get('/:id/documents/:docId/download', AdminPartnershipsController.downloadDocument);

// Backward-compatible license download endpoint
router.get('/:id/license', AdminPartnershipsController.getLicenseDownload);

export default router;
