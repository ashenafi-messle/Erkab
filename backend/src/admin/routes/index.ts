import { Router } from 'express';
import adminApplicationsRoutes from './adminApplications.routes';

const router = Router();

router.use('/applications', adminApplicationsRoutes);

export default router;
