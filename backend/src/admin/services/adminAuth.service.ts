import crypto from 'crypto';
import { query, queryOne } from '../../core/database/db';
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from '../../core/errors/AppError';
import { verifyPassword, hashPassword, createSessionToken } from '../../core/utils/authSecurity';
import { logger } from '../../core/logging/logger';

export interface AdminUserModel {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'SUPER_ADMIN' | 'SUB_ADMIN';
  permissions: string;
  status: 'ACTIVE' | 'DISABLED';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export class AdminAuthService {
  /**
   * Log in an administrator, verifying email, password, and account status
   */
  public static async login(email: string, password: string, ipAddress?: string) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await queryOne<AdminUserModel>(
      `SELECT * FROM "public"."AdminUser" WHERE LOWER("email") = $1`,
      [normalizedEmail]
    );

    if (!user) {
      logger.warn({ email: normalizedEmail, ipAddress }, 'Admin login failed: user not found');
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (user.status === 'DISABLED') {
      logger.warn({ email: normalizedEmail, ipAddress }, 'Admin login rejected: account disabled');
      throw new ForbiddenError('Your administrative account is disabled. Please contact the Super Admin.');
    }

    const isMatch = verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      logger.warn({ email: normalizedEmail, ipAddress }, 'Admin login failed: incorrect password');
      throw new UnauthorizedError('Invalid email or password.');
    }

    // Update lastLoginAt
    await query(
      `UPDATE "public"."AdminUser" SET "lastLoginAt" = NOW(), "updatedAt" = NOW() WHERE "id" = $1`,
      [user.id]
    );

    // Parse permissions JSON
    let permissions: string[] = [];
    try {
      permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
    } catch {
      permissions = [];
    }

    // Create audit log
    const auditId = crypto.randomUUID();
    await query(
      `INSERT INTO "public"."AdminAuditLog" ("id", "adminUserId", "adminName", "action", "resource", "details", "ipAddress", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [auditId, user.id, user.name, 'ADMIN_LOGIN', 'Auth', `Successful sign-in as ${user.role}`, ipAddress || 'unknown']
    );

    const token = createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions,
    });

    logger.info({ userId: user.id, role: user.role, email: user.email }, 'Admin logged in successfully');

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions,
        status: user.status,
      },
    };
  }

  /**
   * Get current authenticated user profile
   */
  public static async getMe(userId: string) {
    const user = await queryOne<AdminUserModel>(
      `SELECT "id", "email", "name", "role", "permissions", "status", "lastLoginAt", "createdAt" 
       FROM "public"."AdminUser" WHERE "id" = $1`,
      [userId]
    );

    if (!user) {
      throw new NotFoundError('Administrator account not found.');
    }

    if (user.status === 'DISABLED') {
      throw new ForbiddenError('Your administrative account has been deactivated.');
    }

    let permissions: string[] = [];
    try {
      permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
    } catch {
      permissions = [];
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  /**
   * Request password reset instructions
   */
  public static async forgotPassword(email: string, ipAddress?: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await queryOne<AdminUserModel>(
      `SELECT "id", "name", "email" FROM "public"."AdminUser" WHERE LOWER("email") = $1`,
      [normalizedEmail]
    );

    if (user) {
      // Create audit log for security tracking
      const auditId = crypto.randomUUID();
      await query(
        `INSERT INTO "public"."AdminAuditLog" ("id", "adminUserId", "adminName", "action", "resource", "details", "ipAddress", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [auditId, user.id, user.name, 'FORGOT_PASSWORD_REQUEST', 'Auth', 'Password reset requested', ipAddress || 'unknown']
      );
    }

    // Always return safe confirmation message regardless of user existence (prevents email enumeration)
    return {
      success: true,
      message: 'If an administrative account is associated with this email, security instructions have been dispatched to your verified address.',
    };
  }
}
