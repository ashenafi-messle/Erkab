import { Request, Response, NextFunction } from 'express';
import { DonationsService } from '../../web/services/donations.service';

export class AdminDonationsController {
  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const status = req.query.status as string | undefined;

      const result = await DonationsService.listDonations(page, limit, status);
      res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }
}
