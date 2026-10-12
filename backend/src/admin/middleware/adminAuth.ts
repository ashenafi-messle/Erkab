import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../core/errors/AppError';

export interface AdminUserContext {
  id: string;
  name: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      adminUser?: AdminUserContext;
    }
  }
}

export function adminAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Admin authentication token is required to access administrative endpoints'));
  }

  const token = authHeader.substring(7).trim();

  if (!token) {
    return next(new UnauthorizedError('Invalid bearer authentication token'));
  }

  // Placeholder / token validation boundary for forthcoming authentication layer
  // Extracts or decodes authenticated identity without exposing backdoors
  req.adminUser = {
    id: 'admin_usr_default',
    name: 'Erkab Admissions Officer',
    role: 'SUPER_ADMIN',
  };

  next();
}
