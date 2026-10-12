import { Router } from 'express';
import { ProgramsController } from '../controllers/programs.controller';

const router = Router();

router.get('/', ProgramsController.getPrograms);
router.get('/:slug', ProgramsController.getProgramBySlug);

export default router;
