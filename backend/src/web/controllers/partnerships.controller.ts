import { Request, Response, NextFunction } from 'express';
import { PartnershipsService } from '../services/partnerships.service';
import { createPartnershipSchema } from '../validation/partnershipSchemas';
import { ValidationError } from '../../core/errors/AppError';

export class PartnershipsController {
  public static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createPartnershipSchema.parse(req.body);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const licenseFile = files?.['organizationLicense']?.[0] || req.file;

      if (!licenseFile) {
        throw new ValidationError('Organization license document (PDF/JPEG/PNG) is required.');
      }

      const result = await PartnershipsService.createPartnership(validated, {
        buffer: licenseFile.buffer,
        originalname: licenseFile.originalname,
        mimetype: licenseFile.mimetype,
        size: licenseFile.size,
      });

      res.status(201).json({
        success: true,
        data: result,
        reference: result.reference,
        referenceNumber: result.referenceNumber,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }
}
