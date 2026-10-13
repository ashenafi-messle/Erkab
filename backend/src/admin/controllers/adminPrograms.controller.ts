import { Request, Response, NextFunction } from 'express';
import { query, queryOne } from '../../core/database/db';
import { NotFoundError } from '../../core/errors/AppError';

export class AdminProgramsController {
  public static async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const programs = await query(
        `SELECT "id", "slug", "title", "category", "duration", "delivery", "scholarship", "isPublished", "createdAt", "updatedAt"
         FROM "public"."TrainingProgram"
         ORDER BY "id" ASC`
      );

      // Get count of applications per program
      const appCounts = await query<{ programId: string; count: number | string }>(
        `SELECT "programId", COUNT(*) as count 
         FROM "public"."StudentApplication" 
         GROUP BY "programId"`
      );

      const countMap = new Map(appCounts.map((r) => [r.programId, Number(r.count)]));

      const enriched = programs.map((p: any) => ({
        ...p,
        applicationCount: countMap.get(p.id) || countMap.get(p.slug) || 0,
      }));

      res.json({
        success: true,
        data: enriched,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async togglePublish(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const prog = await queryOne(`SELECT * FROM "public"."TrainingProgram" WHERE "id" = $1 OR "slug" = $1`, [id]);
      if (!prog) throw new NotFoundError('Training program not found.');

      const newStatus = !prog.isPublished;
      await query(
        `UPDATE "public"."TrainingProgram" SET "isPublished" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
        [newStatus, prog.id]
      );

      res.json({
        success: true,
        message: `Program '${prog.title}' is now ${newStatus ? 'Published' : 'Hidden'}.`,
        isPublished: newStatus,
      });
    } catch (err) {
      next(err);
    }
  }
}
