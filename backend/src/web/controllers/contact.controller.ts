import { Request, Response, NextFunction } from 'express';
import { contactSubmissionSchema } from '../validation/contactSchemas';
import { ContactService } from '../services/contact.service';

export class ContactController {
  public static async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const parseResult = contactSubmissionSchema.safeParse(req.body);

      if (!parseResult.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parseResult.error.issues) {
          const field = issue.path[0] ? String(issue.path[0]) : 'general';
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        }

        return res.status(400).json({
          success: false,
          message: 'Please review the submitted information.',
          errors: fieldErrors,
        });
      }

      const clientIp = req.ip || req.socket.remoteAddress;
      const result = await ContactService.submitContactMessage(parseResult.data, clientIp);

      return res.status(201).json({
        success: true,
        message: 'Thank you for contacting Erkab! Your message has been received.',
        data: {
          referenceCode: result.referenceCode,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
