import { query, queryOne } from '../../core/database/db';
import { logger } from '../../core/logging/logger';
import { AdminUserContext } from '../middleware/adminAuth';
import { AdminUpdateContactInput } from '../../web/validation/contactSchemas';
import crypto from 'crypto';

export class AdminContactService {
  /**
   * List contact messages with pagination, filters, and search
   */
  public static async listMessages(options: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
  }) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
    const offset = (page - 1) * limit;

    let baseSql = `SELECT "id", "referenceCode", "fullName", "email", "phone", "subject", "category", "status", "priority", "assignedAdminId", "readAt", "resolvedAt", "createdAt", "updatedAt" FROM "public"."ContactMessage"`;
    let countSql = `SELECT COUNT(*) as count FROM "public"."ContactMessage"`;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (options.status && options.status !== 'ALL') {
      params.push(options.status.toUpperCase());
      whereClauses.push(`"status" = $${params.length}`);
    }

    if (options.category && options.category !== 'ALL') {
      let cat = options.category;
      if (cat === 'GENERAL') cat = 'GENERAL_INQUIRY';
      if (cat === 'SCHOLARSHIPS') cat = 'SCHOLARSHIP_APPLICATION';
      if (cat === 'PARTNERSHIPS') cat = 'PARTNERSHIP_MENTORSHIP';
      params.push(cat);
      whereClauses.push(`"category" = $${params.length}`);
    }

    if (options.priority && options.priority !== 'ALL') {
      params.push(options.priority.toUpperCase());
      whereClauses.push(`"priority" = $${params.length}`);
    }

    if (options.search && options.search.trim().length > 0) {
      params.push(`%${options.search.trim()}%`);
      whereClauses.push(
        `("referenceCode" ILIKE $${params.length} OR "fullName" ILIKE $${params.length} OR "email" ILIKE $${params.length} OR "subject" ILIKE $${params.length})`
      );
    }

    if (whereClauses.length > 0) {
      const whereStr = ` WHERE ${whereClauses.join(' AND ')}`;
      baseSql += whereStr;
      countSql += whereStr;
    }

    baseSql += ` ORDER BY "createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    const [countResult, messages] = await Promise.all([
      queryOne<{ count: number | string }>(countSql, params),
      query(baseSql, [...params, limit, offset]),
    ]);

    const total = Number(countResult?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return {
      messages,
      items: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Aggregated status and category metrics for admin dashboard/inbox
   */
  public static async getStats() {
    const rows = await query<{ status: string; count: string | number }>(
      `SELECT "status", COUNT(*) as count FROM "public"."ContactMessage" GROUP BY "status"`
    );

    const counts: Record<string, number> = {
      TOTAL: 0,
      NEW: 0,
      IN_PROGRESS: 0,
      WAITING_FOR_VISITOR: 0,
      RESOLVED: 0,
      CLOSED: 0,
      SPAM: 0,
    };

    for (const r of rows) {
      const status = r.status.toUpperCase();
      const count = Number(r.count);
      counts[status] = count;
      counts.TOTAL += count;
    }

    return {
      ...counts,
      total: counts.TOTAL,
      newCount: counts.NEW,
      inProgressCount: counts.IN_PROGRESS,
      waitingCount: counts.WAITING_FOR_VISITOR,
      resolvedCount: counts.RESOLVED,
      closedCount: counts.CLOSED,
      spamCount: counts.SPAM,
    };
  }

  /**
   * Get single contact message by ID or referenceCode, marking readAt on first staff view
   */
  public static async getMessageById(id: string) {
    const message = await queryOne(
      `SELECT * FROM "public"."ContactMessage" WHERE "id" = $1 OR "referenceCode" = $1`,
      [id]
    );

    if (!message) {
      return null;
    }

    // Mark as read if not already read
    if (!message.readAt) {
      const now = new Date().toISOString();
      await query(
        `UPDATE "public"."ContactMessage" SET "readAt" = $1, "updatedAt" = $1 WHERE "id" = $2`,
        [now, message.id]
      );
      message.readAt = now;
    }

    return message;
  }

  /**
   * Update message status, priority, assignment, or internal notes
   */
  public static async updateMessage(
    id: string,
    updateData: AdminUpdateContactInput,
    adminUser: AdminUserContext
  ) {
    const existing = await queryOne(`SELECT * FROM "public"."ContactMessage" WHERE "id" = $1`, [id]);
    if (!existing) {
      return null;
    }

    const setClauses: string[] = [];
    const params: any[] = [];
    const now = new Date().toISOString();

    if (updateData.status) {
      params.push(updateData.status);
      setClauses.push(`"status" = $${params.length}`);

      if (updateData.status === 'RESOLVED' || updateData.status === 'CLOSED') {
        params.push(now);
        setClauses.push(`"resolvedAt" = $${params.length}`);

        params.push(adminUser.id);
        setClauses.push(`"resolvedByAdminId" = $${params.length}`);
      }
    }

    if (updateData.priority) {
      params.push(updateData.priority);
      setClauses.push(`"priority" = $${params.length}`);
    }

    if (updateData.assignedAdminId !== undefined) {
      params.push(updateData.assignedAdminId);
      setClauses.push(`"assignedAdminId" = $${params.length}`);
    }

    if (updateData.internalNotes !== undefined) {
      params.push(updateData.internalNotes);
      setClauses.push(`"internalNotes" = $${params.length}`);
    }

    params.push(now);
    setClauses.push(`"updatedAt" = $${params.length}`);

    params.push(id);
    const sql = `UPDATE "public"."ContactMessage" SET ${setClauses.join(', ')} WHERE "id" = $${params.length} RETURNING *`;

    const updated = await queryOne(sql, params);

    // Audit log
    const auditId = `audit-${crypto.randomUUID()}`;
    await query(
      `INSERT INTO "public"."AdminAuditLog" ("id", "adminUserId", "adminName", "action", "resource", "details", "createdAt")
       VALUES ($1, $2, $3, 'UPDATE_CONTACT_MESSAGE', 'ContactMessage', $4, $5)`,
      [
        auditId,
        adminUser.id,
        adminUser.name,
        JSON.stringify({
          messageId: id,
          referenceCode: existing.referenceCode,
          changes: updateData,
        }),
        now,
      ]
    ).catch((err) => {
      logger.warn({ err: err.message }, 'Audit log recording failed for contact message update');
    });

    return updated;
  }
}
