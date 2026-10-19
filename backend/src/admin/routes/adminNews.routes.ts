import { Router } from 'express';
import { AdminNewsController } from '../controllers/adminNews.controller';
import { adminAuth, requireRole } from '../middleware/adminAuth';
import { uploadNewsImage } from '../../core/middleware/upload.middleware';

const router = Router();

router.use(adminAuth);

// Dedicated image upload endpoints for announcement slideshows
router.post(
  '/upload-image',
  requireRole('SUPER_ADMIN', 'SUB_ADMIN'),
  uploadNewsImage.single('image'),
  AdminNewsController.uploadImage
);

router.post(
  '/upload-images',
  requireRole('SUPER_ADMIN', 'SUB_ADMIN'),
  uploadNewsImage.array('images', 10),
  AdminNewsController.uploadMultipleImages
);

router.get('/', AdminNewsController.list);
router.get('/:id', AdminNewsController.getDetail);
router.post('/', requireRole('SUPER_ADMIN'), AdminNewsController.create);
router.put('/:id', requireRole('SUPER_ADMIN'), AdminNewsController.update);
router.patch('/:id/publish', requireRole('SUPER_ADMIN'), AdminNewsController.togglePublish);
router.patch('/:id/status', requireRole('SUPER_ADMIN'), AdminNewsController.togglePublish);
router.delete('/:id', requireRole('SUPER_ADMIN'), AdminNewsController.delete);

export default router;
