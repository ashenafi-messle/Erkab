import { Request, Response, NextFunction } from 'express';
import { AdminAuthService } from '../services/adminAuth.service';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Valid email address is required'),
});

export class AdminAuthController {
  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
      const result = await AdminAuthService.login(validated.email, validated.password, ipAddress);

      // Set secure HttpOnly cookie for browser sessions
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('admin_token', result.token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
      });

      res.status(200).json({
        success: true,
        token: result.token,
        user: result.user,
        data: {
          token: result.token,
          user: result.user,
        },
        message: `Welcome back, ${result.user.name}`,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.adminUser!.id;
      const user = await AdminAuthService.getMe(userId);

      res.status(200).json({
        success: true,
        user,
        data: {
          user,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Clear cookie
      const isProd = process.env.NODE_ENV === 'production';
      res.clearCookie('admin_token', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
      });

      res.status(200).json({
        success: true,
        message: 'Successfully logged out.',
      });
    } catch (err) {
      next(err);
    }
  }

  public static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = forgotPasswordSchema.parse(req.body);
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
      const result = await AdminAuthService.forgotPassword(validated.email, ipAddress);

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
