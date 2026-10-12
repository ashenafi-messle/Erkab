import { Request, Response, NextFunction } from 'express';
import { PartnershipsService } from '../../web/services/partnerships.service';
import { reviewPartnershipSchema } from '../../web/validation/partnershipSchemas';

export class AdminPartnershipsController {
  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await PartnershipsService.listPartnerships(page, limit, status, search);
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
      const id = req.params.id as string;
      const result = await PartnershipsService.getPartnershipDetail(id);
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getLicenseDownload(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await PartnershipsService.getLicenseDownloadUrl(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async review(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validated = reviewPartnershipSchema.parse(req.body);

      const reviewerId = req.adminUser?.id || 'admin_usr_default';
      const reviewerName = req.adminUser?.name || 'Erkab Partnerships Reviewer';

      const result = await PartnershipsService.reviewPartnership({
        id,
        status: validated.status,
        reviewNotes: validated.reviewNotes,
        reviewerId,
        reviewerName,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
