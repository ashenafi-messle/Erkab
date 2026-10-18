import { Request, Response, NextFunction } from 'express';
import { AdminContactService } from '../services/adminContact.service';
import { adminUpdateContactSchema } from '../../web/validation/contactSchemas';
import { NotFoundError, ValidationError } from '../../core/errors/AppError';

export class AdminContactController {
  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const status = req.query.status as string | undefined;
      const category = req.query.category as string | undefined;
      const priority = req.query.priority as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await AdminContactService.listMessages({
        page,
        limit,
        status,
        category,
        priority,
        search,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminContactService.getStats();
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const message = await AdminContactService.getMessageById(id);

      if (!message) {
        throw new NotFoundError(`Contact message '${id}' not found`);
      }

      return res.status(200).json({
        success: true,
        data: message,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const parseResult = adminUpdateContactSchema.safeParse(req.body);

      if (!parseResult.success) {
        throw new ValidationError('Invalid update parameters', parseResult.error.format());
      }

      if (!req.adminUser) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const updated = await AdminContactService.updateMessage(id, parseResult.data, req.adminUser);

      if (!updated) {
        throw new NotFoundError(`Contact message '${id}' not found`);
      }

      return res.status(200).json({
        success: true,
        message: 'Contact message updated successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
}
