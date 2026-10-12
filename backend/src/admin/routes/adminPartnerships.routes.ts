import { Router } from 'express';
import { AdminPartnershipsController } from '../controllers/adminPartnerships.controller';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

router.use(adminAuth);

router.get('/', AdminPartnershipsController.list);
router.get('/:id', AdminPartnershipsController.getDetail);
router.get('/:id/license', AdminPartnershipsController.getLicenseDownload);
router.post('/:id/review', AdminPartnershipsController.review);

export default router;
