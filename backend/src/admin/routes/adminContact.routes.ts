import { Router } from 'express';
import { AdminContactController } from '../controllers/adminContact.controller';
import { adminAuth, requireRole } from '../middleware/adminAuth';

const router = Router();

// Protect all admin contact message endpoints
router.use(adminAuth);
router.use(requireRole('SUPER_ADMIN', 'SUB_ADMIN'));

// Aggregated inbox statistics
router.get('/stats', AdminContactController.getStats);

// List contact messages with pagination and filtering
router.get('/', AdminContactController.list);

// View contact message details (marks readAt if unread)
router.get('/:id', AdminContactController.getById);

// Update status, priority, assignment, or internal notes
router.patch('/:id', AdminContactController.update);

export default router;
