import { Router } from 'express';
import { ApplicationsController } from '../controllers/applications.controller';
import { upload } from '../../core/middleware/upload.middleware';
import { applicationSubmitLimiter } from '../../core/middleware/rateLimiter';

const router = Router();

// Student Applications
const studentUploadFields = upload.fields([
  { name: 'educationCertificate', maxCount: 1 },
  { name: 'nationalId', maxCount: 1 },
  { name: 'ideaProposal', maxCount: 1 },
]);

router.post(
  '/students',
  applicationSubmitLimiter,
  studentUploadFields,
  ApplicationsController.submitStudent
);
router.post(
  '/student',
  applicationSubmitLimiter,
  studentUploadFields,
  ApplicationsController.submitStudent
);

// Trainer Applications
const trainerUploadFields = upload.fields([
  { name: 'resumeFile', maxCount: 1 },
]);

router.post(
  '/trainers',
  applicationSubmitLimiter,
  trainerUploadFields,
  ApplicationsController.submitTrainer
);
router.post(
  '/trainer',
  applicationSubmitLimiter,
  trainerUploadFields,
  ApplicationsController.submitTrainer
);

// Tutor Applications
const tutorUploadFields = upload.fields([
  { name: 'resumeFile', maxCount: 1 },
]);

router.post(
  '/tutors',
  applicationSubmitLimiter,
  tutorUploadFields,
  ApplicationsController.submitTutor
);
router.post(
  '/tutor',
  applicationSubmitLimiter,
  tutorUploadFields,
  ApplicationsController.submitTutor
);

export default router;
