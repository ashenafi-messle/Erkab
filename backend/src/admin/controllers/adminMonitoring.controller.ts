import { Request, Response, NextFunction } from 'express';
import { AdminMonitoringService } from '../services/adminMonitoring.service';

export class AdminMonitoringController {
  public static async getHealth(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminMonitoringService.getSystemHealth();
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  public static async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 25;
      const search = req.query.search as string | undefined;
      const result = await AdminMonitoringService.getSecurityEvents(page, limit, search);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  public static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const search = req.query.search as string | undefined;
      const result = await AdminMonitoringService.getSecurityEvents(page, limit, search);
      res.json({
        success: true,
        data: result.events,
        events: result.events,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const status = req.query.status as string | undefined;
      const result = await AdminMonitoringService.getSupportTickets(page, limit, status);
      res.json({ success: true, data: result.tickets, ...result });
    } catch (err) {
      next(err);
    }
  }

  public static async updateTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status, notes } = req.body;
      const result = await AdminMonitoringService.updateSupportTicket(id, status, notes);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async triggerMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
      const { action } = req.body;
      const adminId = req.adminUser?.id || 'admin_usr_default';
      const adminName = req.adminUser?.name || 'Administrator';
      const result = await AdminMonitoringService.executeMaintenance(action, adminId, adminName);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async getMetrics(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminMonitoringService.getPerformanceMetrics();
      res.json({ success: true, data: result, ...result });
    } catch (err) {
      next(err);
    }
  }

  public static async getIncidents(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, data: [] });
    } catch (err) {
      next(err);
    }
  }

  public static async createIncident(req: Request, res: Response, next: NextFunction) {
    try {
      const incident = {
        id: `inc-${Date.now()}`,
        title: req.body.title || 'System Alert',
        component: req.body.component || 'Infrastructure',
        severity: req.body.severity || 'MEDIUM',
        description: req.body.description || '',
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      };
      res.status(201).json({ success: true, data: incident });
    } catch (err) {
      next(err);
    }
  }

  public static async updateIncident(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const status = req.body.status || 'RESOLVED';
      res.json({ success: true, message: `Incident ${id} updated to ${status}` });
    } catch (err) {
      next(err);
    }
  }
}
