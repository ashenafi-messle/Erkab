import { Request, Response, NextFunction } from 'express';
import { ApplicationsService } from '../services/applications.service';
import {
  studentApplicationSchema,
  trainerApplicationSchema,
  tutorApplicationSchema,
  confirmPaymentSchema,
  receiptSubmissionSchema,
} from '../validation/applicationSchemas';

export class ApplicationsController {
  public static async submitStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = studentApplicationSchema.parse(req.body);

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const educationCertificate = files?.['educationCertificate']?.[0];
      const nationalId = files?.['nationalId']?.[0];
      const ideaProposal = files?.['ideaProposal']?.[0];

      const result = await ApplicationsService.createStudentApplication(validatedData, {
        educationCertificate,
        nationalId,
        ideaProposal,
      });

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async submitTrainer(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = trainerApplicationSchema.parse(req.body);

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const resumeFile = files?.['resumeFile']?.[0];

      const result = await ApplicationsService.createTrainerApplication(validatedData, {
        resumeFile,
      });

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async submitTutor(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = tutorApplicationSchema.parse(req.body);

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const resumeFile = files?.['resumeFile']?.[0];

      const result = await ApplicationsService.createTutorApplication(validatedData, {
        resumeFile,
      });

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async getPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const reference = req.params.reference as string;
      const data = await ApplicationsService.getTutoringPaymentByReference(reference);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  public static async submitReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const reference = req.params.reference as string;
      const { receiptUrl } = receiptSubmissionSchema.parse(req.body);
      const result = await ApplicationsService.submitTutoringReceipt(reference, receiptUrl);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async confirmDemoPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const reference = req.params.reference as string;
      const { simulatedOutcome } = confirmPaymentSchema.parse(req.body || {});
      const result = await ApplicationsService.confirmDemoPayment(reference, simulatedOutcome);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

