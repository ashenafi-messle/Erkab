import { Request, Response, NextFunction } from 'express';
import { AdminApplicationsService } from '../services/adminApplications.service';
import { ValidationError } from '../../core/errors/AppError';

export class AdminApplicationsController {
  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const type = (req.params.type as 'students' | 'trainers' | 'tutors') || 'students';
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await AdminApplicationsService.listApplications(type, status, page, limit, search);
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

  public static async getDocumentAccess(req: Request, res: Response, next: NextFunction) {
    try {
      const type = (req.params.type as 'students' | 'trainers' | 'tutors') || 'students';
      const applicationId = req.params.id as string;
      const documentId = req.params.docId as string;
      const adminUser = req.adminUser || { id: 'admin_usr_default', name: 'Erkab Administrator' };
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const result = await AdminApplicationsService.getDocumentAccess({
        type,
        applicationId,
        documentId,
        adminUser,
        ipAddress,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async viewDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const type = (req.params.type as 'students' | 'trainers' | 'tutors') || 'students';
      const applicationId = req.params.id as string;
      const documentId = req.params.docId as string;
      const adminUser = req.adminUser || { id: 'admin_usr_default', name: 'Erkab Administrator' };
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      await AdminApplicationsService.streamDocument({
        type,
        applicationId,
        documentId,
        adminUser,
        ipAddress,
        disposition: 'inline',
        res,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async downloadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const type = (req.params.type as 'students' | 'trainers' | 'tutors') || 'students';
      const applicationId = req.params.id as string;
      const documentId = req.params.docId as string;
      const adminUser = req.adminUser || { id: 'admin_usr_default', name: 'Erkab Administrator' };
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      await AdminApplicationsService.streamDocument({
        type,
        applicationId,
        documentId,
        adminUser,
        ipAddress,
        disposition: 'attachment',
        res,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async recordDecision(req: Request, res: Response, next: NextFunction) {
    try {
      const type = (req.params.type as 'students' | 'trainers' | 'tutors') || 'students';
      const id = req.params.id as string;
      const rawDecision = req.body.decision || req.body.status;
      const notes = req.body.notes;

      if (!rawDecision) {
        throw new ValidationError('Application decision or status is required');
      }

      const reviewerId = req.adminUser?.id || 'admin_usr_default';
      const reviewerName = req.adminUser?.name || 'Erkab Admissions Officer';
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const result = await AdminApplicationsService.recordReviewDecision({
        type,
        applicationId: id,
        reviewerId,
        reviewerName,
        decision: String(rawDecision),
        notes: notes ? String(notes) : undefined,
        ipAddress,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async listNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const type = (req.params.type as 'students' | 'trainers' | 'tutors') || 'students';
      const id = req.params.id as string;

      const result = await AdminApplicationsService.getApplicationNotifications(type, id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async retryNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const type = (req.params.type as 'students' | 'trainers' | 'tutors') || 'students';
      const id = req.params.id as string;
      const notificationId = req.params.notificationId as string;
      const adminUser = req.adminUser || { id: 'admin_usr_default', name: 'Erkab Administrator' };
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const result = await AdminApplicationsService.retryApplicationNotification({
        type,
        applicationId: id,
        notificationId,
        adminUser,
        ipAddress,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
