import { Router } from 'express';
import { AdminDashboardController } from '../controllers/adminDashboard.controller';
import { adminAuth, requireRole } from '../middleware/adminAuth';

const router = Router();

router.use(adminAuth);

// Super Admin summary
router.get('/summary', requireRole('SUPER_ADMIN'), AdminDashboardController.getSummary);

// Sub Admin & operational summary
router.get('/operational', AdminDashboardController.getOperational);

export default router;
