import { Request, Response, NextFunction } from 'express';
import { AdminUsersService } from '../services/adminUsers.service';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().trim().email('Valid email is required'),
  name: z.string().trim().min(2, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['SUPER_ADMIN', 'SUB_ADMIN']),
  permissions: z.array(z.string()).optional(),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(2).optional(),
  role: z.enum(['SUPER_ADMIN', 'SUB_ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).optional(),
  permissions: z.array(z.string()).optional(),
  password: z.string().min(8).optional(),
});

export class AdminUsersController {
  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const result = await AdminUsersService.listUsers(page, limit);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createUserSchema.parse(req.body);
      const creatorId = req.adminUser!.id;
      const user = await AdminUsersService.createUser(validated, creatorId);
      res.status(201).json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const validated = updateUserSchema.parse(req.body);
      const updaterId = req.adminUser!.id;
      const user = await AdminUsersService.updateUser(id, validated, updaterId);
      res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const deleterId = req.adminUser!.id;
      const result = await AdminUsersService.deleteUser(id, deleterId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
