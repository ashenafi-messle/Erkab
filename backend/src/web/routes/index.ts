import { Router } from 'express';
import programsRoutes from './programs.routes';
import applicationsRoutes from './applications.routes';
import { ApplicationsController } from '../controllers/applications.controller';
import { PartnershipsController } from '../controllers/partnerships.controller';
import { DonationsController } from '../controllers/donations.controller';
import { NewsController } from '../controllers/news.controller';
import { ContactController } from '../controllers/contact.controller';
import { applicationSubmitLimiter, contactSubmitLimiter } from '../../core/middleware/rateLimiter';
import { upload } from '../../core/middleware/upload.middleware';

const router = Router();

router.use('/programs', programsRoutes);
router.use('/applications', applicationsRoutes);

// Tutoring requests & payment verification
router.post(
  '/tutoring/requests',
  applicationSubmitLimiter,
  upload.none(),
  ApplicationsController.submitTutor
);
router.post(
  '/tutoring/request',
  applicationSubmitLimiter,
  upload.none(),
  ApplicationsController.submitTutor
);
router.get(
  '/tutoring/payments/:reference',
  ApplicationsController.getPayment
);
router.post(
  '/tutoring/payments/:reference/receipt',
  applicationSubmitLimiter,
  upload.none(),
  ApplicationsController.submitReceipt
);
router.post(
  '/tutoring/payments/:reference/confirm-demo',
  applicationSubmitLimiter,
  ApplicationsController.confirmDemoPayment
);

// Partnerships
router.post(
  '/partnerships',
  applicationSubmitLimiter,
  upload.fields([{ name: 'organizationLicense', maxCount: 1 }]),
  PartnershipsController.submit
);

// Donations & campaigns
router.get('/donation-campaigns', DonationsController.listCampaigns);
router.get('/donation-campaigns/:slug', DonationsController.getCampaign);
router.post(
  '/donations',
  applicationSubmitLimiter,
  upload.none(),
  DonationsController.createDonation
);
router.get(
  '/donations/payments/:reference',
  DonationsController.getPayment
);
router.post(
  '/donations/payments/:reference/confirm-demo',
  applicationSubmitLimiter,
  DonationsController.confirmDemoPayment
);

// News & Updates
router.get('/news', NewsController.list);
router.get('/news/:slug', NewsController.getBySlug);

// Public Contact Form
router.post(
  '/contact',
  contactSubmitLimiter,
  upload.none(),
  ContactController.submit
);

export default router;
