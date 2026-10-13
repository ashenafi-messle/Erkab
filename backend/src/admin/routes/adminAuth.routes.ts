import { Router } from 'express';
import { AdminAuthController } from '../controllers/adminAuth.controller';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Public auth endpoints
router.post('/login', AdminAuthController.login);
router.post('/forgot-password', AdminAuthController.forgotPassword);
router.post('/logout', AdminAuthController.logout);

// Protected session check
router.get('/me', adminAuth, AdminAuthController.getMe);

export default router;
