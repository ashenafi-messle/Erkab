import { Router } from 'express';
import { AdminDonationsController } from '../controllers/adminDonations.controller';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

router.use(adminAuth);

router.get('/', AdminDonationsController.list);

export default router;
