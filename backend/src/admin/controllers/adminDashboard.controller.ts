import { Request, Response, NextFunction } from 'express';
import { AdminDashboardService } from '../services/adminDashboard.service';

export class AdminDashboardController {
  public static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminDashboardService.getSummary();
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  public static async getOperational(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminDashboardService.getOperational();
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}
