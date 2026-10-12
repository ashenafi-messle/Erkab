import { Router } from 'express';
import { AdminNewsController } from '../controllers/adminNews.controller';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

router.use(adminAuth);

router.get('/', AdminNewsController.list);
router.post('/', AdminNewsController.create);
router.put('/:id', AdminNewsController.update);
router.delete('/:id', AdminNewsController.delete);

export default router;
