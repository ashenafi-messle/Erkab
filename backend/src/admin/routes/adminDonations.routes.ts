import { Router } from 'express';
import { AdminDonationsController } from '../controllers/adminDonations.controller';
import { adminAuth, requireRole } from '../middleware/adminAuth';

const router = Router();

// Only Super Admins or explicit finance permission can inspect financial records
router.use(adminAuth, requireRole('SUPER_ADMIN'));

router.get('/', AdminDonationsController.list);

export default router;
