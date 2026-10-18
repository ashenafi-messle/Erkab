import { Router } from 'express';
import { AdminProgramsController } from '../controllers/adminPrograms.controller';
import { adminAuth, requireRole } from '../middleware/adminAuth';
import { uploadProgramImage } from '../../core/middleware/upload.middleware';

const router = Router();

router.use(adminAuth);

// Summary statistics
router.get('/stats', AdminProgramsController.getStats);

// Upload program image to Cloudinary (dedicated endpoint)
router.post(
  '/upload-image',
  requireRole('SUPER_ADMIN'),
  uploadProgramImage.single('image'),
  AdminProgramsController.uploadImage
);

// Programs management (supports both JSON payloads and multipart/form-data with attached image)
router.get('/', AdminProgramsController.list);
router.get('/:id', AdminProgramsController.getDetail);
router.post('/', requireRole('SUPER_ADMIN'), uploadProgramImage.single('image'), AdminProgramsController.create);
router.put('/:id', requireRole('SUPER_ADMIN'), uploadProgramImage.single('image'), AdminProgramsController.update);
router.patch('/:id', requireRole('SUPER_ADMIN'), uploadProgramImage.single('image'), AdminProgramsController.update);
router.patch('/:id/publish', requireRole('SUPER_ADMIN'), AdminProgramsController.togglePublish);
router.patch('/:id/toggle', requireRole('SUPER_ADMIN'), AdminProgramsController.togglePublish);
router.delete('/:id', requireRole('SUPER_ADMIN'), AdminProgramsController.delete);

export default router;
