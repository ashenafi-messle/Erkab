import { Request, Response, NextFunction } from 'express';
import { NewsService } from '../../web/services/news.service';
import { createNewsArticleSchema, updateNewsArticleSchema } from '../../web/validation/newsSchemas';

export class AdminNewsController {
  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const status = req.query.status as string | undefined;

      const result = await NewsService.listAllArticles(page, limit, status);
      res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createNewsArticleSchema.parse(req.body);
      const authorName = req.adminUser?.name || 'Erkab Editorial Team';
      const result = await NewsService.createArticle(validated, authorName);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validated = updateNewsArticleSchema.parse(req.body);
      const result = await NewsService.updateArticle(id, validated);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await NewsService.deleteArticle(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async togglePublish(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const isPublished = Boolean(req.body.isPublished);
      const newStatus = isPublished ? 'PUBLISHED' : 'DRAFT';
      const result = await NewsService.updateArticle(id, { status: newStatus as any });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
