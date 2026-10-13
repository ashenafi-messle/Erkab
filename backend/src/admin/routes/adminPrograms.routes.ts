import { Router } from 'express';
import { AdminProgramsController } from '../controllers/adminPrograms.controller';
import { adminAuth, requireRole } from '../middleware/adminAuth';

const router = Router();

router.use(adminAuth);

router.get('/', AdminProgramsController.list);
router.patch('/:id/toggle', requireRole('SUPER_ADMIN'), AdminProgramsController.togglePublish);

export default router;
