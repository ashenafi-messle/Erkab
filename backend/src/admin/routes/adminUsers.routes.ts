import { Router } from 'express';
import { AdminUsersController } from '../controllers/adminUsers.controller';
import { adminAuth, requireRole } from '../middleware/adminAuth';

const router = Router();

// Only Super Admins can manage administrative users and permissions
router.use(adminAuth, requireRole('SUPER_ADMIN'));

router.get('/', AdminUsersController.list);
router.post('/', AdminUsersController.create);
router.patch('/:id', AdminUsersController.update);
router.delete('/:id', AdminUsersController.delete);

export default router;
