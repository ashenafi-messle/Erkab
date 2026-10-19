import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { NewsService } from '../../web/services/news.service';
import { createNewsArticleSchema, updateNewsArticleSchema } from '../../web/validation/newsSchemas';
import { CloudinaryService } from '../../core/services/cloudinary.service';

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

  public static async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const article = await NewsService.getArticleById(id);
      res.json({
        success: true,
        data: article,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file uploaded' });
      }

      const title = (req.body.title as string) || 'announcement';
      const fileToUpload = {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };

      const uploaded = await CloudinaryService.uploadNewsImage(fileToUpload, title);

      return res.status(200).json({
        success: true,
        message: 'Image uploaded successfully to Cloudinary',
        data: {
          publicId: uploaded.publicId,
          secureUrl: uploaded.secureUrl,
          imageUrl: uploaded.secureUrl,
          format: uploaded.format,
          bytes: uploaded.bytes,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async uploadMultipleImages(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: 'No image files uploaded' });
      }

      const title = (req.body.title as string) || 'announcement';

      const uploadPromises = files.map((f) =>
        CloudinaryService.uploadNewsImage(
          {
            buffer: f.buffer,
            originalname: f.originalname,
            mimetype: f.mimetype,
            size: f.size,
          },
          title
        )
      );

      const results = await Promise.all(uploadPromises);

      const uploadedImages = results.map((r, index) => ({
        id: crypto.randomUUID(),
        imageUrl: r.secureUrl,
        cloudinaryPublicId: r.publicId,
        displayOrder: index,
      }));

      return res.status(200).json({
        success: true,
        message: `Successfully uploaded ${uploadedImages.length} images`,
        data: uploadedImages,
      });
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
