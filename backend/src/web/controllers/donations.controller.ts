import { Request, Response, NextFunction } from 'express';
import { DonationsService } from '../services/donations.service';
import { createDonationSchema, confirmDonationPaymentSchema } from '../validation/donationSchemas';

export class DonationsController {
  public static async listCampaigns(_req: Request, res: Response, next: NextFunction) {
    try {
      const campaigns = await DonationsService.listCampaigns();
      res.json({
        success: true,
        data: campaigns,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const campaign = await DonationsService.getCampaignBySlug(req.params.slug as string);
      res.json({
        success: true,
        data: campaign,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async createDonation(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createDonationSchema.parse(req.body);
      const result = await DonationsService.createDonation(validated);
      res.status(201).json({
        data: result,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const reference = req.params.reference as string;
      const payment = await DonationsService.getPaymentByReference(reference);
      res.json({
        success: true,
        data: payment,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async confirmDemoPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const reference = req.params.reference as string;
      const { simulatedOutcome } = confirmDonationPaymentSchema.parse(req.body);
      const result = await DonationsService.confirmDemoPayment(reference, simulatedOutcome);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
