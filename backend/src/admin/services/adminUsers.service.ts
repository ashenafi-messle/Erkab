import crypto from 'crypto';
import { query, queryOne } from '../../core/database/db';
import { NotFoundError, ValidationError, ConflictError } from '../../core/errors/AppError';
import { hashPassword } from '../../core/utils/authSecurity';

export interface CreateAdminUserDTO {
  email: string;
  name: string;
  password: string;
  role: 'SUPER_ADMIN' | 'SUB_ADMIN';
  permissions?: string[];
}

export interface UpdateAdminUserDTO {
  name?: string;
  role?: 'SUPER_ADMIN' | 'SUB_ADMIN';
  permissions?: string[];
  status?: 'ACTIVE' | 'DISABLED';
  password?: string;
}

export class AdminUsersService {
  public static async listUsers(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const users = await query(
      `SELECT "id", "email", "name", "role", "permissions", "status", "lastLoginAt", "createdAt", "updatedAt"
       FROM "public"."AdminUser"
       ORDER BY "createdAt" DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countRow = await queryOne<{ count: number | string }>(
      `SELECT COUNT(*) as count FROM "public"."AdminUser"`
    );
    const total = Number(countRow?.count || 0);

    return {
      users: users.map((u) => ({
        ...u,
        permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions || '[]') : u.permissions,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public static async createUser(data: CreateAdminUserDTO, creatorId: string) {
    const existing = await queryOne(
      `SELECT "id" FROM "public"."AdminUser" WHERE LOWER("email") = $1`,
      [data.email.toLowerCase().trim()]
    );

    if (existing) {
      throw new ConflictError(`Administrator with email '${data.email}' already exists.`);
    }

    const id = crypto.randomUUID();
    const passwordHash = hashPassword(data.password);
    const permissions = JSON.stringify(data.permissions || (data.role === 'SUPER_ADMIN' ? ['*'] : [
      'security:read',
      'support:read',
      'support:write',
      'monitoring:read',
      'maintenance:read',
      'applications:read'
    ]));

    await query(
      `INSERT INTO "public"."AdminUser" ("id", "email", "passwordHash", "name", "role", "permissions", "status", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', NOW(), NOW())`,
      [id, data.email.toLowerCase().trim(), passwordHash, data.name.trim(), data.role, permissions]
    );

    // Audit log
    await query(
      `INSERT INTO "public"."AdminAuditLog" ("id", "adminUserId", "adminName", "action", "resource", "details", "createdAt")
       VALUES ($1, $2, 'Super Admin', 'CREATE_ADMIN_USER', 'AdminUser', $3, NOW())`,
      [crypto.randomUUID(), creatorId, `Created ${data.role} account for ${data.email}`]
    );

    return {
      id,
      email: data.email.toLowerCase().trim(),
      name: data.name.trim(),
      role: data.role,
      permissions: JSON.parse(permissions),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
  }

  public static async updateUser(id: string, data: UpdateAdminUserDTO, updaterId: string) {
    const user = await queryOne(
      `SELECT * FROM "public"."AdminUser" WHERE "id" = $1`,
      [id]
    );

    if (!user) {
      throw new NotFoundError(`Administrator with ID '${id}' not found.`);
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.name) {
      params.push(data.name.trim());
      updates.push(`"name" = $${params.length}`);
    }
    if (data.role) {
      params.push(data.role);
      updates.push(`"role" = $${params.length}`);
    }
    if (data.status) {
      params.push(data.status);
      updates.push(`"status" = $${params.length}`);
    }
    if (data.permissions) {
      params.push(JSON.stringify(data.permissions));
      updates.push(`"permissions" = $${params.length}`);
    }
    if (data.password) {
      params.push(hashPassword(data.password));
      updates.push(`"passwordHash" = $${params.length}`);
    }

    if (updates.length === 0) {
      return user;
    }

    updates.push(`"updatedAt" = NOW()`);
    params.push(id);

    await query(
      `UPDATE "public"."AdminUser" SET ${updates.join(', ')} WHERE "id" = $${params.length}`,
      params
    );

    // Audit log
    await query(
      `INSERT INTO "public"."AdminAuditLog" ("id", "adminUserId", "adminName", "action", "resource", "details", "createdAt")
       VALUES ($1, $2, 'Super Admin', 'UPDATE_ADMIN_USER', 'AdminUser', $3, NOW())`,
      [crypto.randomUUID(), updaterId, `Updated user ${user.email} (${Object.keys(data).join(', ')})`]
    );

    return this.getUser(id);
  }

  public static async deleteUser(id: string, deleterId: string) {
    const user = await queryOne(
      `SELECT "id", "email" FROM "public"."AdminUser" WHERE "id" = $1`,
      [id]
    );

    if (!user) {
      throw new NotFoundError(`Administrator with ID '${id}' not found.`);
    }

    // Set to DISABLED instead of destructive deletion
    await query(
      `UPDATE "public"."AdminUser" SET "status" = 'DISABLED', "updatedAt" = NOW() WHERE "id" = $1`,
      [id]
    );

    // Audit log
    await query(
      `INSERT INTO "public"."AdminAuditLog" ("id", "adminUserId", "adminName", "action", "resource", "details", "createdAt")
       VALUES ($1, $2, 'Super Admin', 'DEACTIVATE_ADMIN_USER', 'AdminUser', $3, NOW())`,
      [crypto.randomUUID(), deleterId, `Deactivated administrator ${user.email}`]
    );

    return { success: true, message: `Administrator '${user.email}' has been deactivated.` };
  }

  public static async getUser(id: string) {
    const user = await queryOne(
      `SELECT "id", "email", "name", "role", "permissions", "status", "lastLoginAt", "createdAt", "updatedAt"
       FROM "public"."AdminUser" WHERE "id" = $1`,
      [id]
    );
    if (!user) throw new NotFoundError('User not found');
    return {
      ...user,
      permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions || '[]') : user.permissions,
    };
  }
}
