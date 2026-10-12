import { Request, Response, NextFunction } from 'express';
import { NewsService } from '../services/news.service';
import { newsQuerySchema } from '../validation/newsSchemas';

export class NewsController {
  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, category } = newsQuerySchema.parse(req.query);
      const result = await NewsService.getPublishedArticles(page, limit, category);
      res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const article = await NewsService.getPublishedArticleBySlug(slug);
      res.json({
        success: true,
        data: article,
      });
    } catch (err) {
      next(err);
    }
  }
}
