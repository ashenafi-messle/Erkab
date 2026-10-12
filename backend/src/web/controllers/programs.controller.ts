import { Request, Response, NextFunction } from 'express';
import { ProgramsService } from '../services/programs.service';

export class ProgramsController {
  public static async getPrograms(_req: Request, res: Response, next: NextFunction) {
    try {
      const programs = await ProgramsService.getAllPublished();
      res.json({
        success: true,
        count: programs.length,
        data: programs,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getProgramBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const program = await ProgramsService.getBySlug(slug);
      res.json({
        success: true,
        data: program,
      });
    } catch (err) {
      next(err);
    }
  }
}
