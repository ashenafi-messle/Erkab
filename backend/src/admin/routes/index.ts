import { Router } from 'express';
import adminApplicationsRoutes from './adminApplications.routes';
import adminPartnershipsRoutes from './adminPartnerships.routes';
import adminDonationsRoutes from './adminDonations.routes';
import adminNewsRoutes from './adminNews.routes';

const router = Router();

router.use('/applications', adminApplicationsRoutes);
router.use('/partnerships', adminPartnershipsRoutes);
router.use('/donations', adminDonationsRoutes);
router.use('/news', adminNewsRoutes);

export default router;
