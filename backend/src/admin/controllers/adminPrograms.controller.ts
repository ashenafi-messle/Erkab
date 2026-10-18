import { Request, Response, NextFunction } from 'express';
import { AdminProgramsService } from '../services/adminPrograms.service';
import { CloudinaryService } from '../../core/services/cloudinary.service';
import { ValidationError } from '../../core/errors/AppError';
import { createProgramSchema, updateProgramSchema, publishProgramSchema } from '../validation/programSchemas';

export class AdminProgramsController {
  public static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new ValidationError('No image file was provided for upload.');
      }
      const titleOrSlug = ((req.body?.title || req.body?.slug || 'program') as string).trim();
      const result = await CloudinaryService.uploadProgramImage(
        {
          buffer: req.file.buffer,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
        titleOrSlug
      );
      res.json({
        success: true,
        data: {
          imageUrl: result.secureUrl,
          url: result.secureUrl,
          publicId: result.publicId,
          format: result.format,
          bytes: result.bytes,
        },
        imageUrl: result.secureUrl,
        url: result.secureUrl,
        publicId: result.publicId,
        message: 'Program image uploaded to Cloudinary successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminProgramsService.getProgramStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string | undefined;
      const category = req.query.category as string | undefined;
      const status = req.query.status as string | undefined;
      const sortBy = req.query.sortBy as string | undefined;
      const sortOrder = req.query.sortOrder as 'ASC' | 'DESC' | undefined;

      const result = await AdminProgramsService.listPrograms({
        page,
        limit,
        search,
        category,
        status,
        sortBy,
        sortOrder,
      });

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
      const program = await AdminProgramsService.getProgramById(id);
      res.json({
        success: true,
        data: program,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = { ...req.body };

      // If an image file was attached in the multipart request, upload it to Cloudinary
      if (req.file) {
        const uploadResult = await CloudinaryService.uploadProgramImage(
          {
            buffer: req.file.buffer,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
          },
          (body.slug || body.title || 'program') as string
        );
        body.image = uploadResult.secureUrl;
      }

      // Pre-process potential JSON string arrays from form-data
      if (typeof body.skills === 'string' && body.skills.startsWith('[')) {
        try { body.skills = JSON.parse(body.skills); } catch {}
      }
      if (typeof body.modules === 'string' && body.modules.startsWith('[')) {
        try { body.modules = JSON.parse(body.modules); } catch {}
      }
      if (typeof body.careerPaths === 'string' && body.careerPaths.startsWith('[')) {
        try { body.careerPaths = JSON.parse(body.careerPaths); } catch {}
      }

      const validated = createProgramSchema.parse(body);
      const adminUser = req.adminUser || { id: 'admin_usr_default', name: 'Erkab Administrator' };

      const program = await AdminProgramsService.createProgram(validated as any, adminUser);
      res.status(201).json({
        success: true,
        data: program,
        message: `Training program '${program.title}' created successfully`,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const body = { ...req.body };

      // If a new image file was attached in the multipart request, upload to Cloudinary
      if (req.file) {
        const uploadResult = await CloudinaryService.uploadProgramImage(
          {
            buffer: req.file.buffer,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
          },
          (body.slug || body.title || id) as string
        );
        body.image = uploadResult.secureUrl;
      }

      // Pre-process potential JSON string arrays from form-data
      if (typeof body.skills === 'string' && body.skills.startsWith('[')) {
        try { body.skills = JSON.parse(body.skills); } catch {}
      }
      if (typeof body.modules === 'string' && body.modules.startsWith('[')) {
        try { body.modules = JSON.parse(body.modules); } catch {}
      }
      if (typeof body.careerPaths === 'string' && body.careerPaths.startsWith('[')) {
        try { body.careerPaths = JSON.parse(body.careerPaths); } catch {}
      }

      const validated = updateProgramSchema.parse(body);
      const adminUser = req.adminUser || { id: 'admin_usr_default', name: 'Erkab Administrator' };

      const program = await AdminProgramsService.updateProgram(id, validated as any, adminUser);
      res.json({
        success: true,
        data: program,
        message: `Training program '${program.title}' updated successfully`,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async togglePublish(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const adminUser = req.adminUser || { id: 'admin_usr_default', name: 'Erkab Administrator' };

      // Support either explicit { isPublished: boolean } or toggling current status
      let isPublished: boolean;
      if (req.body && typeof req.body.isPublished === 'boolean') {
        isPublished = req.body.isPublished;
      } else {
        const current = await AdminProgramsService.getProgramById(id);
        isPublished = !current.isPublished;
      }

      const result = await AdminProgramsService.togglePublish(id, isPublished, adminUser);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const adminUser = req.adminUser || { id: 'admin_usr_default', name: 'Erkab Administrator' };

      const result = await AdminProgramsService.deleteProgram(id, adminUser);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
