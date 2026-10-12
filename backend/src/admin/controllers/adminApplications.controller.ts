import { Request, Response, NextFunction } from 'express';
import { AdminApplicationsService } from '../services/adminApplications.service';
import { ValidationError } from '../../core/errors/AppError';

export class AdminApplicationsController {
  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const type = (req.params.type as 'students' | 'trainers' | 'tutors') || 'students';
      const status = req.query.status as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await AdminApplicationsService.listApplications(type, status, page, limit);
      res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const type = (req.params.type as 'students' | 'trainers' | 'tutors') || 'students';
      const id = req.params.id as string;

      const result = await AdminApplicationsService.getApplicationDetail(type, id);
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async recordDecision(req: Request, res: Response, next: NextFunction) {
    try {
      const type = (req.params.type as 'students' | 'trainers' | 'tutors') || 'students';
      const id = req.params.id as string;
      const { decision, notes } = req.body;

      if (!['ACCEPTED', 'REJECTED', 'WAITLISTED', 'NEEDS_INFO'].includes(decision)) {
        throw new ValidationError('Invalid decision. Must be ACCEPTED, REJECTED, WAITLISTED, or NEEDS_INFO');
      }

      const reviewerId = req.adminUser?.id || 'admin_usr_default';
      const reviewerName = req.adminUser?.name || 'Erkab Admissions Officer';

      const result = await AdminApplicationsService.recordReviewDecision({
        type,
        applicationId: id,
        reviewerId,
        reviewerName,
        decision,
        notes,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
